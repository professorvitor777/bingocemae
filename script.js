const grid = document.getElementById("bingo-grid");
const sorteadosSpan = document.getElementById("numeros-sorteados");
const ultimoSpan = document.getElementById("ultimo");
const botaoSortear = document.getElementById("sortear");
const botaoReiniciar = document.getElementById("reiniciar");

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
  if (disponiveis.length === 0) {
    alert("Todos os números foram sorteados!");
    return;
  }
  const sorteado =
    disponiveis[Math.floor(Math.random() * disponiveis.length)].numero;
  marcarNumero(sorteado);
  botaoSortear.disabled = true;
  setTimeout(() => (botaoSortear.disabled = false), 500); // Evita clique duplo
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
  ultimoSpan.innerText = numero;
}

function atualizarSorteados() {
  if (sorteados.length === 0) {
    sorteadosSpan.innerText = "Nenhum ainda";
    ultimoSpan.innerText = "--";
  } else {
    const ordenados = [...sorteados].sort((a, b) => a - b);
    sorteadosSpan.innerText = ordenados.join(", ");
  }
}

function reiniciarJogo() {
  if (confirm("Deseja reiniciar o jogo?")) {
    numeros = Array.from({ length: 90 }, (_, i) => ({
      numero: i + 1,
      marcado: false
    }));
    sorteados = [];
    renderizarNumeros();
  }
}

botaoSortear.onclick = sortearNumero;
botaoReiniciar.onclick = reiniciarJogo;

renderizarNumeros();
