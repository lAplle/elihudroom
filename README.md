# 🎓 Elihudroom - Plataforma Educativa

Una plataforma educativa inspirada en Google Classroom que permite a maestros crear clases y a alumnos unirse para ver publicaciones y materiales.

## ✨ Características

### 👨‍🏫 Para Maestros:
- Crear clases con nombre, descripción y código único
- Hacer publicaciones con texto y archivos adjuntos (PDFs e imágenes)
- Gestionar múltiples clases
- Ver lista de alumnos inscritos

### 👨‍🎓 Para Alumnos:
- Unirse a clases usando códigos únicos
- Ver publicaciones del maestro en tiempo real
- Descargar archivos adjuntos (PDFs e imágenes)
- Acceder a múltiples clases

## 🚀 Tecnologías Utilizadas

- **Frontend**: React 19
- **Backend**: Firebase
- **Autenticación**: Firebase Auth
- **Base de datos**: Firestore
- **Almacenamiento**: Firebase Storage
- **Routing**: React Router DOM

## 📋 Requisitos Previos

- Node.js (versión 16 o superior)
- npm o yarn
- Cuenta de Firebase

## 🔧 Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <url-del-repositorio>
   cd elihudroom
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar Firebase**
   - Ve a [Firebase Console](https://console.firebase.google.com/)
   - Crea un nuevo proyecto
   - Habilita Authentication con Email/Password
   - Crea una base de datos Firestore
   - Habilita Firebase Storage
   - Obtén las credenciales de configuración

4. **Configurar variables de Firebase**
   - Abre `src/firebase.js`
   - Reemplaza la configuración con tus credenciales de Firebase

5. **Ejecutar la aplicación**
   ```bash
   npm start
   ```

## 🔥 Configuración de Firebase

### 1. Autenticación
- Ve a Authentication > Sign-in method
- Habilita "Email/Password"

### 2. Firestore Database
- Ve a Firestore Database
- Crea una base de datos en modo de prueba
- Estructura de colecciones:
  ```
  usuarios/
    {userId}/
      email: string
      role: "maestro" | "alumno"
  
  clases/
    {classId}/
      nombre: string
      descripcion: string
      codigo: string
      maestroId: string
      maestroName: string
      fechaCreacion: timestamp
      alumnos: array
  
  inscripciones/
    {enrollmentId}/
      claseId: string
      alumnoId: string
      alumnoEmail: string
      fechaInscripcion: timestamp
  
  clases/{classId}/publicaciones/
    {postId}/
      titulo: string
      contenido: string
      archivos: array
      maestroId: string
      maestroName: string
      fechaCreacion: timestamp
  ```

### 3. Storage
- Ve a Storage
- Configura las reglas de seguridad para permitir subida de archivos

## 📱 Uso de la Aplicación

### Registro e Inicio de Sesión
1. Abre la aplicación en tu navegador
2. Regístrate como maestro o alumno
3. Inicia sesión con tus credenciales

### Para Maestros:
1. **Crear una Clase**
   - Haz clic en "Crear nueva clase"
   - Completa el nombre y descripción
   - Se generará automáticamente un código único

2. **Hacer Publicaciones**
   - Entra a tu clase
   - Haz clic en "Crear Publicación"
   - Escribe título y contenido
   - Adjunta archivos (PDFs o imágenes)
   - Publica

### Para Alumnos:
1. **Unirse a una Clase**
   - Haz clic en "Unirse a una clase"
   - Ingresa el código de la clase
   - Confirma la inscripción

2. **Ver Publicaciones**
   - Entra a la clase
   - Ve las publicaciones del maestro
   - Descarga archivos adjuntos

## 🎨 Características de la UI

- **Diseño Responsivo**: Funciona en desktop, tablet y móvil
- **Interfaz Moderna**: Gradientes y animaciones suaves
- **Tiempo Real**: Las publicaciones se actualizan automáticamente
- **Navegación Intuitiva**: Fácil de usar para todos los usuarios

## 🔒 Seguridad

- Autenticación con Firebase Auth
- Reglas de Firestore para proteger datos
- Validación de roles y permisos
- Códigos únicos para clases

## 🚀 Despliegue

### Firebase Hosting
```bash
npm run build
firebase init hosting
firebase deploy
```

### Netlify
```bash
npm run build
# Sube la carpeta build a Netlify
```

### Vercel
```bash
npm run build
# Conecta tu repositorio a Vercel
```

## 🐛 Solución de Problemas

### Error de Autenticación
- Verifica que Firebase Auth esté habilitado
- Confirma que las credenciales sean correctas

### Error de Base de Datos
- Verifica las reglas de Firestore
- Confirma que las colecciones existan

### Error de Storage
- Verifica las reglas de Storage
- Confirma que los archivos no excedan el límite

## 📞 Soporte

Si tienes problemas o preguntas:
1. Revisa la documentación de Firebase
2. Verifica la consola del navegador para errores
3. Asegúrate de que todas las dependencias estén instaladas

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

---

**¡Disfruta usando Elihudroom! 🎓✨**
