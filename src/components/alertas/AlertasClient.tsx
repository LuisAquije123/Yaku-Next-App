// src/components/alertas/AlertasClient.tsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Text, Flex, Card, Button, Grid, Slider, Select, Badge } from '@radix-ui/themes';
import { guardarUmbrales } from '@/actions/alertas';

export default function AlertasClient({ userId, cultivos, initialData, initialCultivo }: any) {
  const router = useRouter();
  const [umbrales, setUmbrales] = useState(initialData.umbrales);
  const [isSaving, setIsSaving] = useState(false);

  const handleSliderChange = (id: number, values: number[]) => {
    setUmbrales(umbrales.map((u: any) => u.id === id ? { ...u, min: values[0], max: values[1] } : u));
  };

  const handleSave = async () => {
    setIsSaving(true);
    await guardarUmbrales(userId, initialCultivo, umbrales);
    setIsSaving(false);
  };

  return (
    <Box>
      <Flex justify="between" mb="6">
        <Text size="6" weight="bold" color="white">Alertas</Text>
        <Select.Root value={initialCultivo.toString()} onValueChange={(v) => router.push(`?cultivo=${v}`)}>
          <Select.Trigger style={{ background: '#111827' }} />
          <Select.Content>
            {cultivos.map((c: any) => <Select.Item key={c.id} value={c.id.toString()}>{c.nombre_planta}</Select.Item>)}
          </Select.Content>
        </Select.Root>
      </Flex>

      {/* Alertas Activas */}
      <Box mb="6">
         <Text size="3" weight="bold" color="white" mb="3">Alertas Activas</Text>
         {initialData.alertasActivas.map((a: any) => (
            <Card key={a.id} mb="3" style={{ background: '#111827', borderColor: '#ef4444' }}>
               <Flex justify="between"><Text color="red" weight="bold">{a.titulo}</Text><Badge color="red">Activa</Badge></Flex>
               <Text color="gray" size="2">{a.sensor}: {a.valor}{a.unidad} - {a.mensaje}</Text>
            </Card>
         ))}
      </Box>

      <Grid columns={{ initial: '1', lg: '2' }} gap="5">
        <Card size="4" style={{ background: '#111827', borderColor: '#1f2937' }}>
          <Text size="4" weight="bold" color="white" mb="5">Configuración de umbrales</Text>
          <Flex direction="column" gap="5">
            {umbrales.map((u: any) => (
              <Box key={u.id}>
                <Flex justify="between"><Text color="gray" size="2">{u.nombre}</Text><Text color="green" size="2" weight="bold">{u.min} - {u.max} {u.unidad}</Text></Flex>
                <Slider value={[u.min, u.max]} min={0} max={100} step={1} onValueChange={(v) => handleSliderChange(u.id, v)} />
              </Box>
            ))}
            <Button onClick={handleSave} disabled={isSaving}>{isSaving ? 'Guardando...' : 'Aplicar cambios'}</Button>
          </Flex>
        </Card>

        <Card size="4" style={{ background: '#111827', borderColor: '#1f2937' }}>
          <Text size="4" weight="bold" color="white" mb="5">Historial de alertas</Text>
          {initialData.historial.map((h: any) => (
            <Flex key={h.id} justify="between" py="2" style={{ borderBottom: '1px solid #1f2937' }}>
                <Text size="2" color="blue">{h.tipo}</Text>
                <Text size="2" color="gray">{h.fecha}</Text>
            </Flex>
          ))}
        </Card>
      </Grid>
    </Box>
  );
}