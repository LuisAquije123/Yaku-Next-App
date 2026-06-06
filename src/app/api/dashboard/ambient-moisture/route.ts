import { NextRequest, NextResponse } from 'next/server'
import { requireSession } from '@/lib/api/require-session'
import { getAmbientMoistureForCultivo } from '@/lib/dashboard/ambient-moisture'
import type { DashboardApiError } from '@/types/dashboard-api'

interface AmbientMoistureResponse {
  success: boolean
  data?: {
    valor: number | null
    fecha_lectura: string
    sensor_nombre: string
    metric_name: string
    metric_unit: string
    min_threshold: number | null
    max_threshold: number | null
  }
  message?: string
}

/**
 * GET /api/dashboard/ambient-moisture?id_cultivo=1
 *
 * Devuelve el último registro de humedad ambiente para el cultivo especificado,
 * incluyendo nombre de métrica, unidad y umbrales de la planta.
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
    const lectura = await getAmbientMoistureForCultivo(idCultivo, session.userId)

    if (!lectura) {
      return NextResponse.json<AmbientMoistureResponse>(
        {
          success: false,
          message: 'No hay lecturas disponibles para este cultivo.',
        },
        { status: 404 },
      )
    }

    return NextResponse.json<AmbientMoistureResponse>({
      success: true,
      data: {
        valor: lectura.valor,
        fecha_lectura: lectura.fecha_lectura.toISOString(),
        sensor_nombre: lectura.sensor_nombre,
        metric_name: lectura.metric_name,
        metric_unit: lectura.metric_unit,
        min_threshold: lectura.min_threshold,
        max_threshold: lectura.max_threshold,
      },
    })
  } catch (error) {
    console.error('[GET /api/dashboard/ambient-moisture]', error)
    return NextResponse.json<DashboardApiError>(
      {
        success: false,
        message: 'Error al obtener la humedad ambiente.',
      },
      { status: 500 },
    )
  }
}
