const grid = document.getElementById("bingo-grid");
const sorteadosSpan = document.getElementById("numeros-sorteados");
const ultimoSpan = document.getElementById("ultimo");
const botaoSortear = document.getElementById("sortear");
const botaoReiniciar = document.getElementById("reiniciar");
const botaoVoltar = document.getElementById("voltar");

let numeros = Array.from({ length: 90 }, (_, i) => ({
  numero: i + 1,
  marcado: false
}));

let sorteados = [];

// Recuperar dados do localStorage ao carregar
if (localStorage.getItem("sorteados")) {
  try {
    sorteados = JSON.parse(localStorage.getItem("sorteados"));
    numeros = numeros.map((n) =>
      sorteados.includes(n.numero) ? { ...n, marcado: true } : n
    );
  } catch (e) {
    console.error("Erro ao carregar do localStorage");
  }
}

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
  setTimeout(() => (botaoSortear.disabled = false), 500);
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
  salvarNoLocalStorage();
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
    ultimoSpan.innerText = sorteados[sorteados.length - 1];
  }
}

function reiniciarJogo() {
  if (confirm("Deseja reiniciar o jogo? Isso apagará os sorteios.")) {
    numeros = Array.from({ length: 90 }, (_, i) => ({
      numero: i + 1,
      marcado: false
    }));
    sorteados = [];
    salvarNoLocalStorage();
    renderizarNumeros();
  }
}

function voltarUltimo() {
  if (sorteados.length === 0) return;
  const removido = sorteados.pop();
  numeros = numeros.map((n) =>
    n.numero === removido ? { ...n, marcado: false } : n
  );
  salvarNoLocalStorage();
  renderizarNumeros();
}

function salvarNoLocalStorage() {
  localStorage.setItem("sorteados", JSON.stringify(sorteados));
}

botaoSortear.onclick = sortearNumero;
botaoReiniciar.onclick = reiniciarJogo;
botaoVoltar.onclick = voltarUltimo;

renderizarNumeros();
