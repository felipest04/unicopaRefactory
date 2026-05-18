import { useMemo, useState } from "react";
import {
  FlatList,
  Image,
  ImageBackground,
  StyleSheet,
  Text,
} from "react-native";
import DiaCard from "./components/DiaCard";
import dados from "./assets/dados.json";
import { agruparJogosPorData } from "./utils/jogos";

export default function App() {
  const [favoritos, setFavoritos] = useState(() => new Set());

  const jogosPorDia = useMemo(() => agruparJogosPorData(dados.jogos), []);

  const alternarFavorito = (jogoId) => {
    setFavoritos((favoritosAtuais) => {
      const novosFavoritos = new Set(favoritosAtuais);

      if (novosFavoritos.has(jogoId)) {
        novosFavoritos.delete(jogoId);
      } else {
        novosFavoritos.add(jogoId);
      }

      return novosFavoritos;
    });
  };

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
          <DiaCard
            data={item.data}
            jogos={item.jogos}
            favoritos={favoritos}
            onAlternarFavorito={alternarFavorito}
          />
        )}
        contentContainerStyle={styles.lista}
        showsVerticalScrollIndicator={false}
      />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
