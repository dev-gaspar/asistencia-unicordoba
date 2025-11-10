import { useEffect, useState } from 'react'
import {
  Stack,
  Title,
  Button,
  Table,
  Badge,
  ActionIcon,
  Group,
  Modal,
  TextInput,
  Textarea,
  Switch,
  Text,
  Card,
  Loader,
  Center,
  ScrollArea
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { useDisclosure } from '@mantine/hooks'
import { modals } from '@mantine/modals'
import { notifications } from '@mantine/notifications'
import { IconPlus, IconEdit, IconTrash, IconDeviceDesktop } from '@tabler/icons-react'
import { dispositivosService } from '../services/api'

const Dispositivos = () => {
  const [dispositivos, setDispositivos] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false)
  const [editingDispositivo, setEditingDispositivo] = useState(null)

  const form = useForm({
    initialValues: {
      codigo: '',
      nombre: '',
      ubicacion: '',
      nota: '',
      activo: true
    },
    validate: {
      codigo: (value) => (!value ? 'Código es requerido' : null),
      nombre: (value) => (!value ? 'Nombre es requerido' : null)
    }
  })

  useEffect(() => {
    loadDispositivos()
  }, [])

  const loadDispositivos = async () => {
    try {
      setLoading(true)
      const data = await dispositivosService.getAll()
      setDispositivos(data.dispositivos || [])
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'No se pudieron cargar los dispositivos',
        color: 'red'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (dispositivo = null) => {
    if (dispositivo) {
      setEditingDispositivo(dispositivo)
      form.setValues({
        codigo: dispositivo.codigo,
        nombre: dispositivo.nombre,
        ubicacion: dispositivo.ubicacion || '',
        nota: dispositivo.nota || '',
        activo: dispositivo.activo
      })
    } else {
      setEditingDispositivo(null)
      form.reset()
    }
    openModal()
  }

  const handleSubmit = async (values) => {
    try {
      if (editingDispositivo) {
        await dispositivosService.update(editingDispositivo._id, values)
        notifications.show({
          title: 'Éxito',
          message: 'Dispositivo actualizado correctamente',
          color: 'green'
        })
      } else {
        await dispositivosService.create(values)
        notifications.show({
          title: 'Éxito',
          message: 'Dispositivo creado correctamente',
          color: 'green'
        })
      }

      closeModal()
      loadDispositivos()
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error.message || 'Error al guardar dispositivo',
        color: 'red'
      })
    }
  }

  const handleDelete = (dispositivo) => {
    modals.openConfirmModal({
      title: 'Eliminar Dispositivo',
      children: (
        <Text size="sm">
          ¿Estás seguro de que quieres eliminar el dispositivo <strong>{dispositivo.nombre}</strong>?
        </Text>
      ),
      labels: { confirm: 'Eliminar', cancel: 'Cancelar' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          await dispositivosService.delete(dispositivo._id)
          notifications.show({
            title: 'Éxito',
            message: 'Dispositivo eliminado correctamente',
            color: 'green'
          })
          loadDispositivos()
        } catch (error) {
          notifications.show({
            title: 'Error',
            message: 'No se pudo eliminar el dispositivo',
            color: 'red'
          })
        }
      }
    })
  }

  if (loading) {
    return (
      <Center h={400}>
        <Loader color="green" size="xl" />
      </Center>
    )
  }

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <div>
          <Title order={1} c="green.7">
            Dispositivos ESP32
          </Title>
          <Text c="dimmed" size="sm">
            Gestión de dispositivos de registro de asistencia
          </Text>
        </div>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={() => handleOpenModal()}
          color="green"
        >
          Nuevo Dispositivo
        </Button>
      </Group>

      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <ScrollArea>
          <Table striped highlightOnHover horizontalSpacing="sm" verticalSpacing="xs" fontSize="sm">
            <Table.Thead>
              <Table.Tr>
                <Table.Th style={{ minWidth: 120 }}>Código</Table.Th>
                <Table.Th style={{ minWidth: 200 }}>Nombre</Table.Th>
                <Table.Th style={{ minWidth: 180 }}>Ubicación</Table.Th>
                <Table.Th style={{ minWidth: 100 }}>Estado</Table.Th>
                <Table.Th style={{ minWidth: 100 }}>Acciones</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {dispositivos.map((dispositivo) => (
                <Table.Tr key={dispositivo._id}>
                  <Table.Td>
                    <Group gap="xs">
                      <IconDeviceDesktop size={14} />
                      <Badge variant="light" color="grape" size="sm">
                        {dispositivo.codigo}
                      </Badge>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Text fw={500} size="sm" lineClamp={1}>{dispositivo.nombre}</Text>
                    {dispositivo.nota && (
                      <Text size="xs" c="dimmed" lineClamp={1}>{dispositivo.nota}</Text>
                    )}
                  </Table.Td>
                  <Table.Td>
                    <Text size="xs" lineClamp={1}>{dispositivo.ubicacion || '-'}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge color={dispositivo.activo ? 'green' : 'gray'} variant="light" size="sm">
                      {dispositivo.activo ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs" wrap="nowrap">
                      <ActionIcon
                        variant="light"
                        color="blue"
                        onClick={() => handleOpenModal(dispositivo)}
                        size="sm"
                      >
                        <IconEdit size={14} />
                      </ActionIcon>
                      <ActionIcon
                        variant="light"
                        color="red"
                        onClick={() => handleDelete(dispositivo)}
                        size="sm"
                      >
                        <IconTrash size={14} />
                      </ActionIcon>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </Card>

      <Modal
        opened={modalOpened}
        onClose={closeModal}
        title={editingDispositivo ? 'Editar Dispositivo' : 'Nuevo Dispositivo'}
        size="md"
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <TextInput
              label="Código"
              placeholder="ESP001"
              {...form.getInputProps('codigo')}
              required
              disabled={!!editingDispositivo}
            />

            <TextInput
              label="Nombre"
              placeholder="Entrada Principal"
              {...form.getInputProps('nombre')}
              required
            />

            <TextInput
              label="Ubicación"
              placeholder="Edificio A - Piso 1"
              {...form.getInputProps('ubicacion')}
            />

            <Textarea
              label="Nota"
              placeholder="Notas adicionales sobre el dispositivo"
              {...form.getInputProps('nota')}
              minRows={3}
            />

            <Switch
              label="Activo"
              {...form.getInputProps('activo', { type: 'checkbox' })}
            />

            <Group justify="flex-end" mt="md">
              <Button variant="light" onClick={closeModal}>
                Cancelar
              </Button>
              <Button type="submit" color="green">
                {editingDispositivo ? 'Actualizar' : 'Crear'}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Stack>
  )
}

export default Dispositivos
