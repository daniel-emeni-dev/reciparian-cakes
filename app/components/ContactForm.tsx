'use client'

import { useState, type ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { submitContact } from '@/app/actions/contact'
import { BAKERY } from '@/lib/bakery'
import { contactSchema, type ContactInput } from '@/lib/validations/contact'

const ENQUIRY_OPTIONS = [
  { value: 'general', label: 'General question' },
  { value: 'custom_order', label: 'Custom order' },
] as const

const inputClass =
  'mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-primary sm:text-sm'

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string
  label: string
  error?: string
  children: ReactNode
}) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  )
}

export function ContactForm() {
  const [sentName, setSentName] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      enquiryType: 'general',
      name: '',
      email: '',
      phone: '',
      eventDate: '',
      servings: '',
      flavorPreferences: '',
      message: '',
      website: '',
    },
  })

  const enquiryType = watch('enquiryType')

  async function onSubmit(values: ContactInput) {
    try {
      const result = await submitContact(values)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast.success('Message sent.')
      setSentName(values.name.split(' ')[0] ?? values.name)
      reset()
    } catch (error) {
      console.error('Contact form submission failed:', error)
      toast.error('Something went wrong. Please try again.')
    }
  }

  if (sentName) {
    return (
      <div role="status" className="rounded-2xl bg-muted p-6 text-center">
        <h3 className="text-lg font-semibold text-foreground">Thank you, {sentName}</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          We got your message and we reply {BAKERY.responseTime}.
        </p>
        <button
          type="button"
          onClick={() => setSentName(null)}
          className="mt-4 rounded-xl border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-brand-pink"
        >
          Send another message
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div role="radiogroup" aria-label="Enquiry type" className="grid grid-cols-2 gap-2">
        {ENQUIRY_OPTIONS.map((option) => (
          <label key={option.value} className="cursor-pointer">
            <input
              type="radio"
              value={option.value}
              {...register('enquiryType')}
              className="peer sr-only"
            />
            <span className="block rounded-xl border border-border bg-surface px-3 py-2.5 text-center text-sm font-medium text-muted-foreground transition-colors peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-foreground peer-focus-visible:ring-2 peer-focus-visible:ring-primary">
              {option.label}
            </span>
          </label>
        ))}
      </div>

      <Field id="contact-name" label="Name" error={errors.name?.message}>
        <input
          id="contact-name"
          type="text"
          autoComplete="name"
          {...register('name')}
          className={inputClass}
        />
      </Field>

      <Field id="contact-email" label="Email" error={errors.email?.message}>
        <input
          id="contact-email"
          type="email"
          autoComplete="email"
          {...register('email')}
          className={inputClass}
        />
      </Field>

      <Field id="contact-phone" label="Phone (optional)" error={errors.phone?.message}>
        <input
          id="contact-phone"
          type="tel"
          autoComplete="tel"
          {...register('phone')}
          className={inputClass}
        />
      </Field>

      {enquiryType === 'custom_order' && (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="contact-date" label="Event date" error={errors.eventDate?.message}>
              <input id="contact-date" type="date" {...register('eventDate')} className={inputClass} />
            </Field>
            <Field id="contact-servings" label="Servings" error={errors.servings?.message}>
              <input
                id="contact-servings"
                type="text"
                inputMode="numeric"
                {...register('servings')}
                className={inputClass}
              />
            </Field>
          </div>
          <Field
            id="contact-flavors"
            label="Flavor preferences (optional)"
            error={errors.flavorPreferences?.message}
          >
            <input
              id="contact-flavors"
              type="text"
              {...register('flavorPreferences')}
              className={inputClass}
            />
          </Field>
        </>
      )}

      <Field id="contact-message" label="Message" error={errors.message?.message}>
        <textarea
          id="contact-message"
          rows={5}
          {...register('message')}
          className={inputClass}
        />
      </Field>

      <div aria-hidden="true" className="absolute left-[-9999px]">
        <label htmlFor="contact-website">Leave this field empty</label>
        <input
          id="contact-website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          {...register('website')}
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        {isSubmitting ? 'Sending...' : 'Send message'}
      </button>
    </form>
  )
}