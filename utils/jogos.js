export function agruparJogosPorData(jogos) {
  const jogosPorData = jogos.reduce((acc, jogo) => {
    const data = jogo.data_brasilia;

    if (!acc[data]) {
      acc[data] = [];
    }

    acc[data].push(jogo);

    return acc;
  }, {});

  return Object.keys(jogosPorData).map((data) => ({
    data,
    jogos: jogosPorData[data],
  }));
}

export function jogoTemBrasil(jogo) {
  return jogo.sigla_casa === "BRA" || jogo.sigla_fora === "BRA";
}
