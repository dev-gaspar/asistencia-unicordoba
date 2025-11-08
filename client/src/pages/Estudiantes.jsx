import { useEffect, useState } from 'react'
import {
  Stack,
  Title,
  TextInput,
  Table,
  Badge,
  Group,
  Text,
  Card,
  Pagination,
  Loader,
  Center
} from '@mantine/core'
import { useDebouncedValue } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import { IconSearch } from '@tabler/icons-react'
import { estudiantesService } from '../services/api'

const Estudiantes = () => {
  const [estudiantes, setEstudiantes] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [debouncedSearch] = useDebouncedValue(search, 500)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    loadEstudiantes()
  }, [page, debouncedSearch])

  const loadEstudiantes = async () => {
    try {
      setLoading(true)
      const data = await estudiantesService.getAll({
        page,
        limit: 50,
        search: debouncedSearch
      })
      setEstudiantes(data.estudiantes || [])
      setTotalPages(data.totalPages || 1)
      setTotal(data.total || 0)
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'No se pudieron cargar los estudiantes',
        color: 'red'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Stack gap="lg">
      <div>
        <Title order={1} c="green.7">
          Estudiantes
        </Title>
        <Text c="dimmed" size="sm">
          {total.toLocaleString()} estudiantes registrados
        </Text>
      </div>

      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <TextInput
          placeholder="Buscar por nombre, código, identificación o email..."
          leftSection={<IconSearch size={16} />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          mb="md"
          size="md"
        />

        {loading ? (
          <Center h={400}>
            <Loader color="green" size="xl" />
          </Center>
        ) : (
          <>
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Nombre</Table.Th>
                  <Table.Th>Identificación</Table.Th>
                  <Table.Th>Código Carnet</Table.Th>
                  <Table.Th>Email</Table.Th>
                  <Table.Th>Estado</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {estudiantes.map((estudiante) => (
                  <Table.Tr key={estudiante._id}>
                    <Table.Td>{estudiante.nombre}</Table.Td>
                    <Table.Td>
                      <Text size="sm">{estudiante.tipo_identificacion}</Text>
                      <Text size="xs" c="dimmed">{estudiante.identificacion}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge variant="light" color="green">
                        {estudiante.codigo_carnet}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{estudiante.email}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge color={estudiante.activo ? 'green' : 'gray'} variant="light">
                        {estudiante.activo ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>

            {totalPages > 1 && (
              <Group justify="center" mt="xl">
                <Pagination
                  value={page}
                  onChange={setPage}
                  total={totalPages}
                  color="green"
                />
              </Group>
            )}
          </>
        )}
      </Card>
    </Stack>
  )
}

export default Estudiantes
