'use client'

import { useState, useEffect } from 'react'
import { AppShell } from '@/components/layout/app-shell'
import { HomeView } from '@/components/views/home-view'
import { LobangView } from '@/components/views/lobang-view'
import { GiveAwayView } from '@/components/views/give-away-view'
import { MyStuffView } from '@/components/views/my-stuff-view'
import { LoginView } from '@/components/views/login-view'
import { NavItem } from '@/lib/types'

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeNav, setActiveNav] = useState<NavItem>('home')
  const [urgentOnly, setUrgentOnly] = useState(false)

  // Check for existing session on mount
  useEffect(() => {
    const storedUserId = sessionStorage.getItem('userId')
    if (storedUserId) {
      setUserId(storedUserId)
      setIsLoggedIn(true)
    }
    setIsLoading(false)
  }, [])

  const handleLogin = (id: string) => {
    sessionStorage.setItem('userId', id)
    setUserId(id)
    setIsLoggedIn(true)
  }

  const handleNavigate = (item: NavItem, options?: { urgentOnly?: boolean }) => {
    setActiveNav(item)
    setUrgentOnly(options?.urgentOnly ?? false)
  }

  const handleLogout = () => {
    sessionStorage.removeItem('userId')
    setUserId(null)
    setIsLoggedIn(false)
    setActiveNav('home')
  }

  const handleClearUrgentFilter = () => {
    setUrgentOnly(false)
  }

  // Show nothing while checking session
  if (isLoading) {
    return (
      <div className="min-h-dvh bg-background flex items-center justify-center">
        <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Show login if not authenticated
  if (!isLoggedIn) {
    return <LoginView onLogin={handleLogin} />
  }

  return (
    <AppShell activeNav={activeNav} onNavigate={(nav) => handleNavigate(nav)}>
      {activeNav === 'home' && userId && (
        <HomeView userId={userId} onNavigate={(nav, options) => handleNavigate(nav as NavItem, options)} onLogout={handleLogout} />
      )}
      {activeNav === 'lobang' && userId && (
        <LobangView 
          userId={userId}
          urgentOnly={urgentOnly} 
          onClearUrgentFilter={handleClearUrgentFilter} 
        />
      )}
      {activeNav === 'give-away' && userId && (
        <GiveAwayView userId={userId} onNavigate={(nav) => handleNavigate(nav as NavItem)} />
      )}
      {activeNav === 'my-stuff' && userId && <MyStuffView userId={userId} />}
    </AppShell>
  )
}
