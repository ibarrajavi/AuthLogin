const API_URL = 'http://localhost:8000/api/v1'

interface LoginRequest {
    identifier: string
    password: string
}

interface RegisterRequest {
    username: string
    password: string
    first_name: string
    last_name: string
    email: string
    phone_num: string
}

interface AuthResponse {
  success?: boolean
  message?: string
  error?: string | string[]
  detail?: Array<{ loc: string[]; msg: string; type: string }>
  access_token?: string
  refresh_token?: string
  token_type?: string
  expires_in?: number
  data?: {
    user_id: number
    username: string
    email: string
  }
}

export async function loginUser(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
    })
    return response.json()
}

export async function registerUser(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
    })
    return response.json()
}

export async function refreshToken(token: string): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
             'Content-Type': 'application/json',
             'Authorization': `Bearer ${token}`
        },
    })
    return response.json()
}

export async function logoutUser(access_token: string): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${access_token}` }
    })
    return response.json()
}
