'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase/server'

export type CoffeeShopInput = {
  name: string
  description?: string
  address?: string
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
  ai_mood_tags: string[]
  image_url: string | null
  created_by: string
}

function normalizeText(value: string | undefined | null) {
  return typeof value === 'string' ? value.trim() : ''
}

function normalizeTags(tags: string[] | undefined) {
  return Array.isArray(tags)
    ? tags.map((tag) => tag.trim()).filter(Boolean)
    : []
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
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('coffee_shops')
    .select('id, name, description, address, ai_mood_tags, image_url, created_by')
    .order('id', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []) as CoffeeShopRow[]
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
      return {
        success: false,
        message: 'Bạn chỉ có thể xóa quán do chính mình tạo.',
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
      return {
        success: false,
        message: 'Bạn chỉ có thể sửa quán do chính mình tạo.',
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