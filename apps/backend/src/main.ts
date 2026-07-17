import { NestFactory } from "@nestjs/core";
import { Logger, ValidationPipe, VersioningType } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import helmet from "helmet";
import * as Sentry from "@sentry/node";
import { AppModule } from "./app.module";
import { GlobalExceptionFilter } from "./core/filters/global-exception.filter";
import { getEnv } from "./config/env";

async function bootstrap() {
  const env = getEnv();

  if (env.SENTRY_DSN) {
    Sentry.init({
      dsn: env.SENTRY_DSN,
      environment: env.NODE_ENV,
      release: process.env.SENTRY_RELEASE || undefined,
      tracesSampleRate: 0.1,
    });
  }

  const app = await NestFactory.create(AppModule, { rawBody: true });
  const logger = new Logger('Bootstrap');

  app.use(helmet());
  app.setGlobalPrefix("api");
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new GlobalExceptionFilter());

  const corsOrigins = (env.CORS_ORIGINS ?? "http://localhost:3000")
    .split(",")
    .map((o: string) => o.trim());
  app.enableCors({ origin: corsOrigins, credentials: true });

  // Only enable Swagger in development
  if (env.NODE_ENV === "development") {
    const swaggerConfig = new DocumentBuilder()
      .setTitle("HexaStudio API")
      .setDescription("HexaStudio.net backend API")
      .setVersion("0.1.0")
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup("api/docs", app, document);
    logger.log("Swagger docs available at /api/docs");
  }

  await app.listen(env.PORT, "0.0.0.0");
  logger.log(`API listening on port ${env.PORT}`);
}

bootstrap();
