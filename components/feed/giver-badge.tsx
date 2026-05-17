'use client'

import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { cn } from '@/lib/utils'
import { Mail, Building2, Layers } from 'lucide-react'

interface GiverBadgeProps {
  name: string
  avatar?: string
  avatarSeed?: string
  email?: string
  agency?: string
  officeFloor?: string
  className?: string
}

export function GiverBadge({ 
  name, 
  avatar, 
  avatarSeed,
  email, 
  agency, 
  officeFloor,
  className 
}: GiverBadgeProps) {
  const [showProfile, setShowProfile] = useState(false)
  
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const avatarUrl = avatar || (avatarSeed ? `https://api.dicebear.com/9.x/thumbs/svg?seed=${avatarSeed}` : '')
  
  return (
    <>
      <button
        onClick={() => setShowProfile(true)}
        className={cn(
          'inline-flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-card/80 backdrop-blur-sm border border-card hover:bg-card/90 hover:border-primary/50 transition-all',
          className
        )}
      >
        <Avatar className="size-7 border-1.5 border-card">
          <AvatarImage src={avatarUrl} alt={name} />
          <AvatarFallback className="text-xs bg-secondary text-secondary-foreground">
            {initials}
          </AvatarFallback>
        </Avatar>
        <span className="text-xs font-medium text-card-foreground">
          {name}
        </span>
      </button>

      {/* Giver Profile Drawer */}
      <Drawer open={showProfile} onOpenChange={setShowProfile}>
        <DrawerContent className="bg-card">
          <DrawerHeader className="text-center pb-2">
            <div className="flex flex-col items-center gap-3">
              <Avatar className="size-16 border-2 border-primary">
                <AvatarImage src={avatarUrl} alt={name} />
                <AvatarFallback className="bg-secondary text-secondary-foreground text-lg">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <DrawerTitle className="text-lg">{name}</DrawerTitle>
            </div>
          </DrawerHeader>
          <div className="px-4 pb-4 space-y-3">
            {email && (
              <div className="flex items-center gap-3 p-3 bg-muted rounded-xl">
                <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Mail className="size-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm font-medium text-foreground">{email}</p>
                </div>
              </div>
            )}
            {agency && (
              <div className="flex items-center gap-3 p-3 bg-muted rounded-xl">
                <div className="size-10 rounded-full bg-secondary flex items-center justify-center">
                  <Building2 className="size-5 text-secondary-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Agency</p>
                  <p className="text-sm font-medium text-foreground">{agency}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3 p-3 bg-muted rounded-xl">
              <div className="size-10 rounded-full bg-success/20 flex items-center justify-center">
                <Layers className="size-5 text-success" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Office Floor</p>
                {officeFloor ? (
                  <p className="text-sm font-medium text-foreground">{officeFloor}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">-</p>
                )}
              </div>
            </div>
          </div>
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="ghost" className="w-full h-11 rounded-xl">
                Close
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  )
}
