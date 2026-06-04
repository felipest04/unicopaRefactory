import { useEffect, useMemo, useRef, useState } from "react";
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
import LoginScreen from "./components/LoginScreen";
import { agruparJogosPorData } from "./utils/jogos";
import { importarJogosDoJson, listarJogosDoJson } from "./utils/importarJogos";
import {
  atualizarFavoritoDoJogo,
  listarJogosDoBanco,
} from "./utils/jogosBanco";
import { getSupabaseClient, isSupabaseConfigurado } from "./utils/supabase";

export default function App() {
  const [grupoSelecionado, setGrupoSelecionado] = useState("Todos");
  const [jogos, setJogos] = useState([]);
  const [isCarregandoJogos, setIsCarregandoJogos] = useState(true);
  const [isImportandoJogos, setIsImportandoJogos] = useState(false);
  const [erroJogos, setErroJogos] = useState("");
  const [isUsandoJogosLocais, setIsUsandoJogosLocais] = useState(false);
  const [session, setSession] = useState(null);
  const [isVerificandoSessao, setIsVerificandoSessao] = useState(true);
  const [isEntrando, setIsEntrando] = useState(false);
  const [erroLogin, setErroLogin] = useState("");
  const filtrosScrollRef = useRef(null);
  const [filtroScrollX, setFiltroScrollX] = useState(0);
  const [filtrosLargura, setFiltrosLargura] = useState(0);
  const [filtrosConteudoLargura, setFiltrosConteudoLargura] = useState(0);

  const maxFiltroScrollX = Math.max(0, filtrosConteudoLargura - filtrosLargura);
  const podeRolarFiltrosParaEsquerda = filtroScrollX > 0;
  const podeRolarFiltrosParaDireita = filtroScrollX < maxFiltroScrollX - 1;

  const normalizarJogos = (jogosParaNormalizar) =>
    jogosParaNormalizar.map((jogo) => ({
      ...jogo,
      favorito: Boolean(jogo.favorito),
    }));

  const traduzirErroLogin = (error) => {
    const mensagem = error?.message || "";

    if (mensagem.includes("Invalid login credentials")) {
      return "E-mail ou senha incorretos.";
    }

    if (mensagem.includes("Email not confirmed")) {
      return "Confirme seu e-mail antes de entrar.";
    }

    if (mensagem.includes("Configuracao do Supabase ausente")) {
      return mensagem;
    }

    return "Nao foi possivel entrar. Confira seus dados e tente novamente.";
  };

  useEffect(() => {
    if (!isSupabaseConfigurado()) {
      setIsVerificandoSessao(false);
      return;
    }

    const supabase = getSupabaseClient();

    supabase.auth
      .getSession()
      .then(({ data }) => {
        setSession(data.session || null);
      })
      .catch((error) => {
        setErroLogin(traduzirErroLogin(error));
      })
      .finally(() => {
        setIsVerificandoSessao(false);
      });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, novaSession) => {
        setSession(novaSession);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const carregarJogos = async () => {
    setIsCarregandoJogos(true);
    setErroJogos("");

    try {
      if (!isSupabaseConfigurado()) {
        setJogos(listarJogosDoJson());
        setIsUsandoJogosLocais(true);
        return;
      }

      try {
        const jogosDoBanco = await listarJogosDoBanco();
        setJogos(normalizarJogos(jogosDoBanco));
        setIsUsandoJogosLocais(false);
      } catch (errorBanco) {
        console.warn(
          "Nao foi possivel carregar jogos do Supabase. Usando JSON local.",
          errorBanco
        );
        setJogos(listarJogosDoJson());
        setIsUsandoJogosLocais(true);
      }
    } catch (error) {
      const mensagem =
        error?.message || "Nao foi possivel carregar os jogos.";

      setErroJogos(mensagem);
      Alert.alert("Erro ao carregar jogos", mensagem);
    } finally {
      setIsCarregandoJogos(false);
    }
  };

  useEffect(() => {
    if (!session) {
      setIsCarregandoJogos(false);
      return;
    }

    carregarJogos();
  }, [session]);

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

  const rolarFiltros = (direcao) => {
    const proximoScrollX = Math.min(
      Math.max(filtroScrollX + direcao * 140, 0),
      maxFiltroScrollX
    );

    filtrosScrollRef.current?.scrollTo({
      x: proximoScrollX,
      animated: true,
    });
  };

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

    if (isUsandoJogosLocais || !isSupabaseConfigurado()) {
      return;
    }

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
      if (!isSupabaseConfigurado()) {
        const jogosDoJson = listarJogosDoJson();

        setJogos(jogosDoJson);
        setIsUsandoJogosLocais(true);

        Alert.alert(
          "Jogos carregados",
          `${jogosDoJson.length} jogos foram carregados do JSON local. Configure o Supabase para importar para o banco.`
        );
        return;
      }

      const resultado = await importarJogosDoJson();

      Alert.alert(
        "Importacao concluida",
        `${resultado.total} jogos foram processados na tabela ${resultado.tabela} usando ${resultado.campoUnico} para evitar duplicidade.`
      );

      await carregarJogos();
    } catch (error) {
      try {
        const jogosDoJson = listarJogosDoJson();

        setJogos(jogosDoJson);
        setIsUsandoJogosLocais(true);

        Alert.alert(
          "Jogos carregados do JSON",
          `${jogosDoJson.length} jogos foram carregados localmente. Nao foi possivel importar para o Supabase: ${
            error?.message || "erro desconhecido"
          }`
        );
      } catch (errorJson) {
        Alert.alert(
          "Erro na importacao",
          errorJson?.message || "Nao foi possivel importar os jogos do JSON."
        );
      }
    } finally {
      setIsImportandoJogos(false);
    }
  };

  const entrar = async (email, senha) => {
    setIsEntrando(true);
    setErroLogin("");

    try {
      if (!isSupabaseConfigurado()) {
        throw new Error(
          "Configuracao do Supabase ausente. Defina EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_ANON_KEY no arquivo .env.local e reinicie o Expo."
        );
      }

      const { data, error } = await getSupabaseClient().auth.signInWithPassword({
        email,
        password: senha,
      });

      if (error) {
        setErroLogin(traduzirErroLogin(error));
        return;
      }

      if (!data.session) {
        setErroLogin("Login realizado, mas nenhuma sessao foi iniciada.");
        return;
      }

      setSession(data.session);
    } catch (error) {
      setErroLogin(traduzirErroLogin(error));
    } finally {
      setIsEntrando(false);
    }
  };

  if (isVerificandoSessao) {
    return (
      <ImageBackground
        style={styles.container}
        source={require("./assets/bg-overlay.png")}
      >
        <Image style={styles.logo} source={require("./assets/unicopa.png")} />
        <Text style={styles.statusLista}>VERIFICANDO LOGIN...</Text>
      </ImageBackground>
    );
  }

  if (!session) {
    return (
      <LoginScreen
        erroLogin={erroLogin}
        isEntrando={isEntrando}
        onEntrar={entrar}
      />
    );
  }

  return (
    <ImageBackground
      style={styles.container}
      source={require("./assets/bg-overlay.png")}
    >
      <Image style={styles.logo} source={require("./assets/unicopa.png")} />

      <Text style={styles.title}>CALENDARIO</Text>

      <View style={styles.filtrosContainer}>
        <Pressable
          onPress={() => rolarFiltros(-1)}
          disabled={!podeRolarFiltrosParaEsquerda}
          style={[
            styles.botaoRolagemFiltro,
            !podeRolarFiltrosParaEsquerda &&
              styles.botaoRolagemFiltroDesabilitado,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Rolar filtros para a esquerda"
        >
          <Text style={styles.botaoRolagemFiltroTexto}>{"<"}</Text>
        </Pressable>

        <ScrollView
          ref={filtrosScrollRef}
          horizontal
          style={styles.filtrosScroll}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtros}
          onLayout={(event) => setFiltrosLargura(event.nativeEvent.layout.width)}
          onContentSizeChange={(largura) => setFiltrosConteudoLargura(largura)}
          onScroll={(event) =>
            setFiltroScrollX(event.nativeEvent.contentOffset.x)
          }
          scrollEventThrottle={16}
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

        <Pressable
          onPress={() => rolarFiltros(1)}
          disabled={!podeRolarFiltrosParaDireita}
          style={[
            styles.botaoRolagemFiltro,
            !podeRolarFiltrosParaDireita &&
              styles.botaoRolagemFiltroDesabilitado,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Rolar filtros para a direita"
        >
          <Text style={styles.botaoRolagemFiltroTexto}>{">"}</Text>
        </Pressable>
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
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  botaoRolagemFiltro: {
    width: 32,
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#f2cc2f",
    backgroundColor: "#102817",
    alignItems: "center",
    justifyContent: "center",
  },
  botaoRolagemFiltroDesabilitado: {
    opacity: 0.35,
  },
  botaoRolagemFiltroTexto: {
    color: "#f2cc2f",
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 20,
  },
  filtrosScroll: {
    flex: 1,
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
