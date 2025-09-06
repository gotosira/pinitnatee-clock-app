import './App.css'
import TopBar from './components/TopBar'
import QuoteBar from './components/QuoteBar'
import { useBackground } from './hooks/useBackground'
import AnalogClock from './components/analog/AnalogClock'
import SimpleInterface from './components/SimpleInterface'
import { useInterface } from './state/ui'

function App() {
  const { style } = useBackground()
  const [ui] = useInterface()
  return (
    <div className="app" style={style as React.CSSProperties}>
      <div className="bg-blur" />
      <TopBar />
      <main className="center">
        {ui === 'watchface' ? <AnalogClock /> : <SimpleInterface />}
      </main>
      <QuoteBar />
    </div>
  )
}

export default App
