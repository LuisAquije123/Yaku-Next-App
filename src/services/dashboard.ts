// src/services/dashboard.ts
import prisma from "@/lib/prisma";

export async function getDashboardData(userId: number) {
  const fechaActual = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Lima' }));
  const fechaLimite7d = new Date(fechaActual);
  fechaLimite7d.setDate(fechaLimite7d.getDate() - 7); // Historial de 7 días exactos para el gráfico

  const fechaLimiteConsumo = new Date(fechaActual);
  fechaLimiteConsumo.setDate(fechaLimiteConsumo.getDate() - 6);
  fechaLimiteConsumo.setHours(0, 0, 0, 0);

  const cultivos = await prisma.cultivos.findMany({
    where: {
      id_usuario: userId,
      estado: "activo",
    },
    include: {
      planta: { include: { umbrales_planta: true } },
      fuente_agua: true,
      configuracion_control: true,
      umbrales_config: { include: { tipo_metrica: true } },
      asignaciones_iot: {
        where: { activo: true },
        include: {
          dispositivo: { include: { tipo: true } },
          componente: { include: { tipo_componente: { include: { tipo_metrica: true } } } },
          // MODIFICADO: Traemos los últimos 7 días de lecturas para el gráfico
          humedad_suelo: { where: { valido: true, fecha: { gte: fechaLimite7d } }, orderBy: { fecha: "desc" } },
          humedad_ambiente: { where: { valido: true, fecha: { gte: fechaLimite7d } }, orderBy: { fecha: "desc" } },
          temperatura_suelo: { where: { valido: true, fecha: { gte: fechaLimite7d } }, orderBy: { fecha: "desc" } },
          temperatura_ambiente: { where: { valido: true, fecha: { gte: fechaLimite7d } }, orderBy: { fecha: "desc" } },
          configuracion_tanque: true,
          telemetria_tanque: { orderBy: { fecha: "desc" }, take: 1 },
          riego: {
            where: { fecha: { gte: fechaLimiteConsumo }, estado: true },
            select: { fecha: true, cantidad_agua_litros: true }
          }
        },
      },
    },
  });

  return cultivos.map((cultivo) => {
    const inicioDeHoy = new Date(fechaActual);
    inicioDeHoy.setHours(0, 0, 0, 0);

    const umbrales = cultivo.planta?.umbrales_planta || [];
    const umbralAgua = cultivo.umbrales_config.find((u) => u.tipo_metrica?.codigo === 'NIVEL_AGUA');
    const limiteConsumo = umbralAgua?.valor_maximo ? Number(umbralAgua.valor_maximo) : null;

    const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const consumoSemanalMap = new Map();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(fechaActual);
      d.setDate(d.getDate() - i);
      const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      
      consumoSemanalMap.set(dateKey, { label: i === 0 ? 'Hoy' : diasSemana[d.getDay()], valor: 0 });
    }

    let riegosHoy = 0;
    let litrosHoy = 0;
    let ultimoRiegoFecha: Date | null = null;

    cultivo.asignaciones_iot.forEach((asignacion) => {
      asignacion.riego.forEach((evento) => {
        const fechaRiego = new Date(evento.fecha.toLocaleString('en-US', { timeZone: 'America/Lima' }));
        const dateKey = `${fechaRiego.getFullYear()}-${String(fechaRiego.getMonth() + 1).padStart(2, '0')}-${String(fechaRiego.getDate()).padStart(2, '0')}`;

        if (consumoSemanalMap.has(dateKey) && evento.cantidad_agua_litros) {
          consumoSemanalMap.get(dateKey).valor += Number(evento.cantidad_agua_litros);
        }

        if (!ultimoRiegoFecha || fechaRiego > ultimoRiegoFecha) ultimoRiegoFecha = fechaRiego;
        
        if (fechaRiego >= inicioDeHoy) {
          riegosHoy++;
          if (evento.cantidad_agua_litros) litrosHoy += Number(evento.cantidad_agua_litros);
        }
      });
    });

    const consumoSemanal = Array.from(consumoSemanalMap.values()).map(d => ({
      label: d.label, valor: Number(d.valor.toFixed(1))
    }));

    const asignacionTanque = cultivo.asignaciones_iot.find((a) => a.telemetria_tanque.length > 0);
    const ultimaTelemetria = asignacionTanque?.telemetria_tanque[0] || null;
    const capacidadMaxima = cultivo.fuente_agua?.capacidad_litros ? Number(cultivo.fuente_agua.capacidad_litros) : 0;
    const porcentajeNivel = ultimaTelemetria?.porcentaje_nivel ? Number(ultimaTelemetria.porcentaje_nivel) : 0;
    const litrosActuales = (porcentajeNivel / 100) * capacidadMaxima;
    const timeoutMinutos = cultivo.configuracion_control.length > 0 ? Math.floor(cultivo.configuracion_control[0].duracion_riego_max_seg / 60) : 10;

    const dispositivosMap = new Map();
    cultivo.asignaciones_iot.forEach((asignacion) => {
      if (asignacion.dispositivo && !dispositivosMap.has(asignacion.dispositivo.id)) {
        dispositivosMap.set(asignacion.dispositivo.id, {
          id: asignacion.dispositivo.id, nombre: asignacion.dispositivo.tipo.nombre, estado: asignacion.dispositivo.estado, 
        });
      }
    });

    const tanqueData = asignacionTanque || cultivo.fuente_agua ? {
      idTelemetria: ultimaTelemetria?.id ? ultimaTelemetria.id.toString() : null,
      nombre: cultivo.fuente_agua?.nombre || "Depósito de agua",
      litrosActuales: Number(litrosActuales.toFixed(1)),
      litrosTotales: capacidadMaxima,
      porcentaje: porcentajeNivel,
      sensorModelo: asignacionTanque?.componente?.tipo_componente?.nombre_modelo || "Desconocido",
      estadoNivel: ultimaTelemetria?.estado_nivel || "Desconocido",
      bombaEncendida: ultimaTelemetria?.bomba_encendida || false,
      timeoutMinutos: timeoutMinutos,
    } : null;

    // Función para mapear el último dato del sensor (tarjetas)
    const mapearSensorUltimo = (asignacion: any, tablaLectura: string) => {
      if (!asignacion || asignacion[tablaLectura].length === 0) return null;
      const lectura = asignacion[tablaLectura][0]; // Sigue tomando el [0] que es el más reciente
      const tipoComp = asignacion.componente?.tipo_componente;
      const tipoMetrica = tipoComp?.tipo_metrica;
      const umbral = umbrales.find((u) => u.id_tipo_metrica === tipoComp?.id_tipo_metrica);

      return {
        modelo: tipoComp?.nombre_modelo || "Desconocido",
        metrica: tipoMetrica?.nombre || "Sensor",
        unidad: tipoMetrica?.unidad || "",
        valor: Number(lectura.valor),
        porcentaje: lectura.porcentaje ? Number(lectura.porcentaje) : null,
        ema: lectura.ema ? Number(lectura.ema) : null,
        fecha: lectura.fecha,
        umbral: umbral ? { min: Number(umbral.valor_minimo), max: Number(umbral.valor_maximo) } : null,
      };
    };

    // NUEVO: Función para formatear todo el arreglo histórico del sensor para el gráfico
    const mapearHistorial = (asignacion: any, tablaLectura: string) => {
      if (!asignacion || asignacion[tablaLectura].length === 0) return [];
      // Lo invertimos porque Prisma lo trajo 'desc' (más nuevo primero) y el gráfico lo necesita cronológico (izq a der)
      return [...asignacion[tablaLectura]].reverse().map((l: any) => ({
        fecha: l.fecha.toISOString(), // Enviamos ISO string para evitar warnings en el Server Component
        valor: Number(l.valor)
      }));
    };

    const asigHS = cultivo.asignaciones_iot.find((a) => a.humedad_suelo.length > 0);
    const asigHA = cultivo.asignaciones_iot.find((a) => a.humedad_ambiente.length > 0);
    const asigTS = cultivo.asignaciones_iot.find((a) => a.temperatura_suelo.length > 0);
    const asigTA = cultivo.asignaciones_iot.find((a) => a.temperatura_ambiente.length > 0);

    const sensoresData = {
      humedadSuelo: mapearSensorUltimo(asigHS, "humedad_suelo"),
      humedadAmbiente: mapearSensorUltimo(asigHA, "humedad_ambiente"),
      temperaturaSuelo: mapearSensorUltimo(asigTS, "temperatura_suelo"),
      temperaturaAmbiente: mapearSensorUltimo(asigTA, "temperatura_ambiente"),
    };

    const historialData = {
      humedadSuelo: mapearHistorial(asigHS, "humedad_suelo"),
      humedadAmbiente: mapearHistorial(asigHA, "humedad_ambiente"),
      temperaturaSuelo: mapearHistorial(asigTS, "temperatura_suelo"),
      temperaturaAmbiente: mapearHistorial(asigTA, "temperatura_ambiente"),
    };

    const resumenDia = {
      riegosHoy,
      litrosHoy: Number(litrosHoy.toFixed(1)),
      ultimoRiego: ultimoRiegoFecha,
      humedadSueloProm: sensoresData.humedadSuelo?.ema ?? sensoresData.humedadSuelo?.porcentaje ?? null,
      humedadAmbiental: sensoresData.humedadAmbiente?.ema ?? sensoresData.humedadAmbiente?.porcentaje ?? null,
    };

    return {
      idCultivo: cultivo.id,
      tanque: tanqueData,
      nombreCultivo: cultivo.nombre_planta,
      conceptoPlanta: cultivo.planta?.nombre || "Desconocido",
      etapaCrecimiento: cultivo.etapa_crecimiento,
      consumoSemanal: consumoSemanal,
      limiteConsumo: limiteConsumo, 
      sensores: sensoresData,
      historialSensores: historialData, // NUEVO: Data completa para Recharts
      dispositivos: Array.from(dispositivosMap.values()),
      resumenDia: resumenDia,
    };
  });
}