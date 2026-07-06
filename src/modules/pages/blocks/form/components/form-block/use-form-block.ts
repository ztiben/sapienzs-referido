import type { Form as FormType } from '@payloadcms/plugin-form-builder/types'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import useSWRMutation from 'swr/mutation'

import { buildInitialFormState } from './build-initial-form-state.util'

type SubmitArg = {
  form: FormType['id'] | undefined
  submissionData: { field: string; value: unknown }[]
}

const submitForm = async (url: string, { arg }: { arg: SubmitArg }) => {
  const req = await fetch(url, {
    body: JSON.stringify(arg),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  })
  const res = await req.json()

  if (req.status >= 400) {
    throw { message: res.errors?.[0]?.message || 'Internal Server Error', status: res.status }
  }

  return res
}

export const useFormBlock = ({
  formFromProps,
  formID,
  confirmationType,
  redirect,
}: {
  formFromProps: FormType
  formID?: FormType['id']
  confirmationType?: FormType['confirmationType']
  redirect?: FormType['redirect']
}) => {
  const formMethods = useForm({
    defaultValues: buildInitialFormState(formFromProps.fields),
  })
  const { handleSubmit } = formMethods

  const [isLoading, setIsLoading] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState<boolean>()
  const [error, setError] = useState<{ message: string; status?: string } | undefined>()
  const router = useRouter()

  const { trigger } = useSWRMutation('/api/form-submissions', submitForm)

  const onSubmit = handleSubmit(async (data) => {
    setError(undefined)

    const dataToSend = Object.entries(data).map(([name, value]) => ({ field: name, value }))

    // delay loading indicator by 1s
    const loadingTimerID = setTimeout(() => setIsLoading(true), 1000)

    try {
      await trigger({ form: formID, submissionData: dataToSend })
      clearTimeout(loadingTimerID)
      setIsLoading(false)
      setHasSubmitted(true)

      if (confirmationType === 'redirect' && redirect) {
        const { url } = redirect
        if (url) router.push(url)
      }
    } catch (err) {
      clearTimeout(loadingTimerID)
      const e = err as { message?: string; status?: string }
      setIsLoading(false)
      setError({ message: e?.message || 'Something went wrong.', status: e?.status })
    }
  })

  return { formMethods, isLoading, hasSubmitted, error, onSubmit }
}
