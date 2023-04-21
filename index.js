import { StockMovementDto } from './types';
// Add Express
const express = require("express");

// Initialize Express
const app = express();

// Create GET request
app.get("/api/ping", (req, res) => {
  res.send("PONNG");
});

//GET products
app.get(`/api/products`, (req, res) => {

  fetch(`https://microservice-stock.vercel.app/api/products`)
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      res.status(200).send(data);
    })

}); 

// // Endpoint pour accepter des marchandises dans le stock
app.post('/api/stock/:productId/movement', async (req, res) => {
  const { productId } = req.params;
  const { quantity, status } = req.body;

  // Vérifier que le produit existe dans le catalogue
  try {
    const response = await fetch(`https://microservice-stock.vercel.app/api/products/${productId}`);
    const product = await response.json();

    console.log(product)

    // Si le produit existe, ajouter la quantité fournie au stock
    // Si le produit n'existe pas, renvoyer une erreur
    if (product) {
      // TODO : Ajouter la quantité fournie au stock
      res.status(204).send();
    } else {
      res.status(400).send('Le produit n\'existe pas dans le catalogue');
    }



  } catch (error) {
    res.status(500).send('Erreur lors de la vérification du produit');
  }
});

// Initialize server
app.listen(5000, () => {
  console.log("Running on port 5000.");
});

module.exports = app;

