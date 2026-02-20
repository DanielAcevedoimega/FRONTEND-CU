import { useState } from 'react'
import type { CuentaVinculada } from '../services/authService'

interface ModalAgregarCuentaProps {
  onClose: () => void
  onAgregar: (cuenta: Omit<CuentaVinculada, 'id'>) => void
}

function ModalAgregarCuenta({ onClose, onAgregar }: ModalAgregarCuentaProps) {
  const [datos, setDatos] = useState({
    plataforma: '',
    usuario: '',
    email: '',
    rol: '',
    estado: 'activo' as const,
    fechaVinculacion: new Date().toISOString().split('T')[0],
    url: ''
  })

  const [error, setError] = useState('')

  const plataformas = ['SAP', 'Monday', 'Vitex', 'Salesforce', 'Teams', 'Jira', 'Slack', 'Otro']

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    if (name === 'estado') {
      setDatos({ ...datos, [name]: value as any })
    } else {
      setDatos({ ...datos, [name]: value })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!datos.plataforma.trim()) {
      setError('La plataforma es requerida')
      return
    }
    if (!datos.usuario.trim()) {
      setError('El usuario es requerido')
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
    if (!datos.rol.trim()) {
      setError('El rol es requerido')
      return
    }

    onAgregar({
      plataforma: datos.plataforma,
      usuario: datos.usuario,
      email: datos.email,
      rol: datos.rol,
      estado: datos.estado,
      fechaVinculacion: datos.fechaVinculacion,
      url: datos.url || undefined
    })
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Agregar Cuenta Vinculada</h2>
          <button onClick={onClose} className="btn-cerrar-modal">✕</button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="formulario-cuenta">
          <div className="form-grupo">
            <label htmlFor="plataforma">Plataforma *</label>
            <select
              id="plataforma"
              name="plataforma"
              value={datos.plataforma}
              onChange={handleChange}
              required
            >
              <option value="">Selecciona una plataforma</option>
              {plataformas.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div className="form-grupo">
            <label htmlFor="usuario">Usuario *</label>
            <input
              type="text"
              id="usuario"
              name="usuario"
              value={datos.usuario}
              onChange={handleChange}
              placeholder="usuario@plataforma"
              required
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
            />
          </div>

          <div className="form-grupo">
            <label htmlFor="rol">Rol *</label>
            <input
              type="text"
              id="rol"
              name="rol"
              value={datos.rol}
              onChange={handleChange}
              placeholder="Ej: Admin, User, Member"
              required
            />
          </div>

          <div className="form-group-row">
            <div className="form-grupo">
              <label htmlFor="estado">Estado</label>
              <select
                id="estado"
                name="estado"
                value={datos.estado}
                onChange={handleChange}
              >
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </div>

            <div className="form-grupo">
              <label htmlFor="fechaVinculacion">Fecha de Vinculación</label>
              <input
                type="date"
                id="fechaVinculacion"
                name="fechaVinculacion"
                value={datos.fechaVinculacion}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-grupo">
            <label htmlFor="url">URL (opcional)</label>
            <input
              type="url"
              id="url"
              name="url"
              value={datos.url}
              onChange={handleChange}
              placeholder="https://ejemplo.com"
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-agregar">Agregar Cuenta</button>
            <button type="button" onClick={onClose} className="btn-cancelar">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ModalAgregarCuenta
