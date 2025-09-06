import { useInterface } from '../state/ui'

export default function InterfaceSwitcher() {
  const [ui, setUi] = useInterface()
  return (
    <div className="iface-switch">
      <button className={`ghost ${ui==='watchface'?'active':''}`} onClick={() => setUi('watchface')}>Watchface</button>
      <button className={`ghost ${ui==='simple'?'active':''}`} onClick={() => setUi('simple')}>Simple</button>
    </div>
  )
}


