"use client"

import React from 'react'
import { cn } from '@/lib/utils'

interface BrandMarkProps {
  size?: number // px
  className?: string
}

export default function BrandMark({ size = 32, className }: BrandMarkProps) {
  const s = size
  return (
    <div
      className={cn(
        'inline-flex items-center justify-center rounded-lg',
        className
      )}
      style={{ width: s, height: s, background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)' }}
      aria-label="unitracker brand mark"
    >
      <span className="text-white font-bold" style={{ fontSize: s * 0.6, lineHeight: 1 }}>u</span>
    </div>
  )
}