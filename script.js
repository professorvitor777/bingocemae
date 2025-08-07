const grid = document.getElementById("bingo-grid");
const sorteadosSpan = document.getElementById("numeros-sorteados");
const botaoSortear = document.getElementById("sortear");

let numeros = Array.from({ length: 90 }, (_, i) => ({
  numero: i + 1,
  marcado: false
}));

let sorteados = [];

function renderizarNumeros() {
  grid.innerHTML = "";
  numeros.forEach((n) => {
    const div = document.createElement("div");
    div.className = "numero" + (n.marcado ? " marcado" : "");
    div.innerText = n.numero;
    div.onclick = () => marcarManual(n.numero);
    grid.appendChild(div);
  });
  atualizarSorteados();
}

function sortearNumero() {
  const disponiveis = numeros.filter(
    (n) => !n.marcado && !sorteados.includes(n.numero)
  );
  if (disponiveis.length === 0) return;
  const sorteado =
    disponiveis[Math.floor(Math.random() * disponiveis.length)].numero;
  marcarNumero(sorteado);
}

function marcarManual(numero) {
  if (!sorteados.includes(numero)) {
    marcarNumero(numero);
  }
}

function marcarNumero(numero) {
  sorteados.push(numero);
  numeros = numeros.map((n) =>
    n.numero === numero ? { ...n, marcado: true } : n
  );
  renderizarNumeros();
}

function atualizarSorteados() {
  if (sorteados.length === 0) {
    sorteadosSpan.innerText = "Nenhum ainda";
  } else {
    const ordenados = [...sorteados].sort((a, b) => a - b);
    sorteadosSpan.innerText = ordenados.join(", ");
  }
}

botaoSortear.onclick = sortearNumero;

renderizarNumeros();
