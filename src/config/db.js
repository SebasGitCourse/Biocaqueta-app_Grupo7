import mongoose from 'mongoose';

mongoose.set('bufferCommands', false);

async function conectarBaseDatos(uri = process.env.MONGODB_URI) {
  if (!uri || /USUARIO_ATLAS|CONTRASENA_ATLAS|HOST_CLUSTER|<[^>]+>/.test(uri)) {
    throw new Error('Completar MONGODB_URI en .env con los datos reales de MongoDB Atlas.');
  }

  if (!/^mongodb(?:\+srv)?:\/\//.test(uri)) {
    throw new Error('MONGODB_URI debe comenzar por mongodb+srv:// o mongodb://.');
  }

  await mongoose.connect(uri, {
    dbName: 'biocaqueta_db',
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 20000,
  });

  console.info('Conexión establecida con MongoDB: biocaqueta_db.');
}

export { conectarBaseDatos };
