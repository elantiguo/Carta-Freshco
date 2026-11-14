// Panel de administración de pedidos
(function () {
  const $ = id => document.getElementById(id);
  const vistaLogin = $("vista-login"), vistaPanel = $("vista-panel");
  const lista = $("lista-pedidos"), conexion = $("panel-estado-conexion");

  const ESTADOS = {
    nuevo:      { txt: "Nuevo",          sig: "preparando", accion: "Preparar" },
    preparando: { txt: "Preparando",     sig: "listo",      accion: "Marcar listo" },
    listo:      { txt: "Listo",          sig: "entregado",  accion: "Entregado" },
    entregado:  { txt: "Entregado",      sig: null },
    cancelado:  { txt: "Cancelado",      sig: "nuevo",      accion: "Reabrir" }
  };
  const ACTIVOS = ["nuevo", "preparando", "listo"];
  const INTERVALO_MS = 5000;

  let filtro = "activos";
  let pedidos = [];
  let vistos = null;          // ids ya conocidos, para detectar pedidos nuevos
  let recientes = new Set();  // ids a resaltar en el próximo render
  let temporizador = null;
  let sonido = true;
  try { sonido = localStorage.getItem("fc_admin_sonido") !== "0"; } catch (e) {}

  // ---------- API ----------
  async function api(url, opciones = {}) {
    const res = await fetch(url, {
      ...opciones,
      headers: { "Content-Type": "application/json", ...(opciones.headers || {}) },
      credentials: "same-origin"
    });
    const data = await res.json().catch(() => ({}));
    if (res.status === 401 && !url.includes("/auth/")) { mostrarLogin(); throw new Error("Sesión expirada"); }
    if (!res.ok) throw new Error(data.error || `Error ${res.status}`);
    return data;
  }

  // ---------- Vistas ----------
  function mostrarLogin() {
    clearTimeout(temporizador);
    vistaPanel.classList.add("oculto");
    vistaLogin.classList.remove("oculto");
    document.title = "Panel Freshco";
    $("login-usuario").focus();
  }

  function mostrarPanel() {
    vistaLogin.classList.add("oculto");
    vistaPanel.classList.remove("oculto");
    vistos = null;
    actualizarBotonSonido();
    cargar();
  }

  // ---------- Login ----------
  $("form-login").addEventListener("submit", async e => {
    e.preventDefault();
    const btn = e.target.querySelector("button");
    const err = $("login-error");
    err.textContent = "";
    btn.disabled = true;
    try {
      await api("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ usuario: $("login-usuario").value.trim(), password: $("login-password").value })
      });
      $("login-password").value = "";
      desbloquearAudio();
      mostrarPanel();
    } catch (ex) {
      err.textContent = ex.message;
    } finally {
      btn.disabled = false;
    }
  });

  $("btn-salir").addEventListener("click", async () => {
    try { await api("/api/auth/logout", { method: "POST" }); } catch (e) {}
    mostrarLogin();
  });

  // ---------- Sonido de aviso ----------
  let audioCtx = null;
  function desbloquearAudio() {
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === "suspended") audioCtx.resume();
    } catch (e) {}
  }
  function pitar() {
    if (!sonido || !audioCtx) return;
    const t = audioCtx.currentTime;
    [0, 0.18, 0.36].forEach((d, i) => {
      const o = audioCtx.createOscillator(), g = audioCtx.createGain();
      o.type = "sine";
      o.frequency.value = i === 2 ? 1320 : 880;
      g.gain.setValueAtTime(0.0001, t + d);
      g.gain.exponentialRampToValueAtTime(0.3, t + d + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + d + 0.16);
      o.connect(g).connect(audioCtx.destination);
      o.start(t + d);
      o.stop(t + d + 0.18);
    });
  }
  function actualizarBotonSonido() {
    const b = $("btn-sonido");
    b.textContent = sonido ? "Sonido: sí" : "Sonido: no";
    b.setAttribute("aria-pressed", String(sonido));
  }
  $("btn-sonido").addEventListener("click", () => {
    sonido = !sonido;
    try { localStorage.setItem("fc_admin_sonido", sonido ? "1" : "0"); } catch (e) {}
    desbloquearAudio();
    actualizarBotonSonido();
    if (sonido) pitar();
  });
  document.addEventListener("click", desbloquearAudio, { once: true });

  // ---------- Carga periódica ----------
  async function cargar() {
    clearTimeout(temporizador);
    try {
      pedidos = await api("/api/admin/pedidos");
      const ids = new Set(pedidos.map(p => p.id));
      if (vistos) {
        const nuevos = pedidos.filter(p => !vistos.has(p.id) && p.estado === "nuevo");
        if (nuevos.length) { nuevos.forEach(p => recientes.add(p.id)); pitar(); }
      }
      vistos = ids;
      conexion.textContent = `Actualizado ${new Date().toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`;
      conexion.classList.remove("error");
      render();
    } catch (e) {
      if (vistaPanel.classList.contains("oculto")) return;
      conexion.textContent = "Sin conexión, reintentando…";
      conexion.classList.add("error");
    }
    if (!vistaPanel.classList.contains("oculto")) temporizador = setTimeout(cargar, INTERVALO_MS);
  }

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && !vistaPanel.classList.contains("oculto")) cargar();
  });

  // ---------- Render ----------
  const hora = iso => new Date(iso).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
  function hace(iso) {
    const min = Math.floor((Date.now() - new Date(iso)) / 60000);
    if (min < 1) return "ahora";
    if (min < 60) return `hace ${min} min`;
    const h = Math.floor(min / 60);
    return h < 24 ? `hace ${h} h` : new Date(iso).toLocaleDateString("es-CO");
  }

  // Ubicación GPS del cliente (domicilios). "En vivo" si se actualizó hace menos de 2 min.
  function ubicacionHtml(p) {
    const u = p.ubicacion;
    if (!u) return `<span class="ubic-admin sin">Sin ubicación GPS: usar la dirección escrita</span>`;
    const mapa = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${u.lat},${u.lng}`)}`;
    const min = (Date.now() - new Date(u.actualizado)) / 60000;
    const terminado = p.estado === "entregado" || p.estado === "cancelado";
    const vivo = !terminado && min < 2;
    const cuando = min < 1 ? "hace menos de 1 min" : min < 60 ? `hace ${Math.floor(min)} min` : `a las ${hora(u.actualizado)}`;
    return `<span class="ubic-admin${vivo ? " vivo" : ""}">
      <a class="btn-mapa" href="${esc(mapa)}" target="_blank" rel="noopener noreferrer">Ver en el mapa</a>
      <span>${vivo ? "<b>En vivo</b> · " : ""}${cuando}${u.precision != null ? ` · ±${esc(u.precision)} m` : ""}</span>
    </span>`;
  }

  function tarjeta(p) {
    const est = ESTADOS[p.estado] || ESTADOS.nuevo;
    const destino = p.tipo === "local"
      ? `<strong class="mesa">Mesa ${esc(p.mesa)}</strong><small>En el local</small>`
      : `<strong class="dom">Domicilio</strong><small>${esc(p.nombre)}</small><small>${esc(p.direccion)}</small>${ubicacionHtml(p)}`;
    const items = p.items.map(it => `
      <li>
        ${it.imagen ? `<img src="${esc(encodeURI(it.imagen))}" alt="" loading="lazy">` : ""}
        <span class="nom"><strong>${esc(it.nombre)}</strong><small>${esc(it.seccion)}${it.precio ? ` · $${Number(it.precio).toLocaleString("es-CO")} c/u` : ""}</small></span>
        <span class="cant">${it.cantidad}x</span>
      </li>`).join("");
    const acciones = [
      est.sig ? `<button type="button" class="btn-avanzar" data-id="${esc(p.id)}" data-a="${est.sig}">${est.accion}</button>` : "",
      ACTIVOS.includes(p.estado) ? `<button type="button" class="btn-cancelar" data-id="${esc(p.id)}" data-a="cancelado">Cancelar</button>` : ""
    ].join("");

    return `<article class="pedido${recientes.has(p.id) ? " recien" : ""}" data-estado="${esc(p.estado)}">
      <div class="pedido-top">
        <span class="pedido-num">#${esc(p.numero)}</span>
        <span class="pedido-hora">${hora(p.creado)}<br>${hace(p.creado)}</span>
      </div>
      <span class="etiqueta-estado">${est.txt}</span>${p.promo ? ` <span class="etiqueta-promo">Precio promo</span>` : ""}
      <div class="pedido-destino">${destino}</div>
      <ul class="pedido-items">${items}</ul>
      ${p.notas ? `<p class="pedido-notas"><b>Nota:</b> ${esc(p.notas)}</p>` : ""}
      <div class="pedido-total"><span>${p.unidades} ${p.unidades === 1 ? "producto" : "productos"}</span>${p.total ? `<strong>$${Number(p.total).toLocaleString("es-CO")}</strong>` : ""}</div>
      ${acciones ? `<div class="pedido-acciones">${acciones}</div>` : ""}
    </article>`;
  }

  function render() {
    const cuenta = e => pedidos.filter(p => p.estado === e).length;
    ["nuevo", "preparando", "listo"].forEach(e => { $(`cnt-${e}`).textContent = cuenta(e); });
    const activos = pedidos.filter(p => ACTIVOS.includes(p.estado));
    $("cnt-activos").textContent = activos.length;
    const nNuevos = cuenta("nuevo");
    document.title = nNuevos ? `(${nNuevos}) Pedidos nuevos · Freshco` : "Panel Freshco";

    let visibles = filtro === "todos" ? pedidos
      : filtro === "activos" ? activos
      : pedidos.filter(p => p.estado === filtro);
    // En activos: los más antiguos primero (orden de atención)
    if (filtro === "activos") visibles = [...visibles].sort((a, b) => a.numero - b.numero);

    lista.innerHTML = visibles.length
      ? visibles.map(tarjeta).join("")
      : `<p class="vacio">No hay pedidos en esta vista.</p>`;
    recientes.clear();
  }

  $("filtros").addEventListener("click", e => {
    const b = e.target.closest("button[data-filtro]");
    if (!b) return;
    filtro = b.dataset.filtro;
    $("filtros").querySelectorAll("button").forEach(x => x.classList.toggle("activo", x === b));
    render();
  });

  lista.addEventListener("click", async e => {
    const b = e.target.closest("button[data-a]");
    if (!b) return;
    if (b.dataset.a === "cancelado" && !confirm("¿Cancelar este pedido?")) return;
    b.disabled = true;
    try {
      const act = await api(`/api/admin/pedidos/${encodeURIComponent(b.dataset.id)}`, {
        method: "PATCH",
        body: JSON.stringify({ estado: b.dataset.a })
      });
      pedidos = pedidos.map(p => (p.id === act.id ? act : p));
      render();
    } catch (ex) {
      if (ex.message !== "Sesión expirada") alert(ex.message);
      b.disabled = false;
    }
  });

  // ---------- Pestañas: pedidos en curso / historial ----------
  const vistaPedidos = $("vista-pedidos"), vistaHistorial = $("vista-historial");
  document.querySelector(".vistas").addEventListener("click", e => {
    const b = e.target.closest("button[data-vista]");
    if (!b) return;
    document.querySelectorAll(".vistas button").forEach(x => {
      const on = x === b;
      x.classList.toggle("activo", on);
      x.setAttribute("aria-selected", String(on));
    });
    const hist = b.dataset.vista === "historial";
    vistaPedidos.classList.toggle("oculto", hist);
    vistaHistorial.classList.toggle("oculto", !hist);
    if (hist) cargarHistorial();
  });

  // ---------- Historial y ventas ----------
  const pesos = n => "$" + Math.round(Number(n) || 0).toLocaleString("es-CO");
  const nombreDia = f => new Date(`${f}T12:00:00`)
    .toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
    .replace(/^./, c => c.toUpperCase());
  const hoyCol = () => fechaColombia();
  const haceDias = n => fechaColombia(new Date(Date.now() - n * 864e5));
  let resumen = [];
  let diaAbierto = null;

  async function cargarHistorial() {
    const cont = $("hist-dias-lista");
    cont.innerHTML = `<p class="vacio">Cargando…</p>`;
    try {
      resumen = await api(`/api/admin/resumen?dias=${$("hist-dias").value}`);
      renderHistorial();
      if (diaAbierto && resumen.some(r => r.fecha === diaAbierto)) abrirDia(diaAbierto);
    } catch (e) {
      if (e.message !== "Sesión expirada") cont.innerHTML = `<p class="vacio">No se pudo cargar el historial: ${esc(e.message)}</p>`;
    }
  }

  function kpi(titulo, filas) {
    const total = filas.reduce((a, r) => a + r.total, 0);
    const n = filas.reduce((a, r) => a + r.pedidos, 0);
    return `<div class="kpi"><span>${titulo}</span><strong>${pesos(total)}</strong><small>${n} ${n === 1 ? "pedido" : "pedidos"}</small></div>`;
  }

  function renderHistorial() {
    const hoy = hoyCol(), ayer = haceDias(1), hace7 = haceDias(6);
    const sel = $("hist-dias");
    $("hist-kpis").innerHTML = [
      kpi("Hoy", resumen.filter(r => r.fecha === hoy)),
      kpi("Ayer", resumen.filter(r => r.fecha === ayer)),
      kpi("Últimos 7 días", resumen.filter(r => r.fecha >= hace7)),
      kpi(sel.options[sel.selectedIndex].text.replace(/^./, c => c.toUpperCase()), resumen)
    ].join("");

    $("hist-dias-lista").innerHTML = resumen.length ? resumen.map(r => `
      <div class="dia" data-fecha="${esc(r.fecha)}">
        <button type="button" class="dia-cabecera" aria-expanded="false">
          <span class="dia-fecha">${esc(nombreDia(r.fecha))}${r.fecha === hoy ? ` <em>Hoy</em>` : ""}</span>
          <span class="dia-datos">
            <span>${r.pedidos} ${r.pedidos === 1 ? "pedido" : "pedidos"} · ${r.unidades} prod.${r.cancelados ? ` · ${r.cancelados} cancel.` : ""}</span>
            <strong>${pesos(r.total)}</strong>
          </span>
        </button>
        <div class="dia-detalle oculto"></div>
      </div>`).join("") : `<p class="vacio">Todavía no hay ventas en este período.</p>`;
  }

  function detalleDia(peds) {
    // Productos vendidos ese día (sin cancelados)
    const prods = new Map();
    peds.filter(p => p.estado !== "cancelado").forEach(p => p.items.forEach(it => {
      const r = prods.get(it.nombre) || { nombre: it.nombre, cantidad: 0, total: 0 };
      r.cantidad += it.cantidad;
      r.total += (it.precio || 0) * it.cantidad;
      prods.set(it.nombre, r);
    }));
    const top = [...prods.values()].sort((a, b) => b.cantidad - a.cantidad);

    const filas = peds.map(p => {
      const est = ESTADOS[p.estado] || ESTADOS.nuevo;
      const destino = p.tipo === "local" ? `Mesa ${esc(p.mesa)}` : `Domicilio · ${esc(p.nombre)}`;
      const items = p.items.map(it => `${it.cantidad}x ${esc(it.nombre)}`).join(", ");
      return `<tr class="${p.estado === "cancelado" ? "cancelado" : ""}">
        <td><b>#${esc(p.numero)}</b><br><small>${hora(p.creado)}</small></td>
        <td>${destino}<br><small>${items}</small></td>
        <td><span class="mini-estado" data-estado="${esc(p.estado)}">${est.txt}</span></td>
        <td class="num">${p.total ? pesos(p.total) : "—"}</td>
      </tr>`;
    }).join("");

    return `
      ${top.length ? `<div class="dia-productos"><h3>Productos vendidos</h3><ul>${top.map(t =>
        `<li><span>${t.cantidad}x ${esc(t.nombre)}</span><b>${pesos(t.total)}</b></li>`).join("")}</ul></div>` : ""}
      <div class="tabla-scroll"><table class="tabla-pedidos">
        <thead><tr><th>Pedido</th><th>Detalle</th><th>Estado</th><th class="num">Total</th></tr></thead>
        <tbody>${filas}</tbody>
      </table></div>`;
  }

  async function abrirDia(fecha) {
    const caja = $("hist-dias-lista").querySelector(`.dia[data-fecha="${fecha}"]`);
    if (!caja) return;
    const det = caja.querySelector(".dia-detalle");
    caja.querySelector(".dia-cabecera").setAttribute("aria-expanded", "true");
    det.classList.remove("oculto");
    det.innerHTML = `<p class="vacio">Cargando pedidos…</p>`;
    try {
      det.innerHTML = detalleDia(await api(`/api/admin/dia/${encodeURIComponent(fecha)}`));
    } catch (e) {
      if (e.message !== "Sesión expirada") det.innerHTML = `<p class="vacio">Error: ${esc(e.message)}</p>`;
    }
  }

  $("hist-dias-lista").addEventListener("click", e => {
    const cab = e.target.closest(".dia-cabecera");
    if (!cab) return;
    const fecha = cab.closest(".dia").dataset.fecha;
    if (cab.getAttribute("aria-expanded") === "true") {
      cab.setAttribute("aria-expanded", "false");
      cab.nextElementSibling.classList.add("oculto");
      diaAbierto = null;
    } else {
      diaAbierto = fecha;
      abrirDia(fecha);
    }
  });
  $("hist-dias").addEventListener("change", cargarHistorial);
  $("btn-hist-recargar").addEventListener("click", cargarHistorial);

  // ---------- Inicio ----------
  api("/api/auth/me").then(mostrarPanel).catch(mostrarLogin);
})();
