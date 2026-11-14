// Control inline para cada producto de la carta
function generarControlHtml(id, nombre, seccion, precio, imagen = "") {
  const cant = Pedido.obtenerCantidad(id);
  const pAttr = precio != null ? ` data-precio="${precio}"` : "";
  const imgAttr = imagen ? ` data-imagen="${esc(imagen)}"` : "";
  const base = `data-id="${esc(id)}" data-nombre="${esc(nombre)}" data-seccion="${esc(seccion)}"${imgAttr}${pAttr}`;

  if (cant === 0) {
    return `<button type="button" class="btn-agregar" ${base} aria-label="Agregar ${esc(nombre)}">
      ${ICONS.plus}<span>Pedir</span>
    </button>`;
  }

  return `<div class="contador-inline" ${base}>
    <button type="button" class="btn-menos" aria-label="Quitar uno">${ICONS.minus}</button>
    <span class="cant-num">${cant}</span>
    <button type="button" class="btn-mas" aria-label="Agregar uno">${ICONS.plus}</button>
  </div>`;
}

function actualizarTodosLosControles() {
  document.querySelectorAll(".contenedor-control").forEach(el => {
    const { id, nombre, seccion, imagen, precio } = el.dataset;
    const pVal = precio !== undefined && precio !== "" ? precio : null;
    el.innerHTML = generarControlHtml(id, nombre, seccion, pVal, imagen || "");
  });
}

// Delegación de eventos para controles inline de la carta
document.addEventListener("click", e => {
  const btnAgregar = e.target.closest(".btn-agregar");
  if (btnAgregar) {
    const { id, nombre, seccion, precio, imagen } = btnAgregar.dataset;
    Pedido.agregar(id, { nombre, seccion, precio: precio ? Number(precio) : null, imagen: imagen || "" });
    return;
  }

  const btnMas = e.target.closest(".contador-inline .btn-mas");
  if (btnMas) {
    const parent = btnMas.closest(".contador-inline");
    const { id, nombre, seccion, precio, imagen } = parent.dataset;
    Pedido.agregar(id, { nombre, seccion, precio: precio ? Number(precio) : null, imagen: imagen || "" });
    return;
  }

  const btnMenos = e.target.closest(".contador-inline .btn-menos");
  if (btnMenos) {
    const parent = btnMenos.closest(".contador-inline");
    Pedido.decrementar(parent.dataset.id);
    return;
  }
});

window.addEventListener("pedido:actualizado", () => {
  actualizarTodosLosControles();
});
