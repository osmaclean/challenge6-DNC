const express = require('express');
const router = express.Router();
const connectDatabase = require('../middlewares/connectDB');
router.use(express.json());
router.use(connectDatabase);


router.post('/create', (req, res) => {
  try {
    const db = req.dbConnection;
    const { name, description, price, author, category } = req.body;

    // Check by name if the product exists
    const checkProductQuery = 'SELECT id FROM product WHERE name = ?';
    db.query(checkProductQuery, [name], (checkError, checkResults) => {
      if (checkError) {
        console.error(`Error checking product in the database: ${checkError}`);
        return res.status(500).json({ error: checkError });
      }

      if (checkResults.length > 0) {
        // Update quantity stock
        const existingProductId = checkResults[0].id;
        const updateQuantityQuery = 'UPDATE stock SET quantity = quantity + 1 WHERE product_id = ?'
        db.query(updateQuantityQuery, [existingProductId], (updateError, updateResults) => {
          if (updateError) {
            console.error(`Error updating quantity in the database: ${updateError}`);
            return res.status(500).json({ error: updateError });
          } else {
            res.status(200).json({ status: 'Updated', message: 'Quantity updated successfully', data: { existingProductId }, updateResults });
            db.release()
          }
        })
      } else {

        const sql = 'INSERT INTO product ( name, description, price, author, category ) VALUES (?, ?, ?, ?, ?)';
        const values = [name, description, price, author, category];

        db.query(sql, values, (err, results) => {
          if (err) {
            console.error(`Error creating product in the database: ${err}`);
            return res.status(500).json({ error: err })
          } else {

            const newProductId = results.insertId;
            const sql2 = 'INSERT INTO stock (product_id, quantity) VALUES (?, 1)'

            db.query(sql2, [newProductId], (secondError, secondResults) => {
              if (secondError) {
                console.error(`Error in second database query: ${secondError}`);
                res.status(500).json({ error: secondError })
              } else {
                res.status(201).json({ status: 'Created', message: 'Product registered successfully', data: { newProductId }, secondResults });
                db.release();
              }
            })
          }
        })
      }
    })
  } catch (error) {
    console.error(`Error inserting data into the products table: ${error}`)
    res.status(500).json({ error: `Internal error in server` })
  }
})

router.get('/', (req, res) => {
  try {
    const db = req.dbConnection;
    const allProductsQuery = 'SELECT * FROM product'

    db.query(allProductsQuery, (err, results) => {
      if (err) {
        console.error(`Error consulting data into the products table: ${err}`);
        res.status(500).json({ error: err })
      } else {
        res.status(200).json({ status: 'Ok', message: "Consulted completed successfully", data: results });
        db.release();
      }
    })

  } catch (error) {
    console.error(`Error consulting data into the products table: ${error}`);
    res.status(500).json({ error: `Internal error in server` })
  }
})

router.get('/:id', (req, res) => {
  try {
    const db = req.dbConnection;
    const id = req.params.id
    const productsByIdQuery = 'SELECT * FROM product WHERE id = ?'

    db.query(productsByIdQuery, [id], (err, results) => {
      if (err) {
        console.error(`Error consulting data into the products table: ${err}`);
        res.status(500).json({ error: err })
      } else {
        res.status(200).json({ status: 'Ok', message: "Consulted completed successfully", data: results });
        db.release();
      }
    })

  } catch (error) {
    console.error(`Error consulting data into the products table: ${error}`);
    res.status(500).json({ error: `Internal error in server` })
  }
})

router.put('/:id', (req, res) => {
  try {
    const db = req.dbConnection;
    const id = req.params.id
    const updatedFiels = req.body;
    const updateProductQuery = 'UPDATE product SET ? WHERE id = ?'
    const values = [updatedFiels, id]

    db.query(updateProductQuery, values, (err, results) => {
      if (err) {
        console.error(`Error in update data into the products table: ${err}`);
        res.status(500).json({ error: err })
      } else {
        res.status(200).json({ status: 'Ok', message: "Update completed successfully", data: results });
        db.release();
      }
    })

  } catch (error) {
    console.error(`Error consulting data into the products table: ${error}`);
    res.status(500).json({ error: `Internal error in server` });
  }
})

router.delete('/:id', (req, res) => {
  try {
    const db = req.dbConnection;
    const id = req.params.id;

    const checkStockQuery = 'SELECT id, quantity FROM stock WHERE product_id = ?'
    db.query(checkStockQuery, [id], (err, results) => {
      if (err) {
        console.error(`Error checking stock entries for the product: ${err}`);
        res.status(500).json({ error: err })
      }

      if (results.length === 0) {
        deleteProduct(id, db, res)
      } else {
        const stockId = results[0].id;
        const quantity = results[0].quantity;

        if (quantity > 1) {
          updateStockQuantity(stockId, quantity - 1, db, res);
        } else {
          deletedProductAndStock(id, stockId, db, res)
        }
      }
    })

  } catch (error) {
    console.log(`Error deleting data into the products table: ${error}`);
    res.status(500).json({ error: `Internal error in server` });
  }
})

function deleteProduct(productId, db, res) {
  const queryDeleteProduct = 'DELETE FROM product WHERE id = ?';
  db.query(queryDeleteProduct, [productId], (err, results) => {
    if (err) {
      console.error(`Error deleting product from database: ${err}`)
      return res.status(500).json({ error: err });
    } else {
      res.status(200).json({ status: 'Ok', message: 'Product deleted successfully', data: results });
      db.release();
    }
  })
}

function updateStockQuantity(stockId, newQuantity, db, res) {
  const updateStockQuery = 'UPDATE stock SET quantity = ? WHERE id = ?';
  db.query(updateStockQuery, [newQuantity, stockId], (err, results) => {
    if (err) {
      console.error(`Error updating stock quantity in the database: ${err}`);
      return res.status(500).json({ error: err })
    } else {
      res.status(200).json({ status: 'Ok', message: 'Stock quantity update successfully', data: results });
      db.release()
    }
  })
}

function deletedProductAndStock(productId, stockId, db, res) {
  const queryDeleteStock = "DELETE FROM stock WHERE id = ?";
  db.query(queryDeleteStock, [stockId], (deleteStockErr, deleteStockResults) => {
    if (deleteStockErr) {
      console.error(`Error deleting stock entry from database: ${deleteStockErr}`);
      return res.status(500).json({ error: deleteStockErr });
    } else {
      deleteProduct(productId, db, res);
    }
  })
}

module.exports = router;