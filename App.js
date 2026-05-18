import { useMemo, useState } from "react";
import {
  FlatList,
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import DiaCard from "./components/DiaCard";
import dados from "./assets/dados.json";
import { agruparJogosPorData } from "./utils/jogos";

export default function App() {
  const [grupoSelecionado, setGrupoSelecionado] = useState("Todos");
  const [favoritos, setFavoritos] = useState(() => new Set());

  const grupos = useMemo(
    () =>
      [
        "Todos",
        ...new Set(
          dados.jogos
            .map((jogo) => jogo.grupo)
            .filter(Boolean)
            .sort((grupoA, grupoB) => grupoA.localeCompare(grupoB))
        ),
      ],
    []
  );

  const jogosFiltrados = useMemo(() => {
    if (grupoSelecionado === "Todos") {
      return dados.jogos;
    }

    return dados.jogos.filter((jogo) => jogo.grupo === grupoSelecionado);
  }, [grupoSelecionado]);

  const jogosPorDia = useMemo(
    () => agruparJogosPorData(jogosFiltrados),
    [jogosFiltrados]
  );

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

      <View style={styles.filtrosContainer}>
        <ScrollView
          horizontal
          style={styles.filtrosScroll}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtros}
        >
          {grupos.map((grupo) => {
            const isSelecionado = grupo === grupoSelecionado;

            return (
              <Pressable
                key={grupo}
                onPress={() => setGrupoSelecionado(grupo)}
                style={[
                  styles.filtroGrupo,
                  isSelecionado && styles.filtroGrupoSelecionado,
                ]}
                accessibilityRole="button"
                accessibilityLabel={
                  grupo === "Todos"
                    ? "Exibir todos os grupos"
                    : `Filtrar jogos do grupo ${grupo}`
                }
              >
                <Text
                  style={[
                    styles.filtroGrupoTexto,
                    isSelecionado && styles.filtroGrupoTextoSelecionado,
                  ]}
                >
                  {grupo === "Todos" ? "TODOS" : `GRUPO ${grupo}`}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

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
  filtrosContainer: {
    width: 320,
    height: 66,
    marginTop: 12,
    marginBottom: 2,
  },
  filtrosScroll: {
    flex: 1,
    width: "100%",
  },
  filtros: {
    minHeight: 54,
    paddingHorizontal: 2,
    paddingVertical: 8,
    alignItems: "center",
    gap: 8,
  },
  filtroGrupo: {
    height: 38,
    minWidth: 84,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#28415b",
    backgroundColor: "#0c1b2a",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  filtroGrupoSelecionado: {
    backgroundColor: "#f2cc2f",
    borderColor: "#f2cc2f",
  },
  filtroGrupoTexto: {
    color: "#8fa3b8",
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 14,
  },
  filtroGrupoTextoSelecionado: {
    color: "#04120a",
  },
  lista: {
    paddingBottom: 24,
  },
});
