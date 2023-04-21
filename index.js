const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const products = {}; // stock de produits

app.post('/api/stock/:productId/movement', (req, res) => {
  const productId = req.params.productId;
  const stockMovement = req.body;

  // Vérifier si le produit existe déjà dans le stock
  if (products[productId]) {
    // Ajouter la quantité fournie à la quantité en stock
    products[productId].quantity += stockMovement.quantity;
  } else {
    // Vérifier auprès du catalogue si le produit existe
    const productDto = getProductFromCatalogue(productId);

    if (productDto) {
      // Si le produit existe, l'ajouter au stock avec la quantité fournie
      products[productId] = {
        name: productDto.name,
        description: productDto.description,
        quantity: stockMovement.quantity
      };
    } else {
      // Si le produit n'existe pas, refuser l'intégration au stock
      return res.status(404).send('Produit inconnu');
    }
  }

  res.status(204).send();
});

function getProductFromCatalogue(productId) {
  const url = `http://microservices.tp.rjqu8633.odns.fr/products/${productId}`;
  return axios.get(url)
    .then(response => {
      if (response.status === 200) {
        return response.data; // Retourne le ProductDto si le produit existe
      } else {
        return null; // Retourne null si le produit n'existe pas
      }
    })
    .catch(error => {
      console.error(error);
      return null; // Retourne null en cas d'erreur de l'appel à l'API
    });
}

app.listen(3000, () => {
  console.log('Serveur démarré sur le port 3000');
});