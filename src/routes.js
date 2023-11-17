function routes(app) {
  app.use('/clients', require('./routes/clients.js'));
  app.use('/stock', require('./routes/stock.js'));
  return;
}

module.exports = routes;