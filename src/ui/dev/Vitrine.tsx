import {
  ArrowClockwise,
  CaretRight,
  Clock,
  Copy,
  DotsThreeVertical,
  MapPin,
  Plus,
  Shuffle,
  UsersThree,
} from '@phosphor-icons/react'
import { useState, type ReactNode } from 'react'
import { Avatar } from '../components/Avatar'
import { Badge, BadgeEstrelas } from '../components/Badge'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import {
  EmptyState,
  Notice,
  SectionLabel,
  Segmented,
  StarPicker,
  Stepper,
  Toggle,
} from '../components/Controls'
import { Header } from '../components/Header'
import { Icon } from '../components/Icon'
import { IconButton } from '../components/IconButton'
import { Input, SearchInput, Textarea } from '../components/Input'
import { PlayerRow } from '../components/PlayerRow'
import { ConfirmModal, Sheet } from '../components/Sheet'
import { TabBar, type Aba } from '../components/TabBar'
import { TeamCard } from '../components/TeamCard'
import { ToastProvider, useToast } from '../components/Toast'
import s from './Vitrine.module.css'

/**
 * Página de desenvolvimento: todos os componentes base em todos os estados.
 * Só existe em `npm run dev`, no endereço /dev. Os textos vêm do COPY.md (coluna Final ou seção 9).
 */
export function Vitrine() {
  return (
    <ToastProvider>
      <Conteudo />
    </ToastProvider>
  )
}

function Bloco({ nome, nota, children }: { nome: string; nota?: string; children: ReactNode }) {
  return (
    <section className={s.bloco}>
      <h2 className={s.nomeBloco}>{nome}</h2>
      {nota && <p className={s.nota}>{nota}</p>}
      {children}
    </section>
  )
}

const time1 = [
  { id: '1', nome: 'Juninho', estrelas: 5 },
  { id: '2', nome: 'Rafael', estrelas: 4 },
  { id: '3', nome: 'Hugo', estrelas: 3 },
  { id: '4', nome: 'Leandro', estrelas: 2 },
  { id: '5', nome: 'Pedro', estrelas: 2 },
]
const time5 = [
  { id: '6', nome: 'Márcio', estrelas: 3 },
  { id: '7', nome: 'Guilherme', estrelas: 3 },
  { id: '8', nome: 'Eduardo Lucas', estrelas: 2 },
]

function Conteudo() {
  const mostrarToast = useToast()
  const [aba, setAba] = useState<Aba>('times')
  const [chegou, setChegou] = useState(true)
  const [estrelas, setEstrelas] = useState(3)
  const [goleiro, setGoleiro] = useState(false)
  const [formato, setFormato] = useState('quem-ganha-fica')
  const [busca, setBusca] = useState('')
  const [sheet, setSheet] = useState(false)
  const [modal, setModal] = useState(false)

  return (
    <main className={s.pagina}>
      <div>
        <h1 className={s.titulo}>Componentes</h1>
        <p className={s.nota}>Confira em 360, 390 e 430 px de largura.</p>
      </div>

      <Bloco nome="Cabeçalho">
        <Header titulo="Pelada dos Brabos" avatar={{ nome: 'Pelada dos Brabos', src: '/mascote/avatar-circulo.webp' }} />
        <Header
          titulo="Pelada dos Brabos"
          subtitulo="Qua 25/11 · 20:30"
          avatar={{ nome: 'Pelada dos Brabos' }}
          acoes={
            <>
              <IconButton icone={ArrowClockwise} rotulo="Sortear de novo" />
              <IconButton icone={DotsThreeVertical} rotulo="Mais opções" />
            </>
          }
        />
        <Header titulo="Jogadores" onVoltar={() => {}} />
      </Bloco>

      <Bloco nome="Botões">
        <Button icone={Shuffle}>Sortear times</Button>
        <Button carregando icone={Shuffle}>
          Sortear times
        </Button>
        <Button disabled>Continuar</Button>
        <p className={s.nota}>Desabilitado sempre com o motivo visível perto, como "Falta escolher 1 nome".</p>
        <Button variante="secundario" icone={Copy}>
          Copiar lista dos times
        </Button>
        <Button variante="tracejado">Não chegaram · 2</Button>
        <div className={s.linha}>
          <Button variante="pequeno">Chegou</Button>
          <Button variante="pequeno-secundario">É ele</Button>
          <Button variante="pequeno-secundario">É novo</Button>
          <IconButton icone={ArrowClockwise} rotulo="Sortear de novo" />
        </div>
      </Bloco>

      <Bloco nome="Selos" nota="Os quatro últimos são a proposta da rodada 4 (DESIGN.md 7.7).">
        <div className={s.linha}>
          <Badge variante="nivel" rotulo="4 estrelas">
            4★
          </Badge>
          <Badge variante="soma" rotulo="16 estrelas">
            16★
          </Badge>
          <Badge variante="incompleto">Incompleto · 3/5</Badge>
          <Badge variante="goleiro">Goleiro</Badge>
        </div>
        <div className={s.linha}>
          <Badge variante="novo">Novo</Badge>
          <Badge variante="cadastrado">Já cadastrado</Badge>
          <BadgeEstrelas estrelas={4} nome="Juninho" textoVazio="Dar estrelas" onClick={() => setSheet(true)} />
          <BadgeEstrelas estrelas={0} nome="Renê" textoVazio="Dar estrelas" onClick={() => setSheet(true)} />
        </div>
      </Bloco>

      <Bloco nome="Avatar">
        <div className={s.linha}>
          <Avatar nome="Pelada dos Brabos" src="/mascote/avatar-circulo.webp" borda />
          <Avatar nome="Pelada dos Brabos" />
          <Avatar nome="Pelada dos Brabos" src="/mascote/avatar-circulo.webp" tamanho={64} />
          <Avatar nome="Calango FC" tamanho={110} />
        </div>
      </Bloco>

      <Bloco nome="Card da próxima pelada">
        <Card semPadding>
          <div className={s.ilustracao}>
            <img src="/mascote/proxima-pelada-solta.webp" alt="Calango, mascote da Pelada dos Brabos, no gramado" />
          </div>
          <div className={s.conteudoCard}>
            <SectionLabel destaque>Próxima pelada</SectionLabel>
            <p className={s.data}>Quarta, 25/11</p>
            <p className={s.meta}>
              <Icon icon={Clock} size={18} /> 20:30 – 22:00
            </p>
            <p className={s.meta}>
              <Icon icon={MapPin} size={18} /> Colibris Club Arena
            </p>
            <Button icone={Shuffle} style={{ marginTop: 'var(--space-3)' }}>
              Sortear times
            </Button>
          </div>
        </Card>
      </Bloco>

      <Bloco nome="Linhas de jogador">
        <div>
          <PlayerRow
            nome="Juninho"
            chegou={chegou}
            onTrocarChegou={() => setChegou((c) => !c)}
            direita={<BadgeEstrelas estrelas={5} nome="Juninho" textoVazio="Dar estrelas" onClick={() => {}} />}
          />
          <PlayerRow nome="Kauã Ferreira" chegou={false} onTrocarChegou={() => {}} direita={<Badge variante="nivel">3★</Badge>} />
          <PlayerRow
            nome="Renê"
            novo
            chegou
            onTrocarChegou={() => {}}
            sub={<Badge variante="novo">Novo</Badge>}
            direita={<BadgeEstrelas estrelas={0} nome="Renê" textoVazio="Dar estrelas" onClick={() => {}} />}
          />
          <PlayerRow
            nome="Stênio"
            novo
            sub="Parece o Stenio Araújo"
            direita={
              <>
                <Button variante="pequeno-secundario">É ele</Button>
                <Button variante="pequeno-secundario">É novo</Button>
              </>
            }
          />
          <PlayerRow nome="Richard" goleiro direita={<Badge variante="nivel">3★</Badge>} />
          <PlayerRow nome="Matheus Rei" direita={<Button variante="pequeno">Chegou</Button>} />
          <PlayerRow
            nome="Eduardo Lucas"
            sub="Diarista"
            onClick={() => mostrarToast({ texto: 'Abre Editar jogador.' })}
            direita={
              <>
                <Badge variante="nivel">2★</Badge>
                <Icon icon={CaretRight} size={18} />
              </>
            }
          />
        </div>
      </Bloco>

      <Bloco nome="Cards de time">
        <div className={s.carrossel}>
          <TeamCard numero={1} jogadores={time1} somaEstrelas={16} completo textoVaga="Vaga" />
          <TeamCard
            numero={5}
            jogadores={time5}
            somaEstrelas={8}
            completo={false}
            textoVaga="Vaga"
            aviso="Esse time foi montado por ordem de chegada, sem equilibrar. Para equilibrar, use Sortear de novo."
          />
        </div>
      </Bloco>

      <Bloco nome="Campos">
        <Input rotulo="E-mail" type="email" placeholder="seu@email.com" autoComplete="email" />
        <Input rotulo="Senha" mostrarSenha={{ mostrar: 'Mostrar', esconder: 'Esconder' }} autoComplete="current-password" />
        <Input
          rotulo="Nome completo"
          defaultValue="Eduardo"
          erro='Já existe um Eduardo. Use o nome completo para diferenciar, como "Eduardo Lucas".'
        />
        <SearchInput valor={busca} onMudar={setBusca} placeholder="Buscar jogador" />
        <Textarea
          rotulo="Vários de uma vez"
          ajuda="Cole a lista do WhatsApp ou escreva os nomes separados por vírgula. Para ditar, toque no microfone do teclado."
          placeholder="Pedro, João Vitor, Maria…"
        />
      </Bloco>

      <Bloco nome="Controles">
        <StarPicker rotulo="Estrelas" valor={estrelas} onMudar={setEstrelas} />
        <StarPicker rotulo="Estrelas" valor={0} onMudar={() => {}} compacto />
        <Toggle rotulo="Goleiro" ligado={goleiro} onMudar={setGoleiro} />
        <Segmented
          rotulo="Formato"
          valor={formato}
          onMudar={setFormato}
          opcoes={[
            { valor: 'quem-ganha-fica', texto: 'Quem ganha fica' },
            { valor: 'todos-contra-todos', texto: 'Estilo campeonato' },
          ]}
        />
        <Stepper atual={1} rotulos={['Lista', 'Conferir', 'Sortear']} />
        <Stepper atual={2} rotulos={['Lista', 'Conferir', 'Sortear']} />
        <Stepper atual={3} rotulos={['Lista', 'Conferir', 'Sortear']} />
      </Bloco>

      <Bloco nome="Avisos e vazios">
        <Notice>O sorteio precisa de pelo menos 10 jogadores de linha. Marque quem chegou ou adicione alguém.</Notice>
        <EmptyState
          icone={UsersThree}
          titulo="Nenhum jogador ainda."
          texto="Cole uma lista do WhatsApp na próxima pelada e cadastre todos de uma vez."
          acao={
            <Button variante="pequeno" icone={Plus}>
              Adicionar jogadores
            </Button>
          }
        />
      </Bloco>

      <Bloco nome="Sheet, modal e toast">
        <Button variante="secundario" onClick={() => setSheet(true)}>
          Abrir sheet
        </Button>
        <Button variante="secundario" onClick={() => setModal(true)}>
          Abrir modal
        </Button>
        <Button variante="secundario" onClick={() => mostrarToast({ texto: 'Lista copiada. É só colar no grupo.' })}>
          Toast de sucesso
        </Button>
        <Button
          variante="secundario"
          onClick={() =>
            mostrarToast({
              texto: 'Matheus Rei entrou no Time 5',
              acoes: [{ texto: 'Desfazer', onClick: () => mostrarToast({ texto: 'Desfeito.' }) }],
            })
          }
        >
          Toast com Desfazer
        </Button>
        <Button
          variante="secundario"
          onClick={() => mostrarToast({ texto: 'Não deu para salvar. O app tenta de novo sozinho.', tom: 'erro' })}
        >
          Toast de erro
        </Button>
      </Bloco>

      <Sheet aberto={sheet} onFechar={() => setSheet(false)} titulo="Adicionar jogador">
        <Input rotulo="Nome" placeholder="Digite o nome" />
        <p className={s.nota}>Jogador novo. Quantas estrelas?</p>
        <StarPicker rotulo="Estrelas" valor={estrelas} onMudar={setEstrelas} />
        <Toggle rotulo="É goleiro" ligado={goleiro} onMudar={setGoleiro} />
        <Button onClick={() => setSheet(false)}>{goleiro ? 'Adicionar como goleiro' : 'Adicionar ao sorteio'}</Button>
      </Sheet>

      <ConfirmModal
        aberto={modal}
        titulo="Excluir 3 jogadores?"
        texto="Eles saem da lista, mas continuam nas peladas antigas. Dá para trazer de volta em Inativos."
        confirmar="Excluir"
        cancelar="Cancelar"
        perigo
        onConfirmar={() => setModal(false)}
        onCancelar={() => setModal(false)}
      />

      {/* Caso mais largo: cronômetro rodando em outra aba (conferir em 360 px). */}
      <TabBar ativa={aba} onTrocar={setAba} cronometro={{ tom: 'rodando', texto: '07:12', progresso: 0.3, rotulo: 'Cronômetro, faltam 07:12' }} />
    </main>
  )
}
