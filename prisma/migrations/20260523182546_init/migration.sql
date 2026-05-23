-- CreateTable
CREATE TABLE "roles" (
    "id_rol" SERIAL NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "descripcion" VARCHAR(150),

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id_rol")
);

-- CreateTable
CREATE TABLE "permisos" (
    "id_permiso" SERIAL NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "descripcion" VARCHAR(150),

    CONSTRAINT "permisos_pkey" PRIMARY KEY ("id_permiso")
);

-- CreateTable
CREATE TABLE "roles_permisos" (
    "id_rol" INTEGER NOT NULL,
    "id_permiso" INTEGER NOT NULL,

    CONSTRAINT "roles_permisos_pkey" PRIMARY KEY ("id_rol","id_permiso")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id_usuario" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "correo" VARCHAR(100) NOT NULL,
    "contrasena" VARCHAR(255) NOT NULL,
    "id_rol" INTEGER,
    "estado" BOOLEAN NOT NULL DEFAULT true,
    "fecha_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id_usuario")
);

-- CreateTable
CREATE TABLE "plantas" (
    "id_planta" SERIAL NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "tipo" VARCHAR(50),
    "requerimiento_hidrico" VARCHAR(20),
    "descripcion" TEXT,

    CONSTRAINT "plantas_pkey" PRIMARY KEY ("id_planta")
);

-- CreateTable
CREATE TABLE "cultivos" (
    "id_cultivo" SERIAL NOT NULL,
    "id_usuario" INTEGER,
    "id_planta" INTEGER,
    "nombre" VARCHAR(100),
    "etapa" VARCHAR(20),
    "area_m2" DECIMAL(10,2),
    "fecha_siembra" DATE,
    "estado" VARCHAR(20),

    CONSTRAINT "cultivos_pkey" PRIMARY KEY ("id_cultivo")
);

-- CreateTable
CREATE TABLE "dispositivos" (
    "id_dispositivo" SERIAL NOT NULL,
    "nombre" VARCHAR(100),
    "ubicacion" VARCHAR(100),
    "estado" VARCHAR(20),
    "fecha_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dispositivos_pkey" PRIMARY KEY ("id_dispositivo")
);

-- CreateTable
CREATE TABLE "sensores" (
    "id_sensor" SERIAL NOT NULL,
    "id_dispositivo" INTEGER,
    "tipo_sensor" VARCHAR(50),
    "unidad" VARCHAR(20),
    "estado" VARCHAR(20),

    CONSTRAINT "sensores_pkey" PRIMARY KEY ("id_sensor")
);

-- CreateTable
CREATE TABLE "lecturas_sensor" (
    "id_lectura" SERIAL NOT NULL,
    "id_sensor" INTEGER,
    "id_cultivo" INTEGER,
    "valor" DECIMAL(10,2),
    "tipo_variable" VARCHAR(50),
    "fecha_hora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lecturas_sensor_pkey" PRIMARY KEY ("id_lectura")
);

-- CreateTable
CREATE TABLE "riego" (
    "id_riego" SERIAL NOT NULL,
    "id_cultivo" INTEGER,
    "id_dispositivo" INTEGER,
    "tipo" VARCHAR(20),
    "duracion" INTEGER,
    "estado" BOOLEAN,
    "fecha_hora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "riego_pkey" PRIMARY KEY ("id_riego")
);

-- CreateTable
CREATE TABLE "modelo_ml" (
    "id_modelo" SERIAL NOT NULL,
    "nombre" VARCHAR(50),
    "version" VARCHAR(20),
    "algoritmo" VARCHAR(50),
    "fecha_entrenamiento" TIMESTAMP(3),
    "parametros" TEXT,
    "metricas" TEXT,

    CONSTRAINT "modelo_ml_pkey" PRIMARY KEY ("id_modelo")
);

-- CreateTable
CREATE TABLE "predicciones" (
    "id_prediccion" SERIAL NOT NULL,
    "id_modelo" INTEGER,
    "id_cultivo" INTEGER,
    "recomendacion" VARCHAR(20),
    "probabilidad" DECIMAL(5,2),
    "fecha_hora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "predicciones_pkey" PRIMARY KEY ("id_prediccion")
);

-- CreateTable
CREATE TABLE "alertas" (
    "id_alerta" SERIAL NOT NULL,
    "id_cultivo" INTEGER,
    "tipo" VARCHAR(50),
    "mensaje" TEXT,
    "nivel" VARCHAR(20),
    "estado" VARCHAR(20),
    "fecha_hora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alertas_pkey" PRIMARY KEY ("id_alerta")
);

-- CreateTable
CREATE TABLE "logs_sistema" (
    "id_log" SERIAL NOT NULL,
    "id_usuario" INTEGER,
    "accion" VARCHAR(100),
    "descripcion" TEXT,
    "fecha_hora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "logs_sistema_pkey" PRIMARY KEY ("id_log")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_correo_key" ON "usuarios"("correo");

-- AddForeignKey
ALTER TABLE "roles_permisos" ADD CONSTRAINT "roles_permisos_id_rol_fkey" FOREIGN KEY ("id_rol") REFERENCES "roles"("id_rol") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roles_permisos" ADD CONSTRAINT "roles_permisos_id_permiso_fkey" FOREIGN KEY ("id_permiso") REFERENCES "permisos"("id_permiso") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_id_rol_fkey" FOREIGN KEY ("id_rol") REFERENCES "roles"("id_rol") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cultivos" ADD CONSTRAINT "cultivos_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id_usuario") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cultivos" ADD CONSTRAINT "cultivos_id_planta_fkey" FOREIGN KEY ("id_planta") REFERENCES "plantas"("id_planta") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sensores" ADD CONSTRAINT "sensores_id_dispositivo_fkey" FOREIGN KEY ("id_dispositivo") REFERENCES "dispositivos"("id_dispositivo") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lecturas_sensor" ADD CONSTRAINT "lecturas_sensor_id_sensor_fkey" FOREIGN KEY ("id_sensor") REFERENCES "sensores"("id_sensor") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lecturas_sensor" ADD CONSTRAINT "lecturas_sensor_id_cultivo_fkey" FOREIGN KEY ("id_cultivo") REFERENCES "cultivos"("id_cultivo") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "riego" ADD CONSTRAINT "riego_id_cultivo_fkey" FOREIGN KEY ("id_cultivo") REFERENCES "cultivos"("id_cultivo") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "riego" ADD CONSTRAINT "riego_id_dispositivo_fkey" FOREIGN KEY ("id_dispositivo") REFERENCES "dispositivos"("id_dispositivo") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "predicciones" ADD CONSTRAINT "predicciones_id_modelo_fkey" FOREIGN KEY ("id_modelo") REFERENCES "modelo_ml"("id_modelo") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "predicciones" ADD CONSTRAINT "predicciones_id_cultivo_fkey" FOREIGN KEY ("id_cultivo") REFERENCES "cultivos"("id_cultivo") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alertas" ADD CONSTRAINT "alertas_id_cultivo_fkey" FOREIGN KEY ("id_cultivo") REFERENCES "cultivos"("id_cultivo") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logs_sistema" ADD CONSTRAINT "logs_sistema_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id_usuario") ON DELETE SET NULL ON UPDATE CASCADE;
