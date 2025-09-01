import { useBackground } from '../../hooks/useBackground'

export function BackgroundControls() {
  const { randomize, resetDefault } = useBackground()
  return (
    <div className="bg-controls">
      <button className="ghost" onClick={randomize}>Random Unsplash</button>
      <button className="ghost" onClick={resetDefault}>Default</button>
    </div>
  )
}

export default BackgroundControls


