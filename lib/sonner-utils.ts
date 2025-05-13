import { toast as sonnerToast } from "sonner"

// Helper functions to standardize toast usage across the app
export const toast = {
    success: (title: string, description?: string) => {
        sonnerToast.success(title, {
            description,
            duration: 4000,
        })
    },
    error: (title: string, description?: string) => {
        sonnerToast.error(title, {
            description,
            duration: 5000,
        })
    },
    info: (title: string, description?: string) => {
        sonnerToast.info(title, {
            description,
            duration: 4000,
        })
    },
    warning: (title: string, description?: string) => {
        sonnerToast.warning(title, {
            description,
            duration: 4000,
        })
    },
}
