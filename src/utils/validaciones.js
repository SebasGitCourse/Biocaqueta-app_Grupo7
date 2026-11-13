const CATEGORIAS = Object.freeze(['Mamífero', 'Ave', 'Reptil', 'Anfibio', 'Flora']);
const ESTADOS_CONSERVACION = Object.freeze(['Preocupación menor', 'Vulnerable', 'En peligro']);

class ErrorSolicitud extends Error {
  constructor(mensaje, estado = 400) {
    super(mensaje);
    this.estado = estado;
  }
}

const CAMPOS_REGISTRO = Object.freeze([
  'nombreComun', 'nombreCientifico', 'categoria', 'zona',
  'estadoConservacion', 'investigador', 'fechaRegistro',
]);
const CAMPOS_EDICION = Object.freeze(['zona', 'estadoConservacion']);

function validarDatos(cuerpo, camposPermitidos) {
  if (!cuerpo || typeof cuerpo !== 'object' || Array.isArray(cuerpo)) {
    throw new ErrorSolicitud('Debes enviar un objeto con los datos del avistamiento.');
  }

  const campos = Object.keys(cuerpo);
  if (campos.length === 0) {
    throw new ErrorSolicitud('Debes enviar al menos un campo.');
  }
  if (campos.some((campo) => !camposPermitidos.includes(campo))) {
    throw new ErrorSolicitud(`Los campos permitidos son: ${camposPermitidos.join(', ')}.`);
  }

  const datos = {};
  for (const campo of campos) {
    if (typeof cuerpo[campo] !== 'string') {
      throw new ErrorSolicitud(`El campo ${campo} debe ser un texto.`);
    }
    datos[campo] = cuerpo[campo].trim();
    if (campo === 'fechaRegistro' && !datos[campo]) {
      throw new ErrorSolicitud('La fecha de registro debe ser válida.');
    }
  }
  return datos;
}

function validarIdentificador(id) {
  if (typeof id !== 'string' || !/^[a-f\d]{24}$/i.test(id)) {
    throw new ErrorSolicitud('El identificador del avistamiento no es válido.');
  }
}

function obtenerFiltroCategoria(categoria) {
  if (categoria === undefined || categoria === '') return {};
  if (typeof categoria !== 'string' || !CATEGORIAS.includes(categoria)) {
    throw new ErrorSolicitud('La categoría debe ser Mamífero, Ave, Reptil, Anfibio o Flora.');
  }
  return { categoria };
}

function esFormulario(req) {
  return Boolean(req.is('application/x-www-form-urlencoded'));
}

export {
  CATEGORIAS, ESTADOS_CONSERVACION,
  ErrorSolicitud, CAMPOS_REGISTRO, CAMPOS_EDICION,
  validarDatos, validarIdentificador, obtenerFiltroCategoria, esFormulario,
};
