// Carga la carta desde js/data.js (el mismo archivo que usa el navegador)
// para que el servidor valide productos y calcule precios sin confiar en el cliente.
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const RUTA = path.join(__dirname, "..", "js", "data.js");

function cargarCarta() {
  const codigo = fs.readFileSync(RUTA, "utf8");
  const carta = vm.runInNewContext(
    `${codigo}\n;({ CARTA, buscarProducto, precioDe, esDiaPromo })`,
    {},
    { filename: RUTA }
  );

  return {
    // Devuelve los datos del producto o null si no existe
    producto(id) {
      const p = carta.buscarProducto(String(id));
      if (!p) return null;
      return { nombre: p.item.nombre, seccion: p.seccion.atajo, imagen: p.imagen, precios: p.precios };
    },
    precio(precios, opciones) {
      return carta.precioDe(precios, opciones);
    },
    esDiaPromo(fecha) {
      return carta.esDiaPromo(fecha);
    }
  };
}

module.exports = { cargarCarta };
