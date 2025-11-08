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
  ThemeIcon
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import {
  IconArrowLeft,
  IconCalendar,
  IconClock,
  IconMapPin,
  IconDeviceDesktop,
  IconUsers
} from '@tabler/icons-react'
import { eventosService, asistenciaService } from '../services/api'
import dayjs from 'dayjs'

const EventoDetalle = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [evento, setEvento] = useState(null)
  const [asistencias, setAsistencias] = useState([])
  const [loading, setLoading] = useState(true)

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

  if (!evento) {
    return (
      <Center h={400}>
        <Loader color="green" size="xl" />
      </Center>
    )
  }

  return (
    <Stack gap="lg">
      <Group>
        <Button
          variant="light"
          leftSection={<IconArrowLeft size={16} />}
          onClick={() => navigate('/eventos')}
        >
          Volver
        </Button>
      </Group>

      <Grid>
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            {evento.imagen_url && (
              <Image
                src={`${evento.imagen_url}`}
                alt={evento.nombre}
                radius="md"
                h={300}
                fit="cover"
                mb="lg"
              />
            )}

            <Title order={1} c="green.7" mb="md">
              {evento.nombre}
            </Title>

            {evento.descripcion && (
              <Text c="dimmed" mb="xl">
                {evento.descripcion}
              </Text>
            )}

            <Grid gutter="md">
              <Grid.Col span={6}>
                <Group gap="xs">
                  <ThemeIcon variant="light" color="blue" size="lg">
                    <IconCalendar size={20} />
                  </ThemeIcon>
                  <div>
                    <Text size="xs" c="dimmed">Fecha</Text>
                    <Text fw={500}>{dayjs(evento.fecha).format('DD/MM/YYYY')}</Text>
                  </div>
                </Group>
              </Grid.Col>

              <Grid.Col span={6}>
                <Group gap="xs">
                  <ThemeIcon variant="light" color="orange" size="lg">
                    <IconClock size={20} />
                  </ThemeIcon>
                  <div>
                    <Text size="xs" c="dimmed">Horario</Text>
                    <Text fw={500}>{evento.hora_inicio} - {evento.hora_fin}</Text>
                  </div>
                </Group>
              </Grid.Col>

              <Grid.Col span={6}>
                <Group gap="xs">
                  <ThemeIcon variant="light" color="red" size="lg">
                    <IconMapPin size={20} />
                  </ThemeIcon>
                  <div>
                    <Text size="xs" c="dimmed">Lugar</Text>
                    <Text fw={500}>{evento.lugar}</Text>
                  </div>
                </Group>
              </Grid.Col>

              <Grid.Col span={6}>
                <Group gap="xs">
                  <ThemeIcon variant="light" color="grape" size="lg">
                    <IconDeviceDesktop size={20} />
                  </ThemeIcon>
                  <div>
                    <Text size="xs" c="dimmed">Dispositivo</Text>
                    <Text fw={500}>{evento.dispositivo?.codigo}</Text>
                  </div>
                </Group>
              </Grid.Col>
            </Grid>

            <Group mt="xl" gap="xs">
              <Badge color={evento.activo ? 'green' : 'gray'} size="lg">
                {evento.activo ? 'Activo' : 'Inactivo'}
              </Badge>
              {evento.finalizado && (
                <Badge color="blue" size="lg">
                  Finalizado
                </Badge>
              )}
            </Group>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 4 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group gap="xs" mb="md">
              <ThemeIcon variant="light" color="green" size="lg">
                <IconUsers size={20} />
              </ThemeIcon>
              <Title order={3}>Asistencias</Title>
            </Group>
            <Center>
              <Stack align="center">
                <Text size={60} fw={700} c="green">
                  {asistencias.length}
                </Text>
                <Text size="sm" c="dimmed">
                  personas registradas
                </Text>
              </Stack>
            </Center>
          </Card>
        </Grid.Col>
      </Grid>

      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Title order={3} mb="md">
          Lista de Asistencias
        </Title>

        {loading ? (
          <Center h={200}>
            <Loader color="green" />
          </Center>
        ) : asistencias.length === 0 ? (
          <Center h={200}>
            <Text c="dimmed">No hay asistencias registradas aún</Text>
          </Center>
        ) : (
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>#</Table.Th>
                <Table.Th>Estudiante</Table.Th>
                <Table.Th>Código Carnet</Table.Th>
                <Table.Th>Email</Table.Th>
                <Table.Th>Fecha Registro</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {asistencias.map((asistencia, index) => (
                <Table.Tr key={asistencia._id}>
                  <Table.Td>{index + 1}</Table.Td>
                  <Table.Td>
                    <Text fw={500}>{asistencia.estudiante?.nombre}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge variant="light" color="green">
                      {asistencia.codigo_carnet_escaneado}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{asistencia.estudiante?.email}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">
                      {dayjs(asistencia.fecha_registro).format('DD/MM/YYYY HH:mm:ss')}
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </Card>
    </Stack>
  )
}

export default EventoDetalle
