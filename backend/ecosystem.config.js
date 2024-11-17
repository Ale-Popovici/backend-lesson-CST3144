module.exports = {
  apps: [
    {
      name: "lessons-api",
      script: "./server.js",
      env: {
        NODE_ENV: "production",
        PORT: 5001,
      },
      watch: false,
      instances: 1,
      autorestart: true,
      max_memory_restart: "1G",
      env_production: {
        NODE_ENV: "production",
      },
    },
  ],
};
