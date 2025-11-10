import { useEffect, useState } from 'react'
import {
  Stack,
  Title,
  Select,
  Table,
  Badge,
  Text,
  Card,
  Loader,
  Center,
  Group,
  ScrollArea
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { eventosService, asistenciaService } from '../services/api'
import dayjs from 'dayjs'

const Asistencias = () => {
  const [eventos, setEventos] = useState([])
  const [selectedEvento, setSelectedEvento] = useState(null)
  const [asistencias, setAsistencias] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadEventos()
  }, [])

  useEffect(() => {
    if (selectedEvento) {
      loadAsistencias(true) // Mostrar loader en carga inicial
      
      // Actualizar asistencias cada 2 segundos sin loader
      const interval = setInterval(() => {
        loadAsistencias(false) // No mostrar loader en actualizaciones automáticas
      }, 2000)

      // Limpiar intervalo al desmontar o cambiar evento
      return () => clearInterval(interval)
    } else {
      // Limpiar asistencias si no hay evento seleccionado
      setAsistencias([])
    }
  }, [selectedEvento])

  const loadEventos = async () => {
    try {
      const data = await eventosService.getAll()
      setEventos(data.eventos || [])
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'No se pudieron cargar los eventos',
        color: 'red'
      })
    }
  }

  const loadAsistencias = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true)
      const data = await asistenciaService.getByEvento(selectedEvento)
      setAsistencias(data.asistencias || [])
    } catch (error) {
      if (showLoader) {
        notifications.show({
          title: 'Error',
          message: 'No se pudieron cargar las asistencias',
          color: 'red'
        })
      }
    } finally {
      if (showLoader) setLoading(false)
    }
  }

  const eventosOptions = eventos.map(e => ({
    value: e._id,
    label: `${e.nombre} - ${dayjs(e.fecha).format('DD/MM/YYYY')}`
  }))

  return (
    <Stack gap="lg">
      <div>
        <Title order={1} c="green.7">
          Asistencias
        </Title>
        <Text c="dimmed" size="sm">
          Consulta de asistencias por evento
        </Text>
      </div>

      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Select
          label="Selecciona un Evento"
          placeholder="Elige el evento a consultar"
          data={eventosOptions}
          value={selectedEvento}
          onChange={setSelectedEvento}
          searchable
          clearable
          size="md"
        />
      </Card>

      {selectedEvento && (
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Group justify="space-between" mb="md">
            <Title order={3}>Registros de Asistencia</Title>
            <Badge size="lg" color="green">
              {asistencias.length} asistencias
            </Badge>
          </Group>

          {loading ? (
            <Center h={300}>
              <Loader color="green" size="xl" />
            </Center>
          ) : asistencias.length === 0 ? (
            <Center h={300}>
              <Text c="dimmed">No hay asistencias registradas para este evento</Text>
            </Center>
          ) : (
            <ScrollArea>
              <Table striped highlightOnHover horizontalSpacing="xs" verticalSpacing="xs" fontSize="sm">
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th style={{ width: 50 }}>#</Table.Th>
                    <Table.Th style={{ minWidth: 250 }}>Estudiante</Table.Th>
                    <Table.Th style={{ minWidth: 130 }}>Código Carnet</Table.Th>
                    <Table.Th style={{ minWidth: 120 }}>Identificación</Table.Th>
                    <Table.Th style={{ minWidth: 200 }}>Email</Table.Th>
                    <Table.Th style={{ minWidth: 150 }}>Fecha Registro</Table.Th>
                    <Table.Th style={{ minWidth: 100 }}>Dispositivo</Table.Th>
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
                        <Text size="xs">{asistencia.estudiante?.identificacion}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="xs" lineClamp={1}>{asistencia.estudiante?.email}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="xs">
                          {dayjs(asistencia.fecha_registro).format('DD/MM/YYYY HH:mm:ss')}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge variant="light" color="grape" size="sm">
                          {asistencia.dispositivo?.codigo}
                        </Badge>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </ScrollArea>
          )}
        </Card>
      )}
    </Stack>
  )
}

export default Asistencias
