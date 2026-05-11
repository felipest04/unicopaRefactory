import { FlatList, Image, ImageBackground, StyleSheet, Text } from "react-native";
import DiaCard from "./components/DiaCard";
import dados from "./assets/dados.json";
import { agruparJogosPorData } from "./utils/jogos";

// Componente principal que monta a tela do calendario.
export default function App() {
  // Agrupa os jogos por data antes de enviar para a lista.
  const jogosPorDia = agruparJogosPorData(dados.jogos);

  return (
    // Define a imagem de fundo da tela inteira.
    <ImageBackground
      style={styles.container}
      source={require("./assets/bg-overlay.png")}
    >
      {/* Exibe a logo do projeto no topo. */}
      <Image style={styles.logo} source={require("./assets/unicopa.png")} />

      {/* Titulo principal da tela. */}
      <Text style={styles.title}>CALENDARIO</Text>

      {/* Renderiza um card para cada dia do calendario. */}
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

// Estilos da tela principal.
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
