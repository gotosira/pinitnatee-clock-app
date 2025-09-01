import './App.css'
import TopBar from './components/TopBar'
import QuoteBar from './components/QuoteBar'
import { useBackground } from './hooks/useBackground'
import YamClock from './components/YamClock'
import YamMinute from './components/YamMinute'
import AnalogClock from './components/analog/AnalogClock'

function App() {
  const { style } = useBackground()
  return (
    <div className="app" style={style as React.CSSProperties}>
      <div className="bg-blur" />
      <TopBar />
      <main className="center">
        <AnalogClock />
        <YamClock />
        <YamMinute />
      </main>
      <QuoteBar />
    </div>
  )
}

export default App
