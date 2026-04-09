import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from './AuthContext'
import { useLogin } from './queries'
import { Button, Field, Input } from './ui'

export default function SignIn() {
  const { user, isLoading } = useAuth()
  const navigate = useNavigate()
  const login = useLogin()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  if (!isLoading && user) return <Navigate to="/" replace />

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    try {
      await login.mutateAsync({ email, password })
      navigate('/', { replace: true })
    } catch {
      // error displayed below
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white rounded-xl shadow-md w-full max-w-sm p-8">
        <div className="text-center mb-7">
          <span className="text-[#1a1a2e] font-bold text-xl tracking-wide">HeptaStore</span>
          <p className="text-gray-500 text-sm mt-1">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="Email" htmlFor="email">
            <Input id="email" type="email" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} />
          </Field>

          <Field label="Password" htmlFor="password">
            <Input id="password" type="password" required autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} />
          </Field>

          {login.error && <p className="text-red-600 text-sm">{login.error.message}</p>}

          <Button type="submit" disabled={login.isPending} className="mt-1">
            {login.isPending ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-5">
          Don't have an account?{' '}
          <Link to="/signup" className="text-indigo-500 font-semibold hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  )
}
