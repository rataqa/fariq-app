import { factory } from './factory';

main();

async function main() {

  const { app, config } = factory();

  app.listen(config.http.port, () => {
    console.log(`API running on http://localhost:${config.http.port}`);
  });

}