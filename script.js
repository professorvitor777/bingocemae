function gerarCartelas() {
  const container = document.getElementById("cartelas-container");
  container.innerHTML = "";

  for (let i = 0; i < 3; i++) {
    const cartela = criarCartela();
    container.appendChild(cartela);
  }
}

function criarCartela() {
  const numeros = gerarNumerosBingo90();
  const cartela = document.createElement("div");
  cartela.className = "cartela";

  for (let i = 0; i < 27; i++) {
    const celula = document.createElement("div");

    if (numeros[i] !== null) {
      celula.className = "numero";
      celula.textContent = numeros[i].toString().padStart(2, "0");
    } else {
      celula.className = "numero vazio";
      celula.textContent = "";
    }

    cartela.appendChild(celula);
  }

  return cartela;
}

function gerarNumerosBingo90() {
  // 3 linhas, 9 colunas, 15 números por cartela, 5 por linha
  const colunas = Array.from({ length: 9 }, (_, i) => {
    const inicio = i * 10 + 1;
    const fim = i === 8 ? 90 : (i + 1) * 10;
    const quantidade = 3;
    const numeros = [];
    while (numeros.length < quantidade) {
      const n = Math.floor(Math.random() * (fim - inicio + 1)) + inicio;
      if (!numeros.includes(n)) numeros.push(n);
    }
    return numeros.sort((a, b) => a - b);
  });

  // Preparar 3 linhas com 5 números e 4 espaços vazios cada
  const linhas = [[], [], []];
  const indicesColunas = Array.from({ length: 9 }, (_, i) => i);

  for (let linha = 0; linha < 3; linha++) {
    let colunasUsadas = 0;
    let colunasDisponiveis = [...indicesColunas];
    while (colunasUsadas < 5) {
      const index = Math.floor(Math.random() * colunasDisponiveis.length);
      const coluna = colunasDisponiveis.splice(index, 1)[0];
      if (colunas[coluna].length > 0) {
        linhas[linha][coluna] = colunas[coluna].pop();
        colunasUsadas++;
      }
    }
  }

  // Preencher vazios com null
  for (let linha = 0; linha < 3; linha++) {
    for (let coluna = 0; coluna < 9; coluna++) {
      if (typeof linhas[linha][coluna] === "undefined") {
        linhas[linha][coluna] = null;
      }
    }
  }

  // Linearizar as linhas
  return linhas.flat();
}
