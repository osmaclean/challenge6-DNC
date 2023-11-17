const express = require('express');
const router = express.Router();
const connectDatabase = require('../middlewares/connectDB');
router.use(express.json());
router.use(connectDatabase);


router.put('/correction/:id', (req, res) => {
  try {
    const db = req.dbConnection;
    const id = req.params.id;
    const updatedFields = req.body;
    const updateStockQuery = 'UPDATE stock SET ? WHERE product_id = ?'
    const values = [updatedFields, id]

    db.query(updateStockQuery, values, (err, results) => {
      if (err) {
        console.error(`Error updating database product: ${err}`);
        return res.status(500).json({ error: "Internal error in server" });
      } else {
        res.status(200).json({ status: 'Ok', message: "Product updated successfully", data: results });
        db.release();
      }
    })

  } catch (error) {
    console.error(`Error in consulting database: ${error}`);
    res.status(500).json({ error: `Internal error in server` })
  }
})

router.put('/update/:id', (req, res) => {
  const db = req.dbConnection;
  const id = req.params.id;
  const { quantity } = req.body;
  const currentQuantity = 'SELECT quantity FROM stock WHERE product_id = ?';

  db.query(currentQuantity, [id], (err, results) => {
    if (err) {
      console.error("Error when querying stock:", err);
      return res.status(500).json({ error: "Internal error in server" });
    } else {
      const currentStock = results[0].quantity;
      if (currentStock < quantity) {
        res.status(400).send("Insufficient quantity in stock");
      } else {
        const newStock = currentStock - quantity;
        const sql = "UPDATE stock SET quantity = ? WHERE product_id = ?"

        db.query(sql, [newStock, id], (err, results) => {
          if (err) {
            console.error("Error updating inventory:", err);
            res.status(500).json({ error: 'Error updating inventory' });
          } else {
            console.log("Stock updated successfully");
            res.status(200).send("Stock updated successfully");
            db.release();
          }
        })
      }
    }
  })
})

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