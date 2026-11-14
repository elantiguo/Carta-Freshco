const STORAGE_KEY = "freshco_pedido_v1";
const ULTIMO_KEY = "freshco_ultimo_pedido";

const Pedido = {
  items: {},

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
        id, nombre: nom, seccion: sec, precio: datos.precio || null,
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
    return Object.values(this.items).reduce((acc, it) => acc + ((Number(it.precio) || 0) * it.cantidad), 0);
  },

  tienePrecios() {
    return Object.values(this.items).some(it => it.precio != null && it.precio > 0);
  },

  // Envía el pedido al servidor. Devuelve { id, numero }.
  async enviar({ tipo = "local", mesa = "1", nombre = "", direccion = "", notas = "" } = {}) {
    const items = this.obtenerItems().map(it => ({ id: it.id, cantidad: it.cantidad }));
    const res = await fetch("/api/pedidos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tipo, mesa, nombre, direccion, notas, items })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "No se pudo enviar el pedido");
    try { localStorage.setItem(ULTIMO_KEY, data.id); } catch (e) {}
    return data;
  }
};

Pedido.init();
