import { createApp } from './app.js';
import { env } from './config/env.js';

const app = createApp({ serveFrontend: true });

app.listen(env.port, () => {
  console.log(`Bluecoderhub server listening on ${env.port}`);
});
