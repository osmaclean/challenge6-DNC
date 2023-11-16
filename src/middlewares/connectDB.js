const mysql = require('mysql2');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'c4y0m4cl34n',
  database: 'desafio_6',
};

const pool = mysql.createPool(dbConfig);

async function connectDatabase(req, res, next) {
  await pool.getConnection((error, connection) => {
    if (error) {
      console.error(`Error in database connection ${error}`);
      return res.status(500).json({ error: 'Internal error' })
    }
    else {
      req.dbConnection = connection;
      console.log(`Connect database!`)
      next();
    }
  })
}

module.exports = connectDatabase;