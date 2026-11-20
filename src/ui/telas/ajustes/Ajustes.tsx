import { CaretRight, Minus, Plus, SignOut, UsersThree } from '@phosphor-icons/react'
import { useState, type ReactNode } from 'react'
import { salvarConfiguracoes, type Configuracoes } from '../../../data/configuracoes'
import { atualizarPelada } from '../../../data/peladas'
import { proximoDia } from '../../../logic/datas'
import { FORMATOS } from '../../../logic/formatos'
import type { FormatoId } from '../../../logic/formatos/tipos'
import { TAMANHO_TIME } from '../../../logic/tipos'
import { Avatar } from '../../components/Avatar'
import { Button } from '../../components/Button'
import { SectionLabel, Segmented } from '../../components/Controls'
import { Header } from '../../components/Header'
import { Icon } from '../../components/Icon'
import { IconButton } from '../../components/IconButton'
import { Input } from '../../components/Input'
import { ConfirmModal, Sheet } from '../../components/Sheet'
import { useToast } from '../../components/Toast'
import { db } from '../../db'
import { DIAS_CURTOS, ddmm, mensagemDeErro, nomeDoDia } from '../../util'
import { useApp, type TelaAjustes } from '../contexto'
import { AVATAR_PADRAO } from '../Times'
import { Jogadores } from './Jogadores'
import { NomeAvatar } from './NomeAvatar'
import t from '../Telas.module.css'

type Folha = 'horario' | 'local' | 'proxima' | 'formato' | 'tempo' | 'jogosSeguidos' | 'craques' | null

interface Props {
  tela: TelaAjustes
  setTela: (tela: TelaAjustes) => void
  /** Voltar das telas internas: o Shell leva para a tela de onde a pessoa veio. */
  onVoltar: () => void
}

/** Aba Ajustes (COPY 6.1). */
export function Ajustes({ tela, setTela, onVoltar }: Props) {
  if (tela === 'jogadores') return <Jogadores onVoltar={onVoltar} />
  if (tela === 'pelada') return <NomeAvatar onVoltar={onVoltar} />
  return <Inicio onAbrir={setTela} />
}

function Linha({ rotulo, valor, onClick, icone }: { rotulo: ReactNode; valor?: ReactNode; onClick?: () => void; icone?: ReactNode }) {
  return (
    <button type="button" className={t.ajuste} onClick={onClick} disabled={!onClick}>
      {icone}
      <span className={t.cresce}>{rotulo}</span>
      <span className={t.ajusteValor}>
        {valor}
        {onClick && <Icon icon={CaretRight} size={18} />}
      </span>
    </button>
  )
}

function Inicio({ onAbrir }: { onAbrir: (tela: TelaAjustes) => void }) {
  const { dados, atualizar } = useApp()
  const mostrarToast = useToast()
  const { config, pelada, jogadores } = dados
  const [folha, setFolha] = useState<Folha>(null)
  const [sair, setSair] = useState(false)
  const ativos = jogadores.filter((j) => j.ativo).length

  /** Salva os ajustes; mudar dia, horário ou local também muda a próxima pelada se ela ainda não começou. */
  async function salvar(mudancas: Partial<Configuracoes>) {
    try {
      const nova = await salvarConfiguracoes(db, mudancas)
      atualizar({ config: nova })
      const intocada = !pelada.sorteadaEm && dados.presencas.length === 0
      if (intocada && (mudancas.diaSemana !== undefined || mudancas.horarioPadrao || mudancas.localPadrao)) {
        const p = await atualizarPelada(db, pelada.id, {
          data: mudancas.diaSemana !== undefined ? proximoDia(new Date(), mudancas.diaSemana) : undefined,
          horario: mudancas.horarioPadrao,
          local: mudancas.localPadrao,
        }).catch(() => null)
        if (p) atualizar({ config: nova, pelada: p })
      }
      setFolha(null)
    } catch (e) {
      mostrarToast({ texto: mensagemDeErro(e), tom: 'erro' })
    }
  }

  async function mudarData(data: string) {
    try {
      atualizar({ pelada: await atualizarPelada(db, pelada.id, { data }) })
      setFolha(null)
    } catch (e) {
      mostrarToast({ texto: mensagemDeErro(e), tom: 'erro' })
    }
  }

  const dataDaRegra = proximoDia(new Date(), config.diaSemana)

  /** Key única por folha que muda ao abrir: a folha volta com os valores salvos, sem rascunho velho. */
  const chave = (nome: Exclude<Folha, null>) => (folha === nome ? `${nome}-aberta` : nome)

  return (
    <main className={`${t.tela} ${t.entrar}`}>
      <Header titulo="Ajustes" />
      <div>
        <button type="button" className={t.ajuste} style={{ minHeight: 76 }} onClick={() => onAbrir('pelada')}>
          <Avatar nome={config.nomePelada} src={config.avatarUrl ?? AVATAR_PADRAO} tamanho={64} />
          <span className={t.cresce}>
            <span className={t.opcaoTitulo}>{config.nomePelada}</span>
            <span className={t.opcaoSub}>Nome e avatar</span>
          </span>
          <Icon icon={CaretRight} size={18} />
        </button>
        <Linha
          icone={
            <span className={t.ajusteIcone}>
              <Icon icon={UsersThree} />
            </span>
          }
          rotulo={<b>Jogadores</b>}
          valor={ativos}
          onClick={() => onAbrir('jogadores')}
        />
      </div>

      <div>
        <SectionLabel>Toda semana</SectionLabel>
        <Linha rotulo="Dia e horário" valor={`${DIAS_CURTOS[config.diaSemana]} · ${config.horarioPadrao}`} onClick={() => setFolha('horario')} />
        <Linha rotulo="Local" valor={config.localPadrao} onClick={() => setFolha('local')} />
        <Linha rotulo="Mudar só a próxima" valor={ddmm(pelada.data)} onClick={() => setFolha('proxima')} />
      </div>

      <div>
        <SectionLabel>Jogo</SectionLabel>
        <Linha rotulo="Formato padrão" valor={FORMATOS[config.formatoPadrao].nome} onClick={() => setFolha('formato')} />
        <Linha rotulo="Tempo de jogo" valor={`${config.tempoJogo} min`} onClick={() => setFolha('tempo')} />
        <Linha
          rotulo="Quem ganha fica até"
          valor={`${config.maxJogosSeguidos} ${config.maxJogosSeguidos === 1 ? 'jogo' : 'jogos'}`}
          onClick={() => setFolha('jogosSeguidos')}
        />
      </div>

      <div>
        <SectionLabel>Sorteio</SectionLabel>
        <Linha rotulo="Craques (5★) por time" valor={`até ${config.maxCincoEstrelas}`} onClick={() => setFolha('craques')} />
        <Linha rotulo="Jogadores por time" valor={TAMANHO_TIME} />
      </div>

      <button type="button" className={`${t.ajuste} ${t.perigo}`} onClick={() => setSair(true)}>
        <Icon icon={SignOut} size={20} />
        <span className={t.cresce}>Sair</span>
      </button>

      <FolhaHorario key={chave('horario')} aberto={folha === 'horario'} config={config} onFechar={() => setFolha(null)} onSalvar={salvar} />
      <FolhaTexto
        key={chave('local')}
        aberto={folha === 'local'}
        titulo="Local"
        valor={config.localPadrao}
        onFechar={() => setFolha(null)}
        onSalvar={(localPadrao) => salvar({ localPadrao })}
      />
      <FolhaProxima
        key={chave('proxima')}
        aberto={folha === 'proxima'}
        data={pelada.data}
        diaDaRegra={nomeDoDia(config.diaSemana).toLowerCase()}
        dataDaRegra={dataDaRegra}
        onFechar={() => setFolha(null)}
        onSalvar={mudarData}
      />
      <FolhaEscolha
        key={chave('formato')}
        aberto={folha === 'formato'}
        titulo="Formato padrão"
        opcoes={(Object.keys(FORMATOS) as FormatoId[]).map((id) => ({ valor: id, texto: FORMATOS[id].nome }))}
        valor={config.formatoPadrao}
        onFechar={() => setFolha(null)}
        onSalvar={(formatoPadrao) => salvar({ formatoPadrao })}
      />
      <FolhaEscolha
        key={chave('tempo')}
        aberto={folha === 'tempo'}
        titulo="Tempo de jogo"
        opcoes={[...new Set([8, 10, config.tempoJogo])].sort((a, b) => a - b).map((m) => ({ valor: m, texto: `${m} min` }))}
        valor={config.tempoJogo}
        onFechar={() => setFolha(null)}
        onSalvar={(tempoJogo) => salvar({ tempoJogo })}
      />
      <FolhaNumero
        key={chave('jogosSeguidos')}
        aberto={folha === 'jogosSeguidos'}
        titulo="Quem ganha fica até"
        valor={config.maxJogosSeguidos}
        min={1}
        max={10}
        unidade={(v) => (v === 1 ? 'jogo' : 'jogos')}
        onFechar={() => setFolha(null)}
        onSalvar={(maxJogosSeguidos) => salvar({ maxJogosSeguidos })}
      />
      <FolhaNumero
        key={chave('craques')}
        aberto={folha === 'craques'}
        titulo="Craques (5★) por time"
        valor={config.maxCincoEstrelas}
        min={1}
        max={5}
        unidade={() => 'no máximo'}
        onFechar={() => setFolha(null)}
        onSalvar={(maxCincoEstrelas) => salvar({ maxCincoEstrelas })}
      />

      <ConfirmModal
        aberto={sair}
        titulo="Sair do app neste celular?"
        texto=""
        confirmar="Sair"
        cancelar="Cancelar"
        perigo
        onConfirmar={() => void db.auth.signOut()}
        onCancelar={() => setSair(false)}
      />
    </main>
  )
}

function FolhaHorario({
  aberto,
  config,
  onFechar,
  onSalvar,
}: {
  aberto: boolean
  config: Configuracoes
  onFechar: () => void
  onSalvar: (m: Partial<Configuracoes>) => Promise<void>
}) {
  const [dia, setDia] = useState(config.diaSemana)
  const [horario, setHorario] = useState(config.horarioPadrao)
  return (
    <Sheet aberto={aberto} onFechar={onFechar} titulo="Dia e horário">
      <div className={t.coluna}>
        <div className={t.chips} role="radiogroup" aria-label="Dia">
          {DIAS_CURTOS.map((d, i) => (
            <button
              key={d}
              type="button"
              role="radio"
              aria-checked={dia === i}
              className={`${t.chip} ${dia === i ? t.chipAtivo : ''}`}
              onClick={() => setDia(i)}
            >
              {d}
            </button>
          ))}
        </div>
        <Input rotulo="Começa" type="time" value={horario} onChange={(e) => setHorario(e.target.value)} />
        <Button onClick={() => onSalvar({ diaSemana: dia, horarioPadrao: horario })} disabled={!horario}>
          Salvar
        </Button>
      </div>
    </Sheet>
  )
}

function FolhaTexto({
  aberto,
  titulo,
  valor,
  onFechar,
  onSalvar,
}: {
  aberto: boolean
  titulo: string
  valor: string
  onFechar: () => void
  onSalvar: (v: string) => Promise<void>
}) {
  const [texto, setTexto] = useState(valor)
  return (
    <Sheet aberto={aberto} onFechar={onFechar} titulo={titulo}>
      <div className={t.coluna}>
        <Input rotulo={titulo} value={texto} onChange={(e) => setTexto(e.target.value)} />
        <Button disabled={!texto.trim()} onClick={() => onSalvar(texto.trim())}>
          Salvar
        </Button>
      </div>
    </Sheet>
  )
}

function FolhaProxima({
  aberto,
  data,
  diaDaRegra,
  dataDaRegra,
  onFechar,
  onSalvar,
}: {
  aberto: boolean
  data: string
  diaDaRegra: string
  dataDaRegra: string
  onFechar: () => void
  onSalvar: (data: string) => Promise<void>
}) {
  const [nova, setNova] = useState(data)
  return (
    <Sheet aberto={aberto} onFechar={onFechar} titulo="Mudar só a próxima">
      <div className={t.coluna}>
        <p className={t.texto2}>Muda a data só desta semana. A regra de toda {diaDaRegra} continua.</p>
        <Input rotulo="Data" type="date" value={nova} onChange={(e) => setNova(e.target.value)} />
        <Button disabled={!nova} onClick={() => onSalvar(nova)}>
          Salvar
        </Button>
        {data !== dataDaRegra && (
          <Button variante="secundario" onClick={() => onSalvar(dataDaRegra)}>
            Voltar para {diaDaRegra}
          </Button>
        )}
      </div>
    </Sheet>
  )
}

function FolhaEscolha<T extends string | number>({
  aberto,
  titulo,
  opcoes,
  valor,
  onFechar,
  onSalvar,
}: {
  aberto: boolean
  titulo: string
  opcoes: { valor: T; texto: string }[]
  valor: T
  onFechar: () => void
  onSalvar: (v: T) => Promise<void>
}) {
  const [escolha, setEscolha] = useState<T>(valor)
  return (
    <Sheet aberto={aberto} onFechar={onFechar} titulo={titulo}>
      <div className={t.coluna}>
        <Segmented rotulo={titulo} opcoes={opcoes} valor={escolha} onMudar={setEscolha} />
        <Button onClick={() => onSalvar(escolha)}>Salvar</Button>
      </div>
    </Sheet>
  )
}

function FolhaNumero({
  aberto,
  titulo,
  valor,
  min,
  max,
  unidade,
  onFechar,
  onSalvar,
}: {
  aberto: boolean
  titulo: string
  valor: number
  min: number
  max: number
  unidade: (v: number) => string
  onFechar: () => void
  onSalvar: (v: number) => Promise<void>
}) {
  const [n, setN] = useState(valor)
  return (
    <Sheet aberto={aberto} onFechar={onFechar} titulo={titulo}>
      <div className={t.coluna}>
        <div className={t.linhaBotoes} style={{ justifyContent: 'center', gap: 'var(--space-6)' }}>
          <IconButton icone={Minus} rotulo="Menos" disabled={n <= min} onClick={() => setN(n - 1)} />
          <span className={t.destaque} aria-live="polite">
            {n} <span className={t.texto2}>{unidade(n)}</span>
          </span>
          <IconButton icone={Plus} rotulo="Mais" disabled={n >= max} onClick={() => setN(n + 1)} />
        </div>
        <Button onClick={() => onSalvar(n)}>Salvar</Button>
      </div>
    </Sheet>
  )
}
