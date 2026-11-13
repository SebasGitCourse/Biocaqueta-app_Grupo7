import path from 'path';
import express from 'express';
import { engine } from 'express-handlebars';
import mongoose from 'mongoose';
import { conectarBaseDatos } from './config/db.js';
import avistamientoRouter from './routes/avistamiento.router.js';
import vistasRouter from './routes/vistas.router.js';
import { ErrorSolicitud } from './utils/validaciones.js';
import { manejarErrores } from './middlewares/errores.js';

const directorioActual = import.meta.dirname;
const app = express();

app.disable('x-powered-by');
app.engine('handlebars', engine({
  defaultLayout: 'main',
  layoutsDir: path.join(directorioActual, 'views', 'layouts'),
  helpers: {
    formatearFecha(fecha) {
      return new Intl.DateTimeFormat('es-CO', {
        dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Bogota',
      }).format(new Date(fecha));
    },
  },
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(directorioActual, 'views'));

app.use(express.json({ limit: '32kb' }));
app.use(express.urlencoded({ extended: false, limit: '32kb', parameterLimit: 20 }));
app.use(express.static(path.join(directorioActual, 'public')));
app.use('/api/avistamientos', avistamientoRouter);
app.use('/', vistasRouter);
app.use((req, res, next) => next(new ErrorSolicitud('La página o el recurso solicitado no existe.', 404)));
app.use(manejarErrores);

async function iniciarServidor() {
  const puerto = Number(process.env.PORT || 3000);
  if (!Number.isInteger(puerto) || puerto < 1 || puerto > 65535) {
    throw new Error('PORT debe ser un número entero entre 1 y 65535.');
  }

  // No acepta solicitudes hasta que la conexión con Atlas esté disponible.
  await conectarBaseDatos();
  const servidor = app.listen(puerto, () => {
    console.info(`BioCaquetá disponible en http://localhost:${puerto}`);
  });
  servidor.on('error', async () => {
    console.error('No fue posible abrir el puerto. Revisa PORT o cierra la aplicación que lo utiliza.');
    try {
      await mongoose.disconnect();
    } catch {
      console.error('No fue posible cerrar la conexión con MongoDB.');
    } finally {
      process.exitCode = 1;
    }
  });

  let cerrando = false;
  async function cerrarServidor() {
    if (cerrando) return;
    cerrando = true;
    console.info('Cerrando BioCaquetá…');
    const limite = setTimeout(() => process.exit(1), 10000);
    limite.unref();
    servidor.close(async () => {
      try {
        await mongoose.disconnect();
      } catch {
        console.error('No fue posible cerrar la conexión con MongoDB.');
        process.exitCode = 1;
      } finally {
        clearTimeout(limite);
      }
    });
  }
  process.once('SIGINT', cerrarServidor);
  process.once('SIGTERM', cerrarServidor);
  return servidor;
}

if (process.argv[1] && path.resolve(process.argv[1]) === import.meta.filename) {
  iniciarServidor().catch(async (error) => {
    console.error('No se pudo iniciar BioCaquetá.');
    console.error(error.message.startsWith('Completa') || error.message.startsWith('MONGODB_URI')
      || error.message.startsWith('PORT') ? error.message
      : 'Revisar la URI, el usuario, la contraseña y el acceso de red de MongoDB Atlas.');
    try {
      await mongoose.disconnect();
    } finally {
      process.exitCode = 1;
    }
  });
}

export { app, iniciarServidor };
