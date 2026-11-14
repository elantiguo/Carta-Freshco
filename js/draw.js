const esc = s => String(s).replace(/[&<>"]/g, c => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;"
}[c]));

const VASOS = {
  alto: { d: "M23 24 L26.5 90 Q27 94 31 94 H49 Q53 94 53.5 90 L57 24 Z", borde: [23, 57, 24], nivel: 33 },
  corto: { d: "M17 46 L20.5 89 Q21 94 26 94 H54 Q59 94 59.5 89 L63 46 Z", borde: [17, 63, 46], nivel: 55 },
  margarita: { d: "M10 34 H70 Q68 50 48 55 Q44 56 44 62 H36 Q36 56 32 55 Q12 50 10 34 Z", borde: [10, 70, 34], nivel: 39, pie: 62 },
  copa: { d: "M13 34 H67 Q66 58 40 60 Q14 58 13 34 Z", borde: [13, 67, 34], nivel: 39, pie: 60 },
  botella: { d: "M35 10 H45 V30 Q45 36 50 42 Q54 47 54 54 V90 Q54 94 50 94 H30 Q26 94 26 90 V54 Q26 47 30 42 Q35 36 35 30 Z", borde: [35, 45, 10], nivel: 18 },
  huracan: { d: "M28 20 Q21 40 28 54 Q34 64 36 72 H44 Q46 64 52 54 Q59 40 52 20 Z", borde: [28, 52, 20], nivel: 27, pie: 72 }
};

const rodaja = (x, y, piel, pulpa) => `
  <g transform="translate(${x} ${y})">
    <circle r="9.5" fill="${piel}"/><circle r="7.2" fill="${pulpa}"/>
    <path d="M0-7V7M-7 0H7M-5-5 5 5M-5 5 5-5" stroke="${piel}" stroke-width="1.1" opacity=".75"/>
    <circle r="9.5" fill="none" stroke="#06070d" stroke-width="1.2" opacity=".45"/>
  </g>`;

const ADORNOS = {
  lima: (x1, x2, y) => rodaja(x2 - 1, y, "#4faa1e", "#d8f58a"),
  limon: (x1, x2, y) => rodaja(x2 - 1, y, "#f2c200", "#fff3a3"),
  naranja: (x1, x2, y) => rodaja(x2 - 1, y, "#ff8a00", "#ffc56b"),
  cereza: (x1, x2, y) => `<path d="M${x1 + 9} ${y - 3} q2 -10 9 -12" fill="none" stroke="#7a3b12" stroke-width="1.3" stroke-linecap="round"/>
    <circle cx="${x1 + 9}" cy="${y - 1}" r="5" fill="#e3112d"/><circle cx="${x1 + 7.5}" cy="${y - 2.5}" r="1.4" fill="#fff" opacity=".8"/>`,
  menta: (x1, x2, y) => {
    const c = (x1 + x2) / 2 - 3;
    return `
    <g fill="#2fbf5a" stroke="#0f6b2c" stroke-width=".8">
      <ellipse cx="${c - 5}" cy="${y - 5}" rx="6" ry="3.4" transform="rotate(-35 ${c - 5} ${y - 5})"/>
      <ellipse cx="${c + 5}" cy="${y - 6}" rx="6" ry="3.4" transform="rotate(30 ${c + 5} ${y - 6})"/>
      <ellipse cx="${c}" cy="${y - 10}" rx="6.5" ry="3.6" transform="rotate(-85 ${c} ${y - 10})"/>
    </g>`;
  },
  pina: (x1, x2, y) => `<g transform="translate(${x2 - 3} ${y})">
      <path d="M-2 -12 l-5 -8 l5 3 l1 -7 l3 7 l5 -4 l-3 9 z" fill="#2fbf5a" stroke="#0f6b2c" stroke-width=".8"/>
      <path d="M-9 4 L3 -13 L10 5 Z" fill="#ffd23f" stroke="#c98a00" stroke-width="1.2" stroke-linejoin="round"/>
      <path d="M-3 0 l4 3 M0 -5 l5 4" stroke="#c98a00" stroke-width=".9" opacity=".7"/>
    </g>`,
  fresa: (x1, x2, y) => `<g transform="translate(${x2 - 4} ${y - 2})">
      <path d="M0 9 C-9 3 -9 -6 0 -6 C9 -6 9 3 0 9 Z" fill="#ff2338" stroke="#9c0b1c" stroke-width="1"/>
      <path d="M-5 -6 l5 -4 l5 4 l-5 2 z" fill="#2fbf5a" stroke="#0f6b2c" stroke-width=".7"/>
      <g fill="#ffd9a0"><circle cx="-3" cy="-1" r=".7"/><circle cx="2" cy="0" r=".7"/><circle cx="0" cy="4" r=".7"/><circle cx="3" cy="-3" r=".7"/></g>
    </g>`,
  sal: (x1, x2, y) => `<path d="M${x1} ${y}H${x2}" stroke="#fff" stroke-width="4.5" stroke-linecap="round" stroke-dasharray=".1 3.2"/>`
};

let nDibujo = 0;
function dibujar(i) {
  const v = VASOS[i.vaso], n = ++nDibujo, [x1, x2, y] = v.borde, m = (x1 + x2) / 2;
  const hielo = i.hielo ? [[m - 9, v.nivel + 6, -14], [m + 2, v.nivel + 16, 18], [m - 7, v.nivel + 27, 8]].map(([x, yy, r]) =>
    `<rect x="${x}" y="${yy}" width="10" height="10" rx="2" fill="#fff" opacity=".3" transform="rotate(${r} ${x + 5} ${yy + 5})"/>`).join("") : "";
  const trozos = i.trozos ? `<g fill="#1f9d44" opacity=".85"><ellipse cx="${m - 6}" cy="${v.nivel + 22}" rx="4" ry="2" transform="rotate(-30 ${m - 6} ${v.nivel + 22})"/><ellipse cx="${m + 7}" cy="${v.nivel + 38}" rx="4" ry="2" transform="rotate(25 ${m + 7} ${v.nivel + 38})"/><ellipse cx="${m - 3}" cy="${v.nivel + 50}" rx="4" ry="2"/></g>` : "";
  return `<svg viewBox="0 0 80 100" role="img" aria-label="Ilustración de ${esc(i.nombre)}">
    <defs>
      <linearGradient id="g${n}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${i.color[0]}"/><stop offset="1" stop-color="${i.color[1]}"/></linearGradient>
      <clipPath id="c${n}"><path d="${v.d}"/></clipPath>
    </defs>
    ${i.pitillo ? `<path d="M${m + 10} 6 L${m + 3} ${v.nivel + 30}" stroke="${i.pitillo}" stroke-width="3.2" stroke-linecap="round"/><path d="M${m + 10} 6 L${m + 3} ${v.nivel + 30}" stroke="#fff" stroke-width=".8" opacity=".5"/>` : ""}
    ${v.pie ? `<path d="M40 ${v.pie}V90M27 92H53" stroke="#eaf6ff" stroke-width="2.4" stroke-linecap="round"/>` : ""}
    <path d="${v.d}" fill="#fff" opacity=".1"/>
    <g clip-path="url(#c${n})">
      <rect x="0" y="${v.nivel}" width="80" height="100" fill="url(#g${n})"/>
      ${i.espuma ? `<rect x="0" y="${v.nivel}" width="80" height="7" fill="#fff" opacity=".95"/>` : ""}
      ${hielo}${trozos}
      ${i.etiqueta ? `<rect x="20" y="58" width="40" height="19" fill="${i.etiqueta}"/><rect x="20" y="22" width="40" height="5" fill="${i.etiqueta}"/>` : ""}
      <path d="M${x1 + 6} ${y + 4} L${x1 + 9} 90" stroke="#fff" stroke-width="2.2" opacity=".35" stroke-linecap="round"/>
    </g>
    <path d="${v.d}" fill="none" stroke="#eaf6ff" stroke-width="2" stroke-linejoin="round"/>
    ${i.tapa ? `<rect x="33.5" y="5" width="13" height="6" rx="1.5" fill="${i.tapa}" stroke="#06070d" stroke-width=".6"/>` : ""}
    ${(i.adornos || []).map(a => ADORNOS[a](x1, x2, y)).join("")}
  </svg>`;
}

