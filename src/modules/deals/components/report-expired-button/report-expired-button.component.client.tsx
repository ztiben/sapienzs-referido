'use client'

import { FlagIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React from 'react'

import { Button } from '@/shared/components/ui/button'

import { useReportExpiredButton } from './use-report-expired-button'

type Props = {
  dealId: number
  className?: string
}

export const ReportExpiredButton: React.FC<Props> = ({ dealId, className }) => {
  const { isMutating, onReport } = useReportExpiredButton(dealId)
  const t = useTranslations('deals')

  return (
    <Button
      className={className}
      disabled={isMutating}
      onClick={onReport}
      size="sm"
      type="button"
      variant="ghost"
    >
      <FlagIcon className="h-4 w-4" />
      {t('reportExpired')}
    </Button>
  )
}
