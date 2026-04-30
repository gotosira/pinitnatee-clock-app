import { useEffect, useState } from 'react'

type Quote = { text: string; author?: string }

const fallbackQuotes: Quote[] = [
  { text: 'You cannot start the next chapter of your life if you keep re-reading the last one.' },
  { text: 'Focus on being productive instead of busy.', author: 'Tim Ferriss' },
  { text: 'The secret of getting ahead is getting started.', author: 'Mark Twain' },
]

const CACHE_KEY = 'quoteCache'
const CACHE_TTL_MS = 24 * 60 * 60 * 1000 // 24h
const REQUEST_TIMEOUT_MS = 6000
const MAX_RETRIES = 2

let inFlightLoad: Promise<Quote> | null = null

function pickFallback(): Quote {
  return fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)]
}

function readCache(): Quote | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const { quote, ts } = JSON.parse(raw) as { quote: Quote; ts: number }
    if (!quote?.text) return null
    if (Date.now() - ts > CACHE_TTL_MS) return null
    return quote
  } catch {
    return null
  }
}

function writeCache(quote: Quote) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ quote, ts: Date.now() }))
  } catch {
    /* storage disabled */
  }
}

async function fetchOnce(url: string, apiKey: string): Promise<Quote | null> {
  const ctrl = new AbortController()
  const timeout = window.setTimeout(() => ctrl.abort(), REQUEST_TIMEOUT_MS)
  try {
    const res = await fetch(url, { headers: { 'X-Api-Key': apiKey }, signal: ctrl.signal })
    if (!res.ok) return null
    const arr = await res.json()
    if (Array.isArray(arr) && arr.length > 0 && arr[0].quote) {
      return { text: arr[0].quote, author: arr[0].author }
    }
    return null
  } catch (err) {
    console.warn('[quote] fetch failed', err)
    return null
  } finally {
    window.clearTimeout(timeout)
  }
}

async function loadQuote(): Promise<Quote> {
  const cached = readCache()
  if (cached) return cached

  const apiKey = import.meta.env.VITE_API_NINJAS_KEY as string | undefined
  if (apiKey) {
    const url = 'https://api.api-ninjas.com/v1/quotes?category=success&limit=1'
    let delay = 500
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      const q = await fetchOnce(url, apiKey)
      if (q) {
        writeCache(q)
        return q
      }
      await new Promise((r) => setTimeout(r, delay))
      delay *= 2
    }
  }
  return pickFallback()
}

export function QuoteBar() {
  const [quote, setQuote] = useState<Quote>(() => readCache() ?? fallbackQuotes[0])

  useEffect(() => {
    if (!inFlightLoad) inFlightLoad = loadQuote()
    let cancelled = false
    inFlightLoad.then((q) => {
      if (!cancelled) setQuote(q)
    })
    return () => {
      cancelled = true
    }
  }, [])

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
