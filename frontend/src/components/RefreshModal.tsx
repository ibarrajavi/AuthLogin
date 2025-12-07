import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { refreshToken, logoutUser } from '@/services/api'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export default function RefreshModal() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const { accessToken, refreshToken: token, expiresAt, refresh, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAuthenticated || !expiresAt) return

    const timeLeft = expiresAt - Date.now()

    // Already expired - logout immediately
    if (timeLeft <= 0) {
      handleLogOut()
      return
    }

    // Show modal 1 minute before expiry
    const WARNING_TIME = 60000 // 1 minute in milliseconds
    const timeUntilWarning = timeLeft - WARNING_TIME

    let warningTimeout: number | null = null
    let expiryTimeout: number | null = null

    if (timeUntilWarning > 0) {
      // Schedule warning modal
      warningTimeout = setTimeout(() => {
        setOpen(true)
      }, timeUntilWarning)
    } else {
      // Less than 1 minute left - show modal immediately
      setOpen(true)
    }

    // Schedule auto-logout at expiry
    expiryTimeout = setTimeout(() => {
      handleLogOut()
    }, timeLeft)

    return () => {
      if (warningTimeout) clearTimeout(warningTimeout)
      if (expiryTimeout) clearTimeout(expiryTimeout)
    }
  }, [isAuthenticated, expiresAt])

  const handleStayLoggedIn = async () => {
    if (!token) return
    setLoading(true)

    const response = await refreshToken(token)

    if (response.success && response.access_token && response.refresh_token) {
      const expiresIn = response.expires_in || 900
      refresh(response.access_token, response.refresh_token, expiresIn)
      setOpen(false)
    } else {
      // Refresh failed, force logout
      handleLogOut()
    }

    setLoading(false)
  }

  const handleLogOut = async () => {
    if (accessToken) {
      await logoutUser(accessToken)
    }
    logout()
    setOpen(false)
    navigate('/login')
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-sm bg-zinc-900 border-zinc-600 top-[9%] translate-y-0 [&>button[data-slot=dialog-close]]:hidden">
        <DialogHeader>
          <DialogTitle className="text-zinc-50 text-center">Session Expiring</DialogTitle>
          <DialogDescription className="text-zinc-400 text-center">
            Your session is about to expire. Would you like to stay logged in?
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-3 justify-center mt-4">
          <Button
            variant="outline"
            onClick={handleLogOut}
            className="text-zinc-900 hover:bg-red-400 hover:text-zinc-50 cursor-pointer"
          >
            Logout
          </Button>
          <Button
            onClick={handleStayLoggedIn}
            disabled={loading}
            className="bg-zinc-50 text-zinc-900 hover:bg-zinc-200 cursor-pointer"
          >
            {loading ? 'Refreshing...' : 'Stay Logged In'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}