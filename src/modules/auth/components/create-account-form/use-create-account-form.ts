import { useAuth } from '@/shared/providers/auth.provider.client'
import { useTranslations } from 'next-intl'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import useSWRMutation from 'swr/mutation'

type FormData = {
  name: string
  email: string
  password: string
  passwordConfirm: string
}

const createUser = async (url: string, { arg }: { arg: FormData }) => {
  const response = await fetch(url, {
    body: JSON.stringify(arg),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  })
  if (!response.ok) throw new Error(response.statusText || '')
  return response.json().catch(() => ({}))
}

export const useCreateAccountForm = () => {
  const t = useTranslations('auth')
  const searchParams = useSearchParams()
  const allParams = searchParams.toString() ? `?${searchParams.toString()}` : ''
  const { login } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<null | string>(null)

  const {
    formState: { errors },
    handleSubmit,
    register,
    watch,
  } = useForm<FormData>()

  const password = watch('password', '')

  const { trigger } = useSWRMutation('/api/users', createUser)

  const onSubmit = handleSubmit(async (data) => {
    try {
      await trigger(data)
    } catch (err) {
      setError(t('errorCreatingAccount'))
      return
    }

    const redirect = searchParams.get('redirect')
    const timer = setTimeout(() => setLoading(true), 1000)

    try {
      await login(data)
      clearTimeout(timer)
      router.push(redirect || `/account?success=${encodeURIComponent(t('accountCreatedSuccess'))}`)
    } catch {
      clearTimeout(timer)
      setError(t('credentialsError'))
    }
  })

  return { onSubmit, register, errors, loading, error, allParams, password }
}
