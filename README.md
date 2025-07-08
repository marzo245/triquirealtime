# 🎮 Triqui Realtime

Una aplicación de Tic Tac Toe multijugador en tiempo real construida con React, Node.js, Socket.IO y MongoDB.

## 🌟 Características

- ✅ **Salas multijugador**: Crea y únete a salas con códigos únicos
- ✅ **Tiempo real**: Jugabilidad instantánea usando WebSockets
- ✅ **Persistencia**: Las salas y su historial se guardan en MongoDB
- ✅ **Historial completo**: Navega y retrocede en cualquier punto del juego
- ✅ **Responsive**: Funciona en desktop y mobile
- ✅ **Deploy fácil**: Listo para Heroku

## 🚀 Demo en Vivo

[Ver Demo en Heroku](https://tu-app.herokuapp.com) *(Actualizar con tu URL)*

## 🛠️ Tecnologías

### Backend
- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web
- **Socket.IO** - WebSockets en tiempo real
- **MongoDB** - Base de datos NoSQL
- **Mongoose** - ODM para MongoDB

### Frontend
- **React** - Biblioteca de UI
- **Socket.IO Client** - Cliente WebSocket
- **CSS3** - Estilos modernos y responsive

## 📋 Requisitos Previos

- Node.js 18.x o superior
- MongoDB (local o MongoDB Atlas)
- Git

## 🔧 Instalación y Configuración

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/triquirealtime.git
cd triquirealtime
```

### 2. Instalar dependencias

```bash
# Instalar dependencias del servidor y cliente
npm run install-all
```

### 3. Configuración de variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# Configuración de la base de datos
MONGODB_URI=mongodb://localhost:27017/triqui-realtime

# Puerto del servidor
PORT=5000

# Entorno
NODE_ENV=development
```

Para producción (Heroku), configura:
```env
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/triqui-realtime
NODE_ENV=production
```

### 4. Ejecutar en desarrollo

```bash
# Ejecutar servidor y cliente simultáneamente
npm run dev
```

O ejecutar por separado:

```bash
# Terminal 1 - Servidor
npm run server

# Terminal 2 - Cliente
npm run client
```

La aplicación estará disponible en:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## 🎮 Cómo Jugar

1. **Crear una sala**: Ingresa tu nombre y haz clic en "Crear Nueva Sala"
2. **Compartir código**: Comparte el código de 6 letras con otro jugador
3. **Unirse**: El segundo jugador ingresa el código para unirse
4. **Jugar**: ¡Disfruta del Tic Tac Toe en tiempo real!
5. **Navegar historial**: Usa el panel derecho para ver y retroceder movimientos

## 🏗️ Estructura del Proyecto

```
triquirealtime/
├── server/                 # Backend Node.js
│   ├── index.js           # Servidor principal con Socket.IO
│   ├── models/            # Modelos de MongoDB
│   │   └── Room.js        # Modelo de sala
│   └── routes/            # Rutas API (futuras expansiones)
├── client/                # Frontend React
│   ├── public/            # Archivos estáticos
│   ├── src/
│   │   ├── components/    # Componentes React
│   │   │   ├── Board.js   # Tablero de juego
│   │   │   ├── GameHistory.js  # Historial
│   │   │   └── RoomInfo.js     # Info de sala
│   │   ├── hooks/         # Custom hooks
│   │   │   └── useSocket.js    # Hook para Socket.IO
│   │   ├── App.js         # Componente principal
│   │   └── index.js       # Punto de entrada
├── package.json           # Configuración principal
└── README.md              # Documentación
```

## 🌐 Deploy en Heroku

### 1. Preparar la aplicación

```bash
# Crear app en Heroku
heroku create tu-app-triqui

# Configurar variables de entorno
heroku config:set MONGODB_URI=tu-mongodb-uri
heroku config:set NODE_ENV=production
```

### 2. Deploy

```bash
# Deploy
git add .
git commit -m "Initial deploy"
git push heroku main
```

### 3. Configurar MongoDB Atlas

1. Crea una cuenta en [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Crea un cluster gratuito
3. Configura las credenciales de acceso
4. Agrega la URL de conexión a las variables de Heroku

## 🔄 API WebSocket

### Eventos del Cliente al Servidor

- `create-room` - Crear nueva sala
- `join-room` - Unirse a sala existente  
- `make-move` - Realizar movimiento
- `go-to-history` - Navegar al historial
- `restart-game` - Reiniciar juego

### Eventos del Servidor al Cliente

- `room-created` - Sala creada exitosamente
- `player-joined` - Jugador se unió
- `game-ready` - Juego listo para comenzar
- `game-updated` - Estado del juego actualizado
- `player-disconnected` - Jugador desconectado
- `error` - Error ocurrido

## 🎯 Funcionalidades Avanzadas

### Persistencia de Datos

- Las salas se guardan automáticamente en MongoDB
- El historial completo se mantiene persistente
- Las salas expiran después de 24 horas de inactividad

### Manejo de Desconexiones

- Detección automática de desconexiones
- Notificación a jugadores activos
- Reconexión automática del cliente

### Historial Interactivo

- Navegación completa por todos los movimientos
- Timestamps de cada movimiento
- Retroceso con restauración de estado

## 🧪 Testing

```bash
# Ejecutar tests (cuando estén implementados)
npm test
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👨‍💻 Autor

**Tu Nombre**
- GitHub: [@tu-usuario](https://github.com/tu-usuario)
- LinkedIn: [Tu Perfil](https://linkedin.com/in/tu-perfil)

## 🙏 Agradecimientos

- Socket.IO por la excelente biblioteca de WebSockets
- MongoDB por la base de datos NoSQL
- React por la biblioteca de UI
- Heroku por el hosting gratuito

---

⭐ ¡Dale una estrella si te gustó este proyecto!
