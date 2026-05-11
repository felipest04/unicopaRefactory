import { FlatList, Image, ImageBackground, StyleSheet, Text } from "react-native";
import DiaCard from "./components/DiaCard";
import dados from "./assets/dados.json";
import { agruparJogosPorData } from "./utils/jogos";

export default function App() {
  const jogosPorDia = agruparJogosPorData(dados.jogos);

  return (
    <ImageBackground
      style={styles.container}
      source={require("./assets/bg-overlay.png")}
    >
      <Image style={styles.logo} source={require("./assets/unicopa.png")} />

      <Text style={styles.title}>CALENDARIO</Text>

      <FlatList
        data={jogosPorDia}
        keyExtractor={(item) => item.data}
        renderItem={({ item }) => (
          <DiaCard data={item.data} jogos={item.jogos} />
        )}
        contentContainerStyle={styles.lista}
        showsVerticalScrollIndicator={false}
      />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    height: "100%",
    width: "100%",
    backgroundColor: "#040b13",
    alignItems: "center",
  },
  logo: {
    marginTop: 20,
    width: 200,
    height: 50,
    resizeMode: "contain",
  },
  title: {
    marginTop: 10,
    fontSize: 28,
    fontWeight: "700",
    color: "white",
  },
  lista: {
    paddingBottom: 24,
  },
});
