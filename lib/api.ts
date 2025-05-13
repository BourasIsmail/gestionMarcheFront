import axios from "axios"
import Cookies from "js-cookie"

// Create axios instance
export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || /*"http://localhost:8080"*/"http://172.16.20.85:8080",
    headers: {
        "Content-Type": "application/json",
    },
})

// Add a request interceptor
api.interceptors.request.use(
    (config) => {
        // Get token from cookies
        const token = Cookies.get("token")

        // If token exists, add to headers
        if (token) {
            config.headers["Authorization"] = `Bearer ${token}`
        }

        return config
    },
    (error) => {
        return Promise.reject(error)
    },
)

// Add a response interceptor
api.interceptors.response.use(
    (response) => {
        return response
    },
    async (error) => {
        const originalRequest = error.config

        // If error is 401 (Unauthorized) and not already retrying
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true

            // Clear token and redirect to login
            Cookies.remove("token")

            // If we're in the browser, redirect to login
            if (typeof window !== "undefined") {
                window.location.href = "/login"
            }
        }

        return Promise.reject(error)
    },
)
