// src/actions/alertas.ts
"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function guardarUmbrales(userId: number, idCultivo: number, updates: { id: number, min: number, max: number }[]) {
  try {
    await prisma.$transaction(
      updates.map((u) => 
        prisma.umbrales_config.update({
          where: { id: u.id, id_usuario: userId, id_cultivo: idCultivo },
          data: {
            valor_minimo: u.min,
            valor_maximo: u.max,
            actualizado_en: new Date()
          }
        })
      )
    );
    revalidatePath('/dashboard/alertas');
    return { success: true };
  } catch (error) {
    return { success: false, error: "Error al guardar." };
  }
}