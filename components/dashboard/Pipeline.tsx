"use client"

import React, { useMemo, useState } from 'react'
import { cn } from '@/lib/utils'

export type PipelineStageId = string

export type PipelineCard = {
  id: string
  title: string
  subtitle?: string
  stageId: PipelineStageId
}

export type PipelineStage = {
  id: PipelineStageId
  name: string
}

type Props = {
  stages: PipelineStage[]
  cards: PipelineCard[]
  className?: string
  onChange?: (cards: PipelineCard[]) => void
}

export default function Pipeline({ stages, cards, className, onChange }: Props) {
  const [internalCards, setInternalCards] = useState<PipelineCard[]>(cards)
  const stageIdToCards = useMemo(() => {
    const map: Record<string, PipelineCard[]> = {}
    for (const s of stages) map[s.id] = []
    for (const c of internalCards) {
      if (!map[c.stageId]) map[c.stageId] = []
      map[c.stageId].push(c)
    }
    return map
  }, [internalCards, stages])

  // Drag state
  const [draggingCard, setDraggingCard] = useState<PipelineCard | null>(null)

  const handleDrop = (stageId: PipelineStageId) => {
    if (!draggingCard) return
    const next = internalCards.map(c => c.id === draggingCard.id ? { ...c, stageId } : c)
    setInternalCards(next)
    onChange?.(next)
    setDraggingCard(null)
  }

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", className)}>
      {stages.map((stage) => (
        <div key={stage.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{stage.name}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{stageIdToCards[stage.id]?.length ?? 0}</div>
          </div>

          <div
            className="flex-1 p-3 space-y-2 min-h-[140px]"
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(stage.id)}
          >
            {(stageIdToCards[stage.id] || []).map((card) => (
              <div
                key={card.id}
                draggable
                onDragStart={() => setDraggingCard(card)}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md p-3 cursor-grab active:cursor-grabbing shadow-sm"
              >
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{card.title}</div>
                {card.subtitle && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{card.subtitle}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}