import 'server-only'
import crypto from 'crypto'

const PAYSTACK_BASE_URL = 'https://api.paystack.co'

interface InitializeTransactionParams {
  email: string
  amountKobo: number
  reference: string
  callbackUrl: string
  metadata: Record<string, unknown>
}

interface InitializeTransactionResponse {
  status: boolean
  message: string
  data: {
    authorization_url: string
    access_code: string
    reference: string
  }
}

/**
 * Calls Paystack's Initialize Transaction endpoint. The owner absorbs
 * Paystack's fee — we never add a surcharge to amountKobo here.
 */
export async function initializeTransaction(
  params: InitializeTransactionParams
): Promise<InitializeTransactionResponse> {
  const secretKey = process.env.PAYSTACK_SECRET_KEY
  if (!secretKey) throw new Error('Missing PAYSTACK_SECRET_KEY')

  const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: params.email,
      amount: params.amountKobo,
      reference: params.reference,
      callback_url: params.callbackUrl,
      metadata: params.metadata,
    }),
  })

  if (!response.ok) {
    throw new Error(`Paystack initialize failed: ${response.status}`)
  }

  return response.json()
}

/**
 * Verifies the x-paystack-signature header against the raw request
 * body using HMAC SHA512, per Paystack's webhook spec. Must be called
 * with the raw (unparsed) body text — signatures don't match if the
 * body was JSON.parse()'d and re-stringified first.
 */
export function verifyPaystackSignature(rawBody: string, signature: string | null): boolean {
  const secretKey = process.env.PAYSTACK_SECRET_KEY
  if (!secretKey || !signature) return false

  const hash = crypto.createHmac('sha512', secretKey).update(rawBody).digest('hex')
  return hash === signature
}

/**
 * Generates a deterministic, collision-resistant order reference.
 */
export function generateOrderReference(): string {
  const random = crypto.randomBytes(4).toString('hex')
  return `ORD_${Date.now()}_${random}`
}
