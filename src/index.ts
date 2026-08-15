import { app } from './server';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger';

const port = process.env.PORT || 5000;


app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.listen(port, () => {
  console.log(`✅ Server is running on port ${port}`);
  console.log(`📚 Swagger UI available at http://localhost:${port}/api-docs`);
});