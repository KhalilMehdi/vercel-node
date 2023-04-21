const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const products = {}; // stock de produits


// Create GET request
app.get("/api/ping", (req, res) => {
  res.send("PONNG");
});



// ID de test : 6442597dfd03626d794bd54a

app.post('/api/stock/:productId', async (req, res) => {
  const productId = req.params.productId;
  const stockMovement = req.body;

  // Vérifier si le produit existe déjà dans le stock
  if (products[productId]) {
    // Ajouter la quantité fournie à la quantité en stock
    products[productId].quantity += stockMovement.quantity;
    console.log('produit ajouté')
    res.status(204).send('produit ajouté');
  } else {
    try {
      // Vérifier auprès du catalogue si le produit existe
      const productDto = await getProductFromCatalogue(productId);

      if (productDto) {
        // Si le produit existe, l'ajouter au stock avec la quantité fournie
        products[productId] = {
          name: productDto.name,
          description: productDto.description,
          quantity: stockMovement.quantity
        };
        console.log('produit existe')
        res.status(204).send('produit existe');
      } else {
        // Si le produit n'existe pas, refuser l'intégration au stock
        res.status(404).send('Produit inconnu');
      }
    } catch (error) {
      console.error(error);
      res.status(500).send('Erreur lors de la récupération du produit dans le catalogue');
    }
  }
});

async function getProductFromCatalogue(productId) {
  const url = `http://microservices.tp.rjqu8633.odns.fr/api/products/${productId}`;
  try {
    const response = await axios.get(url);
    if (response.status === 200) {
      return response.data; // Retourne le ProductDto si le produit existe
    } else {
      return null; // Retourne null si le produit n'existe pas
    }
  } catch (error) {
    console.error(error);
    return null; // Retourne null en cas d'erreur de l'appel à l'API
  }
}

app.listen(3000, () => {
  console.log('Serveur démarré sur le port 3000');
});
