// Carga la carta desde js/data.js (el mismo archivo que usa el navegador)
// para que el servidor valide los productos y no confíe en lo que envía el cliente.
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const RUTA = path.join(__dirname, "..", "js", "data.js");

function cargarCarta() {
  const codigo = fs.readFileSync(RUTA, "utf8");
  const { CARTA } = vm.runInNewContext(`${codigo}\n;({ CARTA })`, {}, { filename: RUTA });

  const productos = new Map();
  for (const sec of CARTA) {
    for (const it of sec.items || []) {
      const imagen = it.imagen || (sec.foto && sec.foto.src) || (sec.fotos && sec.fotos[0] && sec.fotos[0].src) || "";
      productos.set(`${sec.id}::${it.nombre}`, {
        nombre: it.nombre,
        seccion: sec.atajo,
        imagen,
        precio: typeof it.precio === "number" ? it.precio : null
      });
    }
  }
  return productos;
}

module.exports = { cargarCarta };
