import { BackgroundControls } from './bg/BackgroundControls'

export function TopBar() {
  return (
    <div className="top-bar">
      <div className="top-left">
        <BackgroundControls />
      </div>
      <div className="top-right" />
    </div>
  )
}

export default TopBar


