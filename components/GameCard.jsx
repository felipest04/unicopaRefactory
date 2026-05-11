import { Image, StyleSheet, Text, View } from "react-native";
import { getTeamLogo } from "../assets/teamLogos";
import { jogoTemBrasil } from "../utils/jogos";

export default function GameCard({ game }) {
  const isBrasilGame = jogoTemBrasil(game);

  return (
    <View style={[styles.jogo, isBrasilGame && styles.jogoBrasil]}>
      <Text style={styles.grupo}>
        {game.grupo ? `GRUPO ${game.grupo}` : game.fase} {game.confronto}
      </Text>

      <View style={styles.linhaPrincipal}>
        <View style={styles.time}>
          <TeamLogo sigla={game.sigla_casa} />
          <Text style={styles.sigla}>{game.sigla_casa}</Text>
        </View>

        <View style={styles.horario}>
          <Text style={styles.hora}>{game.hora_brasilia}</Text>
          <Text style={styles.subTitulo}>VS</Text>
        </View>

        <View style={styles.time}>
          <Text style={styles.sigla}>{game.sigla_fora}</Text>
          <TeamLogo sigla={game.sigla_fora} />
        </View>
      </View>

      <View style={styles.local}>
        <Text style={styles.subTitulo}>{game.estadio}</Text>
        <Text style={styles.subTitulo}>
          {game.cidade} - {game.pais}
        </Text>
      </View>
    </View>
  );
}

function TeamLogo({ sigla }) {
  const logo = getTeamLogo(sigla);

  if (!logo) {
    return (
      <View style={styles.bandeiraPlaceholder}>
        <Text style={styles.placeholderText}>{sigla.slice(0, 2)}</Text>
      </View>
    );
  }

  return <Image style={styles.bandeira} source={logo} />;
}

const styles = StyleSheet.create({
  jogo: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#1e2d3d",
    paddingBottom: 15,
    paddingHorizontal: 8,
  },
  jogoBrasil: {
    backgroundColor: "rgba(242, 204, 47, 0.08)",
    borderLeftWidth: 4,
    borderLeftColor: "#f2cc2f",
    borderRadius: 8,
    paddingTop: 10,
  },
  grupo: {
    color: "#8fa3b8",
    fontSize: 12,
    marginBottom: 10,
  },
  linhaPrincipal: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  time: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  bandeira: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  bandeiraPlaceholder: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#1e2d3d",
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    color: "#8fa3b8",
    fontSize: 9,
    fontWeight: "700",
  },
  sigla: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  horario: {
    alignItems: "center",
  },
  hora: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  local: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  subTitulo: {
    color: "#8fa3b8",
    fontSize: 12,
    flexShrink: 1,
  },
});
