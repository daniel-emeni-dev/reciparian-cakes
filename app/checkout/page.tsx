import { getDeliveryZones } from '@/app/actions/delivery-zones'
import { CheckoutForm } from '@/app/components/CheckoutForm'

export default async function CheckoutPage() {
  const zones = await getDeliveryZones()

  return (
    <main className="min-h-screen bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-8 text-3xl font-bold text-foreground">Checkout</h1>
        <CheckoutForm zones={zones} />
      </div>
    </main>
  )
}