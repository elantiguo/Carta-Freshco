const STORAGE_KEY = "freshco_pedido_v1";
const ULTIMO_KEY = "freshco_ultimo_pedido";

const Pedido = {
  items: {},
  tipo: "local", // "local" o "domicilio": cambia el precio de los granizados

  // Precio unitario actual (según tipo de entrega y día de promo)
  precioUnitario(id) {
    const p = typeof buscarProducto === "function" ? buscarProducto(id) : null;
    return p ? precioDe(p.precios, { domicilio: this.tipo === "domicilio" }) : null;
  },

  cambiarTipo(tipo) {
    this.tipo = tipo === "domicilio" ? "domicilio" : "local";
    window.dispatchEvent(new CustomEvent("pedido:actualizado", { detail: this.items }));
  },

  resolverImagen(id = "", nombre = "", seccion = "") {
    if (typeof CARTA === "undefined") return "";
    const [sId, n] = id.split("::");
    const sec = CARTA.find(s => s.id === sId || s.atajo === seccion || s.id === seccion);
    if (!sec) return "";
    const it = (sec.items || []).find(i => i.nombre === (n || nombre));
    if (it && it.imagen) return it.imagen;
    if (sec.foto && sec.foto.src) return sec.foto.src;
    if (sec.fotos && sec.fotos.length) return sec.fotos[0].src;
    return "";
  },

  init() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      this.items = data ? JSON.parse(data) : {};
      Object.values(this.items).forEach(it => {
        delete it.precio; // precios viejos guardados: ahora se calculan siempre
        if (!it.imagen) it.imagen = this.resolverImagen(it.id, it.nombre, it.seccion);
      });
    } catch (e) { this.items = {}; }
  },

  guardar() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items)); } catch (e) {}
    window.dispatchEvent(new CustomEvent("pedido:actualizado", { detail: this.items }));
  },

  obtenerItems() { return Object.values(this.items); },
  obtenerCantidad(id) { return this.items[id] ? this.items[id].cantidad : 0; },

  agregar(id, datos = {}) {
    const nom = datos.nombre || (id.split("::")[1] || "");
    const sec = datos.seccion || (id.split("::")[0] || "");
    if (!this.items[id]) {
      this.items[id] = {
        id, nombre: nom, seccion: sec,
        imagen: datos.imagen || this.resolverImagen(id, nom, sec), cantidad: 0
      };
    }
    if (!this.items[id].imagen) {
      this.items[id].imagen = datos.imagen || this.resolverImagen(id, nom, sec);
    }
    this.items[id].cantidad += 1;
    this.guardar();
  },

  decrementar(id) {
    if (!this.items[id]) return;
    this.items[id].cantidad -= 1;
    if (this.items[id].cantidad <= 0) delete this.items[id];
    this.guardar();
  },

  eliminar(id) {
    if (this.items[id]) { delete this.items[id]; this.guardar(); }
  },

  vaciar() { this.items = {}; this.guardar(); },
  totalItems() { return Object.values(this.items).reduce((acc, it) => acc + it.cantidad, 0); },

  totalPrecio() {
    return Object.values(this.items).reduce((acc, it) => acc + ((this.precioUnitario(it.id) || 0) * it.cantidad), 0);
  },

  tienePrecios() {
    return Object.values(this.items).some(it => this.precioUnitario(it.id) > 0);
  },

  // Envía el pedido al servidor. Devuelve { id, numero }.
  async enviar({ tipo = "local", mesa = "1", nombre = "", direccion = "", telefono = "", notas = "", ubicacion = null } = {}) {
    const items = this.obtenerItems().map(it => ({ id: it.id, cantidad: it.cantidad }));
    const res = await fetch("/api/pedidos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tipo, mesa, nombre, direccion, telefono, notas, items, ubicacion })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "No se pudo enviar el pedido");
    try { localStorage.setItem(ULTIMO_KEY, data.id); } catch (e) {}
    return data;
  }
};

Pedido.init();
