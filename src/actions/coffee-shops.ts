'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase/server'
import { getUserRole } from '@/lib/auth/role'

export type CoffeeShopInput = {
  name: string
  description?: string
  address?: string
  latitude?: number | null
  longitude?: number | null
  ai_mood_tags?: string[]
}

export type CoffeeShopActionResult = {
  success: boolean
  message: string
}

export type CoffeeShopRow = {
  id: number
  name: string
  description: string | null
  address: string | null
  latitude: number | null
  longitude: number | null
  ai_mood_tags: string[]
  image_url: string | null
  created_by: string
}

export type CoffeeShopsFetchResult = {
  shops: CoffeeShopRow[]
  source: 'database' | 'fallback'
  message: string | null
}

type CoffeeShopQueryRow = {
  id: number | string | null
  name: string | null
  description: string | null
  address: string | null
  latitude: number | string | null
  longitude: number | string | null
  ai_mood_tags: string[] | null
  image_url: string | null
  created_by: string | null
}

const coffeeShopSelect = 'id, name, description, address, latitude, longitude, ai_mood_tags, image_url, created_by'

const fallbackCoffeeShops: CoffeeShopRow[] = [
  {
    id: 1,
    name: 'Cheo Veooo',
    description: 'View rừng thông thoáng đãng, nhiều góc ngồi tĩnh lặng và ánh sáng tự nhiên dịu mắt.',
    address: '7/20 Nguyễn Văn Cừ, Phường 1, Đà Lạt',
    latitude: 11.9412,
    longitude: 108.4488,
    ai_mood_tags: ['Chill', 'Acoustic'],
    image_url:
      'https://images.unsplash.com/photo-1505275350441-83dcda8eeef5?auto=format&fit=crop&w=1800&q=80',
    created_by: 'system',
  },
  {
    id: 2,
    name: 'Tiệm Cà Phê Túi Mơ To',
    description: 'Không gian sân vườn mềm mại, phù hợp ngồi lâu, trò chuyện và chụp ảnh.',
    address: '31 Đặng Thái Thân, Phường 3, Đà Lạt',
    latitude: 11.9498,
    longitude: 108.4461,
    ai_mood_tags: ['Sân vườn', 'Chill'],
    image_url:
      'https://images.unsplash.com/photo-1445116572660-236099ec97a0?auto=format&fit=crop&w=1800&q=80',
    created_by: 'system',
  },
  {
    id: 3,
    name: 'Tiệm Cà Phê Hoàng Hôn',
    description: 'Chất vintage ấm áp, tone gỗ đậm và góc nhìn mây trời đẹp vào cuối ngày.',
    address: 'Khu vực Trại Mát, Đà Lạt',
    latitude: 11.9416,
    longitude: 108.4714,
    ai_mood_tags: ['Cổ điển - Vintage', 'Acoustic'],
    image_url:
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1800&q=80',
    created_by: 'system',
  },
  {
    id: 4,
    name: 'Misty Pine',
    description: 'Quán nhỏ ấm, góc đọc sách, phù hợp làm việc nhẹ.',
    address: 'Hẻm nhỏ gần Hồ Xuân Hương, Đà Lạt',
    latitude: 11.9409,
    longitude: 108.4582,
    ai_mood_tags: ['Chill', 'Yên tĩnh'],
    image_url:
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1800&q=80',
    created_by: 'system',
  },
]

function normalizeText(value: string | undefined | null) {
  return typeof value === 'string' ? value.trim() : ''
}

function normalizeTags(tags: string[] | undefined) {
  return Array.isArray(tags)
    ? tags.map((tag) => tag.trim()).filter(Boolean)
    : []
}

function toFiniteNumber(value: number | string | null | undefined) {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value)

    return Number.isFinite(parsed) ? parsed : null
  }

  return null
}

function normalizeCoffeeShopRow(row: CoffeeShopQueryRow, index: number): CoffeeShopRow {
  const numericId = toFiniteNumber(row.id)

  return {
    id: numericId ?? index + 1,
    name: normalizeText(row.name) || `Quán cà phê ${index + 1}`,
    description: normalizeText(row.description) || null,
    address: normalizeText(row.address) || null,
    latitude: toFiniteNumber(row.latitude),
    longitude: toFiniteNumber(row.longitude),
    ai_mood_tags: normalizeTags(row.ai_mood_tags ?? undefined),
    image_url: normalizeText(row.image_url) || null,
    created_by: normalizeText(row.created_by) || 'system',
  }
}

async function fetchCoffeeShopsFromSupabase(): Promise<CoffeeShopsFetchResult> {
  try {
    const supabase = await createClient()

    // First try: full select including latitude/longitude
    let data: any = null
    let error: any = null

    try {
      const res = await supabase.from('coffee_shops').select(coffeeShopSelect).order('id', { ascending: false })
      data = res.data
      error = res.error
    } catch (err) {
      // supabase-js may throw for unexpected reasons
      error = err
    }

    // If the first attempt errored due to missing columns, retry without latitude/longitude
    if (error) {
      const msg = String(error.message ?? error)

      if (/column .*latitude.* does not exist|column .*longitude.* does not exist|does not exist/.test(msg)) {
        try {
          const reducedSelect = coffeeShopSelect.replace(', latitude, longitude', '')
          const res2 = await supabase.from('coffee_shops').select(reducedSelect).order('id', { ascending: false })
          data = res2.data
          error = res2.error
        } catch (err2) {
          console.error('getCoffeeShops error (reduced select):', err2)

          return {
            shops: fallbackCoffeeShops,
            source: 'fallback',
            message: 'Không thể tải dữ liệu quán từ Supabase. Hệ thống đang dùng dữ liệu mẫu để tiếp tục hiển thị.',
          }
        }
      } else {
        console.error('getCoffeeShops error:', msg)

        return {
          shops: fallbackCoffeeShops,
          source: 'fallback',
          message: 'Không thể tải dữ liệu quán từ Supabase. Hệ thống đang dùng dữ liệu mẫu để tiếp tục hiển thị.',
        }
      }
    }

    const normalizedShops = (data ?? []).map((row: any, index: number) =>
      normalizeCoffeeShopRow(row as CoffeeShopQueryRow, index)
    )

    if (normalizedShops.length === 0) {
      return {
        shops: fallbackCoffeeShops,
        source: 'fallback',
        message: 'Chưa có quán cà phê nào trong Supabase. Hệ thống đang hiển thị dữ liệu mẫu.',
      }
    }

    return {
      shops: normalizedShops,
      source: 'database',
      message: null,
    }
  } catch (error) {
    console.error('getCoffeeShops fatal error:', error)

    return {
      shops: fallbackCoffeeShops,
      source: 'fallback',
      message: 'Không thể kết nối Supabase lúc này. Hệ thống đang dùng dữ liệu mẫu để tránh bị trống màn hình.',
    }
  }
}

function parseTagsFromFormData(formData: FormData) {
  return formData
    .getAll('ai_mood_tags')
    .map((tag) => (typeof tag === 'string' ? tag.trim() : ''))
    .filter(Boolean)
}

function getFormValue(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === 'string' ? value.trim() : ''
}

function getFormNumber(formData: FormData, key: string) {
  const value = getFormValue(formData, key)

  if (!value) {
    return null
  }

  const parsed = Number(value)

  return Number.isFinite(parsed) ? parsed : null
}

function getFormFile(formData: FormData, key: string) {
  const value = formData.get(key)
  return isFile(value) && value.size > 0 ? value : null
}

function slugifyFileName(fileName: string) {
  return fileName
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function isFile(value: unknown): value is File {
  return typeof File !== 'undefined' && value instanceof File
}

async function uploadCoffeeImage(supabase: Awaited<ReturnType<typeof createClient>>, userId: string, imageFile: File) {
  const safeFileName = slugifyFileName(imageFile.name || 'coffee-image')
  const uploadedPath = `${userId}/${crypto.randomUUID()}-${safeFileName}`

  const { error: uploadError } = await supabase.storage
    .from('coffee-images')
    .upload(uploadedPath, imageFile, {
      contentType: imageFile.type || 'application/octet-stream',
      upsert: false,
    })

  if (uploadError) {
    throw new Error(uploadError.message)
  }

  const { data: publicUrlData } = supabase.storage.from('coffee-images').getPublicUrl(uploadedPath)

  return {
    uploadedPath,
    imageUrl: publicUrlData.publicUrl,
  }
}

export async function getCoffeeShops(): Promise<CoffeeShopRow[]> {
  const result = await fetchCoffeeShopsFromSupabase()
  return result.shops
}

export async function getCoffeeShopsWithStatus(): Promise<CoffeeShopsFetchResult> {
  return fetchCoffeeShopsFromSupabase()
}

export async function createCoffeeShop(
  data: CoffeeShopInput,
  imageFile: File | null
): Promise<CoffeeShopActionResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return {
        success: false,
        message: 'Bạn cần đăng nhập để tạo quán cà phê.',
      }
    }

    const name = normalizeText(data.name)

    if (!name) {
      return {
        success: false,
        message: 'Tên quán là bắt buộc.',
      }
    }

    let imageUrl: string | null = null
    let uploadedPath: string | null = null

    if (isFile(imageFile) && imageFile.size > 0) {
      try {
        const uploadedImage = await uploadCoffeeImage(supabase, user.id, imageFile)
        uploadedPath = uploadedImage.uploadedPath
        imageUrl = uploadedImage.imageUrl
      } catch (error) {
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Không thể tải ảnh lên.',
        }
      }
    }

    const { error: insertError } = await supabase.from('coffee_shops').insert({
      name,
      description: normalizeText(data.description) || null,
      address: normalizeText(data.address) || null,
      latitude: typeof data.latitude === 'number' ? data.latitude : null,
      longitude: typeof data.longitude === 'number' ? data.longitude : null,
      ai_mood_tags: normalizeTags(data.ai_mood_tags),
      image_url: imageUrl,
      created_by: user.id,
    })

    if (insertError) {
      if (uploadedPath) {
        await supabase.storage.from('coffee-images').remove([uploadedPath])
      }

      return {
        success: false,
        message: insertError.message,
      }
    }

    revalidatePath('/')
    revalidatePath('/admin/cafe-management')

    return {
      success: true,
      message: 'Đã tạo quán cà phê thành công.',
    }
  } catch {
    return {
      success: false,
      message: 'Không thể tạo quán cà phê lúc này. Vui lòng thử lại sau.',
    }
  }
}

export async function deleteCoffeeShop(id: number): Promise<CoffeeShopActionResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return {
        success: false,
        message: 'Bạn cần đăng nhập để xóa quán cà phê.',
      }
    }

    const { data: shop, error: fetchError } = await supabase
      .from('coffee_shops')
      .select('id, created_by, image_url')
      .eq('id', id)
      .single()

    if (fetchError) {
      return {
        success: false,
        message: fetchError.message,
      }
    }

    if (shop.created_by !== user.id) {
      const role = getUserRole(user as any)

      if (role !== 'admin') {
        return {
          success: false,
          message: 'Bạn chỉ có thể xóa quán do chính mình tạo.',
        }
      }
    }

    const { error: deleteError } = await supabase.from('coffee_shops').delete().eq('id', id)

    if (deleteError) {
      return {
        success: false,
        message: deleteError.message,
      }
    }

    if (shop.image_url) {
      const imagePath = shop.image_url.split('/coffee-images/').pop()

      if (imagePath) {
        await supabase.storage.from('coffee-images').remove([decodeURIComponent(imagePath)])
      }
    }

    revalidatePath('/')
    revalidatePath('/admin/cafe-management')

    return {
      success: true,
      message: 'Đã xóa quán cà phê thành công.',
    }
  } catch {
    return {
      success: false,
      message: 'Không thể xóa quán cà phê lúc này. Vui lòng thử lại sau.',
    }
  }
}

export async function createCoffeeShopAction(formData: FormData): Promise<CoffeeShopActionResult> {
  return createCoffeeShop(
    {
      name: getFormValue(formData, 'name'),
      description: getFormValue(formData, 'description'),
      address: getFormValue(formData, 'address'),
      latitude: getFormNumber(formData, 'latitude'),
      longitude: getFormNumber(formData, 'longitude'),
      ai_mood_tags: parseTagsFromFormData(formData),
    },
    getFormFile(formData, 'image')
  )
}

export async function updateCoffeeShop(
  id: number,
  data: CoffeeShopInput,
  imageFile: File | null
): Promise<CoffeeShopActionResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return {
        success: false,
        message: 'Bạn cần đăng nhập để sửa quán cà phê.',
      }
    }

    const { data: shop, error: fetchError } = await supabase
      .from('coffee_shops')
      .select('id, created_by, image_url')
      .eq('id', id)
      .single()

    if (fetchError) {
      return {
        success: false,
        message: fetchError.message,
      }
    }

    if (shop.created_by !== user.id) {
        const role = getUserRole(user as any)

        if (role !== 'admin') {
          return {
            success: false,
            message: 'Bạn chỉ có thể sửa quán do chính mình tạo.',
          }
        }
    }

    let imageUrl = shop.image_url
    let uploadedPath: string | null = null

    if (isFile(imageFile) && imageFile.size > 0) {
      try {
        const uploadedImage = await uploadCoffeeImage(supabase, user.id, imageFile)
        uploadedPath = uploadedImage.uploadedPath
        imageUrl = uploadedImage.imageUrl
      } catch (error) {
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Không thể tải ảnh lên.',
        }
      }
    }

    const { error: updateError } = await supabase
      .from('coffee_shops')
      .update({
        name: normalizeText(data.name),
        description: normalizeText(data.description) || null,
        address: normalizeText(data.address) || null,
        latitude: typeof data.latitude === 'number' ? data.latitude : null,
        longitude: typeof data.longitude === 'number' ? data.longitude : null,
        ai_mood_tags: normalizeTags(data.ai_mood_tags),
        image_url: imageUrl,
      })
      .eq('id', id)

    if (updateError) {
      if (uploadedPath) {
        await supabase.storage.from('coffee-images').remove([uploadedPath])
      }

      return {
        success: false,
        message: updateError.message,
      }
    }

    if (uploadedPath && shop.image_url) {
      const previousImagePath = shop.image_url.split('/coffee-images/').pop()

      if (previousImagePath) {
        await supabase.storage.from('coffee-images').remove([decodeURIComponent(previousImagePath)])
      }
    }

    revalidatePath('/')
    revalidatePath('/admin/cafe-management')

    return {
      success: true,
      message: 'Đã cập nhật quán cà phê thành công.',
    }
  } catch {
    return {
      success: false,
      message: 'Không thể cập nhật quán cà phê lúc này. Vui lòng thử lại sau.',
    }
  }
}

export async function updateCoffeeShopAction(formData: FormData): Promise<CoffeeShopActionResult> {
  const idValue = getFormValue(formData, 'id')
  const id = Number(idValue)

  if (!Number.isInteger(id) || id <= 0) {
    return {
      success: false,
      message: 'Thiếu mã quán cần cập nhật.',
    }
  }

  return updateCoffeeShop(
    id,
    {
      name: getFormValue(formData, 'name'),
      description: getFormValue(formData, 'description'),
      address: getFormValue(formData, 'address'),
      latitude: getFormNumber(formData, 'latitude'),
      longitude: getFormNumber(formData, 'longitude'),
      ai_mood_tags: parseTagsFromFormData(formData),
    },
    getFormFile(formData, 'image')
  )
}

export async function deleteCoffeeShopAction(formData: FormData): Promise<CoffeeShopActionResult> {
  const idValue = getFormValue(formData, 'id')
  const id = Number(idValue)

  if (!Number.isInteger(id) || id <= 0) {
    return {
      success: false,
      message: 'Thiếu mã quán cần xóa.',
    }
  }

  return deleteCoffeeShop(id)
}