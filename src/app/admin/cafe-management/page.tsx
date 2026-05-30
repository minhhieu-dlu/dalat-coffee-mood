import { getCoffeeShops } from '@/actions/coffee-shops'
import CafeManagementClient from '@/components/admin/CafeManagementClient'

export const dynamic = 'force-dynamic'

export default async function CafeManagementPage() {
  const coffeeShops = await getCoffeeShops().catch(() => [])

  return <CafeManagementClient initialCoffeeShops={coffeeShops} />
}
