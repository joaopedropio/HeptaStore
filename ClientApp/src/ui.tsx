import { useRef } from 'react'
import * as RadixLabel from '@radix-ui/react-label'

// --- Button ---

type ButtonVariant = 'primary' | 'secondary' | 'destructive' | 'ghost'

const btnBase = 'px-4 py-2 rounded-md text-sm font-semibold cursor-pointer transition-colors disabled:opacity-55 disabled:cursor-not-allowed'

const btnVariants: Record<ButtonVariant, string> = {
  primary:     `${btnBase} bg-indigo-500 text-white hover:bg-indigo-600`,
  secondary:   `${btnBase} bg-gray-200 text-gray-700 hover:bg-gray-300`,
  destructive: `${btnBase} bg-red-600 text-white hover:bg-red-700`,
  ghost: 'bg-transparent border-none cursor-pointer text-lg text-gray-400 px-1 py-0.5 rounded leading-none tracking-wide transition-colors hover:bg-gray-100 hover:text-gray-700 focus:outline-none',
}

export function Button({
  variant = 'primary',
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return <button className={`${btnVariants[variant]} ${className}`} {...props} />
}

// --- Input / Textarea ---

const inputCls = 'px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-800 transition-colors focus:outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/10'

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={inputCls} {...props} />
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`${inputCls} resize-y`} {...props} />
}

// --- Field (label + control wrapper) ---

export function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <RadixLabel.Root htmlFor={htmlFor} className="text-sm font-semibold text-gray-600">
        {label}
      </RadixLabel.Root>
      {children}
    </div>
  )
}

// --- ImagePicker ---

export function ImagePicker({
  id,
  accept,
  fileName,
  onChange,
}: {
  id: string
  accept: string
  fileName: string | null
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}) {
  const ref = useRef<HTMLInputElement>(null)

  return (
    <div className="flex items-center gap-3">
      <input ref={ref} id={id} type="file" accept={accept} onChange={onChange} className="hidden" />
      <button
        type="button"
        onClick={() => ref.current?.click()}
        className="px-3 py-1.5 rounded-md border border-gray-300 bg-gray-50 text-sm text-gray-700 font-medium cursor-pointer transition-colors hover:bg-gray-100 hover:border-gray-400"
      >
        Choose image
      </button>
      <span className="text-sm text-gray-400 truncate">{fileName ?? 'No file chosen'}</span>
    </div>
  )
}

// --- ErrorBanner ---

export function ErrorBanner({ message }: { message: string }) {
  return <p className="bg-red-50 text-red-600 px-3 py-2.5 rounded-md text-sm m-0">{message}</p>
}
