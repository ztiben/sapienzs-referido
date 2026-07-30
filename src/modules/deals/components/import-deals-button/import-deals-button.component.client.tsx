'use client'

import { Button } from '@payloadcms/ui'

import { useImportDealsButton } from './use-import-deals-button'

/**
 * Admin toolbar button (Deals list view) that triggers POST /api/deals/import,
 * pulling deals from the configured feed on demand.
 */
export const ImportDealsButton = () => {
  const { loading, handleImport } = useImportDealsButton()

  return (
    <div style={{ marginBottom: 'calc(var(--base) * 0.5)' }}>
      <Button onClick={handleImport} disabled={loading} buttonStyle="secondary" size="small">
        {loading ? 'Importando ofertas…' : 'Importar ofertas del feed'}
      </Button>
    </div>
  )
}
