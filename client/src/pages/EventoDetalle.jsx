import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Stack,
  Title,
  Button,
  Group,
  Card,
  Text,
  Badge,
  Table,
  Loader,
  Center,
  Grid,
  Image,
  ThemeIcon,
  Paper,
  SimpleGrid,
  Box,
  Divider,
  ScrollArea
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import {
  IconArrowLeft,
  IconCalendar,
  IconClock,
  IconMapPin,
  IconDeviceDesktop,
  IconUsers,
  IconDownload
} from '@tabler/icons-react'
import { eventosService, asistenciaService } from '../services/api'
import dayjs from 'dayjs'

const EventoDetalle = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [evento, setEvento] = useState(null)
  const [asistencias, setAsistencias] = useState([])
  const [loading, setLoading] = useState(true)
  const [exportando, setExportando] = useState(false)

  useEffect(() => {
    loadEvento()
    loadAsistencias(true) // Mostrar loader en carga inicial

    // Actualizar asistencias cada 2 segundos sin loader
    const interval = setInterval(() => {
      loadAsistencias(false) // No mostrar loader en actualizaciones automáticas
    }, 2000)

    // Limpiar intervalo al desmontar o cambiar evento
    return () => clearInterval(interval)
  }, [id])

  const loadEvento = async () => {
    try {
      const data = await eventosService.getById(id)
      setEvento(data.evento)
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'No se pudo cargar el evento',
        color: 'red'
      })
      navigate('/eventos')
    }
  }

  const loadAsistencias = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true)
      const data = await asistenciaService.getByEvento(id)
      setAsistencias(data.asistencias || [])
    } catch (error) {
      console.error('Error loading asistencias:', error)
    } finally {
      if (showLoader) setLoading(false)
    }
  }

  const handleExportarExcel = async () => {
    try {
      setExportando(true)
      const blob = await asistenciaService.exportarExcel(id)

      // Crear link de descarga
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `asistencias_${evento.nombre.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      notifications.show({
        title: 'Éxito',
        message: 'Asistencias exportadas correctamente',
        color: 'green'
      })
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'No se pudo exportar las asistencias',
        color: 'red'
      })
    } finally {
      setExportando(false)
    }
  }

  if (!evento) {
    return (
      <Center h={400}>
        <Loader color="green" size="xl" />
      </Center>
    )
  }

  return (
    <Stack gap="md">
      <Group justify="space-between" wrap="wrap">
        <Button
          variant="light"
          leftSection={<IconArrowLeft size={16} />}
          onClick={() => navigate('/eventos')}
          size="sm"
        >
          Volver
        </Button>
        <Group gap="xs">
          <Button
            color="green"
            leftSection={<IconDownload size={16} />}
            onClick={handleExportarExcel}
            loading={exportando}
            disabled={asistencias.length === 0}
            size="sm"
          >
            Exportar a Excel
          </Button>
        </Group>
      </Group>

      <Card shadow="sm" padding="md" radius="md" withBorder>
        <Grid gutter="md">
          {evento.imagen_url && (
            <Grid.Col span={{ base: 12, sm: 4, md: 3 }}>
              <Image
                src={`${evento.imagen_url}`}
                alt={evento.nombre}
                radius="md"
                h={180}
                fit="cover"
              />
            </Grid.Col>
          )}

          <Grid.Col span={{ base: 12, sm: evento.imagen_url ? 8 : 12, md: evento.imagen_url ? 9 : 12 }}>
            <Stack gap="xs">
              <Group justify="space-between" align="flex-start">
                <div>
                  <Title order={2} c="green.7">
                    {evento.nombre}
                  </Title>
                  {evento.descripcion && (
                    <Text c="dimmed" size="sm" mt={4}>
                      {evento.descripcion}
                    </Text>
                  )}
                </div>
                <Group gap="xs">
                  <Badge color={evento.activo ? 'green' : 'gray'} size="md">
                    {evento.activo ? 'Activo' : 'Inactivo'}
                  </Badge>
                  {evento.finalizado && (
                    <Badge color="blue" size="md">
                      Finalizado
                    </Badge>
                  )}
                </Group>
              </Group>

              <Divider my="xs" />

              <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
                <Group gap="xs" wrap="nowrap">
                  <ThemeIcon variant="light" color="blue" size="sm">
                    <IconCalendar size={16} />
                  </ThemeIcon>
                  <Box style={{ minWidth: 0 }}>
                    <Text size="xs" c="dimmed">Fecha</Text>
                    <Text size="sm" fw={500}>{dayjs(evento.fecha).format('DD/MM/YYYY')}</Text>
                  </Box>
                </Group>

                <Group gap="xs" wrap="nowrap">
                  <ThemeIcon variant="light" color="orange" size="sm">
                    <IconClock size={16} />
                  </ThemeIcon>
                  <Box style={{ minWidth: 0 }}>
                    <Text size="xs" c="dimmed">Horario</Text>
                    <Text size="sm" fw={500}>{evento.hora_inicio} - {evento.hora_fin}</Text>
                  </Box>
                </Group>

                <Group gap="xs" wrap="nowrap">
                  <ThemeIcon variant="light" color="red" size="sm">
                    <IconMapPin size={16} />
                  </ThemeIcon>
                  <Box style={{ minWidth: 0 }}>
                    <Text size="xs" c="dimmed">Lugar</Text>
                    <Text size="sm" fw={500} lineClamp={1}>{evento.lugar}</Text>
                  </Box>
                </Group>

                <Group gap="xs" wrap="nowrap">
                  <ThemeIcon variant="light" color="grape" size="sm">
                    <IconDeviceDesktop size={16} />
                  </ThemeIcon>
                  <Box style={{ minWidth: 0 }}>
                    <Text size="xs" c="dimmed">Dispositivo</Text>
                    <Text size="sm" fw={500}>{evento.dispositivo?.codigo}</Text>
                  </Box>
                </Group>
              </SimpleGrid>
            </Stack>
          </Grid.Col>
        </Grid>
      </Card>

      <Card shadow="sm" padding="md" radius="md" withBorder>
        <Group justify="space-between" mb="sm">
          <Title order={4}>Lista de Asistencias</Title>
          <Badge size="lg" variant="light" color="green">
            {asistencias.length} registros
          </Badge>
        </Group>

        {loading ? (
          <Center h={200}>
            <Loader color="green" />
          </Center>
        ) : asistencias.length === 0 ? (
          <Center h={200}>
            <Text c="dimmed">No hay asistencias registradas aún</Text>
          </Center>
        ) : (
          <ScrollArea>
            <Table striped highlightOnHover horizontalSpacing="xs" verticalSpacing="xs" fontSize="sm">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th style={{ width: 50 }}>#</Table.Th>
                  <Table.Th style={{ minWidth: 250 }}>Estudiante</Table.Th>
                  <Table.Th style={{ minWidth: 130 }}>Código Carnet</Table.Th>
                  <Table.Th style={{ minWidth: 200 }}>Email</Table.Th>
                  <Table.Th style={{ minWidth: 150 }}>Fecha Registro</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {asistencias.map((asistencia, index) => (
                  <Table.Tr key={asistencia._id}>
                    <Table.Td>{index + 1}</Table.Td>
                    <Table.Td>
                      <Text size="sm" fw={500} lineClamp={1}>{asistencia.estudiante?.nombre}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge variant="light" color="green" size="sm">
                        {asistencia.codigo_carnet_escaneado}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text size="xs" lineClamp={1}>{asistencia.estudiante?.email}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="xs">
                        {dayjs(asistencia.fecha_registro).format('DD/MM/YYYY HH:mm:ss')}
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </ScrollArea>
        )}
      </Card>
    </Stack>
  )
}

export default EventoDetalle
