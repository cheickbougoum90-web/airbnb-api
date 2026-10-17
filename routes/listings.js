// routes/listings.js
// Définit toutes les URLs (routes) de l'API

const express  = require('express');
const router   = express.Router();
const Listing  = require('../models/Listing');

// ── ROUTE 1 : Lister tous les logements ──────────────────
// GET /api/listings?neighbourhood=Brooklyn&max_price=100
router.get('/', async (req, res) => {
  try {
    const { neighbourhood, room_type, min_price, max_price, page = 1 } = req.query;
    const filtre = {};
    if (neighbourhood) filtre.neighbourhood_group = new RegExp(neighbourhood, 'i');
    if (room_type)    filtre.room_type = room_type;
    if (min_price || max_price) {
      filtre.price = {};
      if (min_price) filtre.price.$gte = Number(min_price);
      if (max_price) filtre.price.$lte = Number(max_price);
    }
    const limite = 20;
    const listings = await Listing.find(filtre)
      .skip((page - 1) * limite)
      .limit(limite)
      .sort({ price: 1 });
    const total = await Listing.countDocuments(filtre);
    res.json({ success: true, total, page: Number(page), data: listings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── ROUTE 2 : Statistiques par quartier ──────────────────
// GET /api/listings/stats
router.get('/stats', async (req, res) => {
  try {
    const stats = await Listing.aggregate([
      { $group: {
        _id: '$neighbourhood_group',
        total:     { $sum: 1 },
        prix_moy: { $avg: '$price' },
        prix_min: { $min: '$price' },
        prix_max: { $max: '$price' }
      }},
      { $sort: { prix_moy: -1 }}
    ]);
    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── ROUTE 3 : Un seul logement par ID ────────────────────
// GET /api/listings/:id
router.get('/:id', async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ success: false, message: 'Introuvable' });
    res.json({ success: true, data: listing });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── ROUTE 4 : Ajouter un logement ────────────────────────
// POST /api/listings
router.post('/', async (req, res) => {
  try {
    const listing = await Listing.create(req.body);
    res.status(201).json({ success: true, data: listing });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ── ROUTE 5 : Modifier un logement ───────────────────────
// PUT /api/listings/:id
router.put('/:id', async (req, res) => {
  try {
    const listing = await Listing.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!listing) return res.status(404).json({ success: false, message: 'Introuvable' });
    res.json({ success: true, data: listing });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ── ROUTE 6 : Supprimer un logement ──────────────────────
// DELETE /api/listings/:id
router.delete('/:id', async (req, res) => {
  try {
    const listing = await Listing.findByIdAndDelete(req.params.id);
    if (!listing) return res.status(404).json({ success: false, message: 'Introuvable' });
    res.json({ success: true, message: 'Logement supprimé' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;