import InterfaceSwitcher from './InterfaceSwitcher'
import { lazy, Suspense, useEffect, useRef, useState } from 'react'
const SevenTable = lazy(() => import('./SevenTable'))
import QuoteBar from './QuoteBar'
import { useMeditationAudio } from '../hooks/useMeditationAudio'

const FOCUSABLE_SELECTOR = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

export function TopBar() {
  const [showSeven, setShowSeven] = useState(false)
  const { enabled, setEnabled } = useMeditationAudio()
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const modalRef = useRef<HTMLDivElement | null>(null)

  // Esc closes the modal; Tab/Shift+Tab cycles focus inside it.
  useEffect(() => {
    if (!showSeven) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault()
        setShowSeven(false)
        return
      }
      if (e.key !== 'Tab' || !modalRef.current) return
      const focusables = Array.from(
        modalRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter((el) => !el.hasAttribute('disabled'))
      if (focusables.length === 0) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      const active = document.activeElement
      if (e.shiftKey && active === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && active === last) {
        e.preventDefault()
        first.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [showSeven])

  // When modal opens: move focus into it. When it closes: restore focus to the trigger.
  useEffect(() => {
    if (showSeven) {
      // wait one frame for the modal to mount
      const id = requestAnimationFrame(() => {
        const first = modalRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)
        first?.focus()
      })
      return () => cancelAnimationFrame(id)
    }
    triggerRef.current?.focus({ preventScroll: true })
  }, [showSeven])

  return (
    <>
      <div className="top-bar">
        <div className="top-left">
          <InterfaceSwitcher />
          <button
            ref={triggerRef}
            className="ghost"
            onClick={() => setShowSeven(true)}
            aria-haspopup="dialog"
            aria-expanded={showSeven}
          >
            7 ตัวพินิจนาที
          </button>
          <button
            className="ghost"
            onClick={() => setEnabled(!enabled)}
            aria-pressed={enabled}
          >
            {enabled ? 'Meditation: On' : 'Meditation: Off'}
          </button>
        </div>
        <div className="top-right" />
      </div>
      <div className="quote"><QuoteBar /></div>
      {showSeven && (
        <div className="seven-modal" onClick={() => setShowSeven(false)}>
          <div
            ref={modalRef}
            className="seven-modal-inner"
            role="dialog"
            aria-modal="true"
            aria-label="ตารางพินิจนาที"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="ghost seven-close" onClick={() => setShowSeven(false)} aria-label="Close dialog">
              ✕
            </button>
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
