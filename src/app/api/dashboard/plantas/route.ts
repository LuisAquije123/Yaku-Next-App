import { NextRequest, NextResponse } from 'next/server'
import { requireSession } from '@/lib/api/require-session'
import { getPlantasForCultivo } from '@/lib/dashboard/plantas'
import type { DashboardApiError } from '@/types/dashboard-api'

/**
 * GET /api/dashboard/plantas?id_cultivo=1
 *
 * Planta vinculada al cultivo (cultivos.id_planta → plantas).
 * Solo cultivos accesibles por el usuario autenticado.
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
    const plantas = await getPlantasForCultivo(idCultivo, session.userId)

    return NextResponse.json({
      success: true,
      data: plantas,
    })
  } catch (error) {
    console.error('[GET /api/dashboard/plantas]', error)
    return NextResponse.json<DashboardApiError>(
      { success: false, message: 'Error al obtener plantas del cultivo.' },
      { status: 500 },
    )
  }
}
