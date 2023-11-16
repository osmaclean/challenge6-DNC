const express = require('express');
const router = express.Router();
const connectDatabase = require('../middlewares/connectDB');
router.use(express.json())
router.use(connectDatabase);

router.post('/create', (req, res) => {
  try {
    const db = req.dbConnection;
    const { name, email, password } = req.body;

    const sql = "INSERT INTO clients (name, email, password) VALUES (?, ?, ?)";
    const values = [name, email, password];

    db.query(sql, values, (err, results) => {
      if (err) {
        console.error(`Error creating customer in database: ${err}`);
        return res.status(500).json({ error: err });
      }

      res.status(201).json({ client_id: results.insertId });
      db.release()
    })
  } catch (error) {
    console.error(`Error inserting data into the customers table: ${error}`)
    res.status(500).json({ error: `Internal error in server` })
  }
})


router.get('/', function (req, res, next) {
  res.send('respond with a resource 2365465465');
});

module.exports = router;