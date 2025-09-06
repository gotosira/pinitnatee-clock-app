import DigitalTime from './DigitalTime'
import YamInlineText from './YamInline'
import { Weather } from './Weather'

export default function SimpleInterface() {
  return (
    <div className="simple-ui" style={{display:'grid', gap:12, placeItems:'center'}}>
      <DigitalTime />
      <YamInlineText />
      <Weather />
    </div>
  )
}



