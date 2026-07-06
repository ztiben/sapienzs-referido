import { useAuth } from '@/shared/providers/auth.provider.client'
import { useTranslations } from 'next-intl'
import { useRouter, useSearchParams } from 'next/navigation'
import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'

type FormData = {
  email: string
  password: string
}

export const useLoginForm = () => {
  const t = useTranslations('auth')
  const searchParams = useSearchParams()
  const allParams = searchParams.toString() ? `?${searchParams.toString()}` : ''
  const redirect = useRef(searchParams.get('redirect'))
  const { login } = useAuth()
  const router = useRouter()
  const [error, setError] = useState<null | string>(null)

  const {
    formState: { errors, isLoading },
    handleSubmit,
    register,
  } = useForm<FormData>()

  const onSubmit = handleSubmit(async (data) => {
    try {
      await login(data)
      router.push(redirect.current || '/account')
    } catch {
      setError(t('credentialsError'))
    }
  })

  return { onSubmit, register, errors, isLoading, error, allParams }
}
