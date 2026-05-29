'use client'

import { useEffect, useMemo, useState } from 'react'

type DistanceFromUserProps = {
  latitude?: number | null
  longitude?: number | null
}

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

  const haversineValue =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(toRadians(firstLatitude)) *
      Math.cos(toRadians(secondLatitude)) *
      Math.sin(longitudeDelta / 2) ** 2

  return 2 * earthRadiusKm * Math.asin(Math.sqrt(haversineValue))
}

export default function DistanceFromUser({ latitude, longitude }: DistanceFromUserProps) {
  const [userPosition, setUserPosition] = useState<{ latitude: number; longitude: number } | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!navigator.geolocation) {
      setErrorMessage('Thiết bị của bạn chưa hỗ trợ định vị.')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserPosition({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
      },
      () => {
        setErrorMessage('Hãy bật định vị để xem khoảng cách đến quán.')
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    )
  }, [])

  const distanceLabel = useMemo(() => {
    if (!userPosition) {
      return null
    }

    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return null
    }

    const distanceKm = haversineDistanceKm(
      userPosition.latitude,
      userPosition.longitude,
      latitude,
      longitude
    )

    return distanceKm < 1 ? `${Math.round(distanceKm * 1000)} m` : `${distanceKm.toFixed(1)} km`
  }, [latitude, longitude, userPosition])

  if (distanceLabel) {
    return <span>{distanceLabel}</span>
  }

  return <span>{errorMessage ?? 'Đang xác định vị trí của bạn...'}</span>
}