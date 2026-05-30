'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'

import type { CoffeeShopRow } from '@/actions/coffee-shops'

type InteractiveDalatMapProps = {
  shops: CoffeeShopRow[]
}

type UserLocation = {
  latitude: number
  longitude: number
}

const dalatCenter: [number, number] = [11.9404, 108.4583]

function toRadians(value: number) {
  return (value * Math.PI) / 180
}

function haversineDistanceKm(
  firstLatitude: number,
  firstLongitude: number,
  secondLatitude: number,
  secondLongitude: number
) {
  const earthRadiusKm = 6371
  const latitudeDelta = toRadians(secondLatitude - firstLatitude)
  const longitudeDelta = toRadians(secondLongitude - firstLongitude)

  const a =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(toRadians(firstLatitude)) * Math.cos(toRadians(secondLatitude)) * Math.sin(longitudeDelta / 2) ** 2

  return 2 * earthRadiusKm * Math.asin(Math.sqrt(a))
}

function formatDistance(distanceKm: number | null) {
  if (distanceKm === null) {
    return 'Đang chờ định vị'
  }

  return distanceKm < 1 ? `Cách bạn ${Math.round(distanceKm * 1000)} m` : `Cách bạn ${distanceKm.toFixed(1)} km`
}

function FitBounds({ shops }: { shops: CoffeeShopRow[] }) {
  const map = useMap()

  useEffect(() => {
    const points = shops.filter(
      (shop) => typeof shop.latitude === 'number' && typeof shop.longitude === 'number'
    )

    if (points.length === 0) {
      map.setView(dalatCenter, 13)
      return
    }

    const bounds = L.latLngBounds(points.map((shop) => [shop.latitude as number, shop.longitude as number]))
    map.fitBounds(bounds.pad(0.2), { animate: true })
  }, [map, shops])

  return null
}

function createMarkerIcon() {
  return L.divIcon({
    className: '',
    html: `
      <div style="width: 34px; height: 34px; display:flex; align-items:center; justify-content:center;">
        <div style="width: 18px; height: 18px; border-radius:9999px; background:#0f5132; border:3px solid #fff; box-shadow:0 8px 18px rgba(15,81,50,.28);"></div>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -30],
  })
}

function MapCenterButton({ userLocation }: { userLocation: UserLocation | null }) {
  const map = useMap()

  return (
    <button
      type="button"
      onClick={() => {
        if (userLocation) {
          map.flyTo([userLocation.latitude, userLocation.longitude], 14, { animate: true })
          return
        }

        map.flyTo(dalatCenter, 13, { animate: true })
      }}
      className="absolute right-4 top-4 z-500 rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-[0_14px_34px_rgba(15,23,42,0.12)] ring-1 ring-black/5 transition hover:bg-slate-50"
    >
      {userLocation ? 'Về vị trí của bạn' : 'Về trung tâm Đà Lạt'}
    </button>
  )
}

export default function InteractiveDalatMap({ shops }: InteractiveDalatMapProps) {
  const router = useRouter()
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null)
  const [mapError, setMapError] = useState(false)

  useEffect(() => {
    if (!navigator.geolocation) {
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
      },
      () => {
        setUserLocation(null)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    )
  }, [])

  const markerIcon = useMemo(() => createMarkerIcon(), [])

  const shopMarkers = shops.filter(
    (shop) => typeof shop.latitude === 'number' && typeof shop.longitude === 'number'
  )
  const hasMarkers = shopMarkers.length > 0

  return (
    <div className="overflow-hidden rounded-4xl bg-white p-3 shadow-[0_20px_50px_rgba(10,47,29,0.08)] ring-1 ring-black/5">
      <div className="relative overflow-hidden rounded-3xl">
        <div className="h-[420px] w-full">
          {mapError ? (
            <div className="flex h-full items-center justify-center text-center text-sm text-slate-600">
              <div>
                <p className="mb-2 font-semibold">Bản đồ hiện không sẵn sàng</p>
                <p className="mb-3">Vui lòng thử tải lại trang hoặc kiểm tra kết nối mạng.</p>
                <a
                  className="inline-flex rounded-full bg-pine-dark px-4 py-2 text-sm font-semibold text-white"
                  href="/map"
                >
                  Thử lại
                </a>
              </div>
            </div>
          ) : (
            <div className="relative h-full w-full">
              <MapContainer center={dalatCenter} zoom={13} className="h-full w-full">
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  eventHandlers={{
                    tileerror: () => {
                      setMapError(true)
                    },
                  }}
                />
                <FitBounds shops={shopMarkers} />

                {shopMarkers.map((shop) => {
                  const distanceKm =
                    userLocation && typeof shop.latitude === 'number' && typeof shop.longitude === 'number'
                      ? haversineDistanceKm(
                          userLocation.latitude,
                          userLocation.longitude,
                          shop.latitude,
                          shop.longitude
                        )
                      : null

                  return (
                    <Marker
                      key={shop.id}
                      position={[shop.latitude as number, shop.longitude as number]}
                      icon={markerIcon}
                      eventHandlers={{
                        click: () => {
                          router.push(`/shops/${shop.id}`)
                        },
                      }}
                    >
                      <Popup>
                        <div className="w-56 space-y-3">
                          <div className="overflow-hidden rounded-2xl bg-slate-100">
                            {shop.image_url ? (
                              <img src={shop.image_url} alt={shop.name} className="h-28 w-full object-cover" />
                            ) : (
                              <div className="flex h-28 items-center justify-center text-sm text-slate-500">
                                Không có ảnh
                              </div>
                            )}
                          </div>

                          <div>
                            <p className="text-sm font-bold text-slate-900">{shop.name}</p>
                            <p className="mt-1 text-xs leading-5 text-slate-600">{formatDistance(distanceKm)}</p>
                          </div>

                          <Link
                            href={`/shops/${shop.id}`}
                            className="inline-flex h-10 items-center justify-center rounded-full bg-pine-dark px-4 text-sm font-semibold text-white transition hover:bg-pine-dark/95"
                          >
                            Xem chi tiết quán
                          </Link>
                        </div>
                      </Popup>
                    </Marker>
                  )
                })}

                <MapCenterButton userLocation={userLocation} />
              </MapContainer>

              {!hasMarkers ? (
                <div className="pointer-events-none absolute inset-x-4 bottom-4 rounded-3xl bg-white/90 px-4 py-3 text-sm font-medium text-slate-700 shadow-lg backdrop-blur-sm">
                  Chưa có địa điểm nào có tọa độ hợp lệ để ghim lên bản đồ.
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}