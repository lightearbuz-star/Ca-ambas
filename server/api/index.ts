import express from 'express';
import { createServer } from '../_core/index';

// Cria o servidor Express
const app = createServer();

// Exporta o app para ser usado como Serverless Function pelo Vercel
export default app;
