'use client'

import { useState, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import {
  User, Gift, Package, Settings, MapPin, Clock, X,
  ChevronDown, Edit3, Archive, ArchiveRestore, Trash2, MoreHorizontal, Check, Users, Mail, Building2, Layers, ImagePlus
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import {
  getUserById, getChopesByUserId, getGivenCount, getChopedCount,
  updateUserProfile, getListingsByUserId, deleteListing, deleteChope,
  uploadListingImage, updateListing, replaceListingMedia,
} from '@/lib/db'
import type { User as DBUser, Chope as DBChope, Listing as DBListing } from '@/lib/db'

// ----- Constants -----

const avatarSeeds = [
  { value: 'cat', label: 'Cat' },
  { value: 'rabbit', label: 'Rabbit' },
  { value: 'dog', label: 'Dog' },
  { value: 'panda', label: 'Panda' },
  { value: 'koala', label: 'Koala' },
  { value: 'bear', label: 'Bear' },
  { value: 'fox', label: 'Fox' },
  { value: 'owl', label: 'Owl' },
  { value: 'penguin', label: 'Penguin' },
]

const locations = [
  'Level 5, Lobby', 'Level 5, Pantry',
  'Level 6, Lobby', 'Level 6, Pantry',
  'Level 7, Lobby', 'Level 7, Pantry', 'Level 7, Hot Desk Area',
  'Level 8, Lobby', 'Level 8, Reception', 'Level 8, Pantry',
  'Level 9, Lobby', 'Level 9, Hot Desk Area', 'Level 9, Pantry',
  'Level 10, Lobby', 'Level 10, Pantry',
  'Level 11, Lobby', 'Level 11, Near Lift', 'Level 11, Pantry',
  'Level 12, Lobby', 'Level 12, Pantry',
]

// ----- ChopeCard -----

function ChopeCard({ chope, onUnchope }: { chope: DBChope; onUnchope?: (chopeId: string) => void }) {
  const listing = chope.listing
  const media = listing?.media
  const giver = (listing as any)?.giver
  const createdAt = new Date(chope.created_at)
  const [showGiverDrawer, setShowGiverDrawer] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  if (!listing) return null

  const handleUnchope = async () => {
    setIsDeleting(true)
    const success = await deleteChope(chope.id)
    if (success && onUnchope) {
      onUnchope(chope.id)
    }
    setIsDeleting(false)
  }

  return (
    <>
      <div className="bg-card border border-border rounded-xl p-3 flex gap-3 relative">
        <button
          onClick={handleUnchope}
          disabled={isDeleting}
          className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
          title="Unchope"
        >
          <X className="size-4" />
        </button>
        <img
          src={media?.[0]?.url || ''}
          alt={listing.title}
          className="size-20 rounded-lg object-cover flex-shrink-0"
        />
        <div className="flex-1 min-w-0 space-y-1">
          <h4 className="font-medium text-foreground line-clamp-1">{listing.title}</h4>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <MapPin className="size-3 flex-shrink-0" />
            <span className="truncate">{listing.location}</span>
          </div>
          <div className="flex items-center justify-between gap-2 pt-0.5">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="size-3 flex-shrink-0" />
              <span>{formatDistanceToNow(createdAt, { addSuffix: true })}</span>
            </div>
            {giver?.name && (
              <button
                onClick={() => setShowGiverDrawer(true)}
                className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-primary/15 hover:bg-primary/25 text-primary transition-colors"
              >
                <User className="size-3" />
                {giver.name}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Giver detail drawer */}
      {giver && (
        <Drawer open={showGiverDrawer} onOpenChange={setShowGiverDrawer}>
          <DrawerContent className="bg-card">
            <DrawerHeader className="text-center pb-2">
              <div className="flex flex-col items-center gap-3">
                <Avatar className="size-16 border-2 border-primary">
                  <AvatarImage
                    src={giver.avatar_seed
                      ? `https://api.dicebear.com/9.x/thumbs/svg?seed=${giver.avatar_seed}`
                      : ''}
                    alt={giver.name}
                  />
                  <AvatarFallback className="bg-secondary text-secondary-foreground text-lg">
                    {giver.name?.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <DrawerTitle>{giver.name}</DrawerTitle>
              </div>
            </DrawerHeader>
            <div className="px-4 pb-4 space-y-3">
              {giver.email && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted">
                  <div className="size-10 rounded-full bg-[#FBE4E4] flex items-center justify-center">
                    <Mail className="size-5 text-[#D66B6B]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm font-medium text-foreground">{giver.email}</p>
                  </div>
                </div>
              )}
              {giver.agency && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted">
                  <div className="size-10 rounded-full bg-[#FFEFDE] flex items-center justify-center">
                    <Building2 className="size-5 text-[#C47D52]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">Agency</p>
                    <p className="text-sm font-medium text-foreground">{giver.agency}</p>
                  </div>
                </div>
              )}
              {giver.office_floor && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted">
                  <div className="size-10 rounded-full bg-[#E1F2F1] flex items-center justify-center">
                    <Layers className="size-5 text-[#4D9B93]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">Office Floor</p>
                    <p className="text-sm font-medium text-foreground">{giver.office_floor}</p>
                  </div>
                </div>
              )}
            </div>
            <DrawerFooter>
              <DrawerClose asChild>
                <Button variant="ghost" className="w-full h-11 rounded-xl">Close</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      )}
    </>
  )
}

// ----- ListingCard -----

interface DBListingWithChopes extends DBListing {
  chopes?: Array<{
    id: string
    user_id: string
    quantity: number
    created_at: string
    users?: { id: string; name: string; avatar_seed: string }
  }>
}

function ListingCard({
  listing,
  showActions,
  onEdit,
  onArchive,
  onDelete,
}: {
  listing: DBListingWithChopes
  showActions?: boolean
  onEdit?: () => void
  onArchive?: () => void
  onDelete?: () => void
}) {
  const [showActionsMenu, setShowActionsMenu] = useState(false)
  const [showChopers, setShowChopers] = useState(false)

  const chopersCount = listing.chopes?.length || 0
  const hasBeenChoped = chopersCount > 0 || listing.quantity_remaining < listing.quantity
  const canEdit = !listing.is_archived
  const endsAt = listing.ends_at ? new Date(listing.ends_at) : null

  return (
    <div className="bg-card border border-border rounded-xl p-3">
      <div className="flex gap-3">
        <img
          src={listing.media?.[0]?.url || ''}
          alt={listing.title}
          className="size-20 rounded-lg object-cover flex-shrink-0"
        />
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-medium text-foreground line-clamp-1">{listing.title}</h4>
            {showActions && (
              <button
                onClick={() => setShowActionsMenu(true)}
                className="text-muted-foreground hover:text-foreground p-1 -mr-1 flex-shrink-0"
                aria-label="More actions"
              >
                <MoreHorizontal className="size-5" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <MapPin className="size-3 flex-shrink-0" />
            <span className="truncate">{listing.location}</span>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs text-primary font-medium">
              {listing.quantity_remaining} left
            </span>
            {chopersCount > 0 && (
              <button
                onClick={() => setShowChopers(!showChopers)}
                className="flex items-center gap-1 text-xs text-success font-medium hover:underline"
              >
                <Users className="size-3" />
                <span>{chopersCount} {chopersCount === 1 ? 'person' : 'people'}</span>
                <ChevronDown className={cn(
                  'size-3 transition-transform duration-200',
                  showChopers && 'rotate-180'
                )} />
              </button>
            )}
            {endsAt && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="size-3" />
                <span>{formatDistanceToNow(endsAt, { addSuffix: true })}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Expanded chopers list */}
      {showChopers && listing.chopes && listing.chopes.length > 0 && (
        <div className="mt-3 pt-3 border-t border-border space-y-2">
          <p className="text-xs text-muted-foreground font-medium">People who choped:</p>
          <div className="space-y-2">
            {listing.chopes.map((choper) => (
              <div key={choper.id} className="flex items-center gap-2">
                <Avatar className="size-6">
                  <AvatarImage
                    src={choper.users?.avatar_seed
                      ? `https://api.dicebear.com/9.x/thumbs/svg?seed=${choper.users.avatar_seed}`
                      : ''}
                    alt={choper.users?.name || ''}
                  />
                  <AvatarFallback className="text-[10px] bg-secondary">
                    {choper.users?.name?.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-foreground flex-1">{choper.users?.name}</span>
                <span className="text-xs text-muted-foreground">
                  {choper.quantity}x &bull; {formatDistanceToNow(new Date(choper.created_at), { addSuffix: true })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions drawer */}
      <Drawer open={showActionsMenu} onOpenChange={setShowActionsMenu}>
        <DrawerContent className="bg-card">
          <DrawerHeader className="text-left">
            <DrawerTitle>Manage Listing</DrawerTitle>
            <DrawerDescription>{listing.title}</DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-4 space-y-2">
            {canEdit && (
              <Button
                variant="outline"
                className="w-full justify-start h-12 rounded-xl"
                onClick={() => {
                  setShowActionsMenu(false)
                  onEdit?.()
                }}
              >
                <Edit3 className="size-5 mr-3" />
                Edit Listing
              </Button>
            )}
            {!listing.is_archived && (
              <Button
                variant="outline"
                className="w-full justify-start h-12 rounded-xl"
                onClick={() => {
                  setShowActionsMenu(false)
                  onArchive?.()
                }}
              >
                <Archive className="size-5 mr-3" />
                Archive Listing
              </Button>
            )}
            <Button
              variant="outline"
              className="w-full justify-start h-12 rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => {
                setShowActionsMenu(false)
                onDelete?.()
              }}
            >
              <Trash2 className="size-5 mr-3" />
              Delete Listing
            </Button>
          </div>
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="ghost" className="w-full h-11 rounded-xl">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  )
}

// ----- ArchivedListingCard -----

function ArchivedListingCard({
  listing,
  onUnarchive,
  onDelete,
}: {
  listing: DBListingWithChopes
  onUnarchive?: () => void
  onDelete?: () => void
}) {
  const [showActionsMenu, setShowActionsMenu] = useState(false)

  return (
    <div className="bg-muted/50 border border-border rounded-xl p-3">
      <div className="flex gap-3">
        <img
          src={listing.media?.[0]?.url || ''}
          alt={listing.title}
          className="size-16 rounded-lg object-cover grayscale flex-shrink-0"
        />
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-medium text-foreground line-clamp-1 opacity-75">{listing.title}</h4>
            <button
              onClick={() => setShowActionsMenu(true)}
              className="text-muted-foreground hover:text-foreground p-1 -mr-1 flex-shrink-0"
              aria-label="More actions"
            >
              <MoreHorizontal className="size-4" />
            </button>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{listing.quantity} given away</span>
            <span>&bull;</span>
            <span>{formatDistanceToNow(new Date(listing.created_at), { addSuffix: true })}</span>
          </div>
        </div>
      </div>

      <Drawer open={showActionsMenu} onOpenChange={setShowActionsMenu}>
        <DrawerContent className="bg-card">
          <DrawerHeader className="text-left">
            <DrawerTitle>Archived Listing</DrawerTitle>
            <DrawerDescription>{listing.title}</DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-4 space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start h-12 rounded-xl"
              onClick={() => {
                setShowActionsMenu(false)
                onUnarchive?.()
              }}
            >
              <ArchiveRestore className="size-5 mr-3" />
              Unarchive Listing
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start h-12 rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => {
                setShowActionsMenu(false)
                onDelete?.()
              }}
            >
              <Trash2 className="size-5 mr-3" />
              Delete Permanently
            </Button>
          </div>
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="ghost" className="w-full h-11 rounded-xl">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  )
}

// ----- EditListingDrawer -----

type EditImage =
  | { kind: 'existing'; id: string; url: string }
  | { kind: 'new'; file: File; preview: string }

function EditListingDrawer({
  listing,
  open,
  onOpenChange,
  onSave,
}: {
  listing: DBListingWithChopes | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (listing: DBListingWithChopes) => void
}) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [images, setImages] = useState<EditImage[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const chopedCount = listing
    ? listing.quantity - listing.quantity_remaining
    : 0
  const minQuantity = Math.max(chopedCount, 1)

  useEffect(() => {
    if (!listing) return
    setTitle(listing.title)
    setDescription(listing.description || '')
    setLocation(listing.location)
    setQuantity(listing.quantity)
    setImages(
      (listing.media || [])
        .sort((a, b) => a.display_order - b.display_order)
        .map((m) => ({ kind: 'existing' as const, id: m.id, url: m.url }))
    )
  }, [listing])

  useEffect(() => {
    return () => {
      images.forEach((img) => {
        if (img.kind === 'new') URL.revokeObjectURL(img.preview)
      })
    }
  }, [images])

  const removeImage = (index: number) => {
    setImages((prev) => {
      const img = prev[index]
      if (img?.kind === 'new') URL.revokeObjectURL(img.preview)
      return prev.filter((_, i) => i !== index)
    })
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    const newFiles = Array.from(files).slice(0, 5 - images.length)
    const newImages: EditImage[] = newFiles.map((file) => ({
      kind: 'new',
      file,
      preview: URL.createObjectURL(file),
    }))
    setImages((prev) => [...prev, ...newImages])
    e.target.value = ''
  }

  const handleSave = async () => {
    if (!listing) return
    if (!title.trim() || !location || images.length === 0) {
      alert('Please fill in title, location, and at least one photo.')
      return
    }
    if (quantity < minQuantity) {
      alert(`Quantity must be at least ${minQuantity} (${chopedCount} already choped).`)
      return
    }

    setIsSaving(true)
    try {
      const mediaUrls: { type: 'image'; url: string; display_order: number }[] = []

      for (let i = 0; i < images.length; i++) {
        const img = images[i]
        if (img.kind === 'existing') {
          mediaUrls.push({ type: 'image', url: img.url, display_order: i })
        } else {
          const url = await uploadListingImage(img.file)
          if (!url) {
            alert('Failed to upload one or more images. Please try again.')
            setIsSaving(false)
            return
          }
          mediaUrls.push({ type: 'image', url, display_order: i })
        }
      }

      const quantityRemaining = quantity - chopedCount

      const updatedListing = await updateListing(listing.id, {
        title: title.trim(),
        description: description.trim() || null,
        location,
        quantity,
        quantity_remaining: quantityRemaining,
      })

      if (!updatedListing) {
        alert('Failed to update listing. Please try again.')
        setIsSaving(false)
        return
      }

      const newMedia = await replaceListingMedia(listing.id, mediaUrls)
      if (newMedia === null) {
        alert('Failed to update photos. Please try again.')
        setIsSaving(false)
        return
      }

      onSave({
        ...listing,
        ...updatedListing,
        media: newMedia,
      })

      setSaved(true)
      setTimeout(() => {
        setSaved(false)
        onOpenChange(false)
      }, 1000)
    } catch (error) {
      console.error('Error saving listing:', error)
      alert('Error saving listing. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const canSave =
    title.trim() && location && images.length > 0 && quantity >= minQuantity

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="bg-card max-h-[90vh]">
        <DrawerHeader className="text-left">
          <DrawerTitle>Edit Listing</DrawerTitle>
          <DrawerDescription>Make changes to your listing</DrawerDescription>
        </DrawerHeader>
        <div className="px-4 pb-4 space-y-4 overflow-y-auto max-h-[60vh]">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Photos <span className="text-destructive">*</span>
            </label>
            <p className="text-xs text-muted-foreground">
              Up to 5 photos. First photo is the cover.
            </p>
            <div className="flex gap-2 flex-wrap">
              {images.map((img, index) => (
                <div key={index} className="relative size-20 rounded-lg overflow-hidden bg-muted">
                  <img
                    src={img.kind === 'existing' ? img.url : img.preview}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 size-5 rounded-full bg-card/90 flex items-center justify-center"
                  >
                    <X className="size-3" />
                  </button>
                  {index === 0 && (
                    <span className="absolute bottom-0 left-0 right-0 bg-primary/90 text-primary-foreground text-[10px] text-center py-0.5">
                      Cover
                    </span>
                  )}
                </div>
              ))}
              {images.length < 5 && (
                <label className="size-20 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors cursor-pointer">
                  <ImagePlus className="size-6 mb-1" />
                  <span className="text-xs">Add</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Quantity available</label>
            <Input
              type="number"
              min={minQuantity}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(minQuantity, parseInt(e.target.value, 10) || minQuantity))}
              className="h-11 rounded-xl"
            />
            {chopedCount > 0 && (
              <p className="text-xs text-muted-foreground">
                {chopedCount} already choped — minimum quantity is {chopedCount}.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What are you giving away?"
              className="h-11 rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell people more about the item..."
              className="min-h-24 rounded-xl resize-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Collection Location</label>
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger className="h-11 rounded-xl">
                <SelectValue placeholder="Where to collect?" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((loc) => (
                  <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DrawerFooter>
          <Button
            onClick={handleSave}
            disabled={isSaving || saved || !canSave}
            className="w-full h-12 rounded-xl bg-primary text-primary-foreground"
          >
            {saved ? (
              <><Check className="size-5 mr-2" />Saved!</>
            ) : isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
          <DrawerClose asChild>
            <Button variant="ghost" className="w-full h-11 rounded-xl">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}


// ----- ProfileEditDrawer -----

function ProfileEditDrawer({
  user,
  open,
  onOpenChange,
  onSave,
}: {
  user: DBUser | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (user: DBUser) => void
}) {
  const [selectedSeed, setSelectedSeed] = useState('')
  const [officeFloor, setOfficeFloor] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (user) {
      setSelectedSeed(user.avatar_seed || 'cat')
      setOfficeFloor(user.office_floor || '')
    }
  }, [user])

  const handleSave = async () => {
    if (!user) return
    setIsSaving(true)
    try {
      const updated = await updateUserProfile(user.id, {
        avatar_seed: selectedSeed,
        office_floor: officeFloor || null,
      })
      if (updated) {
        onSave(updated)
        setSaved(true)
        setTimeout(() => {
          setSaved(false)
          onOpenChange(false)
        }, 1000)
      }
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="bg-card max-h-[90vh]">
        <DrawerHeader className="text-center pb-4">
          <DrawerTitle className="text-lg">Edit Profile</DrawerTitle>
          <DrawerDescription>Update your profile details</DrawerDescription>
        </DrawerHeader>
        <div className="px-4 pb-4 space-y-3 overflow-y-auto">
          {/* Email - read only */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-muted">
            <div className="size-10 rounded-full bg-[#FBE4E4] flex items-center justify-center">
              <Mail className="size-5 text-[#D66B6B]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="text-sm font-medium text-foreground">{user?.email || '—'}</p>
            </div>
          </div>

          {/* Agency - read only */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-muted">
            <div className="size-10 rounded-full bg-[#FFEFDE] flex items-center justify-center">
              <Building2 className="size-5 text-[#C47D52]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">Agency</p>
              <p className="text-sm font-medium text-foreground">{user?.agency || '—'}</p>
            </div>
          </div>

          {/* Office Floor - optional free text */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-muted">
            <div className="size-10 rounded-full bg-[#E1F2F1] flex items-center justify-center">
              <Layers className="size-5 text-[#4D9B93]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">Office Floor</p>
              <Input
                value={officeFloor}
                onChange={(e) => setOfficeFloor(e.target.value)}
                placeholder="e.g. Level 7, Pantry"
                className="h-auto min-h-0 border-0 bg-transparent px-0 py-0 shadow-none focus-visible:ring-0 text-sm font-medium text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {/* Avatar picker */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">Avatar</label>
            <div className="grid grid-cols-6 gap-1">
              {avatarSeeds.map((seed) => (
                <button
                  key={seed.value}
                  onClick={() => setSelectedSeed(seed.value)}
                  className={cn(
                    'flex items-center justify-center transition-colors rounded-full px-1 py-0.5',
                    selectedSeed === seed.value
                      ? 'outline outline-2 outline-destructive rounded-[999px]'
                      : ''
                  )}
                >
                  <img
                    src={`https://api.dicebear.com/9.x/thumbs/svg?seed=${seed.value}`}
                    alt={seed.value}
                    className="size-10 rounded-full"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
        <DrawerFooter>
          <Button
            onClick={handleSave}
            disabled={isSaving || saved}
            className="w-full h-12 rounded-xl bg-primary text-primary-foreground"
          >
            {saved ? (
              <><Check className="size-5 mr-2" />Saved!</>
            ) : isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
          <DrawerClose asChild>
            <Button variant="ghost" className="w-full h-11 rounded-xl">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

// ----- Main View -----

export function MyStuffView({ userId }: { userId: string }) {
  const [user, setUser] = useState<DBUser | null>(null)
  const [chopes, setChopes] = useState<DBChope[]>([])
  const [givenCount, setGivenCount] = useState(0)
  const [chopedCount, setChopedCount] = useState(0)
  const [activeListings, setActiveListings] = useState<DBListingWithChopes[]>([])
  const [archivedListings, setArchivedListings] = useState<DBListingWithChopes[]>([])
  const [isArchivedOpen, setIsArchivedOpen] = useState(false)

  // Edit drawer state
  const [editingListing, setEditingListing] = useState<DBListingWithChopes | null>(null)
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false)

  // Profile edit drawer state
  const [isProfileEditOpen, setIsProfileEditOpen] = useState(false)

  useEffect(() => {
    async function loadData() {
      try {
        const [userData, chopesData, given, choped, allListings] = await Promise.all([
          getUserById(userId),
          getChopesByUserId(userId),
          getGivenCount(userId),
          getChopedCount(userId),
          getListingsByUserId(userId),
        ])

        setUser(userData)
        setChopes(chopesData)
        setGivenCount(given)
        setChopedCount(choped)

        const active = (allListings as DBListingWithChopes[]).filter(l => !l.is_archived)
        const archived = (allListings as DBListingWithChopes[]).filter(l => l.is_archived)
        setActiveListings(active)
        setArchivedListings(archived)
      } catch (error) {
        console.error('Error loading my stuff data:', error)
      }
    }
    loadData()
  }, [userId])

  const handleEdit = (listing: DBListingWithChopes) => {
    setEditingListing(listing)
    setIsEditDrawerOpen(true)
  }

  const handleSaveEdit = (updated: DBListingWithChopes) => {
    setActiveListings(prev => prev.map(l => l.id === updated.id ? updated : l))
  }

  const handleArchive = (listing: DBListingWithChopes) => {
    setActiveListings(prev => prev.filter(l => l.id !== listing.id))
    setArchivedListings(prev => [{ ...listing, is_archived: true }, ...prev])
  }

  const handleDelete = async (listing: DBListingWithChopes) => {
    const success = await deleteListing(listing.id)
    if (success) {
      setActiveListings(prev => prev.filter(l => l.id !== listing.id))
    }
  }

  const handleDeleteArchived = async (listing: DBListingWithChopes) => {
    const success = await deleteListing(listing.id)
    if (success) {
      setArchivedListings(prev => prev.filter(l => l.id !== listing.id))
    }
  }

  const handleUnarchive = (listing: DBListingWithChopes) => {
    setArchivedListings(prev => prev.filter(l => l.id !== listing.id))
    setActiveListings(prev => [{ ...listing, is_archived: false }, ...prev])
  }

  return (
    <div className="space-y-6 pt-4 pb-8">
      {/* Header */}
      <header className="px-4">
        <div className="flex items-center gap-2 mb-1">
          <User className="size-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">My Stuff</h1>
        </div>
      </header>

      {/* Profile card */}
      <section className="px-4">
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center gap-4">
            <Avatar className="size-16 border-2 border-primary">
              <AvatarImage
                src={user?.avatar_seed
                  ? `https://api.dicebear.com/9.x/thumbs/svg?seed=${user.avatar_seed}`
                  : ''}
                alt={user?.name || ''}
              />
              <AvatarFallback className="bg-secondary text-secondary-foreground text-lg">
                {user?.name?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-foreground">{user?.name}</h2>
              <div className="flex items-center gap-4 mt-1">
                <div className="flex items-center gap-1.5">
                  <Gift className="size-4 text-success" />
                  <span className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">{givenCount}</span> given
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Package className="size-4 text-primary" />
                  <span className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">{chopedCount}</span> choped
                  </span>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground flex-shrink-0"
              onClick={() => setIsProfileEditOpen(true)}
            >
              <Settings className="size-5" />
            </Button>
          </div>


        </div>
      </section>

      {/* My Chopes section */}
      <section className="px-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Package className="size-5 text-primary" />
            My Chopes
          </h3>
          <Badge variant="secondary" className="bg-muted">{chopes.length}</Badge>
        </div>

        {chopes.length === 0 ? (
          <div className="text-center py-8 bg-muted/50 rounded-xl">
            <p className="text-muted-foreground">Nothing here leh...</p>
            <p className="text-sm text-muted-foreground mt-1">Start browsing and chope some items!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {chopes.map((chope) => (
              <ChopeCard
                key={chope.id}
                chope={chope}
                onUnchope={(chopeId) => setChopes(prev => prev.filter(c => c.id !== chopeId))}
              />
            ))}
          </div>
        )}
      </section>

      {/* My Listings section */}
      <section className="px-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Gift className="size-5 text-success" />
            My Listings
          </h3>
          <Badge variant="secondary" className="bg-muted">{activeListings.length}</Badge>
        </div>

        {activeListings.length === 0 ? (
          <div className="text-center py-8 bg-muted/50 rounded-xl">
            <p className="text-muted-foreground">Nothing here leh...</p>
            <p className="text-sm text-muted-foreground mt-1">Got stuff to give away? List them now!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {activeListings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                showActions
                onEdit={() => handleEdit(listing)}
                onArchive={() => handleArchive(listing)}
                onDelete={() => handleDelete(listing)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Archived Listings - Collapsible */}
      {archivedListings.length > 0 && (
        <section className="px-4">
          <Collapsible open={isArchivedOpen} onOpenChange={setIsArchivedOpen}>
            <CollapsibleTrigger className="flex items-center justify-between w-full py-2">
              <div className="flex items-center gap-2">
                <Archive className="size-5 text-muted-foreground" />
                <span className="font-semibold text-muted-foreground">
                  Archived ({archivedListings.length})
                </span>
              </div>
              <ChevronDown className={cn(
                'size-5 text-muted-foreground transition-transform duration-200',
                isArchivedOpen && 'rotate-180'
              )} />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2">
              <div className="space-y-2">
                {archivedListings.map((listing) => (
                  <ArchivedListingCard
                    key={listing.id}
                    listing={listing}
                    onUnarchive={() => handleUnarchive(listing)}
                    onDelete={() => handleDeleteArchived(listing)}
                  />
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </section>
      )}

      {/* Edit Listing Drawer */}
      <EditListingDrawer
        listing={editingListing}
        open={isEditDrawerOpen}
        onOpenChange={setIsEditDrawerOpen}
        onSave={handleSaveEdit}
      />

      {/* Profile Edit Drawer */}
      <ProfileEditDrawer
        user={user}
        open={isProfileEditOpen}
        onOpenChange={setIsProfileEditOpen}
        onSave={(updated) => {
          setUser(updated)
          setIsProfileEditOpen(false)
        }}
      />
    </div>
  )
}
