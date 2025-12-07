import { useAuth } from '@/context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { logoutUser } from '@/services/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function Success() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logoutUser()
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950">
      <Card className="w-full max-w-md bg-zinc-900 border-zinc-600">
        <CardHeader>
          <CardTitle className="text-center font-semibold text-xl text-zinc-50">Login Successful</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-zinc-300 mb-6">You have successfully logged in.</p>
          <Button 
            variant={'outline'}
            onClick={handleLogout} 
            className="bg-zinc-50 text-zinc-900 cursor-pointer hover:bg-red-400 hover:text-zinc-50"
          >
            Logout
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}