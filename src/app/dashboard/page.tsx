"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser, signOut, addSite, getUserSites, deleteSite } from "@/lib/supabaseAuth"
import type { User } from "@supabase/supabase-js"

interface Site {
  id: string
  url: string
  title: string | null
  created_at: string
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [sites, setSites] = useState<Site[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddSite, setShowAddSite] = useState(false)
  const [newSiteUrl, setNewSiteUrl] = useState("")
  const [newSiteTitle, setNewSiteTitle] = useState("")
  const [isAddingSite, setIsAddingSite] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const user = await getCurrentUser()
      if (!user) {
        router.push("/auth/signin")
      } else {
        setUser(user)
        loadSites()
      }
      setLoading(false)
    }
    getUser()
  }, [router])

  const loadSites = async () => {
    try {
      const { data, error } = await getUserSites()
      if (error) {
        console.error('Error loading sites:', error)
      } else {
        setSites(data || [])
      }
    } catch {
      console.error('Error loading sites')
    }
  }

  const handleAddSite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSiteUrl.trim()) return

    setIsAddingSite(true)
    setError("")

    try {
      const { data, error } = await addSite(newSiteUrl.trim(), newSiteTitle.trim() || undefined)
      if (error) {
        setError(error.message)
      } else {
        setSites([data, ...sites])
        setNewSiteUrl("")
        setNewSiteTitle("")
        setShowAddSite(false)
      }
    } catch (error) {
      setError("Failed to add site. Please try again.")
    } finally {
      setIsAddingSite(false)
    }
  }

  const handleDeleteSite = async (siteId: string) => {
    if (!confirm("Are you sure you want to delete this site?")) return

    try {
      const { error } = await deleteSite(siteId)
      if (error) {
        console.error('Error deleting site:', error)
      } else {
        setSites(sites.filter(site => site.id !== siteId))
      }
    } catch {
      console.error('Error deleting site')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {user.user_metadata?.avatar_url && (
                  <img
                    className="h-8 w-8 rounded-full"
                    src={user.user_metadata.avatar_url}
                    alt="Profile"
                  />
                )}
                <span className="text-sm font-medium text-gray-700">
                  {user.user_metadata?.name || user.email}
                </span>
              </div>
              <button
                onClick={() => signOut().then(() => router.push("/"))}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">SEO Dashboard</h1>
            <p className="mt-2 text-gray-600">
              Manage your websites and track their SEO performance.
            </p>
          </div>

          {/* Add Site Section */}
          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Your Sites</h2>
              <button
                onClick={() => setShowAddSite(!showAddSite)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                {showAddSite ? 'Cancel' : 'Add Site'}
              </button>
            </div>

            {showAddSite && (
              <form onSubmit={handleAddSite} className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="siteUrl" className="block text-sm font-medium text-gray-700 mb-1">
                      Website URL *
                    </label>
                    <input
                      type="url"
                      id="siteUrl"
                      value={newSiteUrl}
                      onChange={(e) => setNewSiteUrl(e.target.value)}
                      placeholder="https://example.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="siteTitle" className="block text-sm font-medium text-gray-700 mb-1">
                      Site Title (Optional)
                    </label>
                    <input
                      type="text"
                      id="siteTitle"
                      value={newSiteTitle}
                      onChange={(e) => setNewSiteTitle(e.target.value)}
                      placeholder="My Website"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                {error && (
                  <div className="mt-2 text-red-600 text-sm">{error}</div>
                )}
                <div className="mt-4 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAddSite(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isAddingSite}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {isAddingSite ? 'Adding...' : 'Add Site'}
                  </button>
                </div>
              </form>
            )}

            {/* Sites List */}
            {sites.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No sites added yet</h3>
                <p className="text-gray-500 mb-4">Add your first website to start tracking its SEO performance.</p>
                <button
                  onClick={() => setShowAddSite(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Add Your First Site
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sites.map((site) => (
                  <div key={site.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-gray-900 truncate">
                        {site.title || 'Untitled Site'}
                      </h3>
                      <button
                        onClick={() => handleDeleteSite(site.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 mb-2 truncate">{site.url}</p>
                    <p className="text-xs text-gray-400">
                      Added {new Date(site.created_at).toLocaleDateString()}
                    </p>
                    <div className="mt-3">
                      <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                        Analyze SEO →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* User Info Section */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Name:</span>
                <p className="text-gray-600">{user.user_metadata?.name || "Not provided"}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Email:</span>
                <p className="text-gray-600">{user.email}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Sites:</span>
                <p className="text-gray-600">{sites.length} site{sites.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
