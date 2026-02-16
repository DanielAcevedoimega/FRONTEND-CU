import '../pages/login.css'

function Login() {
  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Iniciar Sesión</h1>
        <form>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input 
              type="email" 
              id="email" 
              placeholder="Ingresa tu email"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Contraseña:</label>
            <input 
              type="password" 
              id="password" 
              placeholder="Ingresa tu contraseña"
              required
            />
          </div>
          <button type="submit" className="login-btn">Ingresar</button>
        </form>
      </div>
    </div>
  )
}

export default Login
