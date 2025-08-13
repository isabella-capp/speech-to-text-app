import { auth } from '@/lib/auth'
import { LoginForm } from '../../../components/auth/login-form'
import { redirect } from 'next/navigation'

export default async function Login() {
  const session = await auth()

  if (session) {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <LoginForm />
    </div>
  )
}
