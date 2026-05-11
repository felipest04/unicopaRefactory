// Converte data no formato YYYY-MM-DD para DD/MM.
export function formatarDataBrasil(data) {
  const [ano, mes, dia] = data.split("-");

  // Mantem o valor original caso a data venha em formato inesperado.
  if (!ano || !mes || !dia) {
    return data;
  }

  return `${dia}/${mes}`;
}

// Retorna a data local do sistema no formato YYYY-MM-DD.
export function obterDataAtualLocal() {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, "0");
  const dia = String(hoje.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

// Compara uma data do calendario com a data atual do sistema.
export function isDataAtual(data) {
  return data === obterDataAtualLocal();
}
