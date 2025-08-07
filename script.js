const grid = document.getElementById("bingo-grid");
const sorteadosSpan = document.getElementById("numeros-sorteados");
const ultimoSpan = document.getElementById("ultimo");
const botaoSortear = document.getElementById("sortear");
const botaoReiniciar = document.getElementById("reiniciar");
const botaoVoltar = document.getElementById("voltar");
const botaoCartelas = document.getElementById("gerar-cartelas");
const cartelasContainer = document.getElementById("cartelas");

let numeros = Array.from({ length: 90 }, (_, i) => ({ numero: i + 1, marcado: false }));
let sorteados = [];

// Carregar do localStorage
if (localStorage.getItem("sorteados")) {
  try {
    sorteados = JSON.parse(localStorage.getItem("sorteados"));
    numeros = numeros.map(n => sorteados.includes(n.numero) ? { ...n, marcado: true } : n);
  } catch { console.error("Erro ao carregar do localStorage"); }
}

function renderizarNumeros() {
  grid.innerHTML = "";
  numeros.forEach(n => {
    const div = document.createElement("div");
    div.className = "numero" + (n.marcado ? " marcado" : "");
    div.innerText = n.numero;
    div.onclick = () => marcarManual(n.numero);
    grid.appendChild(div);
  });
  atualizarSorteados();
}

function sortearNumero() {
  const disponiveis = numeros.filter(n => !n.marcado && !sorteados.includes(n.numero));
  if (!disponiveis.length) return alert("Todos os números foram sorteados!");
  const sorteado = disponiveis[Math.floor(Math.random() * disponiveis.length)].numero;
  marcarNumero(sorteado);
  botaoSortear.disabled = true;
  setTimeout(() => botaoSortear.disabled = false, 500);
}

function marcarManual(numero) {
  if (!sorteados.includes(numero)) marcarNumero(numero);
}

function marcarNumero(numero) {
  sorteados.push(numero);
  numeros = numeros.map(n => n.numero === numero ? { ...n, marcado: true } : n);
  salvarNoLocalStorage();
  renderizarNumeros();
  ultimoSpan.innerText = numero;
}

function atualizarSorteados() {
  if (!sorteados.length) {
    sorteadosSpan.innerText = "Nenhum ainda";
    ultimoSpan.innerText = "--";
  } else {
    const orden = [...sorteados].sort((a,b) => a-b);
    sorteadosSpan.innerText = orden.join(", ");
    ultimoSpan.innerText = sorteados[sorteados.length-1];
  }
}

function reiniciarJogo() {
  if (confirm("Deseja reiniciar o jogo?")) {
    numeros = Array.from({ length: 90 }, (_,i) => ({ numero: i+1, marcado: false }));
    sorteados = [];
    salvarNoLocalStorage();
    renderizarNumeros();
    cartelasContainer.innerHTML = "";
  }
}

function voltarUltimo() {
  if (!sorteados.length) return;
  const rem = sorteados.pop();
  numeros = numeros.map(n => n.numero===rem ? { ...n, marcado: false } : n);
  salvarNoLocalStorage();
  renderizarNumeros();
}

function gerarCartelas() {
  cartelasContainer.innerHTML = "";
  for (let i = 1; i <= 20; i++) {
    const numerosUnicos = new Set();
    while (numerosUnicos.size < 30) {
      numerosUnicos.add(Math.ceil(Math.random()*90));
    }
    const arr = [...numerosUnicos].sort((a,b)=>a-b);
    const cartela = document.createElement("div");
    cartela.className = "cartela";
    cartela.innerHTML = `<h3>Cartela ${i}</h3>`;
    const gridC = document.createElement("div");
    gridC.className = "grid-cartela";
    arr.forEach(num => {
      const cell = document.createElement("div");
      cell.className = "numero-cartela";
      cell.innerText = num;
      gridC.appendChild(cell);
    });
    cartela.appendChild(gridC);
    cartelasContainer.appendChild(cartela);
  }
  window.print();
}

function salvarNoLocalStorage() {
  localStorage.setItem("sorteados", JSON.stringify(sorteados));
}

botaoSortear.onclick = sortearNumero;
botaoReiniciar.onclick = reiniciarJogo;
botaoVoltar.onclick = voltarUltimo;
botaoCartelas.onclick = gerarCartelas;

renderizarNumeros();
