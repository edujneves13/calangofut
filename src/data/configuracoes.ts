import type { FormatoId } from '../logic/formatos/tipos'
import type { Db } from './cliente'
import type { Tables, TablesUpdate } from './database.types'
import { ErroDados, traduzirErro } from './erros'

export interface Configuracoes {
  nomePelada: string
  /** URL pública da imagem; null = avatar padrão do app. */
  avatarUrl: string | null
  /** 0 = domingo … 6 = sábado */
  diaSemana: number
  /** HH:MM */
  horarioPadrao: string
  localPadrao: string
  formatoPadrao: FormatoId
  /** Minutos */
  tempoJogo: number
  /** Quem ganha fica até N jogos seguidos. */
  maxJogosSeguidos: number
  /** Craques (5★) por time. */
  maxCincoEstrelas: number
}

/** O que aparece no login, antes de entrar. */
export interface IdentidadePelada {
  nomePelada: string
  avatarUrl: string | null
}

const BUCKET_AVATAR = 'avatar'

function paraConfiguracoes(linha: Tables<'configuracoes'>): Configuracoes {
  return {
    nomePelada: linha.nome_pelada,
    avatarUrl: linha.avatar_url,
    diaSemana: linha.dia_semana,
    horarioPadrao: linha.horario_padrao.slice(0, 5),
    localPadrao: linha.local_padrao,
    formatoPadrao: linha.formato_padrao as FormatoId,
    tempoJogo: linha.tempo_jogo,
    maxJogosSeguidos: linha.max_jogos_seguidos,
    maxCincoEstrelas: linha.max_cinco_estrelas,
  }
}

export async function lerConfiguracoes(db: Db): Promise<Configuracoes> {
  const { data, error } = await db.from('configuracoes').select('*').single()
  if (error) throw traduzirErro(error)
  return paraConfiguracoes(data)
}

export async function salvarConfiguracoes(db: Db, mudancas: Partial<Configuracoes>): Promise<Configuracoes> {
  const valores: TablesUpdate<'configuracoes'> = {
    nome_pelada: mudancas.nomePelada?.trim(),
    avatar_url: mudancas.avatarUrl,
    dia_semana: mudancas.diaSemana,
    horario_padrao: mudancas.horarioPadrao,
    local_padrao: mudancas.localPadrao,
    formato_padrao: mudancas.formatoPadrao,
    tempo_jogo: mudancas.tempoJogo,
    max_jogos_seguidos: mudancas.maxJogosSeguidos,
    max_cinco_estrelas: mudancas.maxCincoEstrelas,
  }
  const { data, error } = await db.from('configuracoes').update(valores).eq('id', true).select().single()
  if (error) throw traduzirErro(error)
  return paraConfiguracoes(data)
}

/** Nome e avatar da pelada. Funciona sem login (tela de login). */
export async function lerIdentidade(db: Db): Promise<IdentidadePelada> {
  const { data, error } = await db.rpc('identidade_pelada').single()
  if (error) throw traduzirErro(error)
  return { nomePelada: data.nome_pelada, avatarUrl: data.avatar_url }
}

/**
 * Envia a imagem do avatar e grava a URL nas configurações.
 * Cada envio usa um nome novo, para o celular não mostrar a imagem antiga guardada em cache.
 */
export async function enviarAvatar(db: Db, imagem: Blob): Promise<Configuracoes> {
  const extensao = imagem.type.split('/')[1] ?? 'img'
  const caminho = `avatar-${Date.now()}.${extensao}`
  const envio = await db.storage.from(BUCKET_AVATAR).upload(caminho, imagem, { contentType: imagem.type })
  if (envio.error) throw new ErroDados('desconhecido', envio.error.message)
  const { data } = db.storage.from(BUCKET_AVATAR).getPublicUrl(caminho)
  return salvarConfiguracoes(db, { avatarUrl: data.publicUrl })
}
