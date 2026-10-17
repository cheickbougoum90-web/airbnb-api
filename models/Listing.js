// models/Listing.js
// Définit la structure d'un logement Airbnb dans MongoDB

const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema(
  {
    // ── Identité ─────────────────────────────
    id:                  { type: String },
    name:                { type: String, required: true, trim: true },

    // ── Hôte ─────────────────────────────────
    host_id:             { type: String },
    host_name:           { type: String, trim: true },

    // ── Localisation ─────────────────────────
    neighbourhood_group: { type: String },
    neighbourhood:       { type: String, index: true },
    latitude:            { type: Number },
    longitude:           { type: Number },

    // ── Type de logement ──────────────────────
    room_type: {
      type: String,
      enum: ['Entire home/apt', 'Private room', 'Shared room', 'Hotel room'],
      index: true
    },

    // ── Prix et règles ────────────────────────
    price:               { type: Number, min: 0 },
    minimum_nights:      { type: Number, min: 1 },

    // ── Avis ──────────────────────────────────
    number_of_reviews:   { type: Number, default: 0 },
    last_review:         { type: Date },
    reviews_per_month:   { type: Number },

    // ── Disponibilité ─────────────────────────
    calculated_host_listings_count: { type: Number },
    availability_365:    { type: Number, min: 0, max: 365 },
  },
  {
    collection: 'listings', // nom exact dans Atlas
    timestamps: true        // ajoute createdAt et updatedAt
  }
);

// Index pour accélérer les recherches par prix
listingSchema.index({ price: 1 });

// Index pour accélérer les recherches par quartier + prix
listingSchema.index({ neighbourhood_group: 1, price: 1 });

// Rend le modèle utilisable dans les autres fichiers
module.exports = mongoose.model('Listing', listingSchema);