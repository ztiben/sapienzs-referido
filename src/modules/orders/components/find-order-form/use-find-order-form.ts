import { useAuth } from '@/shared/providers/auth.provider.client'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'

type FormData = {
  email: string
  orderID: string
}

export const useFindOrderForm = (initialEmail?: string) => {
  const router = useRouter()
  const { user } = useAuth()

  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<FormData>({
    defaultValues: {
      email: initialEmail || user?.email,
    },
  })

  const onSubmit = handleSubmit(async (data) => {
    router.push(`/orders/${data.orderID}?email=${data.email}`)
  })

  return { onSubmit, register, errors }
}
