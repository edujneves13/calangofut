import { WifiSlash } from '@phosphor-icons/react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { lerConfiguracoes } from '../../data/configuracoes'
import { estadoNaBarra } from '../../logic/cronometro'
import { listarJogadores } from '../../data/jogadores'
import { peladaAtual } from '../../data/peladas'
import { listarPresencas } from '../../data/presencas'
import { Button } from '../components/Button'
import { EmptyState } from '../components/Controls'
import { TabBar, type Aba } from '../components/TabBar'
import { db } from '../db'
import { Ajustes } from './ajustes/Ajustes'
import { ContextoApp, type Contexto, type Dados, type TelaAjustes } from './contexto'
import { Cronometro, FimDeJogo } from './Cronometro'
import { Times } from './Times'
import { useCronometro } from './useCronometro'
import t from './Telas.module.css'

async function carregarTudo(): Promise<Dados> {
  const [config, jogadores, pelada] = await Promise.all([
    lerConfiguracoes(db),
    listarJogadores(db, { incluirInativos: true }),
    peladaAtual(db, new Date()),
  ])
  const presencas = await listarPresencas(db, pelada.id)
  return { config, jogadores, pelada, presencas }
}

/** O app depois do login: carrega os dados, mostra a aba e o menu de baixo. */
export function Shell() {
  const [dados, setDados] = useState<Dados | null>(null)
  const [semInternet, setSemInternet] = useState(false)
  const [aba, setAba] = useState<Aba>('times')
  const [telaAjustes, setTelaAjustes] = useState<TelaAjustes>('inicio')
  const [fluxoAberto, setFluxoAberto] = useState(false)
  // O fluxo do sorteio guarda rascunho na tela; não recarregar por cima dele.
  const fluxoAbertoRef = useRef(false)
  fluxoAbertoRef.current = fluxoAberto

  const recarregar = useCallback(async () => {
    try {
      const novos = await carregarTudo()
      setDados(novos)
      setSemInternet(false)
    } catch {
      setSemInternet(true)
    }
  }, [])

  useEffect(() => {
    void recarregar()
    // Voltou para o app: pega o que outro organizador mudou e vira a pelada depois da meia-noite.
    const aoVoltar = () => {
      if (document.visibilityState === 'visible' && !fluxoAbertoRef.current) void recarregar()
    }
    document.addEventListener('visibilitychange', aoVoltar)
    return () => document.removeEventListener('visibilitychange', aoVoltar)
  }, [recarregar])

  const cronometro = useCronometro(10)
  const tempoJogo = dados?.config.tempoJogo
  const { setMinutos } = cronometro
  const fase = cronometro.estado.fase
  useEffect(() => {
    // Cronômetro parado começa no tempo de jogo dos Ajustes.
    if (tempoJogo && fase === 'parado') setMinutos(tempoJogo)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tempoJogo])

  const contexto = useMemo<Contexto | null>(
    () =>
      dados && {
        dados,
        atualizar: (m) => setDados((d) => (d ? { ...d, ...m } : d)),
        recarregar,
        irParaAjustes: (tela) => {
          setTelaAjustes(tela)
          setAba('ajustes')
        },
        setFluxoAberto,
      },
    [dados, recarregar],
  )

  if (!contexto) {
    if (semInternet) {
      return (
        <main className={t.tela}>
          <EmptyState
            icone={WifiSlash}
            titulo="Sem internet. Conecte para carregar a pelada."
            acao={
              <Button variante="secundario" onClick={() => void recarregar()}>
                Recarregar
              </Button>
            }
          />
        </main>
      )
    }
    return (
      <main className={t.tela} aria-busy="true">
        <div className={t.esqueleto} style={{ height: 56 }} />
        <div className={t.esqueleto} style={{ height: 480 }} />
      </main>
    )
  }

  const mostrarMenu = !(aba === 'times' && fluxoAberto) && fase !== 'fim'

  return (
    <ContextoApp.Provider value={contexto}>
      {aba === 'times' && <Times />}
      {aba === 'cronometro' && <Cronometro cronometro={cronometro} />}
      {aba === 'ajustes' && <Ajustes tela={telaAjustes} setTela={setTelaAjustes} />}
      {mostrarMenu && (
        <TabBar
          ativa={aba}
          cronometro={estadoNaBarra(cronometro.estado, cronometro.agora)}
          onTrocar={(nova) => {
            if (nova === 'ajustes' && aba !== 'ajustes') setTelaAjustes('inicio')
            setAba(nova)
          }}
        />
      )}
      {cronometro.estado.fase === 'fim' && <FimDeJogo cronometro={cronometro} />}
    </ContextoApp.Provider>
  )
}
