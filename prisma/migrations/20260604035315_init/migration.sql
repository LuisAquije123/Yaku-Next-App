-- CreateTable
CREATE TABLE "roles" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "apellido" VARCHAR(100),
    "correo" VARCHAR(100) NOT NULL,
    "contrasena" VARCHAR(255) NOT NULL,
    "id_rol" INTEGER NOT NULL,
    "telefono" VARCHAR(20),
    "zona_horaria" VARCHAR(50) DEFAULT 'America/Lima',
    "verificado" BOOLEAN NOT NULL DEFAULT false,
    "estado" BOOLEAN NOT NULL DEFAULT true,
    "ultimo_acceso" TIMESTAMP(3),
    "fecha_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tipos_dispositivo" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "tipos_dispositivo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dispositivos" (
    "id" SERIAL NOT NULL,
    "id_tipo" INTEGER NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "mac_address" VARCHAR(100),
    "client_id_mqtt" VARCHAR(100),
    "topic_pub" VARCHAR(150),
    "topic_sub" VARCHAR(150),
    "ubicacion" VARCHAR(150),
    "estado" VARCHAR(20) DEFAULT 'activo',
    "funcionamiento_activo" BOOLEAN NOT NULL DEFAULT true,
    "ultimo_ping" TIMESTAMP(3),
    "firmware_version" VARCHAR(20),
    "fecha_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dispositivos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tipos_metrica" (
    "id" SERIAL NOT NULL,
    "codigo" VARCHAR(50) NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "unidad" VARCHAR(20) NOT NULL,
    "descripcion" TEXT,
    "fecha_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tipos_metrica_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tipos_componente" (
    "id" SERIAL NOT NULL,
    "nombre_modelo" VARCHAR(100) NOT NULL,
    "categoria" VARCHAR(30) NOT NULL,
    "id_tipo_metrica" INTEGER,
    "descripcion" TEXT,

    CONSTRAINT "tipos_componente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "componentes" (
    "id" SERIAL NOT NULL,
    "id_tipo_componente" INTEGER NOT NULL,
    "numero_serie" VARCHAR(100),
    "estado" VARCHAR(20) DEFAULT 'activo',
    "fecha_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "componentes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fuentes_agua" (
    "id" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "tipo" VARCHAR(30) NOT NULL,
    "capacidad_litros" DECIMAL(10,2),
    "altura_tanque_cm" DECIMAL(6,2),
    "altura_seguridad_cm" DECIMAL(6,2),
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fecha_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fuentes_agua_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plantas" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "tipo" VARCHAR(50),
    "descripcion" TEXT,

    CONSTRAINT "plantas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "umbrales_planta" (
    "id" SERIAL NOT NULL,
    "id_planta" INTEGER NOT NULL,
    "id_tipo_metrica" INTEGER NOT NULL,
    "valor_minimo" DECIMAL(10,2),
    "valor_maximo" DECIMAL(10,2),

    CONSTRAINT "umbrales_planta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "regiones" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,

    CONSTRAINT "regiones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provincias" (
    "id" SERIAL NOT NULL,
    "id_region" INTEGER NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,

    CONSTRAINT "provincias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "distritos" (
    "id" SERIAL NOT NULL,
    "id_provincia" INTEGER NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,

    CONSTRAINT "distritos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cultivos" (
    "id" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "id_planta" INTEGER,
    "id_fuente_agua" INTEGER,
    "id_distrito" INTEGER,
    "lugar" VARCHAR(255),
    "nombre_planta" VARCHAR(100) NOT NULL,
    "etapa_crecimiento" VARCHAR(50),
    "area_m2" DECIMAL(10,2),
    "fecha_siembra" DATE,
    "estado" VARCHAR(20) DEFAULT 'activo',
    "fecha_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cultivos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asignaciones_iot" (
    "id" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "id_dispositivo" INTEGER NOT NULL,
    "id_componente" INTEGER,
    "id_fuente_agua" INTEGER,
    "id_cultivo" INTEGER,
    "pin_gpio" INTEGER,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fecha_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "asignaciones_iot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuracion_tanque" (
    "id_asignacion" INTEGER NOT NULL,
    "valvula_abierta" BOOLEAN NOT NULL DEFAULT false,
    "bomba_encendida" BOOLEAN NOT NULL DEFAULT false,
    "actualizado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "configuracion_tanque_pkey" PRIMARY KEY ("id_asignacion")
);

-- CreateTable
CREATE TABLE "humedad_suelo" (
    "id" BIGSERIAL NOT NULL,
    "id_asignacion" INTEGER NOT NULL,
    "valor" DECIMAL(10,2),
    "porcentaje" DECIMAL(10,2),
    "ema" DECIMAL(10,2),
    "desviacion" DECIMAL(8,3),
    "valido" BOOLEAN NOT NULL DEFAULT true,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "humedad_suelo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "humedad_ambiente" (
    "id" BIGSERIAL NOT NULL,
    "id_asignacion" INTEGER NOT NULL,
    "valor" DECIMAL(10,2),
    "porcentaje" DECIMAL(10,2),
    "ema" DECIMAL(10,2),
    "desviacion" DECIMAL(8,3),
    "valido" BOOLEAN NOT NULL DEFAULT true,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "humedad_ambiente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "temperatura_ambiente" (
    "id" BIGSERIAL NOT NULL,
    "id_asignacion" INTEGER NOT NULL,
    "valor" DECIMAL(10,2),
    "temperatura" DECIMAL(10,2),
    "ema" DECIMAL(10,2),
    "desviacion" DECIMAL(8,3),
    "valido" BOOLEAN NOT NULL DEFAULT true,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "temperatura_ambiente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "temperatura_suelo" (
    "id" BIGSERIAL NOT NULL,
    "id_asignacion" INTEGER NOT NULL,
    "valor" DECIMAL(10,2),
    "temperatura" DECIMAL(10,2),
    "ema" DECIMAL(10,2),
    "desviacion" DECIMAL(8,3),
    "valido" BOOLEAN NOT NULL DEFAULT true,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "temperatura_suelo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "telemetria_tanque" (
    "id" BIGSERIAL NOT NULL,
    "id_asignacion" INTEGER NOT NULL,
    "distancia_cm" DECIMAL(10,2) NOT NULL,
    "nivel_agua_cm" DECIMAL(10,2),
    "porcentaje_nivel" DECIMAL(10,2),
    "estado_nivel" VARCHAR(20),
    "valvula_abierta" BOOLEAN NOT NULL DEFAULT false,
    "bomba_encendida" BOOLEAN NOT NULL DEFAULT false,
    "fuente_control" VARCHAR(30),
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "telemetria_tanque_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lecturas_bateria" (
    "id" BIGSERIAL NOT NULL,
    "id_asignacion" INTEGER NOT NULL,
    "porcentaje" DECIMAL(5,2) NOT NULL,
    "voltaje" DECIMAL(4,2),
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lecturas_bateria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "umbrales_config" (
    "id" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "id_cultivo" INTEGER,
    "id_tipo_metrica" INTEGER NOT NULL,
    "valor_minimo" DECIMAL(10,2),
    "valor_maximo" DECIMAL(10,2),
    "actualizado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "umbrales_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuracion_control" (
    "id" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "id_cultivo" INTEGER,
    "duracion_riego_max_seg" INTEGER NOT NULL DEFAULT 1800,
    "confianza_ml_minima" DECIMAL(4,3) NOT NULL DEFAULT 0.70,
    "actualizado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "configuracion_control_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "modelos_ml" (
    "id" SERIAL NOT NULL,
    "nombre_modelo" VARCHAR(100) NOT NULL,
    "algoritmo" VARCHAR(50) NOT NULL,
    "descripcion" TEXT,
    "ruta_archivo" VARCHAR(255),
    "precision_modelo" DECIMAL(5,2),
    "precision_score" DECIMAL(5,4),
    "recall_score" DECIMAL(5,4),
    "f1_score" DECIMAL(5,4),
    "version" VARCHAR(20) DEFAULT '1.0.0',
    "es_default" BOOLEAN NOT NULL DEFAULT false,
    "estado" VARCHAR(20) DEFAULT 'activo',
    "creado_por" INTEGER,
    "fecha_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_entrenamiento" TIMESTAMP(3),

    CONSTRAINT "modelos_ml_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuario_modelo" (
    "id" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "id_modelo" INTEGER NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fecha_asignacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuario_modelo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historial_modelos" (
    "id" SERIAL NOT NULL,
    "id_usuario" INTEGER,
    "id_modelo" INTEGER,
    "accion" VARCHAR(50),
    "descripcion" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historial_modelos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "predicciones_ml" (
    "id" BIGSERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "id_modelo" INTEGER NOT NULL,
    "id_cultivo" INTEGER,
    "variables_entrada" JSONB NOT NULL,
    "recomendacion" VARCHAR(50),
    "probabilidad" DECIMAL(5,2),
    "accion_ejecutada" BOOLEAN,
    "fuente_accion" VARCHAR(30),
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "predicciones_ml_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "riego" (
    "id" BIGSERIAL NOT NULL,
    "id_asignacion" INTEGER NOT NULL,
    "id_usuario" INTEGER,
    "id_modelo" INTEGER,
    "id_prediccion" BIGINT,
    "tipo_riego" VARCHAR(20) NOT NULL,
    "duracion_segundos" INTEGER,
    "cantidad_agua_litros" DECIMAL(10,2),
    "motivo_cierre" VARCHAR(50),
    "estado" BOOLEAN NOT NULL DEFAULT false,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "riego_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plantillas_riego" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "lunes" BOOLEAN NOT NULL DEFAULT false,
    "martes" BOOLEAN NOT NULL DEFAULT false,
    "miercoles" BOOLEAN NOT NULL DEFAULT false,
    "jueves" BOOLEAN NOT NULL DEFAULT false,
    "viernes" BOOLEAN NOT NULL DEFAULT false,
    "sabado" BOOLEAN NOT NULL DEFAULT false,
    "domingo" BOOLEAN NOT NULL DEFAULT false,
    "hora_inicio" TIME(0) NOT NULL,
    "duracion_seg" INTEGER NOT NULL DEFAULT 300,

    CONSTRAINT "plantillas_riego_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "programacion_riego" (
    "id" SERIAL NOT NULL,
    "id_asignacion" INTEGER NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "id_plantilla" INTEGER,
    "nombre" VARCHAR(100),
    "lunes" BOOLEAN NOT NULL DEFAULT false,
    "martes" BOOLEAN NOT NULL DEFAULT false,
    "miercoles" BOOLEAN NOT NULL DEFAULT false,
    "jueves" BOOLEAN NOT NULL DEFAULT false,
    "viernes" BOOLEAN NOT NULL DEFAULT false,
    "sabado" BOOLEAN NOT NULL DEFAULT false,
    "domingo" BOOLEAN NOT NULL DEFAULT false,
    "hora_inicio" TIME(0) NOT NULL,
    "duracion_seg" INTEGER NOT NULL DEFAULT 300,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "ultima_ejecucion" TIMESTAMP(3),
    "fecha_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "programacion_riego_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reporte_consumo_agua" (
    "id" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "id_cultivo" INTEGER,
    "periodo_inicio" DATE NOT NULL,
    "periodo_fin" DATE NOT NULL,
    "consumo_total_litros" DECIMAL(12,3),
    "consumo_manual_litros" DECIMAL(12,3),
    "reduccion_porcentaje" DECIMAL(5,2),
    "riegos_automaticos" INTEGER,
    "riegos_manuales" INTEGER,
    "riegos_programados" INTEGER,
    "duracion_total_segundos" INTEGER,
    "generado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reporte_consumo_agua_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tipos_alerta" (
    "id" SERIAL NOT NULL,
    "codigo" VARCHAR(50) NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "descripcion" TEXT,
    "severidad" VARCHAR(20) NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "tipos_alerta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alertas" (
    "id" BIGSERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "id_asignacion" INTEGER,
    "id_tipo_alerta" INTEGER NOT NULL,
    "id_tipo_metrica" INTEGER,
    "mensaje" TEXT NOT NULL,
    "prioridad" VARCHAR(20),
    "valor_detectado" DECIMAL(10,2),
    "umbral" DECIMAL(10,2),
    "estado" VARCHAR(20) DEFAULT 'pendiente',
    "resuelta_por" INTEGER,
    "resuelta_en" TIMESTAMP(3),
    "comentario" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alertas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuracion_notificaciones" (
    "id" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "id_tipo_alerta" INTEGER NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "canal_email" BOOLEAN NOT NULL DEFAULT true,
    "canal_dashboard" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "configuracion_notificaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notificaciones" (
    "id" BIGSERIAL NOT NULL,
    "id_alerta" BIGINT NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "canal" VARCHAR(20) NOT NULL,
    "asunto" VARCHAR(200),
    "mensaje" TEXT,
    "enviado" BOOLEAN NOT NULL DEFAULT false,
    "enviado_en" TIMESTAMP(3),
    "error" TEXT,

    CONSTRAINT "notificaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "logs_sistema" (
    "id" BIGSERIAL NOT NULL,
    "id_usuario" INTEGER,
    "accion" VARCHAR(100) NOT NULL,
    "modulo" VARCHAR(50),
    "descripcion" TEXT,
    "ip_acceso" INET,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "logs_sistema_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_nombre_key" ON "roles"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_correo_key" ON "usuarios"("correo");

-- CreateIndex
CREATE INDEX "usuarios_correo_idx" ON "usuarios"("correo");

-- CreateIndex
CREATE INDEX "usuarios_id_rol_idx" ON "usuarios"("id_rol");

-- CreateIndex
CREATE UNIQUE INDEX "dispositivos_mac_address_key" ON "dispositivos"("mac_address");

-- CreateIndex
CREATE UNIQUE INDEX "dispositivos_client_id_mqtt_key" ON "dispositivos"("client_id_mqtt");

-- CreateIndex
CREATE UNIQUE INDEX "tipos_metrica_codigo_key" ON "tipos_metrica"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "tipos_componente_nombre_modelo_key" ON "tipos_componente"("nombre_modelo");

-- CreateIndex
CREATE UNIQUE INDEX "componentes_numero_serie_key" ON "componentes"("numero_serie");

-- CreateIndex
CREATE UNIQUE INDEX "umbrales_planta_id_planta_id_tipo_metrica_key" ON "umbrales_planta"("id_planta", "id_tipo_metrica");

-- CreateIndex
CREATE UNIQUE INDEX "regiones_nombre_key" ON "regiones"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "provincias_id_region_nombre_key" ON "provincias"("id_region", "nombre");

-- CreateIndex
CREATE UNIQUE INDEX "distritos_id_provincia_nombre_key" ON "distritos"("id_provincia", "nombre");

-- CreateIndex
CREATE INDEX "cultivos_id_usuario_idx" ON "cultivos"("id_usuario");

-- CreateIndex
CREATE INDEX "asignaciones_iot_id_usuario_idx" ON "asignaciones_iot"("id_usuario");

-- CreateIndex
CREATE INDEX "asignaciones_iot_id_dispositivo_idx" ON "asignaciones_iot"("id_dispositivo");

-- CreateIndex
CREATE INDEX "asignaciones_iot_id_cultivo_idx" ON "asignaciones_iot"("id_cultivo");

-- CreateIndex
CREATE UNIQUE INDEX "asignaciones_iot_id_usuario_id_dispositivo_id_componente_id_key" ON "asignaciones_iot"("id_usuario", "id_dispositivo", "id_componente", "id_cultivo");

-- CreateIndex
CREATE INDEX "humedad_suelo_id_asignacion_idx" ON "humedad_suelo"("id_asignacion");

-- CreateIndex
CREATE INDEX "humedad_suelo_fecha_idx" ON "humedad_suelo"("fecha" DESC);

-- CreateIndex
CREATE INDEX "humedad_ambiente_id_asignacion_idx" ON "humedad_ambiente"("id_asignacion");

-- CreateIndex
CREATE INDEX "humedad_ambiente_fecha_idx" ON "humedad_ambiente"("fecha" DESC);

-- CreateIndex
CREATE INDEX "temperatura_ambiente_id_asignacion_idx" ON "temperatura_ambiente"("id_asignacion");

-- CreateIndex
CREATE INDEX "temperatura_ambiente_fecha_idx" ON "temperatura_ambiente"("fecha" DESC);

-- CreateIndex
CREATE INDEX "temperatura_suelo_id_asignacion_idx" ON "temperatura_suelo"("id_asignacion");

-- CreateIndex
CREATE INDEX "temperatura_suelo_fecha_idx" ON "temperatura_suelo"("fecha" DESC);

-- CreateIndex
CREATE INDEX "telemetria_tanque_id_asignacion_idx" ON "telemetria_tanque"("id_asignacion");

-- CreateIndex
CREATE INDEX "telemetria_tanque_fecha_idx" ON "telemetria_tanque"("fecha" DESC);

-- CreateIndex
CREATE INDEX "telemetria_tanque_estado_nivel_idx" ON "telemetria_tanque"("estado_nivel");

-- CreateIndex
CREATE INDEX "lecturas_bateria_id_asignacion_idx" ON "lecturas_bateria"("id_asignacion");

-- CreateIndex
CREATE INDEX "lecturas_bateria_fecha_idx" ON "lecturas_bateria"("fecha" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "umbrales_config_id_usuario_id_cultivo_id_tipo_metrica_key" ON "umbrales_config"("id_usuario", "id_cultivo", "id_tipo_metrica");

-- CreateIndex
CREATE UNIQUE INDEX "configuracion_control_id_usuario_id_cultivo_key" ON "configuracion_control"("id_usuario", "id_cultivo");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_modelo_id_usuario_key" ON "usuario_modelo"("id_usuario");

-- CreateIndex
CREATE INDEX "predicciones_ml_id_usuario_idx" ON "predicciones_ml"("id_usuario");

-- CreateIndex
CREATE INDEX "predicciones_ml_id_modelo_idx" ON "predicciones_ml"("id_modelo");

-- CreateIndex
CREATE INDEX "predicciones_ml_fecha_idx" ON "predicciones_ml"("fecha" DESC);

-- CreateIndex
CREATE INDEX "riego_id_asignacion_idx" ON "riego"("id_asignacion");

-- CreateIndex
CREATE INDEX "riego_id_usuario_idx" ON "riego"("id_usuario");

-- CreateIndex
CREATE INDEX "riego_fecha_idx" ON "riego"("fecha" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "plantillas_riego_nombre_key" ON "plantillas_riego"("nombre");

-- CreateIndex
CREATE INDEX "programacion_riego_id_asignacion_idx" ON "programacion_riego"("id_asignacion");

-- CreateIndex
CREATE INDEX "programacion_riego_id_usuario_idx" ON "programacion_riego"("id_usuario");

-- CreateIndex
CREATE INDEX "reporte_consumo_agua_id_usuario_idx" ON "reporte_consumo_agua"("id_usuario");

-- CreateIndex
CREATE INDEX "reporte_consumo_agua_periodo_inicio_periodo_fin_idx" ON "reporte_consumo_agua"("periodo_inicio", "periodo_fin");

-- CreateIndex
CREATE UNIQUE INDEX "tipos_alerta_codigo_key" ON "tipos_alerta"("codigo");

-- CreateIndex
CREATE INDEX "alertas_id_usuario_idx" ON "alertas"("id_usuario");

-- CreateIndex
CREATE INDEX "alertas_id_asignacion_idx" ON "alertas"("id_asignacion");

-- CreateIndex
CREATE INDEX "alertas_id_tipo_alerta_idx" ON "alertas"("id_tipo_alerta");

-- CreateIndex
CREATE INDEX "alertas_estado_idx" ON "alertas"("estado");

-- CreateIndex
CREATE INDEX "alertas_fecha_idx" ON "alertas"("fecha" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "configuracion_notificaciones_id_usuario_id_tipo_alerta_key" ON "configuracion_notificaciones"("id_usuario", "id_tipo_alerta");

-- CreateIndex
CREATE INDEX "notificaciones_id_alerta_idx" ON "notificaciones"("id_alerta");

-- CreateIndex
CREATE INDEX "notificaciones_id_usuario_idx" ON "notificaciones"("id_usuario");

-- CreateIndex
CREATE INDEX "notificaciones_enviado_idx" ON "notificaciones"("enviado");

-- CreateIndex
CREATE INDEX "logs_sistema_id_usuario_idx" ON "logs_sistema"("id_usuario");

-- CreateIndex
CREATE INDEX "logs_sistema_fecha_idx" ON "logs_sistema"("fecha" DESC);

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_id_rol_fkey" FOREIGN KEY ("id_rol") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dispositivos" ADD CONSTRAINT "dispositivos_id_tipo_fkey" FOREIGN KEY ("id_tipo") REFERENCES "tipos_dispositivo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tipos_componente" ADD CONSTRAINT "tipos_componente_id_tipo_metrica_fkey" FOREIGN KEY ("id_tipo_metrica") REFERENCES "tipos_metrica"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "componentes" ADD CONSTRAINT "componentes_id_tipo_componente_fkey" FOREIGN KEY ("id_tipo_componente") REFERENCES "tipos_componente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fuentes_agua" ADD CONSTRAINT "fuentes_agua_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "umbrales_planta" ADD CONSTRAINT "umbrales_planta_id_planta_fkey" FOREIGN KEY ("id_planta") REFERENCES "plantas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "umbrales_planta" ADD CONSTRAINT "umbrales_planta_id_tipo_metrica_fkey" FOREIGN KEY ("id_tipo_metrica") REFERENCES "tipos_metrica"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provincias" ADD CONSTRAINT "provincias_id_region_fkey" FOREIGN KEY ("id_region") REFERENCES "regiones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "distritos" ADD CONSTRAINT "distritos_id_provincia_fkey" FOREIGN KEY ("id_provincia") REFERENCES "provincias"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cultivos" ADD CONSTRAINT "cultivos_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cultivos" ADD CONSTRAINT "cultivos_id_planta_fkey" FOREIGN KEY ("id_planta") REFERENCES "plantas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cultivos" ADD CONSTRAINT "cultivos_id_fuente_agua_fkey" FOREIGN KEY ("id_fuente_agua") REFERENCES "fuentes_agua"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cultivos" ADD CONSTRAINT "cultivos_id_distrito_fkey" FOREIGN KEY ("id_distrito") REFERENCES "distritos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asignaciones_iot" ADD CONSTRAINT "asignaciones_iot_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asignaciones_iot" ADD CONSTRAINT "asignaciones_iot_id_dispositivo_fkey" FOREIGN KEY ("id_dispositivo") REFERENCES "dispositivos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asignaciones_iot" ADD CONSTRAINT "asignaciones_iot_id_componente_fkey" FOREIGN KEY ("id_componente") REFERENCES "componentes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asignaciones_iot" ADD CONSTRAINT "asignaciones_iot_id_fuente_agua_fkey" FOREIGN KEY ("id_fuente_agua") REFERENCES "fuentes_agua"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asignaciones_iot" ADD CONSTRAINT "asignaciones_iot_id_cultivo_fkey" FOREIGN KEY ("id_cultivo") REFERENCES "cultivos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "configuracion_tanque" ADD CONSTRAINT "configuracion_tanque_id_asignacion_fkey" FOREIGN KEY ("id_asignacion") REFERENCES "asignaciones_iot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "humedad_suelo" ADD CONSTRAINT "humedad_suelo_id_asignacion_fkey" FOREIGN KEY ("id_asignacion") REFERENCES "asignaciones_iot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "humedad_ambiente" ADD CONSTRAINT "humedad_ambiente_id_asignacion_fkey" FOREIGN KEY ("id_asignacion") REFERENCES "asignaciones_iot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "temperatura_ambiente" ADD CONSTRAINT "temperatura_ambiente_id_asignacion_fkey" FOREIGN KEY ("id_asignacion") REFERENCES "asignaciones_iot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "temperatura_suelo" ADD CONSTRAINT "temperatura_suelo_id_asignacion_fkey" FOREIGN KEY ("id_asignacion") REFERENCES "asignaciones_iot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "telemetria_tanque" ADD CONSTRAINT "telemetria_tanque_id_asignacion_fkey" FOREIGN KEY ("id_asignacion") REFERENCES "asignaciones_iot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lecturas_bateria" ADD CONSTRAINT "lecturas_bateria_id_asignacion_fkey" FOREIGN KEY ("id_asignacion") REFERENCES "asignaciones_iot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "umbrales_config" ADD CONSTRAINT "umbrales_config_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "umbrales_config" ADD CONSTRAINT "umbrales_config_id_cultivo_fkey" FOREIGN KEY ("id_cultivo") REFERENCES "cultivos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "umbrales_config" ADD CONSTRAINT "umbrales_config_id_tipo_metrica_fkey" FOREIGN KEY ("id_tipo_metrica") REFERENCES "tipos_metrica"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "configuracion_control" ADD CONSTRAINT "configuracion_control_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "configuracion_control" ADD CONSTRAINT "configuracion_control_id_cultivo_fkey" FOREIGN KEY ("id_cultivo") REFERENCES "cultivos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "modelos_ml" ADD CONSTRAINT "modelos_ml_creado_por_fkey" FOREIGN KEY ("creado_por") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario_modelo" ADD CONSTRAINT "usuario_modelo_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario_modelo" ADD CONSTRAINT "usuario_modelo_id_modelo_fkey" FOREIGN KEY ("id_modelo") REFERENCES "modelos_ml"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_modelos" ADD CONSTRAINT "historial_modelos_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_modelos" ADD CONSTRAINT "historial_modelos_id_modelo_fkey" FOREIGN KEY ("id_modelo") REFERENCES "modelos_ml"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "predicciones_ml" ADD CONSTRAINT "predicciones_ml_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "predicciones_ml" ADD CONSTRAINT "predicciones_ml_id_modelo_fkey" FOREIGN KEY ("id_modelo") REFERENCES "modelos_ml"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "predicciones_ml" ADD CONSTRAINT "predicciones_ml_id_cultivo_fkey" FOREIGN KEY ("id_cultivo") REFERENCES "cultivos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "riego" ADD CONSTRAINT "riego_id_asignacion_fkey" FOREIGN KEY ("id_asignacion") REFERENCES "asignaciones_iot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "riego" ADD CONSTRAINT "riego_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "riego" ADD CONSTRAINT "riego_id_modelo_fkey" FOREIGN KEY ("id_modelo") REFERENCES "modelos_ml"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "riego" ADD CONSTRAINT "riego_id_prediccion_fkey" FOREIGN KEY ("id_prediccion") REFERENCES "predicciones_ml"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "programacion_riego" ADD CONSTRAINT "programacion_riego_id_asignacion_fkey" FOREIGN KEY ("id_asignacion") REFERENCES "asignaciones_iot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "programacion_riego" ADD CONSTRAINT "programacion_riego_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "programacion_riego" ADD CONSTRAINT "programacion_riego_id_plantilla_fkey" FOREIGN KEY ("id_plantilla") REFERENCES "plantillas_riego"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reporte_consumo_agua" ADD CONSTRAINT "reporte_consumo_agua_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reporte_consumo_agua" ADD CONSTRAINT "reporte_consumo_agua_id_cultivo_fkey" FOREIGN KEY ("id_cultivo") REFERENCES "cultivos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alertas" ADD CONSTRAINT "alertas_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alertas" ADD CONSTRAINT "alertas_resuelta_por_fkey" FOREIGN KEY ("resuelta_por") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alertas" ADD CONSTRAINT "alertas_id_asignacion_fkey" FOREIGN KEY ("id_asignacion") REFERENCES "asignaciones_iot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alertas" ADD CONSTRAINT "alertas_id_tipo_alerta_fkey" FOREIGN KEY ("id_tipo_alerta") REFERENCES "tipos_alerta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alertas" ADD CONSTRAINT "alertas_id_tipo_metrica_fkey" FOREIGN KEY ("id_tipo_metrica") REFERENCES "tipos_metrica"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "configuracion_notificaciones" ADD CONSTRAINT "configuracion_notificaciones_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "configuracion_notificaciones" ADD CONSTRAINT "configuracion_notificaciones_id_tipo_alerta_fkey" FOREIGN KEY ("id_tipo_alerta") REFERENCES "tipos_alerta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificaciones" ADD CONSTRAINT "notificaciones_id_alerta_fkey" FOREIGN KEY ("id_alerta") REFERENCES "alertas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificaciones" ADD CONSTRAINT "notificaciones_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logs_sistema" ADD CONSTRAINT "logs_sistema_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
