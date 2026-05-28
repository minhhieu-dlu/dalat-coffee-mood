'use server'

export type DalatWeather = {
  temperature: number | null
  description: string
}

function formatWeatherDescription(value: string) {
  if (!value) {
    return 'Không xác định'
  }

  return value.charAt(0).toUpperCase() + value.slice(1)
}

export async function getDalatWeather(): Promise<DalatWeather> {
  const apiKey = process.env.OPENWEATHER_API_KEY

  if (!apiKey) {
    return {
      temperature: null,
      description: 'Thiếu cấu hình OpenWeather',
    }
  }

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=Da%20Lat&units=metric&lang=vi&appid=${apiKey}`,
      {
        next: {
          revalidate: 1800,
        },
      }
    )

    if (!response.ok) {
      throw new Error(`OpenWeather request failed with status ${response.status}`)
    }

    const data = (await response.json()) as {
      main?: { temp?: number }
      weather?: Array<{ description?: string }>
    }

    const temperature = typeof data.main?.temp === 'number' ? Math.round(data.main.temp) : null
    const description = formatWeatherDescription(data.weather?.[0]?.description ?? '')

    return {
      temperature,
      description,
    }
  } catch {
    return {
      temperature: null,
      description: 'Không thể tải dữ liệu thời tiết',
    }
  }
}