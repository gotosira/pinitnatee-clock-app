import { Weather } from './Weather'
import { BackgroundControls } from './bg/BackgroundControls'

export function TopBar() {
  return (
    <div className="top-bar">
      <div className="top-left">
        <BackgroundControls />
      </div>
      <div className="top-right">
        <Weather />
      </div>
    </div>
  )
}

export default TopBar


