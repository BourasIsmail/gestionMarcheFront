"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/lib/sonner-utils"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import axios from "axios";

export default function ProfilePage() {
    const { user, logout } = useAuth()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")

    const [passwordData, setPasswordData] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
    })

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setPasswordData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        // Validate passwords
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setError("Les nouveaux mots de passe ne correspondent pas")
            return
        }

        if (passwordData.newPassword.length < 6) {
            setError("Le nouveau mot de passe doit contenir au moins 6 caractères")
            return
        }

        setIsLoading(true)

        try {
            await api.put(`/auth/changepsw/${user?.id}`, passwordData)

            toast.success("Succès", "Votre mot de passe a été mis à jour avec succès")

            // Reset form
            setPasswordData({
                oldPassword: "",
                newPassword: "",
                confirmPassword: "",
            })

            // Logout user to re-authenticate with new password
            setTimeout(() => {
                logout()
            }, 2000)
        } catch (error: unknown) {
            console.error("Error updating password:", error)
            if (axios.isAxiosError(error)) {
                setError(error.response?.data || "Une erreur s'est produite lors de la mise à jour du mot de passe")
            } else {
                setError("Une erreur s'est produite lors de la mise à jour du mot de passe")
            }
        } finally {
            setIsLoading(false)
        }
    }

    if (!user) {
        return null
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Profil</h1>
                <p className="text-muted-foreground">Gérez vos informations personnelles</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Informations du Compte</CardTitle>
                        <CardDescription>Vos informations de connexion</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Nom</Label>
                                <div className="rounded-md border border-input bg-background px-3 py-2">{user.name}</div>
                            </div>
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <div className="rounded-md border border-input bg-background px-3 py-2">{user.email}</div>
                            </div>
                            <div className="space-y-2">
                                <Label>Rôle</Label>
                                <div className="rounded-md border border-input bg-background px-3 py-2">
                                    {user.roles === "ADMIN_ROLES" ? "Administrateur" : "Utilisateur"}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Changer le Mot de Passe</CardTitle>
                        <CardDescription>Mettez à jour votre mot de passe</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {error && (
                            <Alert variant="destructive" className="mb-4">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="oldPassword">Mot de passe actuel</Label>
                                <Input
                                    id="oldPassword"
                                    name="oldPassword"
                                    type="password"
                                    value={passwordData.oldPassword}
                                    onChange={handlePasswordChange}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                                <Input
                                    id="newPassword"
                                    name="newPassword"
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={handlePasswordChange}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</Label>
                                <Input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={handlePasswordChange}
                                    required
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? "Mise à jour en cours..." : "Mettre à jour le mot de passe"}
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="text-sm text-muted-foreground">
                        Vous serez déconnecté après avoir changé votre mot de passe.
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}
