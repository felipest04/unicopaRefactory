import { useEffect, useMemo, useState } from "react";
import {
  Alert,
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
import { agruparJogosPorData } from "./utils/jogos";
import { importarJogosDoJson } from "./utils/importarJogos";
import {
  atualizarFavoritoDoJogo,
  listarJogosDoBanco,
} from "./utils/jogosBanco";

export default function App() {
  const [grupoSelecionado, setGrupoSelecionado] = useState("Todos");
  const [jogos, setJogos] = useState([]);
  const [isCarregandoJogos, setIsCarregandoJogos] = useState(true);
  const [isImportandoJogos, setIsImportandoJogos] = useState(false);
  const [erroJogos, setErroJogos] = useState("");

  const carregarJogos = async () => {
    setIsCarregandoJogos(true);
    setErroJogos("");

    try {
      const jogosDoBanco = await listarJogosDoBanco();
      setJogos(
        jogosDoBanco.map((jogo) => ({
          ...jogo,
          favorito: Boolean(jogo.favorito),
        }))
      );
    } catch (error) {
      const mensagem =
        error?.message || "Nao foi possivel carregar os jogos do banco.";

      setErroJogos(mensagem);
      Alert.alert("Erro ao carregar jogos", mensagem);
    } finally {
      setIsCarregandoJogos(false);
    }
  };

  useEffect(() => {
    carregarJogos();
  }, []);

  const grupos = useMemo(
    () =>
      [
        "Todos",
        ...new Set(
          jogos
            .map((jogo) => jogo.grupo)
            .filter(Boolean)
            .sort((grupoA, grupoB) => grupoA.localeCompare(grupoB))
        ),
      ],
    [jogos]
  );

  const jogosFiltrados = useMemo(() => {
    if (grupoSelecionado === "Todos") {
      return jogos;
    }

    return jogos.filter((jogo) => jogo.grupo === grupoSelecionado);
  }, [grupoSelecionado, jogos]);

  const jogosPorDia = useMemo(
    () => agruparJogosPorData(jogosFiltrados),
    [jogosFiltrados]
  );

  const alternarFavorito = async (jogoId) => {
    const jogoAtual = jogos.find((jogo) => jogo.id === jogoId);

    if (!jogoAtual) {
      return;
    }

    const novoFavorito = !Boolean(jogoAtual.favorito);

    setJogos((jogosAtuais) =>
      jogosAtuais.map((jogo) =>
        jogo.id === jogoId ? { ...jogo, favorito: novoFavorito } : jogo
      )
    );

    try {
      await atualizarFavoritoDoJogo(jogoId, novoFavorito);
    } catch (error) {
      setJogos((jogosAtuais) =>
        jogosAtuais.map((jogo) =>
          jogo.id === jogoId ? { ...jogo, favorito: jogoAtual.favorito } : jogo
        )
      );

      Alert.alert(
        "Erro ao atualizar favorito",
        error?.message || "Nao foi possivel salvar o favorito no banco."
      );
    }
  };

  const importarJogos = async () => {
    setIsImportandoJogos(true);

    try {
      const resultado = await importarJogosDoJson();

      Alert.alert(
        "Importacao concluida",
        `${resultado.total} jogos foram processados na tabela ${resultado.tabela} usando ${resultado.campoUnico} para evitar duplicidade.`
      );

      await carregarJogos();
    } catch (error) {
      Alert.alert(
        "Erro na importacao",
        error?.message || "Nao foi possivel importar os jogos do JSON."
      );
    } finally {
      setIsImportandoJogos(false);
    }
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

      <View style={styles.importacaoContainer}>
        <Pressable
          onPress={importarJogos}
          disabled={isImportandoJogos || isCarregandoJogos}
          style={[
            styles.botaoImportar,
            (isImportandoJogos || isCarregandoJogos) &&
              styles.botaoImportarDesabilitado,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Importar jogos do JSON para o banco"
        >
          <Text style={styles.botaoImportarTexto}>
            {isImportandoJogos ? "IMPORTANDO..." : "IMPORTAR JOGOS"}
          </Text>
        </Pressable>
      </View>

      {isCarregandoJogos && (
        <Text style={styles.statusLista}>CARREGANDO JOGOS...</Text>
      )}

      {!isCarregandoJogos && erroJogos && (
        <Text style={styles.statusLista}>ERRO AO CARREGAR JOGOS</Text>
      )}

      <FlatList
        data={jogosPorDia}
        keyExtractor={(item) => item.data}
        renderItem={({ item }) => (
          <DiaCard
            data={item.data}
            jogos={item.jogos}
            onAlternarFavorito={alternarFavorito}
          />
        )}
        contentContainerStyle={styles.lista}
        ListEmptyComponent={
          !isCarregandoJogos && !erroJogos ? (
            <View style={styles.cardVazio}>
              <Text style={styles.cardVazioTitulo}>Nenhum jogo carregado</Text>
            </View>
          ) : null
        }
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
    flexGrow: 1,
    paddingBottom: 24,
  },
  statusLista: {
    width: 320,
    marginTop: 20,
    color: "#8fa3b8",
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
  },
  cardVazio: {
    width: 320,
    marginTop: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#28415b",
    backgroundColor: "#0c1b2a",
    paddingHorizontal: 16,
    paddingVertical: 24,
    alignItems: "center",
  },
  cardVazioTitulo: {
    color: "#f2cc2f",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
  importacaoContainer: {
    width: 320,
    marginTop: 2,
    marginBottom: 2,
  },
  botaoImportar: {
    height: 38,
    borderRadius: 8,
    backgroundColor: "#32d16d",
    alignItems: "center",
    justifyContent: "center",
  },
  botaoImportarDesabilitado: {
    opacity: 0.6,
  },
  botaoImportarTexto: {
    color: "#04120a",
    fontSize: 12,
    fontWeight: "700",
  },
});
