import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { refreshToken as refreshTokenAPI } from '../services/api'

interface AuthContextType {
    isAuthenticated: boolean
    expiresAt: number | null
    login: (expiresIn: number) => void
    logout: () => void
    checkAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

const EXPIRES_AT_KEY = 'auth_expires_at'

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [expiresAt, setExpiresAt] = useState<number | null>(null)
    const [isInitialized, setIsInitialized] = useState(false)

    // Check auth state on mount
    useEffect(() => {
        const checkAuthOnMount = async () => {
            // Try to get expiration from sessionStorage first
            const storedExpiresAt = sessionStorage.getItem(EXPIRES_AT_KEY)

            if (storedExpiresAt) {
                const expiresAtTimestamp = parseInt(storedExpiresAt, 10)
                const timeLeft = expiresAtTimestamp - Date.now()

                // If token hasn't expired yet, use stored value
                if (timeLeft > 0) {
                    setIsAuthenticated(true)
                    setExpiresAt(expiresAtTimestamp)
                    setIsInitialized(true)
                    return
                } else {
                    // Token expired, clear storage
                    sessionStorage.removeItem(EXPIRES_AT_KEY)
                }
            }

            // No valid stored expiration, try to refresh
            try {
                const response = await refreshTokenAPI()
                if (response.success && response.expires_in) {
                    const newExpiresAt = Date.now() + response.expires_in * 1000
                    setIsAuthenticated(true)
                    setExpiresAt(newExpiresAt)
                    sessionStorage.setItem(EXPIRES_AT_KEY, newExpiresAt.toString())
                }
            } catch {
                // No valid session, user needs to login
                setIsAuthenticated(false)
            } finally {
                setIsInitialized(true)
            }
        }

        checkAuthOnMount()
    }, [])

    const login = (expiresIn: number) => {
        const newExpiresAt = Date.now() + expiresIn * 1000
        setIsAuthenticated(true)
        setExpiresAt(newExpiresAt)
        sessionStorage.setItem(EXPIRES_AT_KEY, newExpiresAt.toString())
    }

    const logout = () => {
        setIsAuthenticated(false)
        setExpiresAt(null)
        sessionStorage.removeItem(EXPIRES_AT_KEY)
    }

    const checkAuth = async () => {
        try {
            const response = await refreshTokenAPI()
            if (response.success && response.expires_in) {
                const newExpiresAt = Date.now() + response.expires_in * 1000
                setIsAuthenticated(true)
                setExpiresAt(newExpiresAt)
                sessionStorage.setItem(EXPIRES_AT_KEY, newExpiresAt.toString())
            } else {
                setIsAuthenticated(false)
                setExpiresAt(null)
                sessionStorage.removeItem(EXPIRES_AT_KEY)
            }
        } catch {
            setIsAuthenticated(false)
            setExpiresAt(null)
            sessionStorage.removeItem(EXPIRES_AT_KEY)
        }
    }

    // Don't render children until auth state is checked
    if (!isInitialized) {
        return null
    }

    return (
        <AuthContext.Provider value={{
            isAuthenticated,
            expiresAt,
            login,
            logout,
            checkAuth
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}