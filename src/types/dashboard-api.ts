import type { SensorMetric } from '@/lib/dashboard/types'

export interface DashboardMetricasResponse {
  success: true
  data: {
    cultivo: {
      id: number
      nombre_planta: string
      id_dispositivo: number | null
      id_planta: number | null
    }
    metricas: SensorMetric[]
    actualizado_en: string
  }
}

export interface DashboardApiError {
  success: false
  message: string
}
