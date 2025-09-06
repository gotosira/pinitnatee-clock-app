import { BackgroundControls } from './bg/BackgroundControls'
import InterfaceSwitcher from './InterfaceSwitcher'

export function TopBar() {
  return (
    <div className="top-bar">
      <div className="top-left">
        <InterfaceSwitcher />
        <BackgroundControls />
      </div>
      <div className="top-right" />
    </div>
  )
}

export default TopBar


