// Add Express
const express = require("express");
import { StockMovementDto, StockMovementType } from './types';

// Initialize Express
const app = express();

// Create GET request
app.get("/api/ping", (req, res) => {
  res.send("PONNG");
});

app.post('/stock/:productId/movement', async (req, res) => {
  const { productId } = req.params;
  const { quantity, status } = req.body;

  // Vérifier que le produit existe dans le catalogue
  try {
    const response = await fetch(`http://microservices.tp.rjqu8633.odns.fr/api/products/${productId}`);
    const product = await response.json();

    console.log(product)

    // Si le produit existe, ajouter la quantité fournie au stock
    // Si le produit n'existe pas, renvoyer une erreur
    if (product) {
      // TODO : Ajouter la quantité fournie au stock
      res.status(204).send();
    } else {
      res.status(400).send(`Le produit n'existe pas dans le catalogue`);
    }
  } catch (error) {
    res.status(500).send('Erreur lors de la vérification du produit');
  }

  // TODO : Ajouter un événement de stock
  const stockMovement: StockMovementDto = {
    productId,
    quantity,
    type: StockMovementType.IN,
    status,
  };

});

// Initialize server
app.listen(5000, () => {
  console.log("Running on port 5000.");
});

module.exports = app;

