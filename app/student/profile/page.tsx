"use client"

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { supabaseBrowser } from '@/lib/supabase/helpers'
import AcademicProfileModal from '@/components/modals/AcademicProfileModal'
import { Button } from '@/components/ui/button'
import UploadCard, { UploadItem } from '@/components/shared/UploadCard'

 type Profile = {
  first_name: string | null
  last_name: string | null
  email: string | null
  role: string | null
}

 type StudentProfile = {
  graduation_year: number | null
  gpa: number | null
  sat_score: number | null
  act_score: number | null
  target_countries: string[] | null
  intended_majors: string[] | null
}

export default function StudentProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [openEdit, setOpenEdit] = useState<boolean>(false)

  // documents (multi-file)
  const [essayItems, setEssayItems] = useState<UploadItem[]>([])
  const [transcriptItems, setTranscriptItems] = useState<UploadItem[]>([])
  const [uploading, setUploading] = useState<boolean>(false)

  const sanitize = (name: string) => name.replace(/[^a-zA-Z0-9._-]/g, '_')

  const loadFiles = async (userId: string) => {
    const supabase = supabaseBrowser()
    const prefix = `${userId}/`
    const { data: files } = await supabase.storage.from('student_files').list(prefix)
    const toItem = (objName: string, kind: 'essay' | 'transcript'): UploadItem => {
      const display = objName.replace(new RegExp(`^${kind}-`), '')
      const { data } = supabase.storage.from('student_files').getPublicUrl(prefix + objName)
      return { name: display, url: data.publicUrl, objectName: objName }
    }
    const essay = (files || []).filter(f => f.name.startsWith('essay-')).map(f => toItem(f.name, 'essay'))
    const transcript = (files || []).filter(f => f.name.startsWith('transcript-')).map(f => toItem(f.name, 'transcript'))
    setEssayItems(essay)
    setTranscriptItems(transcript)
  }

  const loadData = async () => {
    try {
      const supabase = supabaseBrowser()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: p } = await supabase
        .from('profiles')
        .select('first_name, last_name, email, role')
        .eq('user_id', user.id)
        .single()

      const { data: sp } = await supabase
        .from('student_profile')
        .select('graduation_year, gpa, sat_score, act_score, target_countries, intended_majors')
        .eq('user_id', user.id)
        .maybeSingle()

      setProfile(p as Profile)
      setStudentProfile(sp as StudentProfile)

      await loadFiles(user.id)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const uploadWithKind = async (files: File[], kind: 'essay' | 'transcript') => {
    setUploading(true)
    try {
      const supabase = supabaseBrowser()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      for (const file of files) {
        const safeOriginal = sanitize(file.name)
        const path = `${user.id}/${kind}-${safeOriginal}`
        const { error } = await supabase.storage.from('student_files').upload(path, file, { upsert: true })
        if (error) throw error
      }
      await loadFiles(user.id)
    } catch (err: any) {
      alert(err?.message ?? 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const deleteObject = async (objectName: string) => {
    try {
      const supabase = supabaseBrowser()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      await supabase.storage.from('student_files').remove([`${user.id}/${objectName}`])
      await loadFiles(user.id)
    } catch (err: any) {
      alert(err?.message ?? 'Delete failed')
    }
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Academic Profile</h1>

        {loading ? (
          <div className="text-gray-600 dark:text-gray-400">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {/* Academic Profile */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">My Academic Details</h2>
                <Button onClick={() => setOpenEdit(true)}>Edit</Button>
              </div>
              {studentProfile ? (
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Graduation Year</span><span className="text-gray-900 dark:text-gray-100">{studentProfile.graduation_year ?? '-'}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">GPA</span><span className="text-gray-900 dark:text-gray-100">{studentProfile.gpa ?? '-'}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">SAT</span><span className="text-gray-900 dark:text-gray-100">{studentProfile.sat_score ?? '-'}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">ACT</span><span className="text-gray-900 dark:text-gray-100">{studentProfile.act_score ?? '-'}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Target Countries</span><span className="text-gray-900 dark:text-gray-100">{studentProfile.target_countries?.join(', ') || '-'}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Intended Majors</span><span className="text-gray-900 dark:text-gray-100">{studentProfile.intended_majors?.join(', ') || '-'}</span></div>
                </div>
              ) : (
                <div className="text-gray-600 dark:text-gray-400 text-sm">No academic profile yet. Click Edit to add yours.</div>
              )}
            </div>

            {/* My Essay */}
            <UploadCard
              title="My Essay"
              accept=".pdf,.doc,.docx,.md,.txt"
              items={essayItems}
              loading={uploading}
              onSelect={(files) => uploadWithKind(files, 'essay')}
              onDelete={deleteObject}
            />

            {/* My Transcript */}
            <UploadCard
              title="My Transcript"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              items={transcriptItems}
              loading={uploading}
              onSelect={(files) => uploadWithKind(files, 'transcript')}
              onDelete={deleteObject}
            />
          </div>
        )}
      </div>
      <AcademicProfileModal
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        onSaved={() => {
          setOpenEdit(false)
          loadData()
        }}
      />
    </DashboardLayout>
  )
}
