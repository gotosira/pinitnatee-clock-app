import { useInterface } from '../state/ui'
import type { InterfaceName } from '../state/ui'

type Props = { value?: InterfaceName; onChange?: (name: InterfaceName) => void }

export default function InterfaceSwitcher(props: Props) {
  const hook = useInterface()
  const ui = props.value ?? hook[0]
  const setUi = props.onChange ?? hook[1]
  return (
    <div className="iface-switch">
      <button className={`ghost ${ui==='watchface'?'active':''}`} onClick={() => setUi('watchface')}>Watchface</button>
      <button className={`ghost ${ui==='simple'?'active':''}`} onClick={() => setUi('simple')}>Simple</button>
    </div>
  )
}


