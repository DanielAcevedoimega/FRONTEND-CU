import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/authService'
import type { Usuario, CuentaVinculada } from '../services/authService'
import TablaUsuarios from '../components/TablaUsuarios'
import ModalAgregarUsuario from '../components/ModalAgregarUsuario'
import ModalAgregarCuenta from '../components/ModalAgregarCuenta'
import CuentasVinculadas from '../components/CuentasVinculadas'
import '../components/Dashboard.css'

type Vista = 'lista' | 'detalle' | 'accesos'

// Función para formatear IDs de forma bonita
const formatearID = (id: string, indice?: number): string => {
  // Si tiene un número al final, lo usa como índice
  if (indice !== undefined) {
    return `USR#${String(indice + 1).padStart(3, '0')}`
  }
  // Si el ID es un UUID largo, se abrevia
  if (id && id.length > 12) {
    return `USR#${id.substring(0, 6).toUpperCase()}`
  }
  return id
}

function Dashboard() {
  const navigate = useNavigate()
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<Usuario | null>(null)
  const [vistaActual, setVistaActual] = useState<Vista>('lista')
  const [busqueda, setBusqueda] = useState('')
  const [filtros, setFiltros] = useState({
    rol: '',
    estado: ''
  })
  const [mostrarModal, setMostrarModal] = useState(false)
  const [mostrarModalCuenta, setMostrarModalCuenta] = useState(false)
  const usuarioActual = authService.getCurrentUser()

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login')
    } else {
      cargarUsuarios()
    }
  }, [navigate])

  const cargarUsuarios = async () => {
    try {
      const users = await authService.getUsuarios()
      setUsuarios(users)
    } catch (error) {
      console.error('Error al cargar usuarios:', error)
      alert('Error al cargar usuarios')
    }
  }

  const handleLogout = () => {
    authService.logout()
    navigate('/login')
  }

  const usuariosFiltrados = usuarios.filter(u => {
    const coincideBusqueda = 
      u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.email.toLowerCase().includes(busqueda.toLowerCase())
    
    const coincideRol = !filtros.rol || u.rol === filtros.rol
    const coincideEstado = !filtros.estado || u.estado === filtros.estado

    return coincideBusqueda && coincideRol && coincideEstado
  })

  const handleAgregarUsuario = async (nuevoUsuario: Omit<Usuario, 'id' | '_id' | 'fechaCreacion'>) => {
    try {
      await authService.createUsuario(nuevoUsuario)
      await cargarUsuarios()
      setMostrarModal(false)
    } catch (error) {
      console.error('Error al crear usuario:', error)
      alert('Error al crear usuario')
    }
  }

  const handleEliminarUsuario = async (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      try {
        await authService.deleteUsuario(id)
        await cargarUsuarios()
        if (usuarioSeleccionado?.id === id) {
          setUsuarioSeleccionado(null)
          setVistaActual('lista')
        }
      } catch (error) {
        console.error('Error al eliminar usuario:', error)
        alert('Error al eliminar usuario')
      }
    }
  }

  const handleEditarPermisos = async (id: string, nuevoPermisos: string[]) => {
    try {
      await authService.updatePermisos(id, nuevoPermisos)
      await cargarUsuarios()
      const usuarioActualizado = await authService.getUsuarioById(id)
      if (usuarioSeleccionado?.id === id && usuarioActualizado) {
        setUsuarioSeleccionado(usuarioActualizado)
      }
    } catch (error) {
      console.error('Error al actualizar permisos:', error)
      alert('Error al actualizar permisos')
    }
  }

  const handleAgregarCuentaVinculada = async (cuenta: Omit<CuentaVinculada, 'id' | '_id'>) => {
    if (usuarioSeleccionado) {
      try {
        await authService.agregarCuentaVinculada(usuarioSeleccionado.id, cuenta)
        await cargarUsuarios()
        const usuarioActualizado = await authService.getUsuarioById(usuarioSeleccionado.id)
        if (usuarioActualizado) {
          setUsuarioSeleccionado(usuarioActualizado)
        }
        setMostrarModalCuenta(false)
      } catch (error) {
        console.error('Error al agregar cuenta:', error)
        alert('Error al agregar cuenta vinculada')
      }
    }
  }

  const handleEliminarCuentaVinculada = async (cuentaId: string) => {
    if (usuarioSeleccionado && confirm('¿Estás seguro de que quieres eliminar esta cuenta vinculada?')) {
      try {
        await authService.eliminarCuentaVinculada(usuarioSeleccionado.id, cuentaId)
        await cargarUsuarios()
        const usuarioActualizado = await authService.getUsuarioById(usuarioSeleccionado.id)
        if (usuarioActualizado) {
          setUsuarioSeleccionado(usuarioActualizado)
        }
      } catch (error) {
        console.error('Error al eliminar cuenta:', error)
        alert('Error al eliminar cuenta vinculada')
      }
    }
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Sistema de Gestión de Usuarios</h1>
          <div className="user-info">
            <span>{usuarioActual?.nombre}</span>
            <button onClick={handleLogout} className="btn-logout">Salir</button>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <div className="dashboard-main">
        {vistaActual === 'lista' && (
          <>
            {/* Buscador y Filtros */}
            <div className="buscador-filtros">
              <input
                type="text"
                placeholder="Buscar por nombre o email..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="input-busqueda"
              />
              <select
                value={filtros.rol}
                onChange={(e) => setFiltros({ ...filtros, rol: e.target.value })}
                className="select-filtro"
              >
                <option value="">Todos los roles</option>
                <option value="admin">Admin</option>
                <option value="gerente">Gerente</option>
                <option value="usuario">Usuario</option>
              </select>
              <select
                value={filtros.estado}
                onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
                className="select-filtro"
              >
                <option value="">Todos los estados</option>
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
              <button 
                onClick={() => setMostrarModal(true)}
                className="btn-agregar"
              >
                + Agregar Usuario
              </button>
            </div>

            {/* Tabla de Usuarios */}
            <TablaUsuarios
              usuarios={usuariosFiltrados}
              onSeleccionar={(usuario: Usuario) => {
                setUsuarioSeleccionado(usuario)
                setVistaActual('detalle')
              }}
              onEliminar={handleEliminarUsuario}
              formatearID={formatearID}
            />
          </>
        )}

        {vistaActual === 'detalle' && usuarioSeleccionado && (
          <div className="vista-detalle">
            <button 
              onClick={() => setVistaActual('lista')}
              className="btn-volver"
            >
              ← Volver
            </button>
            
            <div className="contenedor-detalle">
              <div className="panel-info">
                <h2>Información del Usuario</h2>
                <div className="info-grid">
                  <div className="info-item">
                    <label>ID:</label>
                    <p style={{ fontFamily: 'monospace', fontWeight: 'bold', color: '#667eea', fontSize: '15px' }}>
                      {formatearID(usuarioSeleccionado.id, usuarios.indexOf(usuarioSeleccionado))}
                    </p>
                  </div>
                  <div className="info-item">
                    <label>Nombre:</label>
                    <p>{usuarioSeleccionado.nombre}</p>
                  </div>
                  <div className="info-item">
                    <label>Email:</label>
                    <p>{usuarioSeleccionado.email}</p>
                  </div>
                  <div className="info-item">
                    <label>Teléfono:</label>
                    <p>{usuarioSeleccionado.telefono || 'N/A'}</p>
                  </div>
                  <div className="info-item">
                    <label>Rol:</label>
                    <p className="rol-badge" data-rol={usuarioSeleccionado.rol}>
                      {usuarioSeleccionado.rol}
                    </p>
                  </div>
                  <div className="info-item">
                    <label>Estado:</label>
                    <p className="estado-badge" data-estado={usuarioSeleccionado.estado}>
                      {usuarioSeleccionado.estado}
                    </p>
                  </div>
                  <div className="info-item">
                    <label>Departamento:</label>
                    <p>{usuarioSeleccionado.departamento || 'N/A'}</p>
                  </div>
                  <div className="info-item">
                    <label>Fecha de Creación:</label>
                    <p>{usuarioSeleccionado.fechaCreacion}</p>
                  </div>
                </div>
              </div>

              <div className="panel-acciones">
                <h3>Acciones</h3>
                <button 
                  onClick={() => setVistaActual('accesos')}
                  className="btn-detalle"
                >
                  🔐 Gestionar Accesos
                </button>
                <button 
                  onClick={() => handleEliminarUsuario(usuarioSeleccionado.id)}
                  className="btn-eliminar"
                >
                  🗑️ Eliminar Usuario
                </button>
              </div>
            </div>

            <CuentasVinculadas 
              cuentas={usuarioSeleccionado.cuentasVinculadas} 
              onAgregarCuenta={() => setMostrarModalCuenta(true)}
              onEliminarCuenta={handleEliminarCuentaVinculada}
              editable={true}
            />
          </div>
        )}

        {vistaActual === 'accesos' && usuarioSeleccionado && (
          <div className="vista-accesos">
            <button 
              onClick={() => setVistaActual('detalle')}
              className="btn-volver"
            >
              ← Volver
            </button>
            
            <h2>Gestión de Permisos - {usuarioSeleccionado.nombre}</h2>
            
            <div className="permisos-container">
              <div className="permisos-disponibles">
                <h3>Permisos Disponibles</h3>
                <div className="permisos-lista">
                  {[
                    { id: 'crear_usuario', label: 'Crear Usuario' },
                    { id: 'editar_usuario', label: 'Editar Usuario' },
                    { id: 'eliminar_usuario', label: 'Eliminar Usuario' },
                    { id: 'ver_usuario', label: 'Ver Usuario' },
                    { id: 'ver_accesos', label: 'Ver Accesos' },
                    { id: 'gestionar_permisos', label: 'Gestionar Permisos' }
                  ].map(permiso => (
                    <label key={permiso.id} className="permiso-check">
                      <input
                        type="checkbox"
                        checked={usuarioSeleccionado.permisos.includes(permiso.id)}
                        onChange={(e) => {
                          let nuevosPermisos = [...usuarioSeleccionado.permisos]
                          if (e.target.checked) {
                            nuevosPermisos.push(permiso.id)
                          } else {
                            nuevosPermisos = nuevosPermisos.filter(p => p !== permiso.id)
                          }
                          handleEditarPermisos(usuarioSeleccionado.id, nuevosPermisos)
                        }}
                      />
                      <span>{permiso.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="permisos-actuales">
                <h3>Permisos Asignados</h3>
                <div className="permisos-tags">
                  {usuarioSeleccionado.permisos.length > 0 ? (
                    usuarioSeleccionado.permisos.map(p => (
                      <span key={p} className="permiso-tag">{p}</span>
                    ))
                  ) : (
                    <p className="sin-permisos">Sin permisos asignados</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal Agregar Usuario */}
      {mostrarModal && (
        <ModalAgregarUsuario
          onClose={() => setMostrarModal(false)}
          onAgregar={handleAgregarUsuario}
        />
      )}

      {/* Modal Agregar Cuenta Vinculada */}
      {mostrarModalCuenta && usuarioSeleccionado && (
        <ModalAgregarCuenta
          onClose={() => setMostrarModalCuenta(false)}
          onAgregar={handleAgregarCuentaVinculada}
        />
      )}
    </div>
  )
}

export default Dashboard
