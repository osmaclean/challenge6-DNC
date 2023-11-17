const express = require('express');
const router = express.Router();
const connectDatabase = require('../middlewares/connectDB');
router.use(express.json());
router.use(connectDatabase);

router.get('/', (req, res) => {
  try {
    const db = req.dbConnection;
    const sql = "SELECT * FROM stock";

    db.query(sql, (err, results) => {
      if (err) {
        console.error(`Error in consulting database ${err}`);
        return res.status(500).json({ error: "Internal error in server" })
      } else {
        res.status(200).json({ status: 'Ok', message: "Success when querying stock", data: results })
        db.release();
      }
    })

  } catch (error) {
    console.error(`Error in consulting database: ${error}`);
    res.status(500).json({ error: `Internal error in server` })
  }
})

router.get('/:id', (req, res) => {
  try {
    const db = req.dbConnection;
    const id = req.params.id
    const sql = "SELECT * FROM stock WHERE product_id = ?"

    db.query(sql, [id], (err, results) => {
      if (err) {
        console.error(`Error in consulting database: ${err}`)
        return res.status(500).json({ error: "Internal error in server" })
      }
      else {
        res.status(200).json({ status: 'Ok', message: "Success when querying stock", data: results })
        db.release();
      }
    })

  } catch (error) {
    console.error(`Error in consulting database: ${error}`);
    res.status(500).json({ error: `Internal error in server` })
  }
})

module.exports = router;