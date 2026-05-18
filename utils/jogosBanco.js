import { supabase } from "./supabase";

const TABELA_JOGOS = "jogos";

export async function listarJogosDoBanco() {
  const { data, error } = await supabase
    .from(TABELA_JOGOS)
    .select("*")
    .order("data_brasilia", { ascending: true })
    .order("hora_brasilia", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}

export async function atualizarFavoritoDoJogo(jogoId, favorito) {
  const { error } = await supabase
    .from(TABELA_JOGOS)
    .update({ favorito })
    .eq("id", jogoId);

  if (error) {
    throw new Error(error.message);
  }
}
