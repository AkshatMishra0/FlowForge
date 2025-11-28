module.exports = {
  apps: [
    {
      name: 'flowforge-backend',
      script: 'dist/main.js',
      cwd: './apps/backend',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'flowforge-worker',
      script: 'dist/index.js',
      cwd: './apps/worker',
      instances: 1,
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
