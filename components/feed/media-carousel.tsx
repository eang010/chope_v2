'use client'

import { useState, useRef, TouchEvent } from 'react'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface MediaCarouselProps {
  media: { type: 'image' | 'video'; url: string }[]
  alt: string
  className?: string
}

export function MediaCarousel({ media, alt, className }: MediaCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const touchStartX = useRef<number | null>(null)
  const touchEndX = useRef<number | null>(null)
  
  const minSwipeDistance = 50
  
  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? media.length - 1 : prev - 1))
  }
  
  const goToNext = () => {
    setCurrentIndex((prev) => (prev === media.length - 1 ? 0 : prev + 1))
  }
  
  const onTouchStart = (e: TouchEvent) => {
    touchEndX.current = null
    touchStartX.current = e.targetTouches[0].clientX
  }
  
  const onTouchMove = (e: TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX
  }
  
  const onTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return
    
    const distance = touchStartX.current - touchEndX.current
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance
    
    if (isLeftSwipe && media.length > 1) {
      goToNext()
    } else if (isRightSwipe && media.length > 1) {
      goToPrevious()
    }
    
    touchStartX.current = null
    touchEndX.current = null
  }
  
  if (media.length === 0) return null
  
  const currentMedia = media[currentIndex]
  
  return (
    <div 
      className={cn('relative aspect-square bg-muted overflow-hidden', className)}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {currentMedia.type === 'image' ? (
        <img
          src={currentMedia.url}
          alt={`${alt} - Image ${currentIndex + 1}`}
          className="w-full h-full object-cover select-none"
          draggable={false}
        />
      ) : (
        <video
          src={currentMedia.url}
          className="w-full h-full object-cover"
          controls
          playsInline
        />
      )}
      
      {/* Navigation arrows - hidden on mobile, visible on larger screens */}
      {media.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-2 top-1/2 -translate-y-1/2 size-8 rounded-full bg-card/80 backdrop-blur-sm items-center justify-center text-foreground hover:bg-card transition-colors hidden md:flex"
            aria-label="Previous image"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 size-8 rounded-full bg-card/80 backdrop-blur-sm items-center justify-center text-foreground hover:bg-card transition-colors hidden md:flex"
            aria-label="Next image"
          >
            <ChevronRight className="size-5" />
          </button>
        </>
      )}
      
      {/* Dots indicator */}
      {media.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {media.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                'size-1.5 rounded-full transition-all',
                index === currentIndex
                  ? 'bg-primary-foreground w-4'
                  : 'bg-primary-foreground/50 hover:bg-primary-foreground/70'
              )}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
