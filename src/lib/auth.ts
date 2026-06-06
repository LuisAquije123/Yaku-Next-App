import { NextAuthOptions, Session } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import prisma from './prisma'
import { JWT } from 'next-auth/jwt'
import crypto from 'crypto' 

// Función robusta para verificar PBKDF2 en múltiples formatos
function verificarContrasena(passwordIngresado: string, hashAlmacenado: string): boolean {
  try {
    // 1. Formato de la imagen (Ej: PBKDF2$PBKDF2WithHmacSHA256$310000$salBase64$hashBase64)
    if (hashAlmacenado.startsWith('PBKDF2$')) {
      const parts = hashAlmacenado.split('$');
      const iterations = parseInt(parts[2], 10);
      const salt = Buffer.from(parts[3], 'base64');
      const originalHash = Buffer.from(parts[4], 'base64');
      
      const derivedKey = crypto.pbkdf2Sync(passwordIngresado, salt, iterations, originalHash.length, 'sha256');
      return crypto.timingSafeEqual(originalHash, derivedKey);
    } 
    // 2. Formato del SQL Seed (Ej: saltHexadecimal:hashHexadecimal)
    else if (hashAlmacenado.includes(':')) {
      const [saltHex, hashHex] = hashAlmacenado.split(':');
      const salt = Buffer.from(saltHex, 'hex');
      const originalHash = Buffer.from(hashHex, 'hex');
      const iterations = 310000; // Iteraciones definidas en tu configuración
      
      const derivedKey = crypto.pbkdf2Sync(passwordIngresado, salt, iterations, originalHash.length, 'sha256');
      return crypto.timingSafeEqual(originalHash, derivedKey);
    }
    
    return false;
  } catch (error) {
    console.error('Error al verificar el hash de la contraseña:', error);
    return false;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        correo: { label: 'Correo', type: 'email' },
        contrasena: { label: 'Contraseña', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.correo || !credentials?.contrasena) {
          throw new Error('Correo y contraseña requeridos')
        }

        const usuario = await prisma.usuarios.findUnique({
          where: { correo: credentials.correo },
          include: { rol: true } // Corregido: en tu schema.prisma la relación se llama "rol", no "roles"
        })

        if (!usuario) {
          throw new Error('Usuario no encontrado')
        }

        if (!usuario.estado) {
          throw new Error('Usuario inactivo')
        }

        // Validación usando el módulo crypto y PBKDF2
        const esValido = verificarContrasena(credentials.contrasena, usuario.contrasena)

        
        if (!esValido) {
          throw new Error('Contraseña incorrecta')
        }

        // Log de inicio de sesión
        await prisma.logs_sistema.create({
          data: {
            id_usuario: usuario.id,
            accion: 'login',
            descripcion: `Inicio de sesión exitoso: ${usuario.nombre}`
          }
        }).catch((err: any) => console.error('Error al registrar log:', err))

        return {
          id: usuario.id.toString(),
          name: usuario.nombre,
          email: usuario.correo
        }
      }
    })
  ],
  pages: {
    signIn: '/auth/login',
    signOut: '/auth/login',
    error: '/auth/login'
  },
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: any }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
      }
      return token
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        (session.user as any).id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
      }
      return session
    }
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60 // 24 horas
  },
  secret: process.env.NEXTAUTH_SECRET
}