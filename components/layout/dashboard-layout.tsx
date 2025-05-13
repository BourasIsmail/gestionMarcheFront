"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, FileText, Users, Settings, Menu, X, LogOut, User, BookOpen } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { ThemeToggle } from "@/components/theme-toggle"

interface DashboardLayoutProps {
    children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const { user, logout, isLoading, isAdmin } = useAuth()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        // Close mobile menu when route changes
        setIsMobileMenuOpen(false)
    }, [pathname])

    if (isLoading) {
        return <LoadingState />
    }

    if (!user) {
        router.push("/login")
        return null
    }

    const navigation = [
        { name: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard },
        { name: "Ajouter Marchés", href: "/dashboard/marches", icon: FileText },
        { name: "Liste Des Décomptes", href: "/dashboard/decomptes", icon: FileText },
        { name: "Rubriques", href: "/dashboard/rubriques", icon: BookOpen },
    ]

    if (isAdmin) {
        navigation.push({ name: "Utilisateurs", href: "/dashboard/users", icon: Users })
    }

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            {/* Sidebar for desktop */}
            <div className="hidden md:flex md:w-64 md:flex-col">
                <div className="flex flex-col flex-grow border-r border-gray-200 bg-white pt-5 dark:border-gray-800 dark:bg-gray-950">
                    <div className="flex flex-shrink-0 items-center px-4">
                        <h1 className="text-xl font-bold dark:text-white">Gestion Marchés</h1>
                    </div>
                    <div className="mt-5 flex flex-grow flex-col">
                        <nav className="flex-1 space-y-1 px-2 pb-4">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`group flex items-center rounded-md px-2 py-2 text-sm font-medium ${
                                        pathname === item.href
                                            ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
                                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
                                    }`}
                                >
                                    <item.icon
                                        className={`mr-3 h-5 w-5 flex-shrink-0 ${
                                            pathname === item.href
                                                ? "text-gray-500 dark:text-gray-400"
                                                : "text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-400"
                                        }`}
                                        aria-hidden="true"
                                    />
                                    {item.name}
                                </Link>
                            ))}
                        </nav>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            <div className={`fixed inset-0 z-40 md:hidden ${isMobileMenuOpen ? "block" : "hidden"}`}>
                <div className="fixed inset-0 bg-gray-600 bg-opacity-75"></div>
                <div className="fixed inset-0 z-40 flex">
                    <div className="relative flex w-full max-w-xs flex-1 flex-col bg-white pt-5 dark:bg-gray-950">
                        <div className="absolute right-0 top-0 -mr-12 pt-2">
                            <button
                                type="button"
                                className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <span className="sr-only">Close sidebar</span>
                                <X className="h-6 w-6 text-white" aria-hidden="true" />
                            </button>
                        </div>
                        <div className="flex flex-shrink-0 items-center px-4">
                            <h1 className="text-xl font-bold dark:text-white">Gestion Marchés</h1>
                        </div>
                        <div className="mt-5 flex flex-grow flex-col">
                            <nav className="flex-1 space-y-1 px-2 pb-4">
                                {navigation.map((item) => (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`group flex items-center rounded-md px-2 py-2 text-base font-medium ${
                                            pathname === item.href
                                                ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
                                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
                                        }`}
                                    >
                                        <item.icon
                                            className={`mr-4 h-6 w-6 flex-shrink-0 ${
                                                pathname === item.href
                                                    ? "text-gray-500 dark:text-gray-400"
                                                    : "text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-400"
                                            }`}
                                            aria-hidden="true"
                                        />
                                        {item.name}
                                    </Link>
                                ))}
                            </nav>
                        </div>
                    </div>
                    <div className="w-14 flex-shrink-0" aria-hidden="true"></div>
                </div>
            </div>

            {/* Main content */}
            <div className="flex flex-1 flex-col">
                <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white shadow dark:bg-gray-950 dark:border-b dark:border-gray-800">
                    <button
                        type="button"
                        className="border-r border-gray-200 px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 md:hidden dark:border-gray-800 dark:text-gray-400"
                        onClick={() => setIsMobileMenuOpen(true)}
                    >
                        <span className="sr-only">Open sidebar</span>
                        <Menu className="h-6 w-6" aria-hidden="true" />
                    </button>
                    <div className="flex flex-1 justify-between px-4">
                        <div className="flex flex-1"></div>
                        <div className="ml-4 flex items-center md:ml-6 space-x-3">
                            <ThemeToggle />
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                        <User className="h-5 w-5" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
                                    <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
                                    <DropdownMenuLabel className="text-xs font-normal text-gray-500 dark:text-gray-400">
                                        {user.email}
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Link href="/dashboard/profile">
                                            <User className="mr-2 h-4 w-4" />
                                            <span>Profil</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/dashboard/settings">
                                            <Settings className="mr-2 h-4 w-4" />
                                            <span>Paramètres</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => logout()}>
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>Se déconnecter</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>

                <main className="flex-1 overflow-y-auto bg-gray-100 p-4 md:p-6 dark:bg-gray-900">{children}</main>
            </div>
        </div>
    )
}

function LoadingState() {
    return (
        <div className="flex h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
            <div className="w-full max-w-md space-y-4 rounded-lg bg-white p-6 shadow-md dark:bg-gray-950">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-10 w-full" />
            </div>
        </div>
    )
}
