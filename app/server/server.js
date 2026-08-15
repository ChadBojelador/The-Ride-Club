const app = require('./src/app');
const config = require('./src/config');

const PORT = config.PORT;

app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════╗
  ║                                          ║
  ║   🏍️  THE RIDES CLUB API                 ║
  ║                                          ║
  ║   Server running on port ${String(PORT).padEnd(5)}           ║
  ║   Environment: ${config.NODE_ENV.padEnd(20)}  ║
  ║                                          ║
  ║   Health: http://localhost:${PORT}/api/health  ║
  ║                                          ║
  ╚══════════════════════════════════════════╝
  `);
});
