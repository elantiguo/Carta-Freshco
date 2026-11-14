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

  function tarjeta(p) {
    const est = ESTADOS[p.estado] || ESTADOS.nuevo;
    const destino = p.tipo === "local"
      ? `<strong class="mesa">Mesa ${esc(p.mesa)}</strong><small>En el local</small>`
      : `<strong class="dom">Domicilio</strong><small>${esc(p.nombre)}</small><small>${esc(p.direccion)}</small>`;
    const items = p.items.map(it => `
      <li>
        ${it.imagen ? `<img src="${esc(encodeURI(it.imagen))}" alt="" loading="lazy">` : ""}
        <span class="nom"><strong>${esc(it.nombre)}</strong><small>${esc(it.seccion)}</small></span>
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
      <span class="etiqueta-estado">${est.txt}</span>
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

  // ---------- Inicio ----------
  api("/api/auth/me").then(mostrarPanel).catch(mostrarLogin);
})();
