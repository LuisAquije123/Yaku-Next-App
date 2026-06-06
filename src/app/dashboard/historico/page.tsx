// src/app/dashboard/historico/page.tsx
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Box, Container, Text } from '@radix-ui/themes';
import HistoricoMultiChart from '@/components/historico/HistoricoMultiChart';
import { getHistoricoData } from '@/services/historico';
import Sidebar from '@/components/layout/Sidebar'; // Importamos el Sidebar

export const metadata = {
  title: 'Análisis Histórico - Yaku',
  description: 'Visualización de telemetría a largo plazo',
};

export const dynamic = 'force-dynamic';

export default async function HistoricoPage({
  searchParams
}: {
  searchParams: Promise<{ cultivo?: string, rango?: string }>
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/auth/login');
  }

  const userId = parseInt(session.user.id, 10);

  const cultivosBase = await prisma.cultivos.findMany({
    where: { id_usuario: userId, estado: 'activo' },
    select: { id: true, nombre_planta: true }
  });

  if (cultivosBase.length === 0) {
    return <Text color="gray">No tienes cultivos registrados.</Text>;
  }

  const resolvedSearchParams = await searchParams;
  const selectedCultivoId = resolvedSearchParams.cultivo ? parseInt(resolvedSearchParams.cultivo, 10) : cultivosBase[0].id;
  const rangoDias = resolvedSearchParams.rango ? parseInt(resolvedSearchParams.rango, 10) : 30;

  const historicoData = await getHistoricoData(userId, selectedCultivoId, rangoDias);

  // Obtenemos iniciales para el botón de perfil
  const name = session?.user?.name || "JR";
  const initials = name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();

  return (
    <>
      {/* 1. Sidebar posicionado */}
      <Sidebar initials={initials} />

      {/* 2. Contenedor principal con clase para CSS responsivo */}
      <Box className="page-content" style={{ background: '#020817', minHeight: '100vh', padding: '2rem 0' }}>

        {/* 3. Estilos responsivos inyectados */}
        <style dangerouslySetInnerHTML={{
          __html: `
          .page-content {
            padding-bottom: 90px !important; /* Espacio para navbar móvil */
            width: 100%;
          }
          @media (min-width: 768px) {
            .page-content {
              padding-bottom: 2rem !important;
              padding-left: 120px !important; /* Espacio para sidebar PC */
            }
          }
        `}} />

        <Container size="4" px="4">
          <HistoricoMultiChart
            cultivos={cultivosBase}
            initialData={historicoData}
            initialCultivo={selectedCultivoId.toString()}
            initialRango={rangoDias}
          />
        </Container>

      </Box>
    </>
  );
}