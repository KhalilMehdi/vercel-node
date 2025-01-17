// Importer les dépendances
const express = require('express');
const axios = require('axios');

// Créer une application Express et activer l'analyse JSON pour les requêtes entrantes
const app = express();
app.use(express.json());

// Initialiser le stock de produits
const products = {};

// Créer une requête GET pour vérifier si le serveur fonctionne
app.get("/api/ping", (req, res) => {
  res.send("PONNG");
});

// Définir la route POST pour ajouter ou supprimer un produit du stock
app.post('/api/stock/:productId/:action', async (req, res) => {
  const productId = req.params.productId;
  const stockMovement = req.body;
  const action = req.params.action;

  // Vérifier si le produit existe déjà dans le stock
  if (products[productId]) {
    if (action === 'add') {
      // Vérifier si la quantité demandée est disponible
      if (products[productId].quantity >= stockMovement.quantity) {
        // Réserver la quantité demandée
        products[productId].reserved += stockMovement.quantity;
        products[productId].quantity -= stockMovement.quantity;
        console.log('produit réservé');
        res.status(204).send('produit réservé');
      }       
      else {

        // Retourner une erreur si la quantité demandée est supérieure à la quantité disponible
        res.status(400).send('Quantité demandée supérieure à la quantité disponible');
      } 
    } else if (action === 'remove') {
      if (products[productId].quantity === 0) {
        requestSupply(productId);
      }
      // Vérifier si la quantité réservée est suffisante
      if (products[productId].reserved >= stockMovement.quantity) {
        // Décrémenter la quantité réservée
        products[productId].reserved -= stockMovement.quantity;
        console.log('produit retiré du stock');
        res.status(204).send('produit retiré du stock');
      } else {
        // Retourner une erreur si la quantité réservée est insuffisante
        res.status(400).send('Quantité réservée insuffisante');
      }
    } else {
      // Retourner une erreur si l'action est inconnue
      res.status(400).send('Action inconnue');
    }
  } else {
    try {
      // Vérifier auprès du catalogue si le produit existe
      const productDto = await getProductFromCatalogue(productId);

      if (productDto) {
        // Si le produit existe, l'ajouter au stock avec la quantité fournie et la quantité réservée à zéro
        products[productId] = {
          name: productDto.name,
          description: productDto.description,
          quantity: stockMovement.quantity,
          reserved: 0
        };
        console.log('produit ajouté');
        res.status(204).send('produit ajouté');
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
// Fonction pour envoyer une demande d'approvisionnement
async function requestSupply(productId) {
  const url = 'https://api-approvisionnement.vercel.app/api/supply-needed'; 
  const requiredSupplyDto = { productId };

  try {
    await axios.post(url, requiredSupplyDto);
    console.log(`Demande d'approvisionnement envoyée pour le produit ${productId}`);
  } catch (error) {
    console.error(`Erreur lors de l'envoi de la demande d'approvisionnement pour le produit ${productId}:`, error);
  }
}

// Route GET pour récupérer la liste des produits en stock
app.get('/api/stock', async (req, res) => {
  const stockProducts = [];

  for (const productId in products) {
    if (products[productId].quantity > 0) {
      const productDto = await getProductFromCatalogue(productId);
      if (productDto) {
        stockProducts.push({ 
          productId: productId,
          name: productDto.name,
          description: productDto.description,
          quantity: products[productId].quantity
        });
      } 
    }
  }

  res.status(200).json(stockProducts);
});

// Fonction pour récupérer les informations d'un produit à partir du catalogue
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

// Lancer le serveur sur le port 3000
app.listen(3000, () => {
  console.log('Serveur démarré sur le port 3000');
});
