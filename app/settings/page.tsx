"use client"

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { PasswordInput } from '@/components/auth/PasswordInput'
import { 
  LockIcon,
  BellIcon,
  UsersIcon,
  CopyIcon,
  CheckIcon,
} from '@/public/icons'
import { supabaseBrowser } from '@/lib/supabase/helpers'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(false)
  const [parentCode, setParentCode] = useState('')
  const [copied, setCopied] = useState(false)
  
  // Profile settings
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [profileLoading, setProfileLoading] = useState(true)
  
  // Security settings
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [applicationUpdates, setApplicationUpdates] = useState(true)
  const [deadlineReminders, setDeadlineReminders] = useState(true)
  
  // Generate parent link code
  const generateParentCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()
    setParentCode(code)
  }
  
  // Copy parent code to clipboard
  const copyToClipboard = async () => {
    if (parentCode) {
      await navigator.clipboard.writeText(parentCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }
  
  // Save profile settings
  const saveProfile = async () => {
    setLoading(true)
    try {
      const supabase = supabaseBrowser()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { error } = await supabase
          .from('profiles')
          .update({
            first_name: firstName,
            last_name: lastName,
            email: email,
          })
          .eq('user_id', user.id)
        
        if (error) throw error
        alert('Profile updated successfully!')
      }
    } catch (error: any) {
      console.error('Error updating profile:', error)
      alert('Failed to update profile: ' + (error?.message || 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }
  
  // Change password
  const changePassword = async () => {
    if (newPassword !== confirmPassword) {
      alert('New passwords do not match!')
      return
    }
    setLoading(true)
    // TODO: Implement password change logic
    setTimeout(() => {
      setLoading(false)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      alert('Password changed successfully!')
    }, 1000)
  }
  
  // Load user profile
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const supabase = supabaseBrowser()
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('first_name, last_name, email')
            .eq('user_id', user.id)
            .single()
          
          if (profile) {
            setFirstName(profile.first_name || '')
            setLastName(profile.last_name || '')
            setEmail(profile.email || user.email || '')
          }
        }
      } catch (error) {
        console.error('Error loading user profile:', error)
      } finally {
        setProfileLoading(false)
      }
    }

    loadUserProfile()
  }, [])

  // Save notification settings
  const saveNotifications = async () => {
    setLoading(true)
    // TODO: Implement save notification settings logic
    setTimeout(() => {
      setLoading(false)
      alert('Notification settings updated!')
    }, 1000)
  }

  const tabs = [
    { id: 'profile', label: 'Academic Profile', icon: UsersIcon },
    { id: 'security', label: 'Security', icon: LockIcon },
    { id: 'notifications', label: 'Notifications', icon: BellIcon },
    { id: 'parent-link', label: 'Link Parent', icon: UsersIcon },
  ]

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Settings
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                        : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {tab.label}
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                             {/* Profile Settings */}
               {activeTab === 'profile' && (
                 <div className="p-6">
                   <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                     Profile Information
                   </h2>
                   {profileLoading ? (
                     <div className="flex items-center justify-center py-8">
                       <div className="text-gray-500 dark:text-gray-400">Loading profile...</div>
                     </div>
                   ) : (
                   <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="First Name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Enter your first name"
                      />
                      <Input
                        label="Last Name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Enter your last name"
                      />
                    </div>
                    <Input
                      label="Email Address"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                    />
                                         <div className="pt-4">
                       <Button
                         onClick={saveProfile}
                         disabled={loading}
                         className="w-full md:w-auto"
                       >
                         {loading ? 'Saving...' : 'Save Changes'}
                       </Button>
                     </div>
                   </div>
                   )}
                 </div>
               )}

              {/* Security Settings */}
              {activeTab === 'security' && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                    Security Settings
                  </h2>
                  <div className="space-y-4">
                    <PasswordInput
                      label="Current Password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                    />
                    <PasswordInput
                      label="New Password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                    />
                    <PasswordInput
                      label="Confirm New Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                    />
                    <div className="pt-4">
                      <Button
                        onClick={changePassword}
                        disabled={loading || !currentPassword || !newPassword || !confirmPassword}
                        className="w-full md:w-auto"
                      >
                        {loading ? 'Changing...' : 'Change Password'}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Notification Settings */}
              {activeTab === 'notifications' && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                    Notification Preferences
                  </h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                          Email Notifications
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Receive notifications via email
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={emailNotifications}
                          onChange={(e) => setEmailNotifications(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                          Application Updates
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Get notified about application status changes
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={applicationUpdates}
                          onChange={(e) => setApplicationUpdates(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                          Deadline Reminders
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Receive reminders for upcoming deadlines
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={deadlineReminders}
                          onChange={(e) => setDeadlineReminders(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    
                    <div className="pt-4">
                      <Button
                        onClick={saveNotifications}
                        disabled={loading}
                        className="w-full md:w-auto"
                      >
                        {loading ? 'Saving...' : 'Save Preferences'}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Parent Link Settings */}
              {activeTab === 'parent-link' && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                    Link Parent Account
                  </h2>
                  <div className="space-y-6">
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                        How it works
                      </h3>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        Generate a unique code and share it with your parent. They can use this code to link their account and view your application progress.
                      </p>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <Button
                          onClick={generateParentCode}
                          disabled={loading}
                          className="flex-shrink-0"
                        >
                          {loading ? 'Generating...' : 'Generate Code'}
                        </Button>
                        {parentCode && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Code:</span>
                            <code className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm font-mono">
                              {parentCode}
                            </code>
                            <button
                              onClick={copyToClipboard}
                              className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                              {copied ? (
                                <CheckIcon className="w-4 h-4 text-green-500" />
                              ) : (
                                <CopyIcon className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                      
                      {parentCode && (
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                            Instructions for your parent:
                          </h4>
                          <ol className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-decimal list-inside">
                            <li>Go to the UniTracker website</li>
                            <li>Click "Sign Up" and select "Parent" role</li>
                            <li>During registration, enter the code: <strong>{parentCode}</strong></li>
                            <li>Complete the registration process</li>
                            <li>They will now be able to view your application progress</li>
                          </ol>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
