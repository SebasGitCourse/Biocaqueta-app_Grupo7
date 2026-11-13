import mongoose from 'mongoose';
import { CATEGORIAS, ESTADOS_CONSERVACION } from '../utils/validaciones.js';

function textoRequerido(etiqueta) {
  return {
    type: String,
    trim: true,
    required: [true, `El campo ${etiqueta} es obligatorio.`],
  };
}

const esquemaAvistamiento = new mongoose.Schema({
  nombreComun: textoRequerido('nombre común'),
  nombreCientifico: textoRequerido('nombre científico'),
  categoria: {
    ...textoRequerido('categoría'),
    enum: { values: CATEGORIAS, message: 'La categoría debe ser Mamífero, Ave, Reptil, Anfibio o Flora.' },
  },
  zona: textoRequerido('zona'),
  estadoConservacion: {
    type: String,
    trim: true,
    enum: { values: ESTADOS_CONSERVACION, message: 'El estado debe ser Preocupación menor, Vulnerable o En peligro.' },
    default: 'Preocupación menor',
    validate: { validator: (valor) => valor !== null, message: 'El estado de conservación debe ser un texto válido.' },
  },
  investigador: textoRequerido('investigador'),
  fechaRegistro: {
    type: Date,
    default: Date.now,
    validate: { validator: (valor) => valor !== null, message: 'La fecha de registro debe ser válida.' },
  },
}, {
  collection: 'avistamientos',
  versionKey: false,
});

// Respalda tanto el listado general como la consulta filtrada por categoría.
esquemaAvistamiento.index({ fechaRegistro: -1, _id: -1 });
esquemaAvistamiento.index({ categoria: 1, fechaRegistro: -1, _id: -1 });

const Avistamiento = mongoose.model('Avistamiento', esquemaAvistamiento);

export { Avistamiento };
