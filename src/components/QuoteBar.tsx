import { useEffect, useState } from 'react'

type Quote = { text: string; author?: string }

const fallbackQuotes: Quote[] = [
  { text: 'You cannot start the next chapter of your life if you keep re-reading the last one.' },
  { text: 'Focus on being productive instead of busy.', author: 'Tim Ferriss' },
  { text: 'The secret of getting ahead is getting started.', author: 'Mark Twain' }
]

export function QuoteBar() {
  const [quote, setQuote] = useState<Quote>(fallbackQuotes[0])

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('https://api.quotable.io/random')
        const data = await res.json()
        setQuote({ text: data.content, author: data.author })
      } catch {
        const idx = Math.floor(Math.random() * fallbackQuotes.length)
        setQuote(fallbackQuotes[idx])
      }
    }
    load()
  }, [])

  return (
    <div className="quote">
      <span className="mark">“</span>
      <span>{quote.text}</span>
      <span className="mark">”</span>
      {quote.author && <span className="author"> — {quote.author}</span>}
    </div>
  )
}

export default QuoteBar


