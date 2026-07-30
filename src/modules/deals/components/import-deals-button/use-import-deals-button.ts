'use client'

import { toast } from '@payloadcms/ui'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

type ImportSummary = { total: number; created: number; updated: number; skipped: number }

export const useImportDealsButton = () => {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleImport = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/deals/import', { method: 'POST', credentials: 'include' })
      const data = (await res.json()) as ImportSummary & { errors?: { message: string }[] }
      if (!res.ok) {
        throw new Error(data?.errors?.[0]?.message ?? 'Error al importar ofertas')
      }
      toast.success(
        `Importación lista: ${data.created} nuevas · ${data.updated} actualizadas · ${data.skipped} omitidas`,
      )
      router.refresh()
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return { loading, handleImport }
}
