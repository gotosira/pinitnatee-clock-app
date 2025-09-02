import './App.css'
import TopBar from './components/TopBar'
import QuoteBar from './components/QuoteBar'
import { useBackground } from './hooks/useBackground'
import YamClock from './components/YamClock'
import YamMinute from './components/YamMinute'
import AnalogClock from './components/analog/AnalogClock'
import DigitalTime from './components/DigitalTime'

function App() {
  const { style } = useBackground()
  return (
    <div className="app" style={style as React.CSSProperties}>
      <div className="bg-blur" />
      <TopBar />
      <main className="center">
        <AnalogClock />
        <DigitalTime />
        <div className="yam-inline">
          <YamClock />
          <span className="sep">/</span>
          <YamMinute />
        </div>
      </main>
      <QuoteBar />
    </div>
  )
}

export default App
