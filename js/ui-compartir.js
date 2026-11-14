// Envío del pedido con fotos via Web Share API, con fallback a wa.me
async function enviarConFotos(texto, enlaceFallback) {
  const base = (CONFIG_PEDIDO.baseUrlImagenes || "").replace(/\/$/, "");
  const items = Pedido.obtenerItems();
  const imagenes = [...new Set(
    items.map(it => it.imagen || Pedido.resolverImagen(it.id, it.nombre, it.seccion)).filter(Boolean)
  )];

  if (navigator.share && navigator.canShare && imagenes.length > 0) {
    try {
      const archivos = await Promise.all(imagenes.map(async (ruta, i) => {
        const url = `${base}/${encodeURI(ruta)}`;
        const resp = await fetch(url);
        const blob = await resp.blob();
        const ext = ruta.split(".").pop() || "jpg";
        return new File([blob], `foto${i + 1}.${ext}`, { type: blob.type });
      }));

      if (navigator.canShare({ files: archivos })) {
        await navigator.share({ files: archivos, text: texto, title: "Pedido Freshco" });
        return;
      }
    } catch (err) {
      if (err.name !== "AbortError") window.open(enlaceFallback, "_blank");
      return;
    }
  }

  window.open(enlaceFallback, "_blank");
}

