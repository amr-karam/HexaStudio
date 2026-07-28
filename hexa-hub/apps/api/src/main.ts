import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // ─── Global API Prefix ────────────────────────────────────────────────────
  app.setGlobalPrefix('api');

  // ─── CORS ─────────────────────────────────────────────────────────────────
  app.enableCors({
    origin: (process.env.CORS_ORIGINS
      ?? 'http://localhost:3001,http://localhost:3002,https://hexastudio.net,https://www.hexastudio.net'
    ).split(',').map((o) => o.trim()),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // ─── Global Validation Pipe ──────────────────────────────────────────────
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));

  // ─── Swagger / OpenAPI Documentation ─────────────────────────────────────
  const swaggerConfig = new DocumentBuilder()
    .setTitle('HEXA Hub API')
    .setDescription(
      '## HEXA Hub — Internal Collaboration Platform API\n\n' +
      'Central gateway for the HEXA Hub platform. Provides REST endpoints for:\n\n' +
      '- **Authentication** — JWT-based login/register with refresh tokens\n' +
      '- **Users** — Profile management and user lookup\n' +
      '- **Workspaces** — Internal collaboration spaces, tasks, and messages\n' +
      '- **Client Portal** — Client-facing workspace views\n' +
      '- **Odoo CRM** — Leads, pipeline, and stats via Odoo ERP\n' +
      '- **Odoo Projects** — Projects, milestones, and tracking\n' +
      '- **Odoo Tasks** — Task management synced with Odoo\n' +
      '- **Odoo Contacts** — Contact and client directory\n' +
      '- **Odoo Sales** — Quotations, orders, and invoices\n' +
      '- **Odoo Activities** — Activity logging and scheduling\n' +
      '- **Odoo Webhooks** — Real-time sync from Odoo events\n' +
      '- **Messages** — Direct messaging and inbox\n' +
      '- **Notifications** — User notification feed and preferences\n' +
      '- **Search** — Global cross-model search\n' +
      '- **AI** — Gemini-powered summarization and suggestions\n\n' +
      '### Authentication\n\n' +
      'Most endpoints require a **Bearer JWT token** in the `Authorization` header.\n' +
      'Obtain a token via `POST /api/auth/login` or `POST /api/auth/register`.\n\n' +
      '### Base URL\n\n' +
      'All endpoints are prefixed with `/api`.\n'
    )
    .setVersion('2.0.0')
    .setContact('HEXA Studio', 'https://hexastudio.net', 'devops@hexastudio.net')
    .setLicense('Proprietary', 'https://hexastudio.net')
    .addServer('http://localhost:3000', 'Local Development')
    .addServer('https://api.hexastudio.net', 'Production')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT access token',
        name: 'Authorization',
        in: 'header',
      },
      'jwt-bearer',
    )
    .addTag('Health', 'Service health checks')
    .addTag('Auth', 'Registration and login endpoints')
    .addTag('Users', 'User profile management')
    .addTag('Workspaces', 'Internal collaboration workspaces and tasks')
    .addTag('Client Portal', 'Client-facing workspace and project views')
    .addTag('Messages', 'Direct messaging and inbox')
    .addTag('Notifications', 'User notification feed')
    .addTag('Odoo — CRM', 'CRM leads, pipeline, and stats (Odoo)')
    .addTag('Odoo — Projects', 'Project management and milestones (Odoo)')
    .addTag('Odoo — Tasks', 'Task tracking synced with Odoo')
    .addTag('Odoo — Contacts', 'Contact and client directory (Odoo)')
    .addTag('Odoo — Sales', 'Quotations, orders, and invoices (Odoo)')
    .addTag('Odoo — Activities', 'Activity logging and scheduling (Odoo)')
    .addTag('Odoo — Webhooks', 'Real-time sync endpoints from Odoo ERP')
    .addTag('Search', 'Global cross-model search')
    .addTag('AI', 'Gemini-powered AI features')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
      tryItOutEnabled: true,
    },
    customSiteTitle: 'HEXA Hub API Docs',
    customfavIcon: 'https://hexastudio.net/favicon.ico',
    customCss: `
      .swagger-ui .topbar { display: none; }
      .swagger-ui .info .title { font-size: 1.8em; }
    `,
  });

  // ─── Start Server ─────────────────────────────────────────────────────────
  const port = process.env.PORT || 3000;
  await app.listen(port);

  logger.log(`HEXA Hub API is running on: http://localhost:${port}/api`);
  logger.log(`Swagger docs available at: http://localhost:${port}/api/docs`);
}

bootstrap();
