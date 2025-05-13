import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function Home() {
  const cookieStore = (await cookies()).get("token")
  const token = cookieStore?.value

  if (token) {
    redirect("/dashboard")
  }

  return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white p-4">
        <div className="w-full max-w-5xl text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
            Gestion des Marchés
          </h1>
          <p className="mb-8 text-xl text-gray-600">Système de gestion des marchés</p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/login">Se connecter</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
              <Link href="/register">S&apos;inscrire</Link>
            </Button>
          </div>
        </div>
      </div>
  )
}
