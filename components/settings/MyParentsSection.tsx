"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  UsersIcon,
  SearchIcon,
  XIcon,
  CheckIcon
} from '@/public/icons'
import { 
  getLinkedParents, 
  unlinkParent, 
  searchParentByEmail,
  linkParent,
  LinkedParent,
  ParentSearchResult 
} from '@/lib/services/studentService'

export default function MyParentsSection() {
  const [parents, setParents] = useState<LinkedParent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchEmail, setSearchEmail] = useState('')
  const [searchResult, setSearchResult] = useState<ParentSearchResult | null>(null)
  const [searching, setSearching] = useState(false)
  const [linking, setLinking] = useState<string | null>(null)
  const [unlinking, setUnlinking] = useState<string | null>(null)

  useEffect(() => {
    loadLinkedParents()
  }, [])

  const loadLinkedParents = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await getLinkedParents()
      
      if (result.error) {
        setError(result.error)
      } else if (result.parents) {
        setParents(result.parents)
      }
    } catch (e) {
      console.error('Error loading linked parents:', e)
      setError('Failed to load linked parents')
    } finally {
      setLoading(false)
    }
  }

  const handleSearchParent = async () => {
    if (!searchEmail.trim()) {
      setError('Please enter an email address')
      return
    }

    try {
      setSearching(true)
      setError(null)
      setSearchResult(null)
      
      const result = await searchParentByEmail(searchEmail.trim())
      
      if (result.error) {
        setError(result.error)
      } else if (result.parent) {
        setSearchResult(result.parent)
      }
    } catch (e) {
      console.error('Error searching for parent:', e)
      setError('Failed to search for parent')
    } finally {
      setSearching(false)
    }
  }

  const handleLinkParent = async (parentId: string) => {
    try {
      setLinking(parentId)
      const result = await linkParent(parentId)
      
      if (result.error) {
        setError(result.error)
      } else if (result.success) {
        // Reload parents list
        await loadLinkedParents()
        // Clear search
        setSearchEmail('')
        setSearchResult(null)
        alert('Parent linked successfully!')
      }
    } catch (e) {
      console.error('Error linking parent:', e)
      setError('Failed to link parent')
    } finally {
      setLinking(null)
    }
  }

  const handleUnlinkParent = async (parentId: string, parentName: string) => {
    if (!confirm(`Are you sure you want to unlink ${parentName}? They will no longer be able to view your application progress.`)) {
      return
    }

    try {
      setUnlinking(parentId)
      const result = await unlinkParent(parentId)
      
      if (result.error) {
        setError(result.error)
      } else if (result.success) {
        // Remove from local state
        setParents(prev => prev.filter(p => p.user_id !== parentId))
        alert('Parent unlinked successfully!')
      }
    } catch (e) {
      console.error('Error unlinking parent:', e)
      setError('Failed to unlink parent')
    } finally {
      setUnlinking(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-500 dark:text-gray-400">Loading parents...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Linked Parents Section */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          My Parents ({parents.length})
        </h3>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {parents.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <UsersIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-2">No parents linked yet</p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Search for a parent by email below to link their account
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {parents.map((parent) => (
              <div
                key={parent.user_id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {parent.first_name.charAt(0)}{parent.last_name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {parent.first_name} {parent.last_name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {parent.email}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => handleUnlinkParent(parent.user_id, `${parent.first_name} ${parent.last_name}`)}
                  disabled={unlinking === parent.user_id}
                  variant="outline"
                  size="sm"
                  className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20"
                >
                  {unlinking === parent.user_id ? (
                    'Unlinking...'
                  ) : (
                    <>
                      <XIcon className="w-4 h-4 mr-1" />
                      Unlink
                    </>
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Link New Parent Section */}
      <div className="border-t border-gray-200 dark:border-gray-600 pt-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Link New Parent
        </h3>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
          <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
            How it works
          </h4>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Search for a parent by their email address. If they have a parent account, you can link them to view your application progress.
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                label="Parent Email"
                type="email"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                placeholder="Enter parent's email address"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSearchParent()
                  }
                }}
              />
            </div>
            <Button
              onClick={handleSearchParent}
              disabled={searching || !searchEmail.trim()}
              className="flex-shrink-0"
            >
              {searching ? (
                'Searching...'
              ) : (
                <>
                  <SearchIcon className="w-4 h-4 mr-2" />
                  Search
                </>
              )}
            </Button>
          </div>
          
          {searchResult && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {searchResult.first_name.charAt(0)}{searchResult.last_name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {searchResult.first_name} {searchResult.last_name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {searchResult.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {searchResult.is_linked ? (
                    <span className="text-sm text-green-600 dark:text-green-400 flex items-center">
                      <CheckIcon className="w-4 h-4 mr-1" />
                      Already Linked
                    </span>
                  ) : (
                    <Button
                      onClick={() => handleLinkParent(searchResult.user_id)}
                      disabled={linking === searchResult.user_id}
                      size="sm"
                    >
                      {linking === searchResult.user_id ? (
                        'Linking...'
                      ) : (
                        'Link Parent'
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
