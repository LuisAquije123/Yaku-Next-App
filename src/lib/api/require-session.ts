import { getServerSession } from 'next-auth/next'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'

type SessionSuccess = {
  userId: number
  error?: never
}

type SessionFailure = {
  userId?: never
  error: NextResponse
}

export async function requireSession(): Promise<SessionSuccess | SessionFailure> {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return {
      error: NextResponse.json(
        { success: false, message: 'No autorizado. Inicia sesión.' },
        { status: 401 },
      ),
    }
  }

  const userId = Number(session.user.id)

  if (Number.isNaN(userId)) {
    return {
      error: NextResponse.json(
        { success: false, message: 'Sesión inválida.' },
        { status: 401 },
      ),
    }
  }

  return { userId }
}
