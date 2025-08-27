"use client"

import React, { useRef } from 'react'
import { Button } from '@/components/ui/Button'

export type UploadItem = { name: string; url?: string; objectName?: string }

type UploadCardProps = {
  title: string
  accept?: string
  items?: UploadItem[]
  loading?: boolean
  onSelect: (files: File[]) => void
  onDelete?: (objectName: string) => void
  className?: string
}

export default function UploadCard({ title, accept, items, loading, onSelect, onDelete, className }: UploadCardProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)

  const handleClick = () => inputRef.current?.click()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length) onSelect(files)
    e.currentTarget.value = ''
  }

  return (
    <div className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 ${className || ''}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        <div className="flex items-center gap-3">
          <input ref={inputRef} type="file" accept={accept} onChange={handleChange} className="hidden" multiple />
          <Button onClick={handleClick} disabled={!!loading} className="py-1 px-3 text-sm">{loading ? 'Uploading...' : 'Choose file'}</Button>
        </div>
      </div>
      {(!items || items.length === 0) ? (
        <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">No files uploaded</div>
      ) : (
        <ul className="mt-1 space-y-1">
          {items.map((it, idx) => (
            <li key={`${it.name}-${idx}`} className="text-sm text-gray-700 dark:text-gray-300 flex items-center justify-between">
              {it.url ? (
                <a href={it.url} target="_blank" className="underline hover:opacity-80 truncate max-w-[70%]">{it.name}</a>
              ) : (
                <span className="truncate max-w-[70%]">{it.name}</span>
              )}
              {onDelete && it.objectName && (
                <button
                  onClick={() => onDelete(it.objectName!)}
                  className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                  Delete
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}