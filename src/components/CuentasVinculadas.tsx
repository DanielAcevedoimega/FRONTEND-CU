import type { CuentaVinculada } from '../services/authService'
import '../components/CuentasVinculadas.css'

interface CuentasVinculadasProps {
  cuentas: CuentaVinculada[] | undefined
  onAgregarCuenta?: () => void
  onEliminarCuenta?: (cuentaId: string) => void
  editable?: boolean
}

function CuentasVinculadas({ cuentas, onAgregarCuenta, onEliminarCuenta, editable = false }: CuentasVinculadasProps) {
  if (!cuentas || cuentas.length === 0) {
    return (
      <div className="sin-cuentas">
        <p>Sin cuentas vinculadas</p>
        {editable && onAgregarCuenta && (
          <button onClick={onAgregarCuenta} className="btn-agregar-cuenta">
            + Agregar Cuenta Vinculada
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="cuentas-container">
      <div className="cuentas-header">
        <h3>Cuentas Vinculadas</h3>
        {editable && onAgregarCuenta && (
          <button onClick={onAgregarCuenta} className="btn-agregar-pequeño">
            + Agregar Cuenta
          </button>
        )}
      </div>
      <div className="cuentas-grid">
        {cuentas.map(cuenta => (
          <div key={cuenta.id} className="cuenta-card">
            <div className="cuenta-header">
              <span className="plataforma-badge">{cuenta.plataforma}</span>
              <span className={`estado-mini ${cuenta.estado}`}>
                {cuenta.estado}
              </span>
            </div>
            <div className="cuenta-info">
              <div className="info-row">
                <label>Usuario:</label>
                <p>{cuenta.usuario}</p>
              </div>
              <div className="info-row">
                <label>Email:</label>
                <p>{cuenta.email}</p>
              </div>
              <div className="info-row">
                <label>Rol:</label>
                <p>{cuenta.rol}</p>
              </div>
              <div className="info-row">
                <label>Vinculada:</label>
                <p>{cuenta.fechaVinculacion}</p>
              </div>
            </div>
            <div className="cuenta-actions">
              {cuenta.url && (
                <a href={cuenta.url} target="_blank" rel="noopener noreferrer" className="btn-acceder">
                  Acceder
                </a>
              )}
              {editable && onEliminarCuenta && (
                <button 
                  onClick={() => onEliminarCuenta(cuenta.id)}
                  className="btn-eliminar-cuenta"
                  title="Eliminar cuenta vinculada"
                >
                  🗑️
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CuentasVinculadas
