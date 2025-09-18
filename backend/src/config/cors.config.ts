export const corsConfig = {
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true, // Importante para cookies httpOnly
  allowedHeaders: ['Content-Type', 'Authorization'],
};
