// Agrupa a lista de jogos pela data de Brasilia.
export function agruparJogosPorData(jogos) {
  const jogosPorData = jogos.reduce((acc, jogo) => {
    const data = jogo.data_brasilia;

    // Cria o grupo do dia quando ele ainda nao existe.
    if (!acc[data]) {
      acc[data] = [];
    }

    // Adiciona o jogo ao grupo da data correspondente.
    acc[data].push(jogo);

    return acc;
  }, {});

  // Transforma o objeto agrupado em lista e ordena os jogos por horario.
  return Object.keys(jogosPorData).map((data) => ({
    data,
    jogos: ordenarJogosPorHorario(jogosPorData[data]),
  }));
}

// Ordena jogos em ordem crescente pelo horario de Brasilia.
export function ordenarJogosPorHorario(jogos) {
  return [...jogos].sort((jogoA, jogoB) =>
    jogoA.hora_brasilia.localeCompare(jogoB.hora_brasilia)
  );
}

// Verifica se a partida tem Brasil como mandante ou visitante.
export function jogoTemBrasil(jogo) {
  return jogo.sigla_casa === "BRA" || jogo.sigla_fora === "BRA";
}
