const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server: SocketIOServer } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  // Initialize Socket.IO with CORS config
  const io = new SocketIOServer(server, {
    path: '/api/socketio',
    addTrailingSlash: false,
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || "*",
      methods: ["GET", "POST"],
      credentials: true
    },
    // Add WebSocket server config
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    upgradeTimeout: 30000,
    allowUpgrades: true
  });

  // Socket connection handler
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Join room based on user role and ID
    socket.on('join', ({ userId, role }) => {
      // Join user-specific room
      socket.join(`user-${userId}`);

      // Join role-specific room
      if (role === 'admin') {
        socket.join('admin-room');
      } else if (role === 'reseller') {
        socket.join(`reseller-${userId}`);
      } else if (role === 'customer') {
        socket.join(`customer-${userId}`);
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });

    // Error handling
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  // Handle WebSocket upgrade
  server.on('upgrade', (req, socket, head) => {
    const { pathname } = parse(req.url);
    
    if (pathname === '/api/socketio') {
      io.engine.handleUpgrade(req, socket, head);
    } else {
      socket.destroy();
    }
  });
  
  // Make io available globally
  global.io = io;

  const port = process.env.PORT || 3000;
  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});