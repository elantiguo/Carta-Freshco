const GOTAS = `<svg class="gotas" viewBox="0 0 150 26" aria-hidden="true"><path fill="currentColor" d="M3 0h144a3 3 0 0 1 0 6h-20c-3 0-3 3-3 6a4 4 0 0 1-8 0c0-3 0-6-3-6H78c-3 0-3 4-3 10a5 5 0 0 1-10 0c0-6 0-10-3-10H38c-2 0-2 2-2 4a3.5 3.5 0 0 1-7 0c0-2 0-4-2-4H3a3 3 0 0 1 0-6z"/></svg>`;

const pesos = n => "$" + Number(n).toLocaleString("es-CO");

const main = document.getElementById("carta");
const nav = document.getElementById("atajos");

function renderLista(s) {
  return `<ul class="lista">${s.items.map(i => `
    <li>
      <span class="dibujo" style="--c2:${i.color ? i.color[1] : '#ff2338'}">
        ${i.imagen ? `<img src="${encodeURI(i.imagen)}" alt="${esc(i.nombre)}" loading="lazy">` : dibujar(i)}
      </span>
      <div><h3>${esc(i.nombre)}</h3>${i.sabor ? `<p>${esc(i.sabor)}</p>` : ""}</div>
      ${i.precio != null ? `<span class="precio">${pesos(i.precio)}</span>` : "<span></span>"}
    </li>`).join("")}</ul>`;
}

function renderSimple(s) {
  return `<div class="granizado-wrap">
    ${s.foto ? `<img class="granizado-foto" src="${encodeURI(s.foto.src)}" alt="${esc(s.foto.alt)}" loading="lazy">` : ""}
    <ul class="nombres">${s.items.map(i => `
      <li><strong>${esc(i.nombre)}</strong></li>`).join("")}
    </ul>
  </div>`;
}

main.innerHTML = CARTA.map(s => `
  <section id="${s.id}" class="${s.tono}">
    <h2>${s.titulo}</h2>
    ${GOTAS}
    ${s.simple ? renderSimple(s) : (s.items.length ? renderLista(s) : "")}
    ${s.nota ? `<p class="nota">${esc(s.nota)}</p>` : ""}
    ${s.fotos ? `<div class="fotos">${s.fotos.map(f =>
  `<img src="${encodeURI(f.src)}" alt="${esc(f.alt)}" loading="lazy" width="800" height="1000">`).join("")}</div>` : ""}
  </section>`).join("");

nav.innerHTML = CARTA.map(s => `<a href="#${s.id}" data-id="${s.id}">${esc(s.atajo)}</a>`).join("");

const enlaces = [...nav.querySelectorAll("a")];
const marcar = id => enlaces.forEach(a => {
  const on = a.dataset.id === id;
  a.classList.toggle("activo", on);
  if (on) nav.scrollTo({ left: a.offsetLeft - 18, behavior: "smooth" });
});

nav.addEventListener("click", e => {
  const a = e.target.closest("a");
  if (!a) return;
  e.preventDefault();
  document.getElementById(a.dataset.id).scrollIntoView({ behavior: "smooth", block: "start" });
});

if ("IntersectionObserver" in window) {
  const obs = new IntersectionObserver(es => {
    es.forEach(en => { if (en.isIntersecting) marcar(en.target.id); });
  }, { rootMargin: "-25% 0px -65% 0px" });
  document.querySelectorAll("main section").forEach(s => obs.observe(s));
}
marcar(CARTA[0].id);
