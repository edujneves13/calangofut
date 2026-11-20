import { Button } from '../components/Button'
import { StarPicker, Toggle } from '../components/Controls'
import { Sheet } from '../components/Sheet'
import t from './Telas.module.css'

interface Props {
  aberto: boolean
  onFechar: () => void
  nome: string
  estrelas: number
  onMudar: (estrelas: number) => void
  /** Só na confirmação do lote: marcar como goleiro. */
  goleiro?: { valor: boolean; onMudar: (goleiro: boolean) => void }
}

/** Sheet pequena com o seletor de estrelas, aberta pelo selo tocável (DESIGN.md 7.7). */
export function EstrelasSheet({ aberto, onFechar, nome, estrelas, onMudar, goleiro }: Props) {
  return (
    <Sheet aberto={aberto} onFechar={onFechar} titulo={nome}>
      <div className={t.coluna}>
        {!goleiro?.valor && (
          <StarPicker
            rotulo="Estrelas"
            valor={estrelas}
            onMudar={(e) => {
              onMudar(e)
              if (!goleiro) onFechar()
            }}
          />
        )}
        {goleiro && <Toggle rotulo="Goleiro" ligado={goleiro.valor} onMudar={goleiro.onMudar} />}
        {goleiro && (
          <Button variante="secundario" onClick={onFechar}>
            Fechar
          </Button>
        )}
      </div>
    </Sheet>
  )
}
