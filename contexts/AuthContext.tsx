"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { api } from "@/lib/api"
import { useRouter } from "next/navigation"
import Cookies from "js-cookie"
import axios from "axios";

interface User {
    id: number
    name: string
    email: string
    roles: string
}

interface AuthContextType {
    user: User | null
    token: string | null
    login: (email: string, password: string) => Promise<void>
    logout: () => Promise<void>
    isLoading: boolean
    isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [token, setToken] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        // Check if user is logged in
        const storedToken = Cookies.get("token")

        if (storedToken) {
            setToken(storedToken)
            fetchUserData(storedToken)
        } else {
            setIsLoading(false)
        }
    }, [])

    const fetchUserData = async (token: string) => {
        try {
            // Set the token in the API headers
            api.defaults.headers.common["Authorization"] = `Bearer ${token}`

            // Extract email from token (you might need to decode JWT)
            const payload = JSON.parse(atob(token.split(".")[1]))
            const email = payload.sub

            // Fetch user data
            const response = await api.get(`/auth/email/${email}`)
            setUser(response.data)
        } catch (error) {
            console.error("Error fetching user data:", error)
            Cookies.remove("token")
            setToken(null)
        } finally {
            setIsLoading(false)
        }
    }

    const login = async (email: string, password: string) => {
        try {
            const response = await api.post("/auth/login", { email, password })
            const newToken = response.data

            // Save token to cookies
            Cookies.set("token", newToken, { expires: 1 }) // 1 day

            // Set token in state and API headers
            setToken(newToken)
            api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`

            // Fetch user data
            await fetchUserData(newToken)

            return Promise.resolve()
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                return Promise.reject(new Error(error.response?.data || "Échec de la connexion"))
            }
            return Promise.reject(new Error("Échec de la connexion"))
        }
    }

    const logout = async () => {
        try {
            await api.post("/auth/logout")
        } catch (error) {
            console.error("Error during logout:", error)
        } finally {
            // Remove token from cookies and state
            Cookies.remove("token")
            setToken(null)
            setUser(null)

            // Remove Authorization header
            delete api.defaults.headers.common["Authorization"]

            // Redirect to login page
            router.push("/login")
        }
    }

    const isAdmin = user?.roles.includes("ADMIN_ROLES") || false

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                login,
                logout,
                isLoading,
                isAdmin,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}
