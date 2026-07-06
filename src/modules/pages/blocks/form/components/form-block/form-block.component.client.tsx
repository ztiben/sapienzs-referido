'use client'
import type { Form as FormType } from '@payloadcms/plugin-form-builder/types'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

import { RichText } from '@/modules/pages/components/rich-text/rich-text.component'
import { Button } from '@/shared/components/ui/button'
import { DefaultDocumentIDType } from 'payload'
import React from 'react'
import { FormProvider } from 'react-hook-form'

import { fields } from './fields.constants'
import { useFormBlock } from './use-form-block'

export type Value = unknown

export interface Property {
  [key: string]: Value
}

export interface Data {
  [key: string]: Property | Property[]
}

export type FormBlockType = {
  blockName?: string
  blockType?: 'formBlock'
  enableIntro: boolean
  form: FormType
  introContent?: SerializedEditorState
}

export const FormBlock: React.FC<
  FormBlockType & {
    id?: DefaultDocumentIDType
  }
> = (props) => {
  const {
    enableIntro,
    form: formFromProps,
    form: { id: formID, confirmationMessage, confirmationType, redirect, submitButtonLabel } = {},
    introContent,
  } = props

  const { formMethods, isLoading, hasSubmitted, error, onSubmit } = useFormBlock({
    formFromProps,
    formID,
    confirmationType,
    redirect,
  })
  const { control, formState: { errors }, register } = formMethods

  return (
    <div className="container lg:max-w-3xl">
      {enableIntro && introContent && !hasSubmitted && (
        <RichText className="mb-8 lg:mb-12" data={introContent} enableGutter={false} />
      )}
      <div className="p-4 lg:p-6 rounded-[0.8rem] bg-base-200 border">
        <FormProvider {...formMethods}>
          {!isLoading && hasSubmitted && confirmationType === 'message' && (
            <RichText data={confirmationMessage} />
          )}
          {isLoading && !hasSubmitted && <p>Loading, please wait...</p>}
          {error && <div>{`${error.status || '500'}: ${error.message || ''}`}</div>}
          {!hasSubmitted && (
            <form id={formID} onSubmit={onSubmit}>
              <div className="mb-4 last:mb-0">
                {formFromProps &&
                  formFromProps.fields &&
                  formFromProps.fields?.map((field, index) => {
                    const Field = fields?.[field.blockType as keyof typeof fields] as unknown as
                      | React.FC<Record<string, unknown>>
                      | undefined

                    if (Field) {
                      return (
                        <div className="mb-6 last:mb-0" key={index}>
                          <Field
                            form={formFromProps}
                            {...field}
                            {...formMethods}
                            control={control}
                            errors={errors}
                            register={register}
                          />
                        </div>
                      )
                    }
                    return null
                  })}
              </div>

              <Button form={formID} type="submit" variant="default">
                {submitButtonLabel}
              </Button>
            </form>
          )}
        </FormProvider>
      </div>
    </div>
  )
}
