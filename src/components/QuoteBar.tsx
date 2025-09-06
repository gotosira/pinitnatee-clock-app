import { useEffect, useState } from 'react'
import { useCurrentLocation } from '../hooks/useLocation'
import { useTemperature } from '../hooks/useTemperature'

type Quote = { text: string; author?: string }

const fallbackQuotes: Quote[] = [
  { text: 'You cannot start the next chapter of your life if you keep re-reading the last one.' },
  { text: 'Focus on being productive instead of busy.', author: 'Tim Ferriss' },
  { text: 'The secret of getting ahead is getting started.', author: 'Mark Twain' }
]

export function QuoteBar() {
  const [quote, setQuote] = useState<Quote>(fallbackQuotes[0])
  const geo = useCurrentLocation()
  const temp = useTemperature()

  function pickCategories(): string[] {
    const h = new Date().getHours()
    const code = temp.code ?? null
    const list: string[] = []
    // time of day
    if (h >= 5 && h < 11) list.push('motivational', 'success')
    else if (h >= 11 && h < 16) list.push('success', 'inspirational')
    else if (h >= 16 && h < 20) list.push('life', 'happiness')
    else list.push('wisdom', 'life')
    // weather-based
    if (code !== null) {
      if ([0,1].includes(code)) list.unshift('inspirational')
      else if ([2,3].includes(code)) list.unshift('life')
      else if ([51,53,55,56,57,61,63,65,80,81,82].includes(code)) list.unshift('hope')
      else if ([45,48].includes(code)) list.unshift('mindfulness')
      else if ([71,73,75,77,85,86].includes(code)) list.unshift('nature')
      else if ([95,96,99].includes(code)) list.unshift('courage')
    }
    // city hint (prefer urban topics at night)
    if (geo?.name && (h >= 18 || h < 6)) list.unshift('life')
    // ensure a reliable fallback category
    list.push('success')
    return Array.from(new Set(list))
  }

  useEffect(() => {
    async function load() {
      try {
        const apiKey = import.meta.env.VITE_API_NINJAS_KEY as string | undefined
        const categories = pickCategories()
        if (apiKey) {
          for (const cat of categories) {
            const url = `https://api.api-ninjas.com/v1/quotes?category=${encodeURIComponent(cat)}&limit=1`
            const res = await fetch(url, { headers: { 'X-Api-Key': apiKey } })
            if (res.ok) {
              const arr = await res.json()
              if (Array.isArray(arr) && arr.length > 0 && arr[0].quote) {
                setQuote({ text: arr[0].quote, author: arr[0].author })
                return
              }
            }
          }
        }
        // fallback
        const idx = Math.floor(Math.random() * fallbackQuotes.length)
        setQuote(fallbackQuotes[idx])
      } catch {
        const idx = Math.floor(Math.random() * fallbackQuotes.length)
        setQuote(fallbackQuotes[idx])
      }
    }
    load()
    // re-evaluate when context changes
  }, [geo?.name, temp.code])

  return (
    <>
      <span className="mark">“</span>
      <span>{quote.text}</span>
      <span className="mark">”</span>
      {quote.author && <span className="author"> — {quote.author}</span>}
    </>
  )
}

export default QuoteBar


