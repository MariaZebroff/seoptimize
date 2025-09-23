"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser, signOut, addSite, getUserSites, deleteSite, addPage, getPagesForSite, deletePage, detectPagesFromSite, addMultiplePages, type Page } from "@/lib/supabaseAuth"
import type { User } from "@supabase/supabase-js"

interface Site {
  id: string
  url: string
  title: string | null
  created_at: string
  pages?: Page[]
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
  const [expandedSites, setExpandedSites] = useState<Set<string>>(new Set())
  const [showAddPage, setShowAddPage] = useState<string | null>(null)
  const [newPageUrl, setNewPageUrl] = useState("")
  const [newPageTitle, setNewPageTitle] = useState("")
  const [isAddingPage, setIsAddingPage] = useState(false)
  const [pageUrlError, setPageUrlError] = useState<string | null>(null)
  const [isDetectingPages, setIsDetectingPages] = useState<string | null>(null)
  const router = useRouter()

  const loadSites = useCallback(async () => {
    try {
      const { data, error } = await getUserSites()
      if (error) {
        console.error('Error loading sites:', error)
        if (error.message === 'User not authenticated') {
          router.push('/auth/signin')
        }
      } else {
        // Load pages for each site
        const sitesWithPages = await Promise.all(
          (data || []).map(async (site) => {
            const { data: pages } = await getPagesForSite(site.id)
            return { ...site, pages: pages || [] }
          })
        )
        setSites(sitesWithPages)
      }
    } catch (err) {
      console.error('Error loading sites:', err)
    }
  }, [router])

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
  }, [router, loadSites])

  const handleAddSite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSiteUrl.trim()) return

    setIsAddingSite(true)
    setError("")

    try {
      const { data, error } = await addSite(newSiteUrl.trim(), newSiteTitle.trim() || undefined)
      if (error) {
        if (error.message === 'User not authenticated') {
          router.push('/auth/signin')
        } else {
          setError(error.message)
        }
      } else {
        setSites([data, ...sites])
        setNewSiteUrl("")
        setNewSiteTitle("")
        setShowAddSite(false)
      }
    } catch {
      setError("Failed to add site. Please try again.")
    } finally {
      setIsAddingSite(false)
    }
  }

  const handleDeleteSite = async (siteId: string) => {
    if (!confirm("Are you sure you want to delete this site and all its pages?")) return

    try {
      const { error } = await deleteSite(siteId)
      if (error) {
        console.error('Error deleting site:', error)
        if (error.message === 'User not authenticated') {
          router.push('/auth/signin')
        } else {
          alert('Failed to delete site. Please try again.')
        }
      } else {
        setSites(sites.filter(site => site.id !== siteId))
      }
    } catch (err) {
      console.error('Error deleting site:', err)
      alert('Failed to delete site. Please try again.')
    }
  }

  const toggleSiteExpansion = (siteId: string) => {
    setExpandedSites(prev => {
      const newSet = new Set(prev)
      if (newSet.has(siteId)) {
        newSet.delete(siteId)
      } else {
        newSet.add(siteId)
      }
      return newSet
    })
  }

  const validatePageUrl = (url: string, siteUrl: string) => {
    if (!url.trim()) {
      setPageUrlError(null)
      return true
    }

    try {
      const mainUrl = new URL(siteUrl)
      const subPageUrl = new URL(url.trim())
      
      if (mainUrl.hostname !== subPageUrl.hostname) {
        setPageUrlError(`Must be from the same domain: ${mainUrl.hostname}`)
        return false
      }
      
      setPageUrlError(null)
      return true
    } catch (error) {
      setPageUrlError('Please enter a valid URL')
      return false
    }
  }

  const handleAddPage = async (siteId: string) => {
    if (!newPageUrl.trim()) return

    // Find the site to get its domain for validation
    const site = sites.find(s => s.id === siteId)
    if (!site) {
      alert('Site not found')
      return
    }

    // Validate that the sub-page URL is from the same domain
    try {
      const mainUrl = new URL(site.url)
      const subPageUrl = new URL(newPageUrl.trim())
      
      if (mainUrl.hostname !== subPageUrl.hostname) {
        alert(`Sub-page must be from the same domain as the main page (${mainUrl.hostname}). Please enter a URL from ${mainUrl.hostname}`)
        return
      }
    } catch (error) {
      alert('Please enter a valid URL')
      return
    }

    setIsAddingPage(true)
    try {
      const { data, error } = await addPage(siteId, newPageUrl.trim(), newPageTitle.trim() || undefined)
      if (error) {
        alert('Failed to add page: ' + error.message)
      } else {
        setNewPageUrl("")
        setNewPageTitle("")
        setPageUrlError(null)
        setShowAddPage(null)
        loadSites() // Reload sites to get updated pages
      }
    } catch (err) {
      alert('Failed to add page. Please try again.')
    } finally {
      setIsAddingPage(false)
    }
  }

  const handleDeletePage = async (pageId: string, siteId: string) => {
    if (!confirm('Are you sure you want to delete this page?')) {
      return
    }

    try {
      const { error } = await deletePage(pageId)
      if (error) {
        alert('Failed to delete page: ' + error.message)
      } else {
        loadSites() // Reload sites to get updated pages
      }
    } catch (err) {
      alert('Failed to delete page. Please try again.')
    }
  }

  const handleDetectPages = async (siteId: string, siteUrl: string) => {
    setIsDetectingPages(siteId)
    try {
      const { data, error } = await detectPagesFromSite(siteUrl)
      if (error) {
        alert('Failed to detect pages: ' + error.message)
      } else if (data && data.length > 0) {
        // Use the new addMultiplePages function for better duplicate handling
        const { data: results, error: addError } = await addMultiplePages(siteId, data)
        
        if (addError) {
          alert('Failed to add pages: ' + addError.message)
        } else {
          loadSites() // Reload sites to get updated pages
          
          // Show detailed results
          let message = ''
          if (results.added > 0) {
            message += `Successfully added ${results.added} new pages!`
          }
          if (results.skipped > 0) {
            message += ` ${results.skipped} pages were skipped (already exist).`
          }
          if (results.errors > 0) {
            message += ` ${results.errors} pages failed to add.`
          }
          
          if (results.added === 0 && results.skipped > 0) {
            message = `All ${results.skipped} detected pages already exist in your site.`
          } else if (results.added === 0 && results.skipped === 0) {
            message = 'No pages were added. Please try again or add pages manually.'
          }
          
          alert(message)
        }
      } else {
        alert('No pages detected. The site may not have a sitemap or accessible navigation links. You can manually add pages.')
      }
    } catch (err) {
      console.error('Error detecting pages:', err)
      alert('Failed to detect pages. Please try again or add pages manually.')
    } finally {
      setIsDetectingPages(null)
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
            <div className="flex items-center space-x-6">
              <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
              <button
                onClick={() => router.push("/audit")}
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Page Audit
              </button>
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
              Manage your pages and track their SEO performance.
            </p>
          </div>

          {/* Add Page Section */}
          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Your Pages</h2>
              <button
                onClick={() => setShowAddSite(!showAddSite)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                {showAddSite ? 'Cancel' : 'Add Page'}
              </button>
            </div>

            {showAddSite && (
              <form onSubmit={handleAddSite} className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="siteUrl" className="block text-sm font-medium text-gray-700 mb-1">
                      Page URL *
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
                      placeholder="My Page"
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
                <h3 className="text-lg font-medium text-gray-900 mb-2">No pages added yet</h3>
                <p className="text-gray-500 mb-4">Add your first page to start tracking its SEO performance.</p>
                <button
                  onClick={() => setShowAddSite(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Add Your First Page
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {sites.map((site) => {
                  const isExpanded = expandedSites.has(site.id)
                  const pages = site.pages || []
                  
                  return (
                    <div key={site.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      {/* Site Header */}
                      <div className="p-4 bg-gray-50 border-b border-gray-200">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleSiteExpansion(site.id)}
                              className="text-gray-600 hover:text-gray-800"
                            >
                              <svg 
                                className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                            <h3 className="font-medium text-gray-900 truncate">
                              {site.title || 'Untitled Site'}
                            </h3>
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                              {pages.length} page{pages.length !== 1 ? 's' : ''}
                            </span>
                          </div>
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
                      </div>

                      {/* Site Actions */}
                      <div className="p-4 bg-white border-b border-gray-200">
                        <div className="flex gap-2 flex-wrap">
                          <button
                            onClick={() => router.push(`/audit?url=${encodeURIComponent(site.url)}`)}
                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                          >
                            Run Full Analysis
                          </button>
                          <button
                            onClick={() => handleDetectPages(site.id, site.url)}
                            disabled={isDetectingPages === site.id}
                            className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                          >
                            {isDetectingPages === site.id ? (
                              <>
                                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Crawling Site...
                              </>
                            ) : (
                              'Auto-detect Sub-pages'
                            )}
                          </button>
                          <button
                            onClick={() => setShowAddPage(showAddPage === site.id ? null : site.id)}
                            className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700"
                          >
                            Add Sub-page Manually
                          </button>
                        </div>
                      </div>

                      {/* Add Page Form */}
                      {showAddPage === site.id && (
                        <div className="p-4 bg-blue-50 border-b border-gray-200">
                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Sub-page URL
                              </label>
                              <input
                                type="url"
                                value={newPageUrl}
                                onChange={(e) => {
                                  setNewPageUrl(e.target.value)
                                  validatePageUrl(e.target.value, site.url)
                                }}
                                placeholder={`${site.url}/page-path`}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                                  pageUrlError 
                                    ? 'border-red-300 focus:ring-red-500 bg-red-50' 
                                    : 'border-gray-300 focus:ring-indigo-500'
                                }`}
                              />
                              {pageUrlError ? (
                                <p className="text-xs text-red-600 mt-1">
                                  {pageUrlError}
                                </p>
                              ) : (
                                <p className="text-xs text-gray-500 mt-1">
                                  Must be from the same domain: <span className="font-medium">{new URL(site.url).hostname}</span>
                                </p>
                              )}
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Page Title (Optional)
                              </label>
                              <input
                                type="text"
                                value={newPageTitle}
                                onChange={(e) => setNewPageTitle(e.target.value)}
                                placeholder="Sub-page title"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              />
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleAddPage(site.id)}
                                disabled={isAddingPage || !newPageUrl.trim() || !!pageUrlError}
                                className="px-4 py-2 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
                              >
                                {isAddingPage ? 'Adding...' : 'Add Sub-page'}
                              </button>
                              <button
                                onClick={() => {
                                  setShowAddPage(null)
                                  setNewPageUrl("")
                                  setNewPageTitle("")
                                  setPageUrlError(null)
                                }}
                                className="px-4 py-2 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Sub-pages List */}
                      {isExpanded && (
                        <div className="p-4">
                          {pages.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                              <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <p>No sub-pages added yet</p>
                              <p className="text-sm">Use "Auto-detect Sub-pages" or "Add Sub-page Manually" to get started</p>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {pages.map((page) => (
                                <div key={page.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-medium text-gray-900">
                                        {page.title || page.path}
                                      </span>
                                      {page.is_main_page && (
                                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                          Main
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-xs text-gray-600 truncate">{page.url}</p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => router.push(`/audit?url=${encodeURIComponent(page.url)}`)}
                                      className="px-3 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700"
                                    >
                                      Audit
                                    </button>
                                    <button
                                      onClick={() => handleDeletePage(page.id, site.id)}
                                      className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* User Info Section */}
          <div className="bg-white shadow rounded-lg p-6 mt-8">
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
