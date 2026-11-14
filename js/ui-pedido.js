// Interfaz de usuario para la barra flotante y el modal de pedidos
(function () {
  const dom = document.createElement("div");
  dom.id = "pedido-ui-root";
  dom.innerHTML = `
    <div id="barra-pedido" class="barra-pedido oculto" role="region" aria-label="Resumen del pedido">
      <div class="barra-info"><span class="icono-cart">${ICONS.cart}</span>
        <div><strong id="barra-cant">0 items</strong><span id="barra-total" class="barra-sub"></span></div></div>
      <button type="button" id="btn-ver-pedido" class="btn-ver-pedido"><span>Ver pedido</span>${ICONS.arrowRight}</button>
    </div>
    <div id="modal-pedido" class="modal-fondo oculto" role="dialog" aria-modal="true" aria-labelledby="modal-titulo">
      <div class="modal-caja">
        <div class="modal-cabecera">
          <div><h2 id="modal-titulo" class="modal-titulo">Tu Pedido</h2><p class="modal-sub">Freshco Bar</p></div>
          <button type="button" id="btn-cerrar-modal" class="btn-cerrar" aria-label="Cerrar">${ICONS.close}</button>
        </div>
        <div id="modal-cuerpo" class="modal-cuerpo"></div>
        <div id="modal-confirmacion" class="modal-confirmacion oculto" aria-live="polite"></div>
        <div class="modal-campos">
          <div class="selector-tipo">
            <button type="button" class="btn-tipo activo" data-tipo="local">En el local</button>
            <button type="button" class="btn-tipo" data-tipo="domicilio">A domicilio</button>
          </div>
          <div id="campo-local" class="campo-modal">
            <span>Selecciona tu mesa:</span>
            <div class="selector-mesas">
              <button type="button" class="btn-mesa activo" data-mesa="1">Mesa 1</button>
              <button type="button" class="btn-mesa" data-mesa="2">Mesa 2</button>
              <button type="button" class="btn-mesa" data-mesa="3">Mesa 3</button>
              <button type="button" class="btn-mesa" data-mesa="4">Mesa 4</button>
              <button type="button" class="btn-mesa" data-mesa="5">Mesa 5</button>
            </div>
          </div>
          <div id="campo-domicilio" class="campo-modal oculto">
            <label><span>Tu nombre: *</span><input type="text" id="pedido-nombre" placeholder="Nombre completo" maxlength="40"></label>
            <label><span>Dirección actual obligatoria: *</span><input type="text" id="pedido-dir" placeholder="Ej: Carrera 15 # 45-20, apto 302" maxlength="80" autocomplete="street-address"></label>
            <label><span>Celular para llamarte: *</span><input type="tel" id="pedido-tel" placeholder="Ej: 300 123 4567" maxlength="16" inputmode="tel" autocomplete="tel"></label>
            <div class="ubicacion-caja" id="ubicacion-caja" data-estado="pendiente">
              <span class="ubicacion-icono" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="10" r="2.6"/></svg></span>
              <span id="ubicacion-estado" class="ubicacion-texto">Activa tu ubicación para que el domiciliario te encuentre.</span>
              <button type="button" id="btn-ubicacion" class="btn-ubicacion">Activar</button>
            </div>
            <p class="aviso-domicilio">Los granizados a domicilio cuestan diferente; el total ya lo incluye.</p>
          </div>
          <label><span>Notas adicionales (opcional):</span><input type="text" id="pedido-notas" placeholder="Ej: Con bastante hielo" maxlength="120"></label>
        </div>
        <div class="modal-pie">
          <div class="modal-resumen"><span id="modal-total-cant">0 productos</span><strong id="modal-total-precio"></strong></div>
          <div class="modal-acciones">
            <button type="button" id="btn-vaciar" class="btn-secundario">Vaciar</button>
            <button type="button" id="btn-enviar-pedido" class="btn-enviar">${ICONS.send}<span>Enviar pedido</span></button>
          </div>
        </div>
      </div>
    </div>`;
  document.body.appendChild(dom);

  const barra = document.getElementById("barra-pedido"), barraCant = document.getElementById("barra-cant");
  const barraTotal = document.getElementById("barra-total"), modal = document.getElementById("modal-pedido");
  const modalCuerpo = document.getElementById("modal-cuerpo"), modalTotalCant = document.getElementById("modal-total-cant");
  const modalTotalPrecio = document.getElementById("modal-total-precio"), inputNotas = document.getElementById("pedido-notas");
  const campoLocal = document.getElementById("campo-local"), campoDomicilio = document.getElementById("campo-domicilio");
  const inputNombre = document.getElementById("pedido-nombre"), inputDir = document.getElementById("pedido-dir");
  const inputTel = document.getElementById("pedido-tel");
  let tipoEntrega = "local", mesaSeleccionada = "1";

  const abrirModal = () => { restaurarModal(); renderModalCuerpo(); modal.classList.remove("oculto"); document.body.style.overflow = "hidden"; };
  const cerrarModal = () => { modal.classList.add("oculto"); document.body.style.overflow = ""; };

  const fmt = n => "$" + Number(n).toLocaleString("es-CO");
  function precioLinea(it) {
    const u = Pedido.precioUnitario(it.id);
    if (!u) return "";
    return `<span class="modal-item-precio">${fmt(u * it.cantidad)}${it.cantidad > 1 ? ` <small>(${fmt(u)} c/u)</small>` : ""}</span>`;
  }

  function renderModalCuerpo() {
    const items = Pedido.obtenerItems();
    if (!items.length) {
      modalCuerpo.innerHTML = `<div class="pedido-vacio"><p>No has agregado ningún producto aún.</p></div>`;
      modalTotalCant.textContent = "0 productos";
      modalTotalPrecio.textContent = "";
      return;
    }
    modalCuerpo.innerHTML = `<ul class="modal-lista">${items.map(it => {
      const img = it.imagen || Pedido.resolverImagen(it.id, it.nombre, it.seccion);
      return `<li class="modal-item">
        ${img ? `<img src="${encodeURI(img)}" class="modal-thumb" alt="${esc(it.nombre)}" loading="lazy">` : ""}
        <div class="modal-item-info"><strong>${esc(it.nombre)}</strong>${it.seccion ? `<small>${esc(it.seccion)}</small>` : ""}
          ${precioLinea(it)}</div>
        <div class="modal-item-ctrl">
          <button type="button" class="btn-m-menos" data-id="${esc(it.id)}" aria-label="Quitar">${ICONS.minus}</button>
          <span class="m-cant">${it.cantidad}</span>
          <button type="button" class="btn-m-mas" data-id="${esc(it.id)}" aria-label="Agregar">${ICONS.plus}</button>
          <button type="button" class="btn-m-eliminar" data-id="${esc(it.id)}" aria-label="Eliminar">${ICONS.trash}</button>
        </div></li>`;
    }).join("")}</ul>`;

    const totalC = Pedido.totalItems();
    modalTotalCant.textContent = `${totalC} ${totalC === 1 ? "producto" : "productos"}`;
    modalTotalPrecio.textContent = Pedido.tienePrecios() ? `$${Pedido.totalPrecio().toLocaleString("es-CO")}` : "";
  }

  function actualizarBarra() {
    const total = Pedido.totalItems();
    if (total > 0) {
      barra.classList.remove("oculto");
      barraCant.textContent = `${total} ${total === 1 ? "producto" : "productos"}`;
      barraTotal.textContent = Pedido.tienePrecios() ? ` • $${Pedido.totalPrecio().toLocaleString("es-CO")}` : "";
    } else {
      barra.classList.add("oculto");
      if (!modal.classList.contains("oculto")) renderModalCuerpo();
    }
  }

  dom.querySelectorAll(".btn-tipo").forEach(btn => btn.addEventListener("click", () => {
    dom.querySelectorAll(".btn-tipo").forEach(b => b.classList.remove("activo"));
    btn.classList.add("activo");
    tipoEntrega = btn.dataset.tipo;
    Pedido.cambiarTipo(tipoEntrega);
    campoLocal.classList.toggle("oculto", tipoEntrega !== "local");
    campoDomicilio.classList.toggle("oculto", tipoEntrega !== "domicilio");
    if (tipoEntrega === "domicilio") {
      // En celulares pequeños los datos de domicilio quedan abajo: se desplaza hasta ellos
      dom.querySelector(".selector-tipo").scrollIntoView({ block: "start", behavior: "smooth" });
      if (!ubicacion) pedirUbicacion();
    }
  }));

  // ---------- Ubicación del cliente (domicilios) ----------
  const cajaUbic = document.getElementById("ubicacion-caja");
  const textoUbic = document.getElementById("ubicacion-estado");
  const btnUbic = document.getElementById("btn-ubicacion");
  let ubicacion = null, pidiendoUbic = null;

  function estadoUbic(estado, texto, boton) {
    cajaUbic.dataset.estado = estado;
    textoUbic.textContent = texto;
    btnUbic.classList.toggle("oculto", !boton);
    if (boton) btnUbic.textContent = boton;
  }

  // Pide la ubicación al navegador. Devuelve la ubicación o null.
  function pedirUbicacion() {
    if (pidiendoUbic) return pidiendoUbic;
    if (!("geolocation" in navigator)) {
      estadoUbic("error", "Tu navegador no permite compartir la ubicación. Escribe bien la dirección.", null);
      return Promise.resolve(null);
    }
    estadoUbic("buscando", "Buscando tu ubicación…", null);
    // 1º ubicación rápida (wifi/red, 1-2 s); si falla, 2º intento con GPS que puede tardar más
    // (en un celular real dentro de una casa el GPS solo puede tardar más de 15 s).
    const intento = opciones => new Promise((ok, falla) => navigator.geolocation.getCurrentPosition(ok, falla, opciones));
    pidiendoUbic = intento({ enableHighAccuracy: false, timeout: 10000, maximumAge: 120000 })
      .catch(err => {
        if (err.code === err.PERMISSION_DENIED) throw err;
        estadoUbic("buscando", "Buscando señal de GPS…", null);
        return intento({ enableHighAccuracy: true, timeout: 30000, maximumAge: 120000 });
      })
      .then(pos => {
        ubicacion = { lat: pos.coords.latitude, lng: pos.coords.longitude, precision: pos.coords.accuracy };
        estadoUbic("ok", `Ubicación activada (precisión ±${Math.round(pos.coords.accuracy)} m)`, null);
        return ubicacion;
      }, err => {
        const negado = err.code === err.PERMISSION_DENIED;
        estadoUbic("error", negado
          ? "Ubicación bloqueada. Actívala en los permisos del navegador para este sitio y vuelve a intentar."
          : "No pudimos obtener tu ubicación. Revisa que la ubicación del celular esté encendida.", "Reintentar");
        return null;
      })
      .finally(() => { pidiendoUbic = null; });
    return pidiendoUbic;
  }
  btnUbic.addEventListener("click", () => pedirUbicacion());

  dom.querySelectorAll(".btn-mesa").forEach(btn => btn.addEventListener("click", () => {
    dom.querySelectorAll(".btn-mesa").forEach(b => b.classList.remove("activo"));
    btn.classList.add("activo");
    mesaSeleccionada = btn.dataset.mesa;
  }));

  document.getElementById("btn-ver-pedido").addEventListener("click", abrirModal);
  document.getElementById("btn-cerrar-modal").addEventListener("click", cerrarModal);
  modal.addEventListener("click", e => { if (e.target === modal) cerrarModal(); });

  modalCuerpo.addEventListener("click", e => {
    const mas = e.target.closest(".btn-m-mas"), menos = e.target.closest(".btn-m-menos"), del = e.target.closest(".btn-m-eliminar");
    if (mas) return Pedido.agregar(mas.dataset.id, {});
    if (menos) return Pedido.decrementar(menos.dataset.id);
    if (del) return Pedido.eliminar(del.dataset.id);
  });

  document.getElementById("btn-vaciar").addEventListener("click", () => {
    if (confirm("¿Deseas vaciar todos los productos del pedido?")) Pedido.vaciar();
  });

  const btnEnviar = document.getElementById("btn-enviar-pedido");
  const confirmacion = document.getElementById("modal-confirmacion");
  const secciones = [modalCuerpo, dom.querySelector(".modal-campos"), dom.querySelector(".modal-pie")];

  function mostrarConfirmacion(numero, id) {
    secciones.forEach(el => el.classList.add("oculto"));
    confirmacion.innerHTML = `
      <div class="conf-check">${ICONS.check}</div>
      <h3>¡Pedido #${esc(numero)} recibido!</h3>
      <p>Ya lo estamos preparando. Puedes ver el estado de tu pedido aquí:</p>
      <a class="btn-enviar" href="pedido.html?id=${encodeURIComponent(id)}">Ver mi pedido</a>
      <button type="button" class="btn-secundario" id="btn-seguir">Seguir viendo la carta</button>`;
    confirmacion.classList.remove("oculto");
    document.getElementById("btn-seguir").addEventListener("click", cerrarModal);
  }

  function restaurarModal() {
    confirmacion.classList.add("oculto");
    secciones.forEach(el => el.classList.remove("oculto"));
  }

  btnEnviar.addEventListener("click", async () => {
    if (!Pedido.totalItems()) return alert("Agrega al menos un producto para enviar tu pedido.");
    if (tipoEntrega === "domicilio") {
      if (!inputNombre.value.trim()) { inputNombre.focus(); return alert("Por favor ingresa tu nombre para el domicilio."); }
      if (!inputDir.value.trim()) { inputDir.focus(); return alert("Por favor ingresa la dirección actual para la entrega."); }
      if (!normalizarTelefono(inputTel.value)) { inputTel.focus(); return alert("Escribe un número de celular válido de 10 dígitos (ej: 300 123 4567) para poder llamarte y confirmar tu pedido."); }
      if (!ubicacion) {
        btnEnviar.disabled = true;
        await pedirUbicacion();
        btnEnviar.disabled = false;
        if (!ubicacion && !confirm("No pudimos obtener tu ubicación. El domiciliario usará solo la dirección escrita.\n\n¿Enviar el pedido de todos modos?")) return;
      }
    }
    const domicilio = tipoEntrega === "domicilio";
    const opts = { tipo: tipoEntrega, mesa: mesaSeleccionada, nombre: inputNombre.value, direccion: inputDir.value, telefono: domicilio ? inputTel.value : "", notas: inputNotas.value, ubicacion: domicilio ? ubicacion : null };
    btnEnviar.disabled = true;
    btnEnviar.querySelector("span").textContent = "Enviando...";
    try {
      const { id, numero } = await Pedido.enviar(opts);
      inputNotas.value = "";
      Pedido.vaciar();
      // Domicilio: ir a la página del pedido, que comparte la ubicación en vivo
      if (domicilio) { location.href = `pedido.html?id=${encodeURIComponent(id)}`; return; }
      mostrarConfirmacion(numero, id);
    } catch (err) {
      alert(err.message || "No se pudo enviar el pedido. Intenta de nuevo.");
    } finally {
      btnEnviar.disabled = false;
      btnEnviar.querySelector("span").textContent = "Enviar pedido";
    }
  });

  window.addEventListener("pedido:actualizado", () => {
    actualizarBarra();
    if (!modal.classList.contains("oculto")) renderModalCuerpo();
  });
  actualizarBarra();
})();
