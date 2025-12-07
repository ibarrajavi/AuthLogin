import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { loginUser } from '@/services/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff } from 'lucide-react'

export default function Login() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const response = await loginUser({ identifier, password })

    if (response.success) {
      const expiresIn = response.expires_in || 900
      login(expiresIn)
      navigate('/success')
    } else {
      const errorMessage = Array.isArray(response.error)
        ? response.error.join(', ')
        : response.error || 'Login failed'
      setError(errorMessage)
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950">
      <Card className="w-full max-w-md bg-zinc-900 border-zinc-600">
        <CardHeader>
          <CardTitle className='text-center font-semibold text-xl text-zinc-50'>AuthLogin</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2 text-zinc-50">
              <Label htmlFor="identifier">Username or Email</Label>
              <Input
                id="identifier"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                className='bg-zinc-800'
              />
            </div>
            <div className="space-y-2 text-zinc-50">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className='bg-zinc-800 pr-10'
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <Button type="submit" className="w-full bg-zinc-50 text-zinc-900 cursor-pointer hover:bg-zinc-200" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
          <p className="text-center text-sm mt-4 text-zinc-50">
            Don't have an account? <Link to="/register" className="text-zinc-50 hover:text-zinc-200 underline">Register</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}