// AuthService - Manejo de autenticación con Backend API
const API_BASE_URL = 'http://localhost:5000/api';

export interface CuentaVinculada {
  _id?: string;
  id?: string;
  plataforma: string;
  usuario: string;
  email: string;
  rol: string;
  estado: 'activo' | 'inactivo';
  fechaVinculacion: string;
  url?: string;
}

export interface Usuario {
  _id?: string;
  id?: string;
  nombre: string;
  email: string;
  rol: string;
  estado: 'activo' | 'inactivo';
  permisos: string[];
  createdAt?: string;
  fechaCreacion?: string;
  updatedAt?: string;
  telefono?: string;
  departamento?: string;
  cuentasVinculadas?: CuentaVinculada[];
}

export interface LoginCredentials {
  email: string;
  contraseña: string;
}

export interface AuthResponse {
  usuario: Usuario;
  token: string;
}

// Helper para normalizar usuarios del backend
const normalizarUsuario = (usuarioBackend: any): Usuario => {
  return {
    id: usuarioBackend._id || usuarioBackend.id,
    _id: usuarioBackend._id,
    nombre: usuarioBackend.nombre,
    email: usuarioBackend.email,
    rol: usuarioBackend.rol,
    estado: usuarioBackend.estado,
    permisos: usuarioBackend.permisos || [],
    fechaCreacion: usuarioBackend.createdAt ? usuarioBackend.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
    telefono: usuarioBackend.telefono,
    departamento: usuarioBackend.departamento,
    cuentasVinculadas: usuarioBackend.cuentasVinculadas || []
  };
};

// Datos de demostración
const usuariosDemo: Usuario[] = [];

// Usuario admin para login
const adminUser: Usuario = {
  id: "admin-001",
  nombre: "Admin Sistema",
  email: "admin@example.com",
  rol: "admin",
  estado: "activo",
  permisos: ["crear_usuario", "editar_usuario", "eliminar_usuario", "ver_accesos", "gestionar_permisos"],
  fechaCreacion: "2022-01-01",
  telefono: "1111111111",
  departamento: "TI",
  cuentasVinculadas: []
};

export const authService = {
  // Login
  login: async (email: string, contraseña: string): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, contraseña })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al iniciar sesión');
    }

    const data = await response.json();
    
    if (data.token) {
      localStorage.setItem('authToken', data.token);
      const usuarioNormalizado = normalizarUsuario(data.usuario);
      localStorage.setItem('currentUser', JSON.stringify(usuarioNormalizado));
      return { usuario: usuarioNormalizado, token: data.token };
    }

    throw new Error('No se recibió token de autenticación');
  },

  // Logout
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
  },

  // Obtener usuario actual
  getCurrentUser: (): Usuario | null => {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  },

  // Verificar si está autenticado
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('authToken');
  },

  // Obtener token
  getToken: (): string | null => {
    return localStorage.getItem('authToken');
  },

  // Obtener todos los usuarios
  getUsuarios: async (): Promise<Usuario[]> => {
    const token = authService.getToken();
    if (!token) throw new Error('No autenticado');

    const response = await fetch(`${API_BASE_URL}/usuarios`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Error al obtener usuarios');
    }

    const data = await response.json();
    return data.datos.map(normalizarUsuario);
  },

  // Obtener usuario por ID
  getUsuarioById: async (id: string): Promise<Usuario | null> => {
    const token = authService.getToken();
    if (!token) throw new Error('No autenticado');

    const response = await fetch(`${API_BASE_URL}/usuarios/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Error al obtener usuario');
    }

    const data = await response.json();
    return normalizarUsuario(data.datos);
  },

  // Crear usuario
  createUsuario: async (usuario: Omit<Usuario, 'id' | '_id' | 'fechaCreacion'>): Promise<Usuario> => {
    const token = authService.getToken();
    if (!token) throw new Error('No autenticado');

    const payload = {
      nombre: usuario.nombre,
      email: usuario.email,
      telefono: usuario.telefono,
      estado: usuario.estado || 'activo',
      rol: usuario.rol || 'usuario',
      departamento: usuario.departamento
    };

    const response = await fetch(`${API_BASE_URL}/usuarios`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al crear usuario');
    }

    const data = await response.json();
    return normalizarUsuario(data.datos);
  },

  // Actualizar usuario
  updateUsuario: async (id: string, datos: Partial<Usuario>): Promise<Usuario> => {
    const token = authService.getToken();
    if (!token) throw new Error('No autenticado');

    const payload: any = {};
    if (datos.nombre) payload.nombre = datos.nombre;
    if (datos.email) payload.email = datos.email;
    if (datos.telefono) payload.telefono = datos.telefono;
    if (datos.estado) payload.estado = datos.estado;
    if (datos.rol) payload.rol = datos.rol;
    if (datos.departamento) payload.departamento = datos.departamento;

    const response = await fetch(`${API_BASE_URL}/usuarios/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error('Error al actualizar usuario');
    }

    const data = await response.json();
    return normalizarUsuario(data.datos);
  },

  // Eliminar usuario
  deleteUsuario: async (id: string): Promise<void> => {
    const token = authService.getToken();
    if (!token) throw new Error('No autenticado');

    const response = await fetch(`${API_BASE_URL}/usuarios/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Error al eliminar usuario');
    }
  },

  // Agregar cuenta vinculada
  agregarCuentaVinculada: async (usuarioId: string, cuenta: Omit<CuentaVinculada, 'id' | '_id'>): Promise<Usuario> => {
    const token = authService.getToken();
    if (!token) throw new Error('No autenticado');

    const response = await fetch(`${API_BASE_URL}/usuarios/${usuarioId}/cuentas`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(cuenta)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al agregar cuenta vinculada');
    }

    const data = await response.json();
    return normalizarUsuario(data.datos);
  },

  // Eliminar cuenta vinculada
  eliminarCuentaVinculada: async (usuarioId: string, cuentaId: string): Promise<Usuario> => {
    const token = authService.getToken();
    if (!token) throw new Error('No autenticado');

    const response = await fetch(`${API_BASE_URL}/usuarios/${usuarioId}/cuentas/${cuentaId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Error al eliminar cuenta vinculada');
    }

    const data = await response.json();
    return normalizarUsuario(data.datos);
  },

  // Actualizar permisos
  updatePermisos: async (usuarioId: string, permisos: string[]): Promise<Usuario> => {
    const token = authService.getToken();
    if (!token) throw new Error('No autenticado');

    const response = await fetch(`${API_BASE_URL}/usuarios/${usuarioId}/permisos`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ permisos })
    });

    if (!response.ok) {
      throw new Error('Error al actualizar permisos');
    }

    const data = await response.json();
    return normalizarUsuario(data.datos);
  }
};
