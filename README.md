# Chatter - Social Platform

Una plataforma social completa desarrollada con el stack MERN (MongoDB, Express, React, Node.js). Este proyecto permite a los usuarios registrarse, gestionar sus perfiles (Bios), interactuar mediante "Kisses" (likes) y comunicarse en tiempo real a través de chats.

## 🚀 Tecnologías Utilizadas

### Frontend
- **React 19**: Biblioteca principal para la interfaz de usuario.
- **Vite**: Empaquetador y servidor de desarrollo ultrarrápido.
- **Bootstrap 5 & Sass**: Estilizado y diseño responsivo.
- **React Router 7**: Gestión de rutas y navegación.
- **Bootstrap Icons**: Iconografía.

### Backend
- **Node.js & Express 5**: Servidor y API RESTful.
- **MongoDB & Mongoose**: Base de datos NoSQL y modelado de datos.
- **Passport.js**: Autenticación segura (Estrategias Local y JWT).
- **Multer**: Gestión de subida de archivos (imágenes de perfil).
- **Socket.io(SSE)** Comunicación en tiempo real.

## 🛠️ Instalación y Configuración

Este proyecto está dividido en dos directorios principales: `projecte-2-backend-equip_07` y `projecte-2-frontend-equip_07`.

### Prerrequisitos
- Node.js (v18 o superior recomendado)
- MongoDB (Instancia local o Atlas URI)

### 1. Configuración del Backend

1. Navega al directorio del backend:
   ```bash
   cd projecte-2-backend-equip_07
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Crea un archivo `.env` en la raíz del backend con las variables necesarias (ejemplo):
   ```env
   PORT=3000
   MONGO_URI=tu_mongodb_uri
   JWT_SECRET=tu_secreto_jwt
   SESSION_SECRET=tu_secreto_session
   ```
4. Inicia el servidor:
   ```bash
   npm run dev
   ```

### 2. Configuración del Frontend

1. Navega al directorio del frontend:
   ```bash
   cd projecte-2-frontend-equip_07
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

## 👥 Créditos y Autores

Este proyecto ha sido desarrollado en equipo, dividiendo responsabilidades para maximizar la eficiencia y calidad del código.

### Backend
- **APIs de Register, Login, Users y Chats**: Desarrollado por **Alejandro Romero Stankevich**.
- **APIs de Bios y Kiss**: Desarrollado por **Nikita Rodionov**.

### Frontend
- **Módulos de Login, Users, Dashboard y Chats**: Desarrollado por **Alejandro Romero Stankevich**.
- **Resto de la interfaz**: Desarrollado por **Nikita Rodionov**.

---
