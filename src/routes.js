function routes(app) {
  app.use('/clients', require('./routes/clients.js'));
  return;
}

module.exports = routes;