import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

interface AuthContextType {
    accessToken: string | null
    refreshToken: string | null
    isAuthenticated: boolean
    expiresAt: number | null
    login: (accessToken: string, refreshToken: string, expiresIn: number) => void
    logout: () => void
    refresh: (accessToken: string, refreshToken: string, expiresIn: number) => void
}

const AuthContext = createContext<AuthContextType | null>(null)

const STORAGE_KEYS = {
    ACCESS_TOKEN: 'auth_access_token',
    REFRESH_TOKEN: 'auth_refresh_token',
    EXPIRES_AT: 'auth_expires_at'
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [accessToken, setAccessToken] = useState<string | null>(null)
    const [refreshToken, setRefreshToken] = useState<string | null>(null)
    const [expiresAt, setExpiresAt] = useState<number | null>(null)
    const [isInitialized, setIsInitialized] = useState(false)

    // Restore auth state from localStorage on mount
    useEffect(() => {
        const storedAccessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
        const storedRefreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
        const storedExpiresAt = localStorage.getItem(STORAGE_KEYS.EXPIRES_AT)

        if (storedAccessToken && storedRefreshToken && storedExpiresAt) {
            const expiryTime = parseInt(storedExpiresAt, 10)

            // Only restore if token hasn't expired
            if (expiryTime > Date.now()) {
                setAccessToken(storedAccessToken)
                setRefreshToken(storedRefreshToken)
                setExpiresAt(expiryTime)
            } else {
                // Clear expired tokens
                localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
                localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
                localStorage.removeItem(STORAGE_KEYS.EXPIRES_AT)
            }
        }

        setIsInitialized(true)
    }, [])

    const isAuthenticated = !!accessToken

    const login = (access: string, refresh: string, expiresIn: number) => {
        const expiryTime = Date.now() + expiresIn * 1000

        setAccessToken(access)
        setRefreshToken(refresh)
        setExpiresAt(expiryTime)

        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, access)
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refresh)
        localStorage.setItem(STORAGE_KEYS.EXPIRES_AT, expiryTime.toString())
    }

    const logout = () => {
        setAccessToken(null)
        setRefreshToken(null)
        setExpiresAt(null)

        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
        localStorage.removeItem(STORAGE_KEYS.EXPIRES_AT)
    }

    const refresh = (access: string, newRefresh: string, expiresIn: number) => {
        const expiryTime = Date.now() + expiresIn * 1000

        setAccessToken(access)
        setRefreshToken(newRefresh)
        setExpiresAt(expiryTime)

        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, access)
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefresh)
        localStorage.setItem(STORAGE_KEYS.EXPIRES_AT, expiryTime.toString())
    }

    // Don't render children until auth state is restored from localStorage
    if (!isInitialized) {
        return null
    }

    return (
        <AuthContext.Provider value={{
            accessToken,
            refreshToken,
            isAuthenticated,
            expiresAt,
            login,
            logout,
            refresh
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