function routes(app) {
  app.use('/clients', require('./routes/clients.js'));
  app.use('/stock', require('./routes/stock.js'));
  app.use('/products', require('./routes/products.js'));
  app.use('/sales', require('./routes/sales.js'));
  return;
}

module.exports = routes;