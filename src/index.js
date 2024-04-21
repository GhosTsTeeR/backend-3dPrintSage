const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const http = require('http');
const socketIo = require('socket.io');

require('dotenv').config();
const app3DPrintsageRoutes = require('./routes/app_3dprintsage/user.js');
const app3DPrintsageRoutesCurses = require('./routes/app_3dprintsage/curses.js');
const appObservationRoutes = require('./routes/app_observation/user.js');
const appObservationRoutesStudents = require('./routes/app_observation/students.js');
const appObservationRoutesGenerateDocs = require('./routes/app_observation/generateDocs.js');
const config = require('./config/config.js');
const { handleChatMessage } = require('./routes/app_3dprintsage/chatbot.js');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});
app.use(express.json());

// Configuración de middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const whitelist = ['http://localhost:3000'];
const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
};
app.use(cors(corsOptions));
app.use(morgan('dev'));
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});
// Rutas
app.use('/api/3dprintsage/user', app3DPrintsageRoutes);
app.use('/api/3dprintsage/curses', app3DPrintsageRoutesCurses);
app.use('/api/observation/user', appObservationRoutes);
app.use('/api/observation/student', appObservationRoutesStudents);
app.use('/api/observation/docs', appObservationRoutesGenerateDocs);

app.get('/', (req, res) => {
  res.send('¡Ghost te saluda :)!');
});


io.on('connection', (socket) => {
  console.log('Un usuario se ha conectado');

  socket.on('disconnect', () => {
    console.log('El usuario se ha desconectado');
  });

  socket.on('chat message', async (msg) => {
    const response = await handleChatMessage(msg);
    io.emit('chat message', response);
  });
});
// Iniciar el servidor
const PORT = config.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Servidor iniciado en el puerto ${PORT}`);
});