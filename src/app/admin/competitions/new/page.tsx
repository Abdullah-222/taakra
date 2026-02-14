'use client'

import { FormEvent, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { theme } from '../../../../../theme'
import { toast } from '@/components/ui/ToasterProvider'
import { supabase } from '@/lib/supabase'
import { MediaDropzone } from '@/components/admin/MediaDropzone'
import { categories, subcategories, getSubcategories } from '@/lib/categories'

type UploadedMedia = {
  id: string
  url: string
  name: string
}

export default function AdminNewCompetitionPage() {
  const router = useRouter()
  const { theme: currentTheme } = useTheme()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [rules, setRules] = useState('')
  const [category, setCategory] = useState('')
  const [subcategory, setSubcategory] = useState('')
  const [deadline, setDeadline] = useState('')
  const [prize, setPrize] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [status, setStatus] = useState<'draft' | 'published'>('draft')
  const [imageUploads, setImageUploads] = useState<UploadedMedia[]>([])
  const [videoUploads, setVideoUploads] = useState<UploadedMedia[]>([])
  const [state, setState] = useState<'idle' | 'saving'>('idle')
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [isUploadingImages, setIsUploadingImages] = useState(false)
  const [isUploadingVideos, setIsUploadingVideos] = useState(false)
  const [isGeneratingRules, setIsGeneratingRules] = useState(false)

  const isSubmitting = state === 'saving'
  const glowEffect = currentTheme === 'dark' ? theme.glow.strong : '0 0 20px rgba(54, 158, 255, 0.2)'
  
  const availableSubcategories = getSubcategories(category)

  function validate() {
    const errors: Record<string, string> = {}
    if (!title.trim()) errors.title = 'Title is required'
    if (!description.trim()) errors.description = 'Description is required'
    if (!category.trim()) errors.category = 'Category is required'
    if (!deadline) errors.deadline = 'Deadline is required'
    if (!prize.trim()) errors.prize = 'Prize is required'
    
    // Validate deadline is in the future
    if (deadline && new Date(deadline) <= new Date()) {
      errors.deadline = 'Deadline must be in the future'
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  function handleAddTag() {
    const trimmedTag = tagInput.trim()
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag])
      setTagInput('')
    }
  }

  function handleRemoveTag(tagToRemove: string) {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  async function handleGenerateRules() {
    // Validate required fields for rules generation
    if (!title.trim() || !description.trim() || !category.trim()) {
      toast.error('Please fill in title, description, and category before generating rules.')
      return
    }

    setIsGeneratingRules(true)
    try {
      const response = await fetch('/api/ai/generate-rules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          category,
          subcategory: subcategory || undefined,
          prize: prize || undefined,
          tags: tags.length > 0 ? tags : undefined,
        }),
      })

      const data = await response.json()

      if (data.success && data.rules) {
        setRules(data.rules)
        toast.success('Rules generated successfully! ✨')
      } else {
        toast.error(data.error || 'Failed to generate rules. Please try again.')
      }
    } catch (error) {
      console.error('Error generating rules:', error)
      toast.error('Failed to generate rules. Please try again.')
    } finally {
      setIsGeneratingRules(false)
    }
  }

  async function handleImagesSelected(files: FileList | null) {
    if (!files || files.length === 0) return
    setIsUploadingImages(true)
    try {
      const newUploads: UploadedMedia[] = []
      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop() || 'jpg'
        const filePath = `competitions/images/${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('takra-bucket')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
          })

        if (uploadError) {
          console.error('Image upload error', uploadError)
          throw new Error('Failed to upload one or more images')
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from('takra-bucket').getPublicUrl(filePath)

        newUploads.push({
          id: `${filePath}-${Date.now()}`,
          url: publicUrl,
          name: file.name,
        })
      }

      setImageUploads((prev) => [...prev, ...newUploads])
      setFormErrors((prev) => ({ ...prev, images: '' }))
      toast.success('Images uploaded ❄️')
    } catch (error: any) {
      console.error(error)
      toast.error(error.message || 'Failed to upload images')
    } finally {
      setIsUploadingImages(false)
    }
  }

  async function handleVideosSelected(files: FileList | null) {
    if (!files || files.length === 0) return
    setIsUploadingVideos(true)
    try {
      const newUploads: UploadedMedia[] = []
      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop() || 'mp4'
        const filePath = `competitions/videos/${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('takra-bucket')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
          })

        if (uploadError) {
          console.error('Video upload error', uploadError)
          throw new Error('Failed to upload one or more videos')
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from('takra-bucket').getPublicUrl(filePath)

        newUploads.push({
          id: `${filePath}-${Date.now()}`,
          url: publicUrl,
          name: file.name,
        })
      }

      setVideoUploads((prev) => [...prev, ...newUploads])
      toast.success('Videos uploaded ❄️')
    } catch (error: any) {
      console.error(error)
      toast.error(error.message || 'Failed to upload videos')
    } finally {
      setIsUploadingVideos(false)
    }
  }

  function removeImage(id: string) {
    setImageUploads((prev) => prev.filter((img) => img.id !== id))
  }

  function removeVideo(id: string) {
    setVideoUploads((prev) => prev.filter((vid) => vid.id !== id))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!validate()) {
      toast.error('Please fix the highlighted errors')
      return
    }

    try {
      setState('saving')

      const res = await fetch('/api/admin/competitions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          rules: rules.trim() || null,
          category: category.trim(),
          subcategory: subcategory.trim() || null,
          deadline: new Date(deadline).toISOString(),
          prize: prize.trim(),
          tags,
          images: imageUploads.map((img) => img.url),
          videos: videoUploads.map((vid) => vid.url),
          status,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        const message = data?.error ?? 'Failed to create competition'
        throw new Error(message)
      }

      toast.success('Competition created successfully ❄️')
      router.push('/admin/competitions')
      router.refresh()
    } catch (error: any) {
      console.error(error)
      toast.error(error.message || 'Something went wrong while creating competition')
      setState('idle')
    }
  }

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: 'var(--background)' }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">❄️</span>
            <h1
              className="text-3xl font-bold"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Create Competition
            </h1>
          </div>
          <p
            className="text-base"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Create a new competition snowflake. Each competition is unique and will appear in the blizzard of opportunities.
          </p>
        </div>

        {/* Form Card */}
        <form
          onSubmit={handleSubmit}
          className="space-y-6 p-8 rounded-3xl backdrop-blur-xl transition-all duration-300"
          style={{
            background: 'var(--glass-bg)',
            backdropFilter: 'var(--glass-blur)',
            border: '1px solid var(--glass-border)',
            boxShadow: 'var(--glass-shadow)',
            borderRadius: theme.radius.xl,
          }}
        >
          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Title <span style={{ color: theme.colors.danger }}>*</span>
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isSubmitting}
              className="w-full px-4 py-3 text-sm transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none"
              style={{
                background: 'var(--input-bg)',
                border: 'var(--input-border)',
                borderRadius: theme.inputs.radius,
                color: 'var(--input-text)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.boxShadow = glowEffect
                e.currentTarget.style.border = `1px solid var(--color-glacier-500)`
              }}
              onBlur={(e) => {
                e.currentTarget.style.boxShadow = 'none'
                e.currentTarget.style.border = 'var(--input-border)'
              }}
              placeholder="e.g., Winter Hackathon 2024"
            />
            {formErrors.title && (
              <p className="mt-1 text-xs" style={{ color: theme.colors.danger }}>
                {formErrors.title}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Description <span style={{ color: theme.colors.danger }}>*</span>
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
              rows={6}
              className="w-full px-4 py-3 text-sm transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none resize-none"
              style={{
                background: 'var(--input-bg)',
                border: 'var(--input-border)',
                borderRadius: theme.inputs.radius,
                color: 'var(--input-text)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.boxShadow = glowEffect
                e.currentTarget.style.border = `1px solid var(--color-glacier-500)`
              }}
              onBlur={(e) => {
                e.currentTarget.style.boxShadow = 'none'
                e.currentTarget.style.border = 'var(--input-border)'
              }}
              placeholder="Describe the competition, requirements, and what participants can expect..."
            />
            {formErrors.description && (
              <p className="mt-1 text-xs" style={{ color: theme.colors.danger }}>
                {formErrors.description}
              </p>
            )}
          </div>

          {/* Rules of competition */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor="rules"
                className="block text-sm font-medium"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Rules of competition
              </label>
              <button
                type="button"
                onClick={handleGenerateRules}
                disabled={isSubmitting || isGeneratingRules || !title.trim() || !description.trim() || !category.trim()}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: isGeneratingRules 
                    ? 'rgba(59, 130, 246, 0.3)' 
                    : theme.buttons.primary.background,
                  color: theme.buttons.primary.color,
                  borderRadius: theme.radius.sm,
                }}
              >
                {isGeneratingRules ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <span>🤖</span>
                    <span>Generate with AI</span>
                  </>
                )}
              </button>
            </div>
            <textarea
              id="rules"
              value={rules}
              onChange={(e) => setRules(e.target.value)}
              disabled={isSubmitting}
              rows={6}
              className="w-full px-4 py-3 text-sm transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none resize-y"
              style={{
                background: 'var(--input-bg)',
                border: 'var(--input-border)',
                borderRadius: theme.inputs.radius,
                color: 'var(--input-text)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.boxShadow = glowEffect
                e.currentTarget.style.border = `1px solid var(--color-glacier-500)`
              }}
              onBlur={(e) => {
                e.currentTarget.style.boxShadow = 'none'
                e.currentTarget.style.border = 'var(--input-border)'
              }}
              placeholder="Enter the full rules of the competition as a paragraph (eligibility, submission guidelines, judging criteria, etc.)..."
            />
            <p className="mt-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Optional. Shown to participants on the competition page. Click "Generate with AI" to auto-generate rules based on your competition details.
            </p>
          </div>

          {/* Category and Subcategory */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Category <span style={{ color: theme.colors.danger }}>*</span>
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value)
                  setSubcategory('') // Reset subcategory when category changes
                }}
                disabled={isSubmitting}
                className="w-full px-4 py-3 text-sm transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none"
                style={{
                  background: 'var(--input-bg)',
                  border: 'var(--input-border)',
                  borderRadius: theme.inputs.radius,
                  color: 'var(--input-text)',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.boxShadow = glowEffect
                  e.currentTarget.style.border = `1px solid var(--color-glacier-500)`
                }}
                onBlur={(e) => {
                  e.currentTarget.style.boxShadow = 'none'
                  e.currentTarget.style.border = 'var(--input-border)'
                }}
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {formErrors.category && (
                <p className="mt-1 text-xs" style={{ color: theme.colors.danger }}>
                  {formErrors.category}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="subcategory"
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Subcategory
              </label>
              <select
                id="subcategory"
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                disabled={isSubmitting || !category || availableSubcategories.length === 0}
                className="w-full px-4 py-3 text-sm transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none"
                style={{
                  background: 'var(--input-bg)',
                  border: 'var(--input-border)',
                  borderRadius: theme.inputs.radius,
                  color: 'var(--input-text)',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.boxShadow = glowEffect
                  e.currentTarget.style.border = `1px solid var(--color-glacier-500)`
                }}
                onBlur={(e) => {
                  e.currentTarget.style.boxShadow = 'none'
                  e.currentTarget.style.border = 'var(--input-border)'
                }}
              >
                <option value="">Select a subcategory (optional)</option>
                {availableSubcategories.map((subcat) => (
                  <option key={subcat} value={subcat}>
                    {subcat}
                  </option>
                ))}
              </select>
              {formErrors.subcategory && (
                <p className="mt-1 text-xs" style={{ color: theme.colors.danger }}>
                  {formErrors.subcategory}
                </p>
              )}
            </div>
          </div>

          {/* Deadline */}
          <div>
            <label
              htmlFor="deadline"
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Deadline <span style={{ color: theme.colors.danger }}>*</span>
              </label>
              <input
                id="deadline"
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                disabled={isSubmitting}
                className="w-full px-4 py-3 text-sm transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none"
                style={{
                  background: 'var(--input-bg)',
                  border: 'var(--input-border)',
                  borderRadius: theme.inputs.radius,
                  color: 'var(--input-text)',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.boxShadow = glowEffect
                  e.currentTarget.style.border = `1px solid var(--color-glacier-500)`
                }}
                onBlur={(e) => {
                  e.currentTarget.style.boxShadow = 'none'
                  e.currentTarget.style.border = 'var(--input-border)'
                }}
              />
              {formErrors.deadline && (
                <p className="mt-1 text-xs" style={{ color: theme.colors.danger }}>
                  {formErrors.deadline}
                </p>
              )}
          </div>

          {/* Prize */}
          <div>
            <label
              htmlFor="prize"
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Prize <span style={{ color: theme.colors.danger }}>*</span>
            </label>
            <input
              id="prize"
              type="text"
              value={prize}
              onChange={(e) => setPrize(e.target.value)}
              disabled={isSubmitting}
              className="w-full px-4 py-3 text-sm transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none"
              style={{
                background: 'var(--input-bg)',
                border: 'var(--input-border)',
                borderRadius: theme.inputs.radius,
                color: 'var(--input-text)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.boxShadow = glowEffect
                e.currentTarget.style.border = `1px solid var(--color-glacier-500)`
              }}
              onBlur={(e) => {
                e.currentTarget.style.boxShadow = 'none'
                e.currentTarget.style.border = 'var(--input-border)'
              }}
              placeholder="e.g., $10,000 cash prize, Trophy + Certificate, etc."
            />
            {formErrors.prize && (
              <p className="mt-1 text-xs" style={{ color: theme.colors.danger }}>
                {formErrors.prize}
              </p>
            )}
          </div>

          {/* Tags */}
          <div>
            <label
              htmlFor="tags"
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Tags
            </label>
            <div className="flex gap-2 mb-2">
              <input
                id="tags"
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddTag()
                  }
                }}
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 text-sm transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none"
                style={{
                  background: 'var(--input-bg)',
                  border: 'var(--input-border)',
                  borderRadius: theme.inputs.radius,
                  color: 'var(--input-text)',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.boxShadow = glowEffect
                  e.currentTarget.style.border = `1px solid var(--color-glacier-500)`
                }}
                onBlur={(e) => {
                  e.currentTarget.style.boxShadow = 'none'
                  e.currentTarget.style.border = 'var(--input-border)'
                }}
                placeholder="Add a tag and press Enter"
              />
              <button
                type="button"
                onClick={handleAddTag}
                disabled={isSubmitting || !tagInput.trim()}
                className="px-6 py-3 text-sm font-medium transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed hover:scale-105"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid var(--glass-border)',
                  color: 'var(--color-text-primary)',
                  borderRadius: theme.radius.lg,
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitting && tagInput.trim()) {
                    e.currentTarget.style.boxShadow = glowEffect
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                Add
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-2 px-3 py-1 text-xs font-medium rounded-full"
                    style={{
                      background: 'var(--color-frost-100)',
                      color: 'var(--color-glacier-500)',
                      border: `1px solid var(--color-frost-300)`,
                    }}
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      disabled={isSubmitting}
                      className="hover:opacity-70 transition-opacity"
                      style={{ color: 'var(--color-glacier-500)' }}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Images and Videos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Competition Images
              </label>
              <p
                className="text-xs mb-3"
                style={{ color: 'var(--color-text-muted)' }}
              >
                Upload high-quality images. The first image becomes the cover.
              </p>
              <MediaDropzone
                accept="image/*"
                disabled={isUploadingImages || isSubmitting}
                loading={isUploadingImages}
                onFilesSelected={handleImagesSelected}
                label="Drop images here or click to browse"
              />
              {formErrors.images && (
                <p className="mt-1 text-xs" style={{ color: theme.colors.danger }}>
                  {formErrors.images}
                </p>
              )}

              {imageUploads.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {imageUploads.map((img, index) => (
                    <div
                      key={img.id}
                      className="relative group rounded-xl overflow-hidden"
                      style={{
                        border: '1px solid var(--glass-border)',
                        background: 'var(--glass-bg)',
                        borderRadius: theme.radius.lg,
                      }}
                    >
                      <div className="relative h-24 w-full">
                        <Image
                          src={img.url}
                          alt={img.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeImage(img.id)}
                        disabled={isSubmitting}
                        className="absolute top-1.5 right-1.5 inline-flex items-center justify-center h-6 w-6 rounded-full text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                        style={{
                          background: 'rgba(0, 0, 0, 0.6)',
                        }}
                      >
                        ✕
                      </button>
                      {index === 0 && (
                        <span
                          className="absolute bottom-1.5 left-1.5 rounded-full text-[10px] px-2 py-0.5 shadow"
                          style={{
                            background: 'var(--color-glacier-500)',
                            color: '#ffffff',
                          }}
                        >
                          Cover
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Competition Videos (Optional)
              </label>
              <p
                className="text-xs mb-3"
                style={{ color: 'var(--color-text-muted)' }}
              >
                Add promotional videos or highlights. MP4 recommended.
              </p>
              <MediaDropzone
                accept="video/*"
                disabled={isUploadingVideos || isSubmitting}
                loading={isUploadingVideos}
                onFilesSelected={handleVideosSelected}
                label="Drop videos here or click to browse"
              />

              {videoUploads.length > 0 && (
                <div className="mt-4 space-y-2">
                  {videoUploads.map((vid) => (
                    <div
                      key={vid.id}
                      className="flex items-center justify-between rounded-lg px-3 py-2 text-xs"
                      style={{
                        border: '1px solid var(--glass-border)',
                        background: 'var(--glass-bg)',
                        color: 'var(--color-text-primary)',
                        borderRadius: theme.radius.md,
                      }}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-lg">🎥</span>
                        <span className="truncate">{vid.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeVideo(vid.id)}
                        disabled={isSubmitting}
                        className="text-[11px] font-medium transition-opacity hover:opacity-70 disabled:opacity-50"
                        style={{ color: theme.colors.danger }}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Status */}
          <div>
            <label
              htmlFor="status"
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Status
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="draft"
                  checked={status === 'draft'}
                  onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
                  disabled={isSubmitting}
                  className="w-4 h-4"
                  style={{ accentColor: 'var(--color-glacier-500)' }}
                />
                <span style={{ color: 'var(--color-text-primary)' }}>Draft</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="published"
                  checked={status === 'published'}
                  onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
                  disabled={isSubmitting}
                  className="w-4 h-4"
                  style={{ accentColor: 'var(--color-glacier-500)' }}
                />
                <span style={{ color: 'var(--color-text-primary)' }}>Published</span>
              </label>
            </div>
            <p className="mt-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
              {status === 'draft' 
                ? 'Competition will be saved as draft and not visible to users'
                : 'Competition will be published and visible to all users'}
            </p>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 text-sm font-semibold transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed hover:scale-[1.02]"
              style={{
                background: 'var(--color-glacier-500)',
                color: '#ffffff',
                borderRadius: theme.buttons.primary.radius,
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.boxShadow = glowEffect
                  e.currentTarget.style.background = 'var(--color-glacier-600)'
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none'
                e.currentTarget.style.background = 'var(--color-glacier-500)'
              }}
            >
              {isSubmitting ? 'Creating... ❄️' : 'Create Competition ❄️'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              disabled={isSubmitting}
              className="px-6 py-3 text-sm font-medium transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed hover:scale-105"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid var(--glass-border)',
                color: 'var(--color-text-primary)',
                borderRadius: theme.radius.lg,
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

