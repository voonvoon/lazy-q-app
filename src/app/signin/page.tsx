
"use client"
import { signIn, useSession } from "next-auth/react"
import { useRouter } from 'next/navigation'
import { useState } from "react"
import Link from 'next/link'
import { toast } from "react-hot-toast"


export default function Signin() {
  const { data: session, status } = useSession()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const router = useRouter()

  console.log("Session data------------------->>", session, "Status------------------->>", status)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false, // Don't redirect, handle response manually
      })
      
      if (result?.error) {
        toast.error("Login failed: " + result.error)
      } else {
        toast.success("Login successful!")
        router.push('/') // Navigate to homepage
      }
      } catch (error) {
        toast.error("Login error: " + error)
      } finally {  setLoading(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg">Loading...</p>
      </div>
    )
  }

  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
       <div className="max-w-md w-full ">
        <h2 className="mt-6 mb-1 text-center text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
        <p className="mb-4 text-center text-sm text-gray-600">
            Or{' '}
            <Link href="/register" className=" font-medium text-indigo-600 hover:text-indigo-500">
              Don't have an account? Sign up
            </Link>
          </p>
        <form onSubmit={handleLogin} className="space-y-4 mb-6">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              required
            />
          </div>

          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Signing in..." : "Sign In with Email"}
          </button>
        </form>
        
        <div className="text-center">
          <p className="text-gray-600 mb-4">Or</p>
          <button
                type="button"
                onClick={() => signIn('google', { callbackUrl: '/' })}
                className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 cursor-pointer"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="ml-2">Sign up with Google</span>
              </button>
        </div>
        
        <div className="mt-6 p-4 bg-gray-100 rounded-md">
          <p className="text-sm text-gray-600">
            <strong>Test Super_admin Account:</strong><br/>
            Email: peter@gmail.com<br/>
            Password: 123321
          </p>
        </div>
      </div>
    </div>
  )
}