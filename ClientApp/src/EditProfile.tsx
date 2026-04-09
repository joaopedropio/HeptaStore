import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './AuthContext'
import { useUpdateProfile } from './queries'
import { Button, ErrorBanner, Field, Input } from './ui'

export default function EditProfile() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const updateProfile = useUpdateProfile()

  const [email, setEmail] = useState(user?.email ?? '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [success, setSuccess] = useState(false)

  const validationError =
    newPassword && newPassword !== confirmPassword ? 'New passwords do not match.' : null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (validationError) return

    const payload: { email?: string; currentPassword?: string; newPassword?: string } = {}

    if (email.trim() && email.trim() !== user?.email) payload.email = email.trim()
    if (newPassword) {
      payload.currentPassword = currentPassword
      payload.newPassword = newPassword
    }

    if (!payload.email && !payload.newPassword) return

    await updateProfile.mutateAsync(payload, {
      onSuccess: () => {
        setSuccess(true)
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      },
    })
  }

  const error = validationError ?? updateProfile.error?.message
  const submitting = updateProfile.isPending

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-semibold mb-6">Edit Profile</h1>
      <form className="bg-white rounded-lg p-7 shadow-sm flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
        {error && <ErrorBanner message={error} />}
        {success && (
          <p className="bg-green-50 text-green-700 px-3 py-2.5 rounded-md text-sm m-0">
            Profile updated successfully.
          </p>
        )}

        <Field label="Email" htmlFor="email">
          <Input
            id="email"
            type="email"
            value={email}
            onChange={e => { setEmail(e.target.value); setSuccess(false) }}
            placeholder="your@email.com"
          />
        </Field>

        <hr className="border-gray-100" />

        <p className="text-sm text-gray-500 m-0">Leave password fields blank to keep your current password.</p>

        <Field label="Current Password" htmlFor="currentPassword">
          <Input
            id="currentPassword"
            type="password"
            value={currentPassword}
            onChange={e => { setCurrentPassword(e.target.value); setSuccess(false) }}
            placeholder="Required to change password"
          />
        </Field>

        <Field label="New Password" htmlFor="newPassword">
          <Input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={e => { setNewPassword(e.target.value); setSuccess(false) }}
            placeholder="Min. 6 characters"
          />
        </Field>

        <Field label="Confirm New Password" htmlFor="confirmPassword">
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={e => { setConfirmPassword(e.target.value); setSuccess(false) }}
            placeholder="Repeat new password"
          />
        </Field>

        <div className="flex justify-end gap-3 pt-1">
          <Button type="button" variant="secondary" onClick={() => navigate('/')} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Saving…' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  )
}
