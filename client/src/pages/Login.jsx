import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Container,
  Paper,
  Title,
  Text,
  TextInput,
  PasswordInput,
  Button,
  Stack,
  Box,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { IconUser, IconLock } from '@tabler/icons-react'
import { useAuth } from '../context/AuthContext'

const Login = () => {
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const form = useForm({
    initialValues: {
      usuario: '',
      contrasena: ''
    },
    validate: {
      usuario: (value) => (!value ? 'Usuario es requerido' : null),
      contrasena: (value) => (!value ? 'Contraseña es requerida' : null)
    }
  })

  const handleSubmit = async (values) => {
    setLoading(true)
    try {
      await login(values)
      notifications.show({
        title: '¡Bienvenido!',
        message: 'Inicio de sesión exitoso',
        color: 'green'
      })
      navigate('/')
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error.message || 'Credenciales inválidas',
        color: 'red'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #43a047 0%, #2e7d32 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
    >
      <Container size={420}>
        <Paper withBorder shadow="xl" p={40} radius="md">
          <Title order={2} ta="center" c="green.7" mb="xs">
            Bienvenido
          </Title>
          <Text size="sm" ta="center" c="dimmed" mb="xl">
            Sistema de Asistencia a Eventos
            <br />
            Unicordoba
          </Text>

          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack>
              <TextInput
                label="Usuario"
                placeholder="Ingresa tu usuario"
                leftSection={<IconUser size={16} />}
                size="md"
                {...form.getInputProps('usuario')}
                disabled={loading}
              />

              <PasswordInput
                label="Contraseña"
                placeholder="Ingresa tu contraseña"
                leftSection={<IconLock size={16} />}
                size="md"
                {...form.getInputProps('contrasena')}
                disabled={loading}
              />

              <Button
                type="submit"
                fullWidth
                size="md"
                color="green"
                loading={loading}
                mt="md"
              >
                Iniciar Sesión
              </Button>
            </Stack>
          </form>

          <Text size="xs" ta="center" c="dimmed" mt="xl">
            Sistema Institucional - Unicordoba
          </Text>
        </Paper>
      </Container>
    </Box>
  )
}

export default Login
