// src/services/alertas.ts
import prisma from "@/lib/prisma";

export async function getAlertasData(userId: number, idCultivo: number) {
  // 1. Umbrales: Convertimos Decimal a Number obligatoriamente
  const umbralesRaw = await prisma.umbrales_config.findMany({
    where: { id_usuario: userId, id_cultivo: idCultivo },
    include: { tipo_metrica: true },
    orderBy: { id: 'asc' }
  });

  const umbrales = umbralesRaw.map(u => ({
    id: u.id,
    nombre: u.tipo_metrica?.nombre || 'Métrica',
    unidad: u.tipo_metrica?.unidad || '',
    min: u.valor_minimo ? Number(u.valor_minimo) : 0,
    max: u.valor_maximo ? Number(u.valor_maximo) : 0,
  }));

  // 2. Alertas Activas
  const alertasActivasRaw = await prisma.alertas.findMany({
    where: { 
      estado: { not: 'resuelta' }, 
      asignacion: { id_cultivo: idCultivo, id_usuario: userId } 
    },
    include: { tipo_alerta: true, tipo_metrica: true, asignacion: { include: { componente: { include: { tipo_componente: true } } } } },
    orderBy: { fecha: 'desc' }
  });

  const alertasActivas = alertasActivasRaw.map(a => ({
    id: a.id.toString(),
    titulo: a.tipo_alerta?.nombre || 'Alerta',
    mensaje: a.mensaje,
    valor: a.valor_detectado ? Number(a.valor_detectado) : null,
    unidad: a.tipo_metrica?.unidad || '',
    severidad: a.tipo_alerta?.severidad || 'info',
    sensor: a.asignacion?.componente?.tipo_componente?.nombre_modelo || 'Sistema'
  }));

  // 3. Historial (Resueltas)
  const historialRaw = await prisma.alertas.findMany({
    where: { 
      estado: 'resuelta', 
      asignacion: { id_cultivo: idCultivo, id_usuario: userId } 
    },
    take: 10,
    orderBy: { fecha: 'desc' },
    include: { tipo_alerta: true, tipo_metrica: true }
  });

  const historial = historialRaw.map(h => ({
    id: h.id.toString(),
    tipo: h.tipo_alerta?.nombre || 'Alerta',
    valor: h.valor_detectado ? Number(h.valor_detectado) : null,
    unidad: h.tipo_metrica?.unidad || '',
    estado: 'Resuelta',
    fecha: h.fecha.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit' })
  }));

  return { umbrales, alertasActivas, historial };
}