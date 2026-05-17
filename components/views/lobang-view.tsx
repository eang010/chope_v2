'use client'

import { useState, useEffect } from 'react'
import { categories } from '@/lib/mock-data'
import { FeedCard } from '@/components/feed/feed-card'
import { cn } from '@/lib/utils'
import { Compass, Flame, X } from 'lucide-react'
import { differenceInHours } from 'date-fns'
import { getAllListings } from '@/lib/db'
import type { Listing } from '@/lib/db'

interface LobangViewProps {
  userId: string
  urgentOnly?: boolean
  onClearUrgentFilter?: () => void
}

export function LobangView({ userId, urgentOnly = false, onClearUrgentFilter }: LobangViewProps) {
  const [activeCategory, setActiveCategory] = useState('All')
  const [listings, setListings] = useState<Listing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const now = new Date()
  
  useEffect(() => {
    async function loadListings() {
      try {
        const data = await getAllListings()
        setListings(data)
      } catch (error) {
        console.error('Error loading listings:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadListings()
  }, [])
  
  // Only show listings with remaining quantity (not fully choped)
  let availableListings = listings.filter(l => l.quantity_remaining > 0)
  
  // If urgentOnly, filter to items ending within 24 hours
  if (urgentOnly) {
    availableListings = availableListings.filter((l) => {
      if (!l.ends_at) return false
      const hoursRemaining = differenceInHours(new Date(l.ends_at), now)
      return hoursRemaining >= 0 && hoursRemaining <= 24
    }).sort((a, b) => {
      const aTime = a.ends_at ? new Date(a.ends_at).getTime() : 0
      const bTime = b.ends_at ? new Date(b.ends_at).getTime() : 0
      return aTime - bTime
    })
  }
  
  const filteredListings = activeCategory === 'All'
    ? availableListings
    : availableListings.filter((l) => l.category === activeCategory)

  return (
    <div className="space-y-4 pt-4">
      {/* Header */}
      <header className="px-4">
        <div className="flex items-center gap-2 mb-1">
          {urgentOnly ? (
            <Flame className="size-6 text-destructive" />
          ) : (
            <Compass className="size-6 text-primary" />
          )}
          <h1 className="text-2xl font-bold text-foreground">
            {urgentOnly ? 'Hot Lobangs' : 'Lobang'}
          </h1>
        </div>
        <p className="text-muted-foreground text-sm">
          {urgentOnly ? 'Grab them before they\'re gone!' : 'Browse freebies near you'}
        </p>
      </header>

      {/* Urgent filter banner */}
      {urgentOnly && onClearUrgentFilter && (
        <div className="mx-4 bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-destructive">
            <Flame className="size-4" />
            <span className="text-sm font-medium">Showing urgent items only</span>
          </div>
          <button 
            onClick={onClearUrgentFilter}
            className="text-destructive hover:text-destructive/80 p-1"
            aria-label="Clear urgent filter"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto px-4 pb-2 scrollbar-hide">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
              activeCategory === category
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            )}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Feed */}
      <div className="px-4 space-y-4">
        {filteredListings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nothing here leh...</p>
            <p className="text-sm text-muted-foreground mt-1">
              {urgentOnly ? 'No urgent items right now. Check back later!' : 'Try another category?'}
            </p>
          </div>
        ) : (
          filteredListings.map((listing) => (
            <FeedCard key={listing.id} listing={listing} userId={userId} />
          ))
        )}
      </div>
    </div>
  )
}
