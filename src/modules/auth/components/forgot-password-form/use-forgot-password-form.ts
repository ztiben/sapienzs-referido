import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import useSWRMutation from 'swr/mutation'

type FormData = {
  email: string
}

const requestPasswordReset = async (url: string, { arg }: { arg: FormData }) => {
  const response = await fetch(url, {
    body: JSON.stringify(arg),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  })
  if (!response.ok) throw new Error('forgot-password request failed')
  return response.json().catch(() => ({}))
}

export const useForgotPasswordForm = () => {
  const t = useTranslations('forgotPassword')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<FormData>()

  const { trigger } = useSWRMutation('/api/users/forgot-password', requestPasswordReset)

  const onSubmit = handleSubmit(async (data) => {
    try {
      await trigger(data)
      setSuccess(true)
      setError('')
    } catch {
      setError(t('errorMessage'))
    }
  })

  return { onSubmit, register, errors, error, success }
}
