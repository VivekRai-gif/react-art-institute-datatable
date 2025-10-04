import axios, { AxiosResponse } from 'axios'
import { ArtWork } from '../types/artwork'

const BASE = 'https://api.artic.edu/api/v1/artworks'

export interface FetchResult {
  data: ArtWork[]
  total: number
}

/**
 * Fetch artworks from the AIAC API with a small retry loop.
 * Keeps mapping explicit and defensive to avoid surprises from API changes.
 */
export async function fetchArtworks(page: number, limit = 12): Promise<FetchResult> {
  const url = `${BASE}?page=${page}&limit=${limit}`

  // Simple retry loop for transient network errors
  const maxAttempts = 3
  let attempt = 0
  let lastError: unknown = null

  while (attempt < maxAttempts) {
    attempt += 1
    try {
      const res: AxiosResponse = await axios.get(url, { timeout: 8000 })
      const body = res.data || {}

      const rawItems = Array.isArray(body.data) ? body.data : []

      const data: ArtWork[] = rawItems.map((it: any) => ({
        id: typeof it.id === 'number' ? it.id : Number(it.id || 0),
        title: String(it.title ?? '').trim(),
        place_of_origin: String(it.place_of_origin ?? it.place_of_origin ?? ''),
        artist_display: String(it.artist_display ?? ''),
        inscriptions: it.inscription_display ?? it.inscriptions ?? null,
        date_start: it.date_start ?? null,
        date_end: it.date_end ?? null,
      }))

      const total = Number(body.pagination?.total ?? data.length)

      return { data, total }
    } catch (err) {
      lastError = err
      // small backoff before retry
      await new Promise(r => setTimeout(r, 300 * attempt))
    }
  }

  // If we reach here, rethrow the last error with a helpful message.
  throw new Error(`Failed to fetch artworks after ${maxAttempts} attempts: ${String(lastError)}`)
}
