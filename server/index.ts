import express, { Application, Request, Response, NextFunction, RequestHandler } from 'express';
import { HTTPS } from 'express-sslify';
import cors from 'cors';

import { OPENSEA_SERVICE } from './constants';
import { OpenSeaService } from './opensea.service';

import { wrap } from './express-helper';

import 'dotenv/config';

// express server related settings
const PORT: number = parseInt(process.env.PORT || '') || 23252;
const ENFORCE_SSL: boolean = process.env.ENFORCE_SSL !== 'false';

function setupApp(): Application {
  // setting up express server
  const app: Application = express();

  // enforce SSL
  if (ENFORCE_SSL) {
    console.log('Enforced SSL');
    app.use(HTTPS({ trustProtoHeader: true }));  // for reverse proxies like heroku
  }

  // CORS
  // note: there is typescript compilation issue with cors(corsOptions) if there is no other middleware together
  // see https://github.com/DefinitelyTyped/DefinitelyTyped/issues/43909
  // therefore, we either downgrade express, add a dummy middleware, or convert to (cors as (options: cors.CorsOptions) => RequestHandler)(corsOptions) as a workaround
  const corsOrigin: string = process.env.CLIENT_BASE_URL || '';
  const corsOptions: cors.CorsOptions = {
    origin: corsOrigin,
    credentials: true,
    methods: ['GET', 'POST']
  };

  // service setup
  app.set(OPENSEA_SERVICE, new OpenSeaService(process.env.OPENSEA_API_KEY || ''));

  // allow POST to use JSON
  //app.use(express.urlencoded({ extended: false }));
  app.use(express.json());

  // enable CORS preflight
  app.options('/api/*', (cors as (options: cors.CorsOptions) => RequestHandler)(corsOptions));

  app.get('/api/collection', (cors as (options: cors.CorsOptions) => RequestHandler)(corsOptions), wrap(async(request: Request, response: Response, next: NextFunction) => {
    const service: OpenSeaService = request.app.get(OPENSEA_SERVICE);
    const data: any =  await service.getCollectionMetadata('otherdeed');
    console.log(data?.collection);
    response.send(data?.collection);
  }));

  // error handling
  app.use((err: any, request: Request, response: Response, next: NextFunction) => {
    console.log(err);
    response.status(500).send(err);
  });

  return app;
}

async function main() {
  // setup express app
  const app: Application = setupApp();

  app.listen(PORT, () => {
    console.log(`Express server is listening on port ${PORT}`);
  });
}

main().catch(err => console.error(err));