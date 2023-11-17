const express = require('express');
const router = express.Router();
const connectDatabase = require('../middlewares/connectDB');
const axios = require('axios');
router.use(express.json());
router.use(connectDatabase);

router.get('/', (req, res) => {
  try {
    const db = req.dbConnection;
    const allSalesQuery = "SELECT * FROM sales";

    db.query(allSalesQuery, (err, results) => {
      if (err) {
        console.error(`Error in consulting database: ${err}`);
        return res.status(500).json({ error: 'Internal error in server' })
      } else {
        res.status(200).json({ status: 'Ok', message: 'Success when querying sales', data: results })
        db.release();
      }
    })

  } catch (error) {
    console.error(`Error in consulting database: ${error}`)
    res.status(500).json({ error: `Internal error in server` })
  }
})

router.get('/:id', (req, res) => {
  try {
    const db = req.dbConnection;
    const id = req.params.id;
    const allSalesQuery = "SELECT * FROM sales WHERE id = ?";

    db.query(allSalesQuery, [id], (err, results) => {
      if (err) {
        console.error(`Error in consulting database: ${err}`);
        return res.status(500).json({ error: 'Internal error in server' })
      } else {
        res.status(200).json({ status: 'Ok', message: 'Success when querying sales', data: results })
        db.release();
      }
    })

  } catch (error) {
    console.error(`Error in consulting database: ${error}`)
    res.status(500).json({ error: `Internal error in server` })
  }
})

router.post('/', async function (req, res) {
  try {
    const db = req.dbConnection;
    const { products, client_id } = req.body;

    const sufficientStock = await checkStock(products);

    if (!sufficientStock) return res.status(401).send('Stock below requested')

    const salesId = await createSale(client_id, db)

    for (const product of products) {
      await createdProductsSales(product, salesId, db);
      await updateStock(product.product_id, product.quantity);
    }

    const totalAmount = await calculateTotalValue(products);
    await updateTotalSaleValue(salesId, totalAmount, db);

    res.status(200).send('Sales entered successfully!');

  } catch (error) {
    console.error(`Error during sale creation: ${error}`);
    res.status(500).json({ error: error.message })
  }
})

async function checkStock(products) {
  for (const product of products) {
    try {
      const response = await axios.get(`http://localhost:4000/stock/${product.product_id}`)
      const result = response.data.result;
      const quantity = result.quantity;

      if (product.quantity > quantity) {
        return false;
      }
    } catch (error) {
      throw new Error(`Error when checking stock ${error}`)
    }
  }
  return true;
}

async function createSale(client_id, db) {
  return new Promise((resolve, reject) => {
    const salesQuery = 'INSERT INTO sales (client_id, total_amount) VALUES (?, ?)'
    const valuesSales = [client_id, 0];

    db.query(salesQuery, valuesSales, (err, results) => {
      if (err) {
        reject(new Error(`Error creating sale in database: ${err.message}`))
      } else resolve(results.insertId)
    });
  });
}

async function createdProductsSales(product, salesId, db) {
  return new Promise((resolve, reject) => {
    const productSalesQuery = 'INSERT INTO products_sales (sales_id, product_id, quantity) VALUES (?, ?, ?)';
    const valuesProdSales = [salesId, product.product_id, product.quantity];

    db.query(productSalesQuery, valuesProdSales, (err, results) => {
      if (err) reject(new Error(`Error creating product in the database: ${err.message}`))
      else resolve();
    });
  });
}

async function updateStock(productId, quantity) {
  try {
    const requestBody = { quantity };
    const response = await axios.get(`http://localhost:4000/stock/update/${productId}`, requestBody)

    if (response.status !== 200) throw new Error(`Error updating inventory for product ${productId}`)
    else console.log(`Successfully updated stock for product ${productId}`)

  } catch (error) {
    throw new Error(`Error when making the request to update stock: ${error.message}`)
  }
}

async function calculateTotalValue(products) {
  return products.reduce((total, product) => {
    return total + product.price * product.quantity
  }, 0);
}

async function updateTotalSaleValue(salesId, totalAmount, db) {
  return new Promise((resolve, reject) => {
    const sqlUpdateSale = 'UPDATE sales SET total_amount = ? WHERE id = ?';

    db.query(sqlUpdateSale, [totalAmount, salesId], (err, results) => {
      if (err) {
        reject(new Error(`Error updating total sale value in database: ${err.message}`))
      } else resolve()
    });
  });
}


module.exports = router;