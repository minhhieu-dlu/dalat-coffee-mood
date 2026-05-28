import { getCoffeeShops } from '@/actions/coffee-shops'
import CafeManagementClient from '@/components/admin/CafeManagementClient'

export default async function CafeManagementPage() {
  const coffeeShops = await getCoffeeShops()

  return <CafeManagementClient initialCoffeeShops={coffeeShops} />
}
