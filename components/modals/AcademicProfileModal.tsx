"use client"

import React, { useEffect, useState } from 'react'
import { supabaseBrowser } from '@/lib/supabase/helpers'
import { Button } from '@/components/ui/Button'

type Props = {
  open: boolean
  onClose: () => void
  onSaved?: () => void
}

export default function AcademicProfileModal({ open, onClose, onSaved }: Props) {
  const [graduationYear, setGraduationYear] = useState<string>('')
  const [gpa, setGpa] = useState<string>('')
  const [sat, setSat] = useState<string>('')
  const [act, setAct] = useState<string>('')
  const [targetCountries, setTargetCountries] = useState<string>('')
  const [intendedMajors, setIntendedMajors] = useState<string>('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    ;(async () => {
      try {
        const supabase = supabaseBrowser()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        const { data } = await supabase
          .from('student_profile')
          .select('graduation_year, gpa, sat_score, act_score, target_countries, intended_majors')
          .eq('user_id', user.id)
          .maybeSingle()
        if (data) {
          setGraduationYear(data.graduation_year?.toString() ?? '')
          setGpa(data.gpa?.toString() ?? '')
          setSat(data.sat_score?.toString() ?? '')
          setAct(data.act_score?.toString() ?? '')
          setTargetCountries(Array.isArray(data.target_countries) ? data.target_countries.join(', ') : '')
          setIntendedMajors(Array.isArray(data.intended_majors) ? data.intended_majors.join(', ') : '')
        }
      } catch (e) {
        // no-op
      }
    })()
  }, [open])

  const save = async () => {
    if (loading) return
    setLoading(true)
    try {
      const supabase = supabaseBrowser()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const payload = {
        user_id: user.id,
        graduation_year: graduationYear ? Number(graduationYear) : null,
        gpa: gpa ? Number(gpa) : null,
        sat_score: sat ? Number(sat) : null,
        act_score: act ? Number(act) : null,
        target_countries: targetCountries
          ? targetCountries.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
        intended_majors: intendedMajors
          ? intendedMajors.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
      }

      const { error } = await supabase
        .from('student_profile')
        .upsert(payload, { onConflict: 'user_id' })
      if (error) throw error
      onSaved?.()
      onClose()
    } catch (e: any) {
      alert(e?.message ?? 'Failed to save profile')
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 w-full max-w-2xl rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Academic Profile</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">✕</button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Graduation Year</label>
              <input
                type="number"
                value={graduationYear}
                onChange={(e) => setGraduationYear(e.target.value)}
                placeholder="e.g., 2026"
                className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">GPA</label>
              <input
                type="number"
                step="0.01"
                value={gpa}
                onChange={(e) => setGpa(e.target.value)}
                placeholder="e.g., 3.85"
                className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">SAT Score</label>
              <input
                type="number"
                value={sat}
                onChange={(e) => setSat(e.target.value)}
                placeholder="e.g., 1540"
                className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">ACT Score</label>
              <input
                type="number"
                value={act}
                onChange={(e) => setAct(e.target.value)}
                placeholder="e.g., 34"
                className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Target Countries</label>
              <input
                type="text"
                value={targetCountries}
                onChange={(e) => setTargetCountries(e.target.value)}
                placeholder="Comma separated, e.g., USA, UK, Canada"
                className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Intended Majors</label>
              <input
                type="text"
                value={intendedMajors}
                onChange={(e) => setIntendedMajors(e.target.value)}
                placeholder="Comma separated, e.g., CS, Math, Economics"
                className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
              />
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-3">
          <Button variant="outline" onClick={onClose} className="min-w-[96px]">Skip</Button>
          <Button onClick={save} disabled={loading} className="min-w-[96px]">{loading ? 'Saving...' : 'Save'}</Button>
        </div>
      </div>
    </div>
  )
}