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
  Select,
  Switch,
  Text,
  Card,
  Loader,
  Center
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { useDisclosure } from '@mantine/hooks'
import { modals } from '@mantine/modals'
import { notifications } from '@mantine/notifications'
import { IconPlus, IconEdit, IconTrash } from '@tabler/icons-react'
import { usuariosService } from '../services/api'

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false)
  const [editingUser, setEditingUser] = useState(null)

  const form = useForm({
    initialValues: {
      usuario: '',
      contrasena: '',
      rol: 'operador',
      activo: true
    },
    validate: {
      usuario: (value) => (!value ? 'Usuario es requerido' : null),
      contrasena: (value) => {
        if (!editingUser && !value) return 'Contraseña es requerida'
        return null
      }
    }
  })

  useEffect(() => {
    loadUsuarios()
  }, [])

  const loadUsuarios = async () => {
    try {
      setLoading(true)
      const data = await usuariosService.getAll()
      setUsuarios(data.usuarios || [])
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'No se pudieron cargar los usuarios',
        color: 'red'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingUser(user)
      form.setValues({
        usuario: user.usuario,
        contrasena: '',
        rol: user.rol,
        activo: user.activo
      })
    } else {
      setEditingUser(null)
      form.reset()
    }
    openModal()
  }

  const handleSubmit = async (values) => {
    try {
      const dataToSend = { ...values }
      if (editingUser && !values.contrasena) {
        delete dataToSend.contrasena
      }

      if (editingUser) {
        await usuariosService.update(editingUser._id, dataToSend)
        notifications.show({
          title: 'Éxito',
          message: 'Usuario actualizado correctamente',
          color: 'green'
        })
      } else {
        await usuariosService.create(dataToSend)
        notifications.show({
          title: 'Éxito',
          message: 'Usuario creado correctamente',
          color: 'green'
        })
      }

      closeModal()
      loadUsuarios()
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error.message || 'Error al guardar usuario',
        color: 'red'
      })
    }
  }

  const handleDelete = (user) => {
    modals.openConfirmModal({
      title: 'Eliminar Usuario',
      children: (
        <Text size="sm">
          ¿Estás seguro de que quieres eliminar el usuario <strong>{user.usuario}</strong>?
        </Text>
      ),
      labels: { confirm: 'Eliminar', cancel: 'Cancelar' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          await usuariosService.delete(user._id)
          notifications.show({
            title: 'Éxito',
            message: 'Usuario eliminado correctamente',
            color: 'green'
          })
          loadUsuarios()
        } catch (error) {
          notifications.show({
            title: 'Error',
            message: 'No se pudo eliminar el usuario',
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
            Usuarios
          </Title>
          <Text c="dimmed" size="sm">
            Gestión de usuarios del sistema
          </Text>
        </div>
        <Button leftSection={<IconPlus size={16} />} onClick={() => handleOpenModal()} color="green">
          Nuevo Usuario
        </Button>
      </Group>

      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Usuario</Table.Th>
              <Table.Th>Rol</Table.Th>
              <Table.Th>Estado</Table.Th>
              <Table.Th>Acciones</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {usuarios.map((user) => (
              <Table.Tr key={user._id}>
                <Table.Td>{user.usuario}</Table.Td>
                <Table.Td>
                  <Badge color={user.rol === 'admin' ? 'red' : 'blue'} variant="light">
                    {user.rol}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Badge color={user.activo ? 'green' : 'gray'} variant="light">
                    {user.activo ? 'Activo' : 'Inactivo'}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <ActionIcon
                      variant="light"
                      color="blue"
                      onClick={() => handleOpenModal(user)}
                    >
                      <IconEdit size={16} />
                    </ActionIcon>
                    <ActionIcon
                      variant="light"
                      color="red"
                      onClick={() => handleDelete(user)}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Card>

      <Modal
        opened={modalOpened}
        onClose={closeModal}
        title={editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
        size="md"
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <TextInput
              label="Usuario"
              placeholder="Nombre de usuario"
              {...form.getInputProps('usuario')}
              required
            />

            <TextInput
              label="Contraseña"
              type="password"
              placeholder={editingUser ? 'Dejar vacío para no cambiar' : 'Contraseña'}
              {...form.getInputProps('contrasena')}
              required={!editingUser}
            />

            <Select
              label="Rol"
              data={[
                { value: 'admin', label: 'Administrador' },
                { value: 'operador', label: 'Operador' }
              ]}
              {...form.getInputProps('rol')}
              required
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
                {editingUser ? 'Actualizar' : 'Crear'}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Stack>
  )
}

export default Usuarios
