import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { registerUser } from '@/services/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff } from 'lucide-react'

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone_num: '',
  })
  const [errors, setErrors] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const navigate = useNavigate()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors([])
    setLoading(true)

    const response = await registerUser(formData)

    if (response.success) {
      navigate('/login')
    } else if (response.detail) {
      const messages = response.detail.flatMap((err: any) => {
        const msg = err.msg.replace(/^Value error,?\s*/i, '')
        return msg.split('\n')
      })
      setErrors(messages)
    } else if (Array.isArray(response.error)) {
      setErrors(response.error)
    } else {
      setErrors([response.error || 'Registration failed'])
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950">
      <Card className="w-full max-w-md bg-zinc-900 border-zinc-600">
        <CardHeader>
          <CardTitle className="text-center font-semibold text-xl text-zinc-50">Create Account</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 text-zinc-50">
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  name="first_name"
                  type="text"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                  className="bg-zinc-800"
                />
              </div>
              <div className="space-y-2 text-zinc-50">
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  name="last_name"
                  type="text"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                  className="bg-zinc-800"
                />
              </div>
            </div>
            <div className="space-y-2 text-zinc-50">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                required
                className="bg-zinc-800"
              />
            </div>
            <div className="space-y-2 text-zinc-50">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="bg-zinc-800"
              />
            </div>
            <div className="space-y-2 text-zinc-50">
              <Label htmlFor="phone_num">Phone Number</Label>
              <Input
                id="phone_num"
                name="phone_num"
                type="tel"
                value={formData.phone_num}
                onChange={handleChange}
                required
                className="bg-zinc-800"
              />
            </div>
            <div className="space-y-2 text-zinc-50">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="bg-zinc-800 pr-10"
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
            {errors.length > 0 && (
              <div className="text-red-400 text-sm space-y-1">
                {errors.map((err, i) => (
                  <p key={i}>{err}</p>
                ))}
              </div>
            )}
            <Button type="submit" className="w-full bg-zinc-50 text-zinc-900 cursor-pointer hover:bg-zinc-200" disabled={loading}>
              {loading ? 'Creating account...' : 'Register'}
            </Button>
          </form>
          <p className="text-center text-sm mt-4 text-zinc-50">
            Already have an account? <Link to="/login" className="text-zinc-50 hover:text-zinc-200 underline">Login</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}