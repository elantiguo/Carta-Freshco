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
            <label><span>Dirección actual obligatoria: *</span><input type="text" id="pedido-dir" placeholder="Ej: Carrera 15 # 45-20" maxlength="80"></label>
          </div>
          <label><span>Notas adicionales (opcional):</span><input type="text" id="pedido-notas" placeholder="Ej: Con bastante hielo" maxlength="120"></label>
        </div>
        <div class="modal-pie">
          <div class="modal-resumen"><span id="modal-total-cant">0 productos</span><strong id="modal-total-precio"></strong></div>
          <div class="modal-acciones">
            <button type="button" id="btn-vaciar" class="btn-secundario">Vaciar</button>
            <button type="button" id="btn-enviar-whatsapp" class="btn-whatsapp">${ICONS.whatsapp}<span>Pedir</span></button>
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
  let tipoEntrega = "local", mesaSeleccionada = "1";

  const abrirModal = () => { renderModalCuerpo(); modal.classList.remove("oculto"); document.body.style.overflow = "hidden"; };
  const cerrarModal = () => { modal.classList.add("oculto"); document.body.style.overflow = ""; };

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
          ${it.precio ? `<span class="modal-item-precio">$${(it.precio * it.cantidad).toLocaleString("es-CO")}</span>` : ""}</div>
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
    campoLocal.classList.toggle("oculto", tipoEntrega !== "local");
    campoDomicilio.classList.toggle("oculto", tipoEntrega !== "domicilio");
  }));

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

  document.getElementById("btn-enviar-whatsapp").addEventListener("click", () => {
    if (!Pedido.totalItems()) return alert("Agrega al menos un producto para enviar tu pedido.");
    if (tipoEntrega === "domicilio") {
      if (!inputNombre.value.trim()) { inputNombre.focus(); return alert("Por favor ingresa tu nombre para el domicilio."); }
      if (!inputDir.value.trim()) { inputDir.focus(); return alert("Por favor ingresa la dirección actual para la entrega."); }
    }
    const opts = { tipo: tipoEntrega, mesa: mesaSeleccionada, nombre: inputNombre.value, direccion: inputDir.value, notas: inputNotas.value };
    enviarConFotos(Pedido.crearTextoWhatsapp(opts), Pedido.crearEnlaceWhatsapp(opts));
  });

  window.addEventListener("pedido:actualizado", () => {
    actualizarBarra();
    if (!modal.classList.contains("oculto")) renderModalCuerpo();
  });
  actualizarBarra();
})();
