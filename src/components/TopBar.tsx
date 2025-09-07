import { BackgroundControls } from './bg/BackgroundControls'
import InterfaceSwitcher from './InterfaceSwitcher'
import { useState } from 'react'
import { lazy, Suspense } from 'react'
const SevenTable = lazy(() => import('./SevenTable'))
import QuoteBar from './QuoteBar'

export function TopBar() {
  const [showSeven, setShowSeven] = useState(false)
  return (
    <>
      <div className="top-bar">
        <div className="top-left">
          <InterfaceSwitcher />
          <BackgroundControls />
          <button className="ghost" onClick={() => setShowSeven(true)}>7 ตัวพินิจนาที</button>
        </div>
        <div className="top-right" />
      </div>
      <div className="quote"><QuoteBar /></div>
      {showSeven && (
        <div className="seven-modal" onClick={() => setShowSeven(false)}>
          <div className="seven-modal-inner" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <button className="ghost seven-close" onClick={() => setShowSeven(false)}>✕</button>
            <Suspense fallback={<div className="seven-wrapper">Loading…</div>}>
              <SevenTable />
            </Suspense>
          </div>
        </div>
      )}
    </>
  )
}

export default TopBar


