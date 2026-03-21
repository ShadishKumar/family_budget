import { execSync } from 'child_process';
import app from './app';
import { env } from './config/env';

app.listen(env.PORT, () => {
  console.log(`API server running on http://localhost:${env.PORT}`);
  console.log(`Environment: ${env.NODE_ENV}`);

  // Run DB migrations after server starts (so Render detects the port)
  if (env.NODE_ENV === 'production') {
    try {
      console.log('Running prisma db push...');
      execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
      console.log('Database schema pushed successfully');
    } catch (err) {
      console.error('DB push failed:', err);
    }
  }
});
