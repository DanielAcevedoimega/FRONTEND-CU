import type { Usuario } from '../services/authService'

interface TablaUsuariosProps {
  usuarios: Usuario[]
  onSeleccionar: (usuario: Usuario) => void
  onEliminar: (id: string) => void
  formatearID?: (id: string, indice?: number) => string
}

function TablaUsuarios({ usuarios, onSeleccionar, onEliminar, formatearID }: TablaUsuariosProps) {
  return (
    <div className="tabla-container">
      <table className="tabla-usuarios">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Estado</th>
            <th>Departamento</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.length > 0 ? (
            usuarios.map((usuario, indice) => (
              <tr key={usuario.id} className="fila-usuario">
                <td><span style={{ fontFamily: 'monospace', fontWeight: 'bold', color: '#667eea' }}>{formatearID ? formatearID(usuario.id, indice) : usuario.id}</span></td>
                <td>{usuario.nombre}</td>
                <td>{usuario.email}</td>
                <td>
                  <span className="rol-badge" data-rol={usuario.rol}>
                    {usuario.rol}
                  </span>
                </td>
                <td>
                  <span className="estado-badge" data-estado={usuario.estado}>
                    {usuario.estado}
                  </span>
                </td>
                <td>{usuario.departamento || '-'}</td>
                <td className="acciones-celda">
                  <button 
                    onClick={() => onSeleccionar(usuario)}
                    className="btn-ver"
                    title="Ver detalle"
                  >
                    👁️ Ver
                  </button>
                  <button 
                    onClick={() => onEliminar(usuario.id)}
                    className="btn-eliminar-tabla"
                    title="Eliminar usuario"
                  >
                    🗑️ Eliminar
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={7} className="sin-resultados">
                No se encontraron usuarios
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <div className="tabla-footer">
        <p>Total de usuarios: <strong>{usuarios.length}</strong></p>
      </div>
    </div>
  )
}

export default TablaUsuarios
