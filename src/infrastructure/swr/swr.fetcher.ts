/**
 * Default SWR fetcher — the canonical native-`fetch` fetcher from the SWR
 * docs (https://swr.vercel.app/docs/getting-started), TypeScript-typed.
 *
 * Wired as the global default in `SwrProvider`, so call sites just do
 * `useSWR<T>(key)` with no fetcher argument. Keys are server-relative paths
 * (e.g. `/api/countries?limit=100`); SWR runs client-side, so `fetch`
 * resolves them against the browser origin automatically.
 */
export const swrFetcher = <T>(...args: Parameters<typeof fetch>): Promise<T> =>
  fetch(...args).then((res) => res.json() as Promise<T>)
