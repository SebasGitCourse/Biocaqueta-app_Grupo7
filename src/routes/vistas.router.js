import { Router } from 'express';
import { Avistamiento } from '../models/avistamientoModel.js';
import {
  CATEGORIAS, ESTADOS_CONSERVACION, ErrorSolicitud, validarIdentificador,
} from '../utils/validaciones.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const avistamientos = await Avistamiento.find().sort({ fechaRegistro: -1, _id: -1 }).lean();
    res.render('home', {
      titulo: 'Avistamientos', avistamientos,
      categorias: CATEGORIAS, estados: ESTADOS_CONSERVACION,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/editar/:id', async (req, res, next) => {
  try {
    validarIdentificador(req.params.id);
    const avistamiento = await Avistamiento.findById(req.params.id).lean();
    if (!avistamiento) throw new ErrorSolicitud('El avistamiento no existe.', 404);
    res.render('editar', {
      titulo: 'Editar avistamiento', avistamiento,
      estados: ESTADOS_CONSERVACION.map((valor) => ({
        valor, seleccionado: valor === avistamiento.estadoConservacion,
      })),
    });
  } catch (error) {
    next(error);
  }
});

export default router;
