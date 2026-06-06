// src/actions/historico.ts
"use server";

import prisma from "@/lib/prisma";

export async function getDatosHistoricosMulti(userId: number, idCultivo: number, dias: number) {
  const fechaActual = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Lima' }));
  const fechaLimite = new Date(fechaActual);
  fechaLimite.setDate(fechaLimite.getDate() - dias);
  fechaLimite.setHours(0, 0, 0, 0);

  const cultivo = await prisma.cultivos.findFirst({
    where: { id: idCultivo, id_usuario: userId },
    include: {
      asignaciones_iot: {
        where: { activo: true },
        include: {
          componente: { include: { tipo_componente: true } }, 
          humedad_suelo: { where: { valido: true, fecha: { gte: fechaLimite } } },
          humedad_ambiente: { where: { valido: true, fecha: { gte: fechaLimite } } },
          temperatura_suelo: { where: { valido: true, fecha: { gte: fechaLimite } } },
          temperatura_ambiente: { where: { valido: true, fecha: { gte: fechaLimite } } },
          riego: { where: { estado: true, fecha: { gte: fechaLimite } } }
        }
      }
    }
  });

  if (!cultivo) return { chartData: [], stats: null };

  const dataPorDia = new Map();

  for (let i = 0; i <= dias; i++) {
    const d = new Date(fechaLimite);
    d.setDate(d.getDate() + i);
    const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const label = d.toLocaleDateString('es-PE', { month: 'short', day: 'numeric' });
    
    dataPorDia.set(dateKey, { label, hs: [], ha: [], ts: [], ta: [], riegos: 0 });
  }

  const getLimaDateKey = (fechaUTC: Date) => {
    const d = new Date(fechaUTC.toLocaleString('en-US', { timeZone: 'America/Lima' }));
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  // Acumuladores para extraer las estadísticas globales
  const statsRaw = {
    hs: { min: Infinity, max: -Infinity, sum: 0, count: 0, model: 'No asignado' },
    ha: { min: Infinity, max: -Infinity, sum: 0, count: 0, model: 'No asignado' },
    ts: { min: Infinity, max: -Infinity, sum: 0, count: 0, model: 'No asignado' },
    ta: { min: Infinity, max: -Infinity, sum: 0, count: 0, model: 'No asignado' },
  };

  cultivo.asignaciones_iot.forEach(asig => {
    const rawModel = asig.componente?.tipo_componente?.nombre_modelo || 'Desconocido';
    
    // Limpiamos un poco el nombre para que encaje mejor en la tabla
    const cleanModel = rawModel.replace('Higrómetro ', '').replace('Termómetro ', '').replace(' Capacitivo', '');

    if (asig.humedad_suelo.length > 0) statsRaw.hs.model = cleanModel;
    if (asig.humedad_ambiente.length > 0) statsRaw.ha.model = cleanModel.replace(' (Humedad)', '');
    if (asig.temperatura_suelo.length > 0) statsRaw.ts.model = cleanModel.replace(' Suelo', '');
    if (asig.temperatura_ambiente.length > 0) statsRaw.ta.model = cleanModel.replace(' (Temperatura)', '');

    // Procesamos cada lectura de telemetría
    asig.humedad_suelo.forEach(l => {
      const val = Number(l.ema || l.valor);
      const key = getLimaDateKey(l.fecha);
      if (dataPorDia.has(key)) dataPorDia.get(key).hs.push(val);
      
      if (val < statsRaw.hs.min) statsRaw.hs.min = val;
      if (val > statsRaw.hs.max) statsRaw.hs.max = val;
      statsRaw.hs.sum += val;
      statsRaw.hs.count++;
    });

    asig.humedad_ambiente.forEach(l => {
      const val = Number(l.ema || l.valor);
      const key = getLimaDateKey(l.fecha);
      if (dataPorDia.has(key)) dataPorDia.get(key).ha.push(val);
      
      if (val < statsRaw.ha.min) statsRaw.ha.min = val;
      if (val > statsRaw.ha.max) statsRaw.ha.max = val;
      statsRaw.ha.sum += val;
      statsRaw.ha.count++;
    });

    asig.temperatura_suelo.forEach(l => {
      const val = Number(l.ema || l.temperatura || l.valor);
      const key = getLimaDateKey(l.fecha);
      if (dataPorDia.has(key)) dataPorDia.get(key).ts.push(val);
      
      if (val < statsRaw.ts.min) statsRaw.ts.min = val;
      if (val > statsRaw.ts.max) statsRaw.ts.max = val;
      statsRaw.ts.sum += val;
      statsRaw.ts.count++;
    });

    asig.temperatura_ambiente.forEach(l => {
      const val = Number(l.ema || l.temperatura || l.valor);
      const key = getLimaDateKey(l.fecha);
      if (dataPorDia.has(key)) dataPorDia.get(key).ta.push(val);
      
      if (val < statsRaw.ta.min) statsRaw.ta.min = val;
      if (val > statsRaw.ta.max) statsRaw.ta.max = val;
      statsRaw.ta.sum += val;
      statsRaw.ta.count++;
    });

    asig.riego.forEach(r => {
      const key = getLimaDateKey(r.fecha);
      if (dataPorDia.has(key)) dataPorDia.get(key).riegos++;
    });
  });

  const chartData = Array.from(dataPorDia.values()).map(d => ({
    label: d.label,
    humedadSuelo: d.hs.length ? Number((d.hs.reduce((a: number, b: number) => a + b, 0) / d.hs.length).toFixed(1)) : null,
    humedadAmbiente: d.ha.length ? Number((d.ha.reduce((a: number, b: number) => a + b, 0) / d.ha.length).toFixed(1)) : null,
    temperaturaSuelo: d.ts.length ? Number((d.ts.reduce((a: number, b: number) => a + b, 0) / d.ts.length).toFixed(1)) : null,
    temperaturaAmbiente: d.ta.length ? Number((d.ta.reduce((a: number, b: number) => a + b, 0) / d.ta.length).toFixed(1)) : null,
    riegos: d.riegos > 0 ? d.riegos : null
  }));

  const formatStat = (raw: any) => ({
    sensor: raw.model,
    min: raw.count > 0 ? Number(raw.min.toFixed(1)) : null,
    prom: raw.count > 0 ? Number((raw.sum / raw.count).toFixed(1)) : null,
    max: raw.count > 0 ? Number(raw.max.toFixed(1)) : null,
  });

  const stats = {
    humedadSuelo: formatStat(statsRaw.hs),
    humedadAmbiente: formatStat(statsRaw.ha),
    temperaturaAmbiente: formatStat(statsRaw.ta),
    temperaturaSuelo: formatStat(statsRaw.ts),
  };

  return { chartData, stats };
}