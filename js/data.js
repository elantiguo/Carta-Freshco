const CARTA = [
  {
    id: "con-licor", atajo: "Con licor", tono: "rojo",
    titulo: "Granizados <em>con licor</em>",
    items: [
      { nombre: "Ardiente", sabor: "Aguardiente con chile", vaso: "alto", hielo: true, color: ["#ff4a3d", "#8b0000"], precio: null },
      { nombre: "Mora Blue", sabor: "Mora con curazao azul", vaso: "alto", hielo: true, color: ["#7b2fff", "#1a0066"], precio: null },
      { nombre: "Fresa Intensa", sabor: "Fresa concentrada con vodka", vaso: "alto", hielo: true, color: ["#ff4466", "#990022"], precio: null },
      { nombre: "Mar Azul", sabor: "Curazao azul con cítricos", vaso: "alto", hielo: true, color: ["#00bfff", "#003366"], precio: null },
      { nombre: "Caipirinha", sabor: "Lima y cachaza brasileña", vaso: "alto", hielo: true, color: ["#c8ff66", "#2e7a00"], precio: null },
      { nombre: "Rosé Summer", sabor: "Vino rosado con frutas", vaso: "alto", hielo: true, color: ["#ffb3c6", "#cc3366"], precio: null },
      { nombre: "Smirnoff", sabor: "Vodka con frutas cítricas", vaso: "alto", hielo: true, color: ["#e0f0ff", "#4dabff"], precio: null },
      { nombre: "Sex On The Beach", sabor: "Durazno, naranja y vodka", vaso: "alto", hielo: true, color: ["#ffaa33", "#ff4444"], precio: null },
      { nombre: "Mulberry", sabor: "Mora silvestre con ron", vaso: "alto", hielo: true, color: ["#c44dbb", "#3d003d"], precio: null },
      { nombre: "Margarita", sabor: "Lima con tequila y sal", vaso: "alto", hielo: true, color: ["#e6ff80", "#669900"], precio: null },
      { nombre: "Jumanji", sabor: "Mix de frutas tropicales con ron", vaso: "alto", hielo: true, color: ["#33cc66", "#004d1a"], precio: null }
    ],
    fotos: [
      { src: "img/coctel-limon.jpg", alt: "Granizado con rodaja de limón en la barra de Freshco" },
      { src: "img/coctel-picante.jpg", alt: "Granizado con borde picante en Freshco" }
    ]
  },
  {
    id: "sin-licor", atajo: "Sin licor", tono: "hielo",
    titulo: "Granizados <em>sin licor</em>",
    items: [
      { nombre: "Mora Azul", sabor: "Mora azul natural", vaso: "alto", hielo: true, color: ["#6644cc", "#220066"], precio: null },
      { nombre: "Maracuyá", sabor: "Fruta de la pasión", vaso: "alto", hielo: true, color: ["#ffcc00", "#cc8800"], precio: null },
      { nombre: "Mango Biche", sabor: "Mango verde", vaso: "alto", hielo: true, color: ["#99cc33", "#336600"], precio: null },
      { nombre: "Bubbachella", sabor: "Tutti frutti", vaso: "alto", hielo: true, color: ["#ff66cc", "#cc0088"], precio: null },
      { nombre: "Sandía", sabor: "Sandía natural", vaso: "alto", hielo: true, color: ["#ff3355", "#880022"], precio: null },
      { nombre: "Frambuesa", sabor: "Frambuesa natural", vaso: "alto", hielo: true, color: ["#ff3377", "#990033"], precio: null },
      { nombre: "Fresa", sabor: "Fresa natural", vaso: "alto", hielo: true, color: ["#ff4455", "#aa0011"], precio: null }
    ],
    fotos: [
      { src: "img/vaso-morado.jpg", alt: "Vaso Freshco morado con gomitas y bolitas de colores" },
      { src: "img/vaso-naranja.jpg", alt: "Vaso Freshco naranja con gomitas y borde picante" }
    ]
  },
  {
    id: "cervezas", atajo: "Cervezas", tono: "ambar",
    titulo: "Las <em>cervezas</em>",
    items: [
      { nombre: "Coronita", imagen: "img/coronita.webp", vaso: "botella", etiqueta: "#ffffff", tapa: "#f5c542", sabor: "Cerveza mexicana", color: ["#fff3b0", "#f0bd2a"], precio: null },
      { nombre: "Poker", imagen: "img/poker.webp", vaso: "botella", etiqueta: "#d81e2c", tapa: "#e8e8e8", sabor: "Cerveza colombiana", color: ["#9a5a1a", "#4a2508"], precio: null },
      { nombre: "Águila", imagen: "img/aguila.webp", vaso: "botella", etiqueta: "#ffd21f", tapa: "#2f6bff", sabor: "Cerveza colombiana", color: ["#b06a1e", "#5a2c0a"], precio: null }
    ]
  }
];
