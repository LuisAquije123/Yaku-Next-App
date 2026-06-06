import { NextResponse } from 'next/server'
import { requireSession } from '@/lib/api/require-session'
import { getCultivosForUser } from '@/lib/dashboard/cultivos'
import type { DashboardApiError } from '@/types/dashboard-api'

/**
 * GET /api/dashboard/cultivos
 *
 * Cultivos del usuario autenticado (id_usuario).
 * Administradores ven todos los cultivos del sistema.
 */
export async function GET() {
  const session = await requireSession()
  if (session.error) return session.error

  try {
    const cultivos = await getCultivosForUser(session.userId)

    return NextResponse.json({
      success: true,
      data: cultivos,
    })
  } catch (error) {
    console.error('[GET /api/dashboard/cultivos]', error)
    return NextResponse.json<DashboardApiError>(
      { success: false, message: 'Error al listar cultivos.' },
      { status: 500 },
    )
  }
}
