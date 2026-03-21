import { exec } from 'child_process';
import app from './app';
import { env } from './config/env';

app.listen(env.PORT, () => {
  console.log(`API server running on http://localhost:${env.PORT}`);
  console.log(`Environment: ${env.NODE_ENV}`);

  // Run DB push in background after server starts
  if (env.NODE_ENV === 'production') {
    console.log('Running prisma db push in background...');
    exec('npx prisma db push --accept-data-loss', (err, stdout, stderr) => {
      if (err) {
        console.error('DB push failed:', stderr);
      } else {
        console.log('Database schema pushed successfully');
        console.log(stdout);
      }
    });
  }
});
