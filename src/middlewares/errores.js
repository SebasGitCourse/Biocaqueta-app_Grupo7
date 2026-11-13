import { ErrorSolicitud, esFormulario } from '../utils/validaciones.js';

function manejarErrores(error, req, res, next) {
  if (res.headersSent) return next(error);

  let estado = 500;
  let mensaje = 'Ocurrió un error interno. Intenta nuevamente más tarde.';
  let detalles = [];

  if (error instanceof ErrorSolicitud) {
    estado = error.estado;
    mensaje = error.message;
  } else if (error.name === 'ValidationError') {
    estado = 400;
    mensaje = 'Revisa los datos del avistamiento.';
    detalles = Object.values(error.errors).map((detalle) => ({
      campo: detalle.path,
      mensaje: detalle.name === 'CastError'
        ? `El campo ${detalle.path} tiene un valor inválido.` : detalle.message,
    }));
  } else if (error.name === 'CastError') {
    estado = 400;
    mensaje = 'Uno de los valores enviados no es válido.';
  } else if (error.type === 'entity.parse.failed') {
    estado = 400;
    mensaje = 'El cuerpo de la solicitud contiene un JSON inválido.';
  } else if (error.status === 413) {
    estado = 413;
    mensaje = 'La solicitud supera el tamaño permitido.';
  } else if (error.status === 415) {
    estado = 415;
    mensaje = 'La codificación de la solicitud no está admitida.';
  } else if (/Mongo|Mongoose/.test(error.name)) {
    estado = 503;
    mensaje = 'No fue posible acceder a la base de datos. Intenta nuevamente más tarde.';
  }

  if (estado >= 500) console.error(`Error del servidor (${error.name || 'Error'}).`);

  const esRutaApi = req.path === '/api' || req.path.startsWith('/api/');
  if (esRutaApi && !esFormulario(req)) {
    return res.status(estado).json({ mensaje, ...(detalles.length ? { errores: detalles } : {}) });
  }
  res.status(estado).render('error', { titulo: 'No se pudo completar la solicitud', estado, mensaje, detalles });
}

export { manejarErrores };
