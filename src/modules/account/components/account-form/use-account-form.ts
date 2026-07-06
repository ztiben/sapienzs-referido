import type { User } from '@/payload-types'
import { useAuth } from '@/shared/providers/auth.provider.client'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import useSWRMutation from 'swr/mutation'

type FormData = {
  email: string
  name: User['name']
  password: string
  passwordConfirm: string
}

class UpdateUserError extends Error {
  constructor(public status: number) {
    super('account update failed')
    this.name = 'UpdateUserError'
  }
}

const updateUser = async (
  url: string,
  { arg }: { arg: { userId: number | string; data: FormData } },
) => {
  const response = await fetch(`${url}/${arg.userId}`, {
    body: JSON.stringify(arg.data),
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    method: 'PATCH',
  })
  if (!response.ok) throw new UpdateUserError(response.status)
  return response.json()
}

export const useAccountForm = () => {
  const t = useTranslations('account')
  const { setUser, user } = useAuth()
  const router = useRouter()
  const [changePassword, setChangePassword] = useState(false)

  const {
    formState: { errors, isLoading, isSubmitting, isDirty },
    handleSubmit,
    register,
    reset,
    watch,
  } = useForm<FormData>()

  const password = watch('password', '')

  const { trigger } = useSWRMutation('/api/users', updateUser)

  const onSubmit = handleSubmit(async (data) => {
    if (!user) return
    try {
      const json = await trigger({ userId: user.id, data })
      setUser(json.doc)
      toast.success(t('updatedSuccess'))
      setChangePassword(false)
      reset({ name: json.doc.name, email: json.doc.email, password: '', passwordConfirm: '' })
    } catch (error) {
      // The session expired or is invalid: clear the user so the effect below
      // redirects to /login instead of leaving the user stuck on the form.
      if (error instanceof UpdateUserError && (error.status === 401 || error.status === 403)) {
        setUser(null)
        return
      }
      toast.error(t('updateError'))
    }
  })

  useEffect(() => {
    if (user === null) {
      router.push(
        `/login?error=${encodeURIComponent(t('mustBeLoggedIn'))}&redirect=${encodeURIComponent('/account')}`,
      )
    }

    if (user) {
      reset({ name: user.name, email: user.email, password: '', passwordConfirm: '' })
    }
  }, [user, router, reset, changePassword, t])

  return {
    onSubmit,
    register,
    errors,
    isLoading,
    isSubmitting,
    isDirty,
    changePassword,
    setChangePassword,
    password,
  }
}
