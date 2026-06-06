// src/app/api/iot/bomba/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const { idTelemetria, estado } = body;

    if (!idTelemetria) {
      return NextResponse.json(
        { error: "Falta el ID de telemetría" },
        { status: 400 },
      );
    }

    // Actualizamos el registro exacto en telemetria_tanque convirtiendo el string a BigInt
    const updateTelemetria = await prisma.telemetria_tanque.update({
      where: { id: BigInt(idTelemetria) },
      data: {
        bomba_encendida: estado,
      },
    });

    await prisma.logs_sistema.create({
      data: {
        id_usuario: parseInt((session.user as any).id, 10),
        accion: estado ? "ENCENDIDO_MANUAL_BOMBA" : "APAGADO_MANUAL_BOMBA",
        modulo: "Dashboard_Tanque",
        descripcion: `Actualización de bomba en telemetría ID: ${idTelemetria}`,
      },
    });

    // Convertimos el BigInt devuelto a string antes de enviarlo en JSON para evitar errores de serialización
    const responseData = {
      ...updateTelemetria,
      id: updateTelemetria.id.toString(),
    };

    return NextResponse.json({ success: true, data: responseData });
  } catch (error) {
    console.error("Error al actualizar la bomba en telemetría:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
