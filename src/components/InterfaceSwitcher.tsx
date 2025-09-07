import { useInterface } from '../state/ui'
import type { InterfaceName } from '../state/ui'

type Props = { value?: InterfaceName; onChange?: (name: InterfaceName) => void }

export default function InterfaceSwitcher(props: Props) {
  const hook = useInterface()
  const ui = props.value ?? hook[0]
  const setUi = props.onChange ?? hook[1]
  const onSet = (name: InterfaceName) => {
    // change UI only; do not emit any background events
    setUi(name)
  }
  return (
    <div className="iface-switch">
      <button className={`ghost ${ui==='watchface'?'active':''}`} onClick={() => onSet('watchface')}>Watchface</button>
      <button className={`ghost ${ui==='simple'?'active':''}`} onClick={() => onSet('simple')}>Simple</button>
    </div>
  )
}


