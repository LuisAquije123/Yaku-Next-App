import { Prisma } from "@/generated/prisma/client";
import prisma from "../src/lib/prisma";

async function main() {
  console.log('Iniciando el proceso de seed para YAKU V4.0...');

  // =========================================================
  // 0. LIMPIEZA DE DATOS (TRUNCATE)
  // =========================================================
  console.log('Limpiando base de datos...');
  await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE logs_sistema, notificaciones, configuracion_notificaciones, alertas, tipos_alerta, 
    riego, programacion_riego, plantillas_riego, predicciones_ml, usuario_modelo, historial_modelos, modelos_ml, 
    configuracion_control, umbrales_config, lecturas_bateria, telemetria_tanque, 
    temperatura_suelo, temperatura_ambiente, humedad_ambiente, humedad_suelo, 
    configuracion_tanque, asignaciones_iot, cultivos, umbrales_planta, plantas, 
    fuentes_agua, componentes, tipos_componente, tipos_metrica, 
    dispositivos, tipos_dispositivo, usuarios, roles, reporte_consumo_agua,
    distritos, provincias, regiones RESTART IDENTITY CASCADE;
  `);

  // =========================================================
  // 1. ROLES Y USUARIOS
  // =========================================================
  console.log('Insertando Roles y Usuarios...');
  await prisma.roles.createMany({
    data: [
      { id: 1, nombre: 'administrador', descripcion: 'Administrador global del sistema. Configura hardware, sensores y asigna agricultores.' },
      { id: 2, nombre: 'agricultor', descripcion: 'Usuario final del campo. Gestiona sus cultivos, configura umbrales y activa/pausa el riego.' },
    ],
  });

  await prisma.usuarios.createMany({
    data: [
      { id: 1, nombre: 'Carlos', apellido: 'Admin', correo: 'admin@yaku.com', contrasena: 'PBKDF2$PBKDF2WithHmacSHA256$310000$5um+93ZO/e7qS+wt5oSCdA==$5lgT69u+elGZWR+Oh+M37B8tlyatE8oJYlV95DaaTiI=', id_rol: 1, telefono: '+51999888777', zona_horaria: 'America/Lima', verificado: true, estado: true },
      { id: 2, nombre: 'Juan', apellido: 'Perez', correo: 'juan.perez@yaku.com', contrasena: 'PBKDF2$PBKDF2WithHmacSHA256$310000$5um+93ZO/e7qS+wt5oSCdA==$5lgT69u+elGZWR+Oh+M37B8tlyatE8oJYlV95DaaTiI=', id_rol: 2, telefono: '+51987654321', zona_horaria: 'America/Lima', verificado: true, estado: true },
    ],
  });

  // =========================================================
  // 3. HARDWARE: TIPOS Y DISPOSITIVOS
  // =========================================================
  await prisma.tipos_dispositivo.createMany({
    data: [
      { id: 1, nombre: 'ESP32-S3 (Módulo Colector)', descripcion: 'Microcontrolador recolector de telemetría de suelo y ambiente.' },
      { id: 2, nombre: 'ESP32 (Actuador y Nivel)', descripcion: 'Microcontrolador encargado del control de bomba y sensor ultrasónico.' },
    ],
  });

  await prisma.dispositivos.createMany({
    data: [
      { id: 1, id_tipo: 1, nombre: 'Dispositivo Suelo & Clima A', mac_address: 'AA:BB:CC:DD:EE:01', client_id_mqtt: 'ESP32_Yaku_001', topic_pub: 'yaku/riego/datos', topic_sub: 'yaku/valvula/comando', ubicacion: 'Invernadero Tomate 1', estado: 'activo', funcionamiento_activo: true },
      { id: 2, id_tipo: 2, nombre: 'Controlador Bomba Tanque 1', mac_address: 'AA:BB:CC:DD:EE:02', client_id_mqtt: 'ESP32_Yaku_002', topic_pub: 'yaku/tanque/datos', topic_sub: 'yaku/riego/comando', ubicacion: 'Estación de Bombeo Principal', estado: 'activo', funcionamiento_activo: true },
      { id: 3, id_tipo: 2, nombre: 'Controlador Riego Jardín Exterior', mac_address: 'AA:BB:CC:DD:EE:03', client_id_mqtt: 'ESP32_Yaku_003', topic_pub: 'yaku/status', topic_sub: 'yaku/valvula/jardin', ubicacion: 'Jardín Lateral', estado: 'activo', funcionamiento_activo: true },
    ],
  });

  // =========================================================
  // 4. CATÁLOGO DE MÉTRICAS Y COMPONENTES
  // =========================================================
  await prisma.tipos_metrica.createMany({
    data: [
      { id: 1, codigo: 'HUM_SUELO', nombre: 'Humedad de Suelo', unidad: '%', descripcion: 'Porcentaje de humedad en la zona radicular.' },
      { id: 2, codigo: 'HUM_AMB', nombre: 'Humedad Ambiente', unidad: '%', descripcion: 'Humedad relativa del aire circundante.' },
      { id: 3, codigo: 'TEMP_AMB', nombre: 'Temperatura Ambiente', unidad: '°C', descripcion: 'Temperatura ambiente del aire.' },
      { id: 4, codigo: 'TEMP_SUELO', nombre: 'Temperatura de Suelo', unidad: '°C', descripcion: 'Temperatura del suelo medida por sensor DS18B20.' },
      { id: 5, codigo: 'NIVEL_AGUA', nombre: 'Nivel de Tanque', unidad: '%', descripcion: 'Porcentaje de volumen de agua en el reservorio.' },
      { id: 6, codigo: 'BAT_PCT', nombre: 'Nivel de Batería', unidad: '%', descripcion: 'Carga restante de batería en porcentaje.' },
    ],
  });

  await prisma.tipos_componente.createMany({
    data: [
      { id: 1, nombre_modelo: 'Higrómetro Capacitivo Suelo', categoria: 'sensor', id_tipo_metrica: 1, descripcion: 'Sensor de humedad de suelo capacitivo anti-corrosivo.' },
      { id: 2, nombre_modelo: 'Higrómetro DHT22 (Humedad)', categoria: 'sensor', id_tipo_metrica: 2, descripcion: 'Sensor de humedad relativa ambiental DHT22.' },
      { id: 3, nombre_modelo: 'Termómetro DHT22 (Temperatura)', categoria: 'sensor', id_tipo_metrica: 3, descripcion: 'Sensor de temperatura ambiental DHT22.' },
      { id: 4, nombre_modelo: 'Termómetro DS18B20 Suelo', categoria: 'sensor', id_tipo_metrica: 4, descripcion: 'Termómetro de varilla de suelo DS18B20.' },
      { id: 5, nombre_modelo: 'Sensor Ultrasónico HC-SR04', categoria: 'sensor', id_tipo_metrica: 5, descripcion: 'Sensor ultrasónico de distancia para tanques.' },
      { id: 6, nombre_modelo: 'Módulo de Relé 5V', categoria: 'actuador', id_tipo_metrica: null, descripcion: 'Módulo de relé electromagnético para bombas o solenoides.' },
      { id: 7, nombre_modelo: 'Módulo de Batería LiPo 18650', categoria: 'bateria', id_tipo_metrica: 6, descripcion: 'Módulo de alimentación y monitoreo por batería LiPo.' },
    ],
  });

  await prisma.componentes.createMany({
    data: [
      { id: 1, id_tipo_componente: 1, numero_serie: 'SN_HUM_001', estado: 'activo' },
      { id: 2, id_tipo_componente: 2, numero_serie: 'SN_DHT_001', estado: 'activo' },
      { id: 3, id_tipo_componente: 3, numero_serie: 'SN_DHT_002', estado: 'activo' },
      { id: 4, id_tipo_componente: 4, numero_serie: 'SN_TEMP_001', estado: 'activo' },
      { id: 5, id_tipo_componente: 5, numero_serie: 'SN_ULTRA_001', estado: 'activo' },
      { id: 6, id_tipo_componente: 6, numero_serie: 'SN_RELE_001', estado: 'activo' },
      { id: 7, id_tipo_componente: 7, numero_serie: 'SN_BAT_001', estado: 'activo' },
      { id: 8, id_tipo_componente: 7, numero_serie: 'SN_BAT_002', estado: 'activo' },
      { id: 9, id_tipo_componente: 6, numero_serie: 'SN_RELE_002', estado: 'activo' },
    ],
  });

  // =========================================================
  // 6. FUENTES DE AGUA Y CULTIVOS
  // =========================================================
  await prisma.fuentes_agua.createMany({
    data: [
      { id: 1, id_usuario: 2, nombre: 'Tanque Principal Invernadero 1', tipo: 'tanque', capacidad_litros: 1100.00, altura_tanque_cm: 140.00, altura_seguridad_cm: 120.00 },
      { id: 2, id_usuario: 2, nombre: 'Grifo Directo Manguera', tipo: 'manguera', capacidad_litros: null, altura_tanque_cm: null, altura_seguridad_cm: null },
    ],
  });

  await prisma.plantas.createMany({
    data: [
      { id: 1, nombre: 'Tomate Cherry', tipo: 'Hortaliza', descripcion: 'Requiere humedad estable de suelo entre 40-70% y temperaturas entre 18-30°C.' },
      { id: 2, nombre: 'Lechuga Orgánica', tipo: 'Hortaliza', descripcion: 'Planta de hoja verde con raíces superficiales. Sensible al estrés hídrico.' },
    ],
  });

  await prisma.umbrales_planta.createMany({
    data: [
      { id: 1, id_planta: 1, id_tipo_metrica: 1, valor_minimo: 40.00, valor_maximo: 70.00 },
      { id: 2, id_planta: 1, id_tipo_metrica: 3, valor_minimo: 15.00, valor_maximo: 32.00 },
      { id: 3, id_planta: 2, id_tipo_metrica: 1, valor_minimo: 50.00, valor_maximo: 80.00 },
    ],
  });

  await prisma.regiones.createMany({
    data: [{ id: 1, nombre: 'Lima' }, { id: 2, nombre: 'Arequipa' }, { id: 3, nombre: 'La Libertad' }],
  });

  await prisma.provincias.createMany({
    data: [
      { id: 1, id_region: 1, nombre: 'Lima' },
      { id: 2, id_region: 2, nombre: 'Caylloma' },
      { id: 3, id_region: 2, nombre: 'Arequipa' },
      { id: 4, id_region: 3, nombre: 'Trujillo' },
    ],
  });

  await prisma.distritos.createMany({
    data: [
      { id: 1, id_provincia: 1, nombre: 'Santiago de Surco' },
      { id: 2, id_provincia: 1, nombre: 'Miraflores' },
      { id: 3, id_provincia: 2, nombre: 'Majes' },
      { id: 4, id_provincia: 3, nombre: 'Arequipa' },
      { id: 5, id_provincia: 4, nombre: 'Laredo' },
    ],
  });

  await prisma.cultivos.createMany({
    data: [
      { id: 1, id_usuario: 2, id_planta: 1, id_fuente_agua: 1, id_distrito: 3, lugar: 'Parcela 45, Sector B', nombre_planta: 'Invernadero Tomate Cherry', etapa_crecimiento: 'Fructificación', area_m2: 50.00, fecha_siembra: new Date('2026-03-01T00:00:00Z'), estado: 'activo' },
      { id: 2, id_usuario: 2, id_planta: 2, id_fuente_agua: 2, id_distrito: 1, lugar: 'Sector Alto, Invernadero 2', nombre_planta: 'Jardín Lechugas Hidropónicas', etapa_crecimiento: 'Crecimiento', area_m2: 20.00, fecha_siembra: new Date('2026-04-15T00:00:00Z'), estado: 'activo' },
    ],
  });

  // =========================================================
  // 8. ASIGNACIONES IOT Y CONFIG TANQUE
  // =========================================================
  console.log('Insertando Asignaciones IoT y Telemetría...');
  await prisma.asignaciones_iot.createMany({
    data: [
      { id: 1, id_usuario: 2, id_dispositivo: 1, id_componente: 1, id_fuente_agua: null, id_cultivo: 1, pin_gpio: 17, activo: true },
      { id: 2, id_usuario: 2, id_dispositivo: 1, id_componente: 2, id_fuente_agua: null, id_cultivo: 1, pin_gpio: 15, activo: true },
      { id: 3, id_usuario: 2, id_dispositivo: 1, id_componente: 3, id_fuente_agua: null, id_cultivo: 1, pin_gpio: 15, activo: true },
      { id: 4, id_usuario: 2, id_dispositivo: 1, id_componente: 4, id_fuente_agua: null, id_cultivo: 1, pin_gpio: 16, activo: true },
      { id: 5, id_usuario: 2, id_dispositivo: 1, id_componente: 7, id_fuente_agua: null, id_cultivo: 1, pin_gpio: 34, activo: true },
      { id: 6, id_usuario: 2, id_dispositivo: 2, id_componente: 5, id_fuente_agua: 1, id_cultivo: null, pin_gpio: 26, activo: true },
      { id: 7, id_usuario: 2, id_dispositivo: 2, id_componente: 6, id_fuente_agua: 1, id_cultivo: 1, pin_gpio: 23, activo: true },
      { id: 8, id_usuario: 2, id_dispositivo: 2, id_componente: 8, id_fuente_agua: null, id_cultivo: null, pin_gpio: 34, activo: true },
      { id: 9, id_usuario: 2, id_dispositivo: 3, id_componente: 9, id_fuente_agua: 2, id_cultivo: 2, pin_gpio: 23, activo: true },
    ],
  });

  await prisma.configuracion_tanque.createMany({
    data: [
      { id_asignacion: 7, valvula_abierta: false, bomba_encendida: true }, // Se actualiza directo al estado del UPDATE SQL
      { id_asignacion: 9, valvula_abierta: false, bomba_encendida: false },
    ],
  });

  await prisma.umbrales_config.createMany({
    data: [
      { id: 1, id_usuario: 2, id_cultivo: 1, id_tipo_metrica: 1, valor_minimo: 45.00, valor_maximo: 75.00 },
      { id: 2, id_usuario: 2, id_cultivo: 1, id_tipo_metrica: 3, valor_minimo: 16.00, valor_maximo: 35.00 },
      { id: 3, id_usuario: 2, id_cultivo: 1, id_tipo_metrica: 5, valor_minimo: 20.00, valor_maximo: 100.00 },
    ],
  });

  await prisma.configuracion_control.createMany({
    data: [
      { id: 1, id_usuario: 2, id_cultivo: 1, duracion_riego_max_seg: 600, confianza_ml_minima: 0.75 },
      { id: 2, id_usuario: 2, id_cultivo: 2, duracion_riego_max_seg: 300, confianza_ml_minima: 0.70 },
    ],
  });

  // =========================================================
  // 10. MODELOS ML Y PREDICCIONES
  // =========================================================
  await prisma.modelos_ml.createMany({
    data: [
      { id: 1, nombre_modelo: 'Random Forest Regresor Riego', algoritmo: 'RandomForest', descripcion: 'Modelo predictivo entrenado con históricos climáticos locales.', ruta_archivo: 'modelo_riego_rf.joblib', precision_modelo: 91.50, precision_score: 0.9150, recall_score: 0.8920, f1_score: 0.9030, version: '2.1.0', es_default: true, estado: 'activo', creado_por: 1, fecha_entrenamiento: new Date('2026-05-01T10:00:00Z') },
      { id: 2, nombre_modelo: 'XGBoost Clasificador Riego', algoritmo: 'XGBoost', descripcion: 'Modelo predictivo de alta velocidad y precisión para bomba.', ruta_archivo: 'modelo_riego_xgb.joblib', precision_modelo: 93.20, precision_score: 0.9320, recall_score: 0.9210, f1_score: 0.9260, version: '1.0.0', es_default: false, estado: 'activo', creado_por: 1, fecha_entrenamiento: new Date('2026-05-15T14:30:00Z') },
    ],
  });

  await prisma.usuario_modelo.createMany({
    data: [ { id: 1, id_usuario: 2, id_modelo: 1, activo: true } ],
  });

  await prisma.historial_modelos.createMany({
    data: [
      { id: 1, id_usuario: 2, id_modelo: 1, accion: 'activado', descripcion: 'Se configuró Random Forest Regresor Riego como modelo activo del usuario.', fecha: new Date('2026-05-01T10:00:00Z') },
      { id: 2, id_usuario: 2, id_modelo: 2, accion: 'desactivado', descripcion: 'Se desactivó XGBoost Clasificador Riego tras el cambio de modelo.', fecha: new Date('2026-05-15T14:30:00Z') },
    ],
  });

  // =========================================================
  // 11. HISTORIAL DE LECTURAS (Sensores)
  // =========================================================
  await prisma.humedad_suelo.createMany({
    data: [
      { id_asignacion: 1, valor: 46.20, porcentaje: 46.20, ema: 47.10, desviacion: 0.12, valido: true },
      { id_asignacion: 1, valor: 45.80, porcentaje: 45.80, ema: 46.80, desviacion: 0.10, valido: true },
      { id_asignacion: 1, valor: 45.10, porcentaje: 45.10, ema: 46.20, desviacion: 0.15, valido: true },
    ],
  });

  await prisma.humedad_ambiente.createMany({
    data: [
      { id_asignacion: 2, valor: 60.50, porcentaje: 60.50, ema: 61.20, desviacion: 0.45, valido: true },
      { id_asignacion: 2, valor: 59.80, porcentaje: 59.80, ema: 60.60, desviacion: 0.38, valido: true },
    ],
  });

  await prisma.temperatura_ambiente.createMany({
    data: [
      { id_asignacion: 3, valor: 24.30, temperatura: 24.30, ema: 24.10, desviacion: 0.22, valido: true },
      { id_asignacion: 3, valor: 24.70, temperatura: 24.70, ema: 24.30, desviacion: 0.19, valido: true },
    ],
  });

  await prisma.temperatura_suelo.createMany({
    data: [
      { id_asignacion: 4, valor: 20.10, temperatura: 20.10, ema: 19.95, desviacion: 0.05, valido: true },
      { id_asignacion: 4, valor: 20.30, temperatura: 20.30, ema: 20.10, desviacion: 0.04, valido: true },
    ],
  });

  await prisma.lecturas_bateria.createMany({
    data: [
      { id_asignacion: 5, porcentaje: 95.00, voltaje: 4.12 },
      { id_asignacion: 5, porcentaje: 92.50, voltaje: 4.08 },
      { id_asignacion: 8, porcentaje: 88.00, voltaje: 3.98 },
    ],
  });

  await prisma.telemetria_tanque.createMany({
    data: [
      { id_asignacion: 6, distancia_cm: 45.00, nivel_agua_cm: 95.00, porcentaje_nivel: 67.85, estado_nivel: 'optimo', valvula_abierta: false, bomba_encendida: false, fuente_control: 'automatico' },
      { id_asignacion: 6, distancia_cm: 48.00, nivel_agua_cm: 92.00, porcentaje_nivel: 65.71, estado_nivel: 'optimo', valvula_abierta: false, bomba_encendida: true, fuente_control: 'automatico' },
    ],
  });

  // =========================================================
  // 12. PREDICCIONES Y RIEGOS
  // =========================================================
  await prisma.predicciones_ml.createMany({
    data: [
      { id: BigInt(1), id_usuario: 2, id_modelo: 1, id_cultivo: 1, variables_entrada: { humedad_suelo: 45.10, humedad_ambiente: 59.80, temperatura_ambiente: 24.70, temperatura_suelo: 20.30 }, recomendacion: 'regar', probabilidad: 0.88, accion_ejecutada: true, fuente_accion: 'automatico' },
    ],
  });

  await prisma.riego.createMany({
    data: [
      { id_asignacion: 7, id_usuario: 2, id_modelo: 1, id_prediccion: BigInt(1), tipo_riego: 'automatico_ml', duracion_segundos: 120, cantidad_agua_litros: 15.50, motivo_cierre: 'riego_completado', estado: true },
    ],
  });

  // =========================================================
  // 13. ALERTAS Y NOTIFICACIONES
  // =========================================================
  console.log('Insertando Alertas y Logs...');
  await prisma.tipos_alerta.createMany({
    data: [
      { id: 1, codigo: 'ALERT_HUM_BAJA', nombre: 'Humedad de suelo crítica baja', descripcion: 'La humedad del suelo ha descendido por debajo del límite de seguridad.', severidad: 'critico' },
      { id: 2, codigo: 'ALERT_TEMP_ALTA', nombre: 'Temperatura ambiente crítica alta', descripcion: 'La temperatura ambiente en el invernadero excede los límites admisibles.', severidad: 'advertencia' },
      { id: 3, codigo: 'ALERT_TANQUE_BAJO', nombre: 'Nivel de reservorio crítico bajo', descripcion: 'El volumen del tanque de almacenamiento está en niveles críticos.', severidad: 'critico' },
    ],
  });

  await prisma.configuracion_notificaciones.createMany({
    data: [
      { id_usuario: 2, id_tipo_alerta: 1, activo: true, canal_email: true, canal_dashboard: true },
      { id_usuario: 2, id_tipo_alerta: 2, activo: true, canal_email: false, canal_dashboard: true },
      { id_usuario: 2, id_tipo_alerta: 3, activo: true, canal_email: true, canal_dashboard: true },
    ],
  });

  await prisma.alertas.createMany({
    data: [
      { id: BigInt(1), id_usuario: 2, id_asignacion: 1, id_tipo_alerta: 1, id_tipo_metrica: 1, mensaje: '¡Alerta de Humedad! El sensor Higrómetro Suelo ha reportado un 43.50%, inferior al umbral mínimo de 45.00%.', prioridad: 'alta', valor_detectado: 43.50, umbral: 45.00, estado: 'pendiente' },
    ],
  });

  await prisma.notificaciones.createMany({
    data: [
      { id_alerta: BigInt(1), id_usuario: 2, canal: 'email', asunto: 'YAKU: Alerta Crítica - Humedad de Suelo Baja', mensaje: 'Estimado Juan Perez, el cultivo Invernadero Tomate Cherry presenta una humedad del 43.50%, lo cual requiere riego urgente.', enviado: true, enviado_en: new Date('2026-05-24T16:00:00Z') },
    ],
  });

  // =========================================================
  // 14. PROGRAMACIONES DE RIEGO Y REPORTES
  // =========================================================
  await prisma.plantillas_riego.createMany({
    data: [
      { id: 1, nombre: 'Riego Interdiario Matutino', lunes: true, martes: false, miercoles: true, jueves: false, viernes: true, sabado: false, domingo: false, hora_inicio: new Date('1970-01-01T07:00:00.000Z'), duracion_seg: 300 },
    ],
  });

  await prisma.programacion_riego.createMany({
    data: [
      { id_asignacion: 7, id_usuario: 2, id_plantilla: 1, nombre: 'Riego Matutino Interdiario', lunes: true, martes: false, miercoles: true, jueves: false, viernes: true, sabado: false, domingo: false, hora_inicio: new Date('1970-01-01T07:00:00.000Z'), duracion_seg: 300, activo: true },
    ],
  });

  await prisma.reporte_consumo_agua.createMany({
    data: [
      { id: 1, id_usuario: 2, id_cultivo: 1, periodo_inicio: new Date('2026-05-01T00:00:00Z'), periodo_fin: new Date('2026-05-31T00:00:00Z'), consumo_total_litros: 450.50, consumo_manual_litros: 600.00, reduccion_porcentaje: 24.91, riegos_automaticos: 12, riegos_manuales: 2, riegos_programados: 4, duracion_total_segundos: 3200 },
    ],
  });

  await prisma.logs_sistema.createMany({
    data: [
      { id_usuario: 2, accion: 'LOGIN', descripcion: 'Inicio de sesión exitoso desde IP 192.168.1.15' },
      { id_usuario: 2, accion: 'SELECT_MODEL', descripcion: 'Cambió modelo activo a Random Forest Regresor Riego' },
    ],
  });

  console.log('✅ Seed completado con éxito.');
}

main()
  .catch((e) => {
    console.error('Error durante la ejecución del seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });