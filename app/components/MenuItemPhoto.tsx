'use client'

import { useRef, useState, type ChangeEvent } from 'react'
import Image from 'next/image'
import { Cake } from 'lucide-react'
import { toast } from 'sonner'
import { updateMenuItemImage } from '@/app/actions/admin-menu-edit'
import { compressImageForUpload } from '@/lib/compress-image'
import { uploadResponseSchema } from '@/lib/validations/admin-menu'

interface MenuItemPhotoProps {
  menuItemId: string
  imageUrl: string | null
  altText: string
}

export function MenuItemPhoto({ menuItemId, imageUrl, altText }: MenuItemPhotoProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [currentUrl, setCurrentUrl] = useState(imageUrl)
  const [isUploading, setIsUploading] = useState(false)

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget
    const file = input.files?.[0]
    if (!file) return

    setIsUploading(true)

    try {
      const prepared = await compressImageForUpload(file)
      const formData = new FormData()
      formData.append('photo', prepared, file.name)

      const response = await fetch('/api/upload', { method: 'POST', body: formData })
      const parsed = uploadResponseSchema.safeParse(await response.json())
      const body = parsed.success ? parsed.data : null

      if (!body || !body.success || !body.url) {
        toast.error(body?.error ?? 'Upload failed. Please try again.')
        return
      }

      const saved = await updateMenuItemImage({ menuItemId, imageUrl: body.url })
      if (!saved.success) {
        toast.error(saved.error)
        return
      }

      setCurrentUrl(body.url)
      toast.success('Photo saved.')
    } catch (error) {
      console.error('Photo upload failed:', error)
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsUploading(false)
      input.value = ''
    }
  }

  return (
    <div>
      <span className="text-sm font-medium text-foreground">Photo</span>
      <div className="relative mt-1 aspect-[4/3] w-full overflow-hidden rounded-xl bg-muted">
        {currentUrl ? (
          <Image
            src={currentUrl}
            alt={altText}
            fill
            sizes="(max-width: 640px) 100vw, 576px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground">
            <Cake size={32} aria-hidden="true" />
            <span className="text-sm">No photo yet</span>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <button
        type="button"
        disabled={isUploading}
        onClick={() => inputRef.current?.click()}
        className="mt-3 w-full rounded-xl border border-border bg-surface py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-brand-pink disabled:opacity-50"
      >
        {isUploading ? 'Uploading...' : currentUrl ? 'Replace photo' : 'Upload photo'}
      </button>
    </div>
  )
}