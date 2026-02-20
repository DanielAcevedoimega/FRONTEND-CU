import { useState } from 'react'
import type { Usuario } from '../services/authService'

interface ModalAgregarUsuarioProps {
  onClose: () => void
  onAgregar: (usuario: Omit<Usuario, 'id' | '_id' | 'fechaCreacion'>) => Promise<void>
}

function ModalAgregarUsuario({ onClose, onAgregar }: ModalAgregarUsuarioProps) {
  const [datos, setDatos] = useState({
    nombre: '',
    email: '',
    telefono: '',
    rol: 'usuario' as const,
    estado: 'activo' as const,
    departamento: ''
  })

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    if (name === 'rol' || name === 'estado') {
      setDatos({ ...datos, [name]: value as any })
    } else {
      setDatos({ ...datos, [name]: value })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!datos.nombre.trim()) {
      setError('El nombre es requerido')
      return
    }
    if (!datos.email.trim()) {
      setError('El email es requerido')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.email)) {
      setError('Email inválido')
      return
    }

    setLoading(true)
    try {
      await onAgregar(datos)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al agregar usuario')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Agregar Nuevo Usuario</h2>
          <button onClick={onClose} className="btn-cerrar-modal" disabled={loading}>✕</button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="formulario-usuario">
          <div className="form-grupo">
            <label htmlFor="nombre">Nombre *</label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={datos.nombre}
              onChange={handleChange}
              placeholder="Nombre completo"
              required
              disabled={loading}
            />
          </div>

          <div className="form-grupo">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={datos.email}
              onChange={handleChange}
              placeholder="correo@example.com"
              required
              disabled={loading}
            />
          </div>

          <div className="form-grupo">
            <label htmlFor="telefono">Teléfono</label>
            <input
              type="tel"
              id="telefono"
              name="telefono"
              value={datos.telefono}
              onChange={handleChange}
              placeholder="1234567890"
              disabled={loading}
            />
          </div>

          <div className="form-grupo">
            <label htmlFor="departamento">Departamento</label>
            <input
              type="text"
              id="departamento"
              name="departamento"
              value={datos.departamento}
              onChange={handleChange}
              placeholder="ej: TI, RRHH"
              disabled={loading}
            />
          </div>

          <div className="form-grupo">
            <label htmlFor="rol">Rol *</label>
            <select
              id="rol"
              name="rol"
              value={datos.rol}
              onChange={handleChange}
              required
              disabled={loading}
            >
              <option value="usuario">Usuario</option>
              <option value="gerente">Gerente</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="form-grupo">
            <label htmlFor="estado">Estado *</label>
            <select
              id="estado"
              name="estado"
              value={datos.estado}
              onChange={handleChange}
              required
              disabled={loading}
            >
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-cancelar" disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="btn-guardar" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar Usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ModalAgregarUsuario
