'use client'

import { useTheme } from 'next-themes'
import { theme } from '../../../theme'

type MediaDropzoneProps = {
  accept: string
  disabled?: boolean
  loading?: boolean
  label: string
  onFilesSelected: (files: FileList | null) => void
}

export function MediaDropzone({
  accept,
  disabled,
  loading,
  label,
  onFilesSelected,
}: MediaDropzoneProps) {
  const { theme: currentTheme } = useTheme()
  const inputId = `dropzone-${accept}-${Math.random().toString(36).slice(2)}`
  const glowEffect = currentTheme === 'dark' ? theme.glow.strong : '0 0 10px rgba(54, 158, 255, 0.15)'

  return (
    <div>
      <label
        htmlFor={inputId}
        className={`group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-8 text-center text-sm transition-all duration-300 cursor-pointer ${
          disabled
            ? 'opacity-60 cursor-not-allowed'
            : 'hover:scale-[1.02]'
        }`}
        style={{
          background: disabled 
            ? 'var(--input-bg)' 
            : 'var(--glass-bg)',
          borderColor: disabled 
            ? 'var(--input-border)' 
            : 'var(--glass-border)',
          borderRadius: theme.radius.lg,
        }}
        onMouseEnter={(e) => {
          if (!disabled) {
            e.currentTarget.style.boxShadow = glowEffect
            e.currentTarget.style.borderColor = 'var(--color-glacier-500)'
          }
        }}
        onMouseLeave={(e) => {
          if (!disabled) {
            e.currentTarget.style.boxShadow = 'none'
            e.currentTarget.style.borderColor = 'var(--glass-border)'
          }
        }}
      >
        <input
          id={inputId}
          type="file"
          accept={accept}
          multiple
          disabled={disabled}
          className="hidden"
          onChange={(e) => onFilesSelected(e.target.files)}
        />
        <div className="mb-2 text-3xl">❄️</div>
        <p 
          className="font-medium"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {label}
        </p>
        <p 
          className="mt-1 text-xs"
          style={{ color: 'var(--color-text-muted)' }}
        >
          {loading ? 'Uploading… Please wait.' : 'You can select multiple files at once.'}
        </p>
      </label>
    </div>
  )
}

