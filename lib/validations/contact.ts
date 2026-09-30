import { z } from 'zod'

const PHONE_PATTERN = /^(\+?234|0)\d{10}$/

export const ENQUIRY_TYPES = ['general', 'custom_order'] as const

export const contactSchema = z
  .object({
    enquiryType: z.enum(ENQUIRY_TYPES),
    name: z.string().trim().min(2, 'Please enter your name.').max(80, 'That name is too long.'),
    email: z.string().trim().toLowerCase().email('Please enter a valid email.'),
    phone: z
      .string()
      .trim()
      .max(20, 'That phone number is too long.')
      .refine(
        (value) => value === '' || PHONE_PATTERN.test(value.replace(/[\s-]/g, '')),
        'Please enter a valid Nigerian phone number.'
      ),
    eventDate: z
      .string()
      .trim()
      .refine(
        (value) => value === '' || (/^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value))),
        'Please pick a valid date.'
      ),
    servings: z
      .string()
      .trim()
      .refine((value) => value === '' || /^\d{1,4}$/.test(value), 'Enter servings as a whole number.'),
    flavorPreferences: z.string().trim().max(200, 'Please keep this under 200 characters.'),
    message: z
      .string()
      .trim()
      .min(10, 'Please tell us a little more.')
      .max(1500, 'Please keep your message under 1500 characters.'),
    website: z.string().max(200),
  })
  .superRefine((value, ctx) => {
    if (value.enquiryType !== 'custom_order') return

    if (value.eventDate === '') {
      ctx.addIssue({ code: 'custom', path: ['eventDate'], message: 'Please tell us the event date.' })
    } else if (value.eventDate < new Date().toISOString().slice(0, 10)) {
      ctx.addIssue({ code: 'custom', path: ['eventDate'], message: 'The event date cannot be in the past.' })
    }

    if (value.servings === '') {
      ctx.addIssue({ code: 'custom', path: ['servings'], message: 'Please tell us how many servings.' })
    }
  })

export type ContactInput = z.infer<typeof contactSchema>