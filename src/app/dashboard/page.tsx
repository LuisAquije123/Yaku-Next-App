// src/app/dashboard/page.tsx
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { Box, Container, Heading, Text, Flex } from '@radix-ui/themes';
import { getDashboardData } from '@/services/dashboard';
import DashboardClient from '@/components/dashboard/DashboardClient';
import Sidebar from '@/components/layout/Sidebar'; // Asegúrate de importar tu Sidebar

export const metadata = {
  title: 'Dashboard - Yaku',
  description: 'Panel de control de monitoreo y riego automático',
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/auth/login');
  }

  const userId = parseInt(session.user.id, 10);
  
  // Obtenemos los datos masivos desde el servidor
  const cultivosData = await getDashboardData(userId);

  // Iniciales para el perfil
  const name = session?.user?.name || "JR";
  const initials = name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();

  return (
    <Box style={{ background: '#020817', minHeight: '100vh' }}>
      {/* 1. Sidebar incluido directamente aquí */}
      <Sidebar initials={initials} />

      {/* 2. Contenedor con clase para estilos responsivos */}
      <Box className="page-content" style={{ padding: '2rem 0' }}>
        <Container size="4">
          
          <Box mb="6" px="4">
            <Flex align="center" gap="3" mb="2">
              <div style={{ 
                width: '40px', 
                height: '40px', 
                background: 'white',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem'
              }}>
                🌊
              </div>
              <Heading size="8" style={{ color: 'white' }}>
                ¡Hola, {session.user.name || 'Agricultor'}!
              </Heading>
            </Flex>
            <Text size="3" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Aquí tienes el resumen en tiempo real de las condiciones de tus cultivos.
            </Text>
          </Box>

          <Box px="4">
             <DashboardClient cultivos={cultivosData as any} />
          </Box>
          
        </Container>
      </Box>

      {/* 3. Inyección de estilos para manejar los márgenes responsivos */}
      <style dangerouslySetInnerHTML={{ __html: `
        .page-content {
          padding-bottom: 90px !important; /* Espacio para el navbar en celular */
          width: 100%;
        }
        @media (min-width: 768px) {
          .page-content {
            padding-bottom: 2rem !important;
            padding-left: 120px !important; /* Desplaza el contenido para dar espacio al Sidebar PC */
          }
        }
      `}} />
    </Box>
  );
}