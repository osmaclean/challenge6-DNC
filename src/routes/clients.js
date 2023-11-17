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
      } else {
        res.status(201).json({ status: 'Created', message: "Customer record created successfully", client_id: results.insertId });
        db.release()
      }
    })
  } catch (error) {
    console.error(`Error inserting data into the customers table: ${error}`)
    res.status(500).json({ error: `Internal error in server` })
  }
})


router.get('/', (req, res) => {
  try {
    const db = req.dbConnection;
    const sql = "SELECT * FROM clients"

    db.query(sql, (err, results) => {
      if (err) {
        console.error(`Error in consulting database: ${err}`);
        return res.status(500).json({ error: `Internal error in server` })
      } else {
        res.status(200).json({ status: 'Ok', message: "Search completed successfully", data: results });
        db.release();
      }
    })

  } catch (error) {
    console.error(`Error in consulting database: ${error}`)
    res.status(500).json({ error: `Error in consulting database` })
  }
});

router.get('/:id', (req, res) => {
  try {
    const db = req.dbConnection;
    const id = req.params.id;
    const sql = "SELECT * FROM clients WHERE id = ?"

    db.query(sql, [id], (err, results) => {
      if (err) {
        console.error(`Error in consulting database: ${err}`);
        return res.status(500).json({ error: `Internal error in server` })
      } else {
        res.res.status(200).json({ status: 'Ok', message: "Search completed successfully", data: results });
        db.release();
      }
    })

  } catch (error) {
    console.error(`Error in consulting database: ${error}`)
    res.status(500).json({ error: `Error in consulting database` })
  }
});

router.put('/:id', (req, res) => {
  try {
    const db = req.dbConnection;
    const id = req.params.id;
    const updatedInfo = req.body;
    const sql = "UPDATE clients SET ? WHERE id = ?"
    const values = [updatedInfo, id]

    db.query(sql, values, (err, results) => {
      if (err) {
        console.error(`Error when editing customer in database: ${err}`);
        return res.status(500).json({ error: `Internal error in server` })
      } else {
        res.status(200).json({ status: 'Ok', message: "Update done successfully", data: updatedInfo, results });
        db.release();
      }
    });

  } catch (error) {
    console.error(`Error in consulting database: ${error}`)
    res.status(500).json({ error: `Error in consulting database` })
  }
});

router.delete('/:id', (req, res) => {
  try {
    const db = req.dbConnection;
    const id = req.params.id
    const sql = "DELETE FROM clients WHERE id = ?"

    db.query(sql, [id], (err, results) => {
      if (err) {
        console.error(`Error when deleting customer in database: ${err}`);
        return res.status(500).json({ error: `Internal error in server` })
      } else {
        res.status(200).json({ status: 'Ok', message: 'User deleted successfully', data: results });
        db.release();
      }
    })

  } catch (error) {
    console.error(`Error in consulting database: ${error}`)
    res.status(500).json({ error: `Error in consulting database` })
  }
})

module.exports = router;