module.exports = {
  apps: [{
    name: 'natif-backend',
    script: 'dist/server.js',
    cwd: '/opt/natif-online-manager/backend',
    env_production: {
      NODE_ENV: 'production',
    },
    env_file: '.env',
  }],
};
