const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  // Try connecting to the configured URI first (skip if it's the default local address)
  if (uri && !uri.includes('127.0.0.1:27017')) {
    try {
      const conn = await mongoose.connect(uri, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      return conn;
    } catch (error) {
      console.warn(`External MongoDB connection failed: ${error.message}`);
      console.warn('Falling back to in-memory MongoDB...');
    }
  }

  // Fallback: start an in-memory MongoDB server
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');

    console.log('Starting in-memory MongoDB (first run may take a minute to download binaries)...');

    const mongod = await MongoMemoryServer.create({
      instance: {
        dbName: 'carbonaccounting',
      },
      binary: {
        downloadDir: require('path').join(require('os').homedir(), '.cache', 'mongodb-binaries'),
      },
    });

    const memUri = mongod.getUri();
    process.env.MONGODB_URI = memUri;

    const conn = await mongoose.connect(memUri, {
      maxPoolSize: 10,
    });

    console.log(`In-Memory MongoDB started successfully`);
    console.log('(Data will be lost when server stops)');

    // Graceful shutdown
    const cleanup = async () => {
      await mongoose.disconnect();
      await mongod.stop();
      console.log('In-Memory MongoDB stopped.');
      process.exit(0);
    };

    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);

    return conn;
  } catch (error) {
    console.error(`Failed to start in-memory MongoDB: ${error.message}`);
    console.error('If this is a download issue, check your internet connection or set MONGODB_URI in .env');
    process.exit(1);
  }
};

module.exports = connectDB;
