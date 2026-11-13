import { Router } from 'express';
import { Avistamiento } from '../models/avistamientoModel.js';
import {
  ErrorSolicitud, CAMPOS_REGISTRO, CAMPOS_EDICION, validarDatos,
  validarIdentificador, obtenerFiltroCategoria, esFormulario,
} from '../utils/validaciones.js';

const router = Router();

router.use((req, res, next) => {
  if (['POST', 'PUT'].includes(req.method)
      && !req.is('application/json') && !esFormulario(req)) {
    return next(new ErrorSolicitud('Utiliza application/json o application/x-www-form-urlencoded.', 415));
  }
  next();
});

router.get('/', async (req, res, next) => {
  try {
    const filtro = obtenerFiltroCategoria(req.query.categoria);
    const avistamientos = await Avistamiento.find(filtro).sort({ fechaRegistro: -1, _id: -1 }).lean();
    res.json(avistamientos);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const datos = validarDatos(req.body, CAMPOS_REGISTRO);
    const avistamiento = await Avistamiento.create(datos);
    if (esFormulario(req)) return res.redirect(303, '/');
    res.status(201).json(avistamiento);
  } catch (error) {
    next(error);
  }
});

async function actualizarAvistamiento(req, res, next) {
  try {
    validarIdentificador(req.params.id);
    const datos = validarDatos(req.body, CAMPOS_EDICION);
    const avistamiento = await Avistamiento.findByIdAndUpdate(
      req.params.id,
      { $set: datos },
      { new: true, runValidators: true },
    );
    if (!avistamiento) throw new ErrorSolicitud('El avistamiento no existe.', 404);
    if (esFormulario(req)) return res.redirect(303, '/');
    res.json(avistamiento);
  } catch (error) {
    next(error);
  }
}

async function eliminarAvistamiento(req, res, next) {
  try {
    validarIdentificador(req.params.id);
    const avistamiento = await Avistamiento.findByIdAndDelete(req.params.id);
    if (!avistamiento) throw new ErrorSolicitud('El avistamiento no existe.', 404);
    if (esFormulario(req)) return res.redirect(303, '/');
    res.status(200).json({ mensaje: 'Avistamiento eliminado correctamente.' });
  } catch (error) {
    next(error);
  }
}

router.put('/:id', actualizarAvistamiento);
router.post('/update/:id', actualizarAvistamiento);
router.delete('/:id', eliminarAvistamiento);
router.post('/delete/:id', eliminarAvistamiento);

export default router;
