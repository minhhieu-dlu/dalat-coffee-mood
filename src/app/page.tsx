import { getCoffeeShopsWithStatus } from '@/actions/coffee-shops'
import HomeClient from '@/components/home/HomeClient'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const { shops, message } = await getCoffeeShopsWithStatus()

  return <HomeClient coffeeShops={shops} dataNotice={message} />
}