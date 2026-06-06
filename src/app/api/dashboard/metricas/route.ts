import { NextRequest, NextResponse } from 'next/server'
import { requireSession } from '@/lib/api/require-session'
import { getDashboardMetricas } from '@/lib/dashboard/metrics-service'
import type { DashboardApiError, DashboardMetricasResponse } from '@/types/dashboard-api'

/**
 * GET /api/dashboard/metricas?id_cultivo=1
 *
 * Devuelve las 4 métricas del dashboard (humedad suelo/ambiente,
 * temperatura ambiente/suelo) con umbrales y tendencia vs hace 1h.
 * Requiere sesión activa (NextAuth).
 */
export async function GET(request: NextRequest) {
  const session = await requireSession()
  if (session.error) return session.error

  const idCultivoParam = request.nextUrl.searchParams.get('id_cultivo')

  if (!idCultivoParam) {
    return NextResponse.json<DashboardApiError>(
      {
        success: false,
        message: 'El parámetro id_cultivo es obligatorio.',
      },
      { status: 400 },
    )
  }

  const idCultivo = parseInt(idCultivoParam, 10)

  if (Number.isNaN(idCultivo)) {
    return NextResponse.json<DashboardApiError>(
      {
        success: false,
        message: 'id_cultivo debe ser un número válido.',
      },
      { status: 400 },
    )
  }

  try {
    const result = await getDashboardMetricas(idCultivo, session.userId)

    if ('error' in result) {
      const messages = {
        cultivo_not_found: {
          message: 'Cultivo no encontrado.',
          status: 404,
        },
        forbidden: {
          message: 'No tienes permiso para ver este cultivo.',
          status: 403,
        },
        not_found: {
          message: 'Usuario no encontrado.',
          status: 404,
        },
      } as const

      const mapped = messages[result.error]

      return NextResponse.json<DashboardApiError>(
        { success: false, message: mapped.message },
        { status: mapped.status },
      )
    }

    return NextResponse.json<DashboardMetricasResponse>({
      success: true,
      data: {
        cultivo: result.cultivo,
        metricas: result.metricas,
        actualizado_en: result.actualizado_en,
      },
    })
  } catch (error) {
    console.error('[GET /api/dashboard/metricas]', error)
    return NextResponse.json<DashboardApiError>(
      {
        success: false,
        message: 'Error interno al obtener las métricas.',
      },
      { status: 500 },
    )
  }
}
