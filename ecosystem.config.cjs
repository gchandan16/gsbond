module.exports = {
  apps: [
    {
      script: "npm start",
    },
  ],

  deploy: {
    production: {
      user: "root",
      host: "109.123.227.233",
      ref: "origin/main",
      repo: "https://gitlab.com/expertcodelab/shipments.git",
      path: "/var/www/live/gsbc_crm",
      "pre-deploy-local": "",
      "post-deploy":
        "soursce ~/.nvm/.nvm.sh && npm install && npm run build && pm2 reload ecosystem.config.js --env production",
      "pre-setup": "",
      ssh_options: "ForwardAgent=yes",
    },
  },
};
