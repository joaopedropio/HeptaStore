import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from './AuthContext'
import { useRegister } from './queries'
import { Button, Field, Input } from './ui'

export default function SignUp() {
  const { user, isLoading } = useAuth()
  const navigate = useNavigate()
  const register = useRegister()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isManager, setIsManager] = useState(false)

  if (!isLoading && user) return <Navigate to="/" replace />

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    try {
      await register.mutateAsync({ email, password, isManager })
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
          <p className="text-gray-500 text-sm mt-1">Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="Email" htmlFor="email">
            <Input id="email" type="email" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} />
          </Field>

          <Field label="Password" htmlFor="password">
            <Input id="password" type="password" required autoComplete="new-password" minLength={6} value={password} onChange={e => setPassword(e.target.value)} />
          </Field>

          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isManager}
              onChange={e => setIsManager(e.target.checked)}
              className="w-4 h-4 accent-indigo-500 cursor-pointer"
            />
            <span className="text-sm text-gray-700">
              Register as <span className="font-semibold">Manager</span>
              <span className="text-gray-400 font-normal"> (can add, edit and delete products)</span>
            </span>
          </label>

          {register.error && <p className="text-red-600 text-sm">{register.error.message}</p>}

          <Button type="submit" disabled={register.isPending} className="mt-1">
            {register.isPending ? 'Creating account…' : 'Sign up'}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-5">
          Already have an account?{' '}
          <Link to="/signin" className="text-indigo-500 font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
