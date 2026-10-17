// scripts/queries.js
// 10 requêtes MongoDB sur le dataset NYC Airbnb
// Exécution : node scripts/queries.js

require('dotenv').config();
const mongoose = require('mongoose');
const Listing  = require('../models/Listing');

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connecté\n');

  // R1 — Compter le total de logements
  const R1 = await Listing.countDocuments();
  console.log('R1 — Total logements :', R1);

  // R2 — Logements à moins de 50$ par nuit
  const R2 = await Listing.find({ price: { $lte: 50 } })
    .select('name price neighbourhood room_type')
    .sort({ price: 1 })
    .limit(5);
  console.log('\nR2 — Logements ≤ 50$/nuit :'); console.table(R2.map(l => ({ name: l.name, price: l.price, quartier: l.neighbourhood })));

  // R3 — Tous les appartements entiers à Manhattan
  const R3 = await Listing.find({
    neighbourhood_group: 'Manhattan',
    room_type: 'Entire home/apt'
  }).countDocuments();
  console.log('\nR3 — Appartements entiers à Manhattan :', R3);

  // R4 — Hôtes avec le plus de logements
  const R4 = await Listing.find()
    .sort({ calculated_host_listings_count: -1 })
    .select('host_name calculated_host_listings_count neighbourhood_group')
    .limit(5);
  console.log('\nR4 — Top 5 hôtes :'); console.table(R4.map(l => ({ hote: l.host_name, nb_logements: l.calculated_host_listings_count })));

  // R5 — Logements disponibles toute l'année
  const R5 = await Listing.countDocuments({ availability_365: 365 });
  console.log('\nR5 — Disponibles 365j/an :', R5);

  // R6 — Prix moyen, min, max par quartier
  const R6 = await Listing.aggregate([
    { $group: {
      _id: '$neighbourhood_group',
      prix_moyen: { $avg: '$price' },
      prix_min:   { $min: '$price' },
      prix_max:   { $max: '$price' },
      total:      { $sum: 1 }
    }},
    { $sort: { prix_moyen: -1 }},
    { $project: {
      quartier:   '$_id',
      prix_moyen: { $round: ['$prix_moyen', 2] },
      prix_min: 1, prix_max: 1, total: 1, _id: 0
    }}
  ]);
  console.log('\nR6 — Prix par quartier :'); console.table(R6);

  // R7 — Répartition des types de chambre en %
  const totalDocs = await Listing.countDocuments();
  const R7 = await Listing.aggregate([
    { $group: { _id: '$room_type', count: { $sum: 1 } }},
    { $project: {
      type: '$_id',
      count: 1,
      pourcentage: { $round: [{ $multiply: [{ $divide: ['$count', totalDocs] }, 100] }, 1] },
      _id: 0
    }},
    { $sort: { count: -1 }}
  ]);
  console.log('\nR7 — Répartition types de chambre :'); console.table(R7);

  // R8 — Top 5 quartiers avec le plus d'avis
  const R8 = await Listing.aggregate([
    { $match:  { number_of_reviews: { $gt: 0 } }},
    { $group:  { _id: '$neighbourhood', total_avis: { $sum: '$number_of_reviews' }, nb_logements: { $sum: 1 } }},
    { $sort:   { total_avis: -1 }},
    { $limit:  5 },
    { $project: { quartier: '$_id', total_avis: 1, nb_logements: 1, _id: 0 }}
  ]);
  console.log('\nR8 — Top 5 quartiers par avis :'); console.table(R8);

  // R9 — Prix moyen par type ET par quartier
  const R9 = await Listing.aggregate([
    { $match: { price: { $gt: 0, $lt: 500 } }},
    { $group: {
      _id: { quartier: '$neighbourhood_group', type: '$room_type' },
      prix_moyen: { $avg: '$price' },
      count: { $sum: 1 }
    }},
    { $sort: { prix_moyen: -1 }},
    { $limit: 8 },
    { $project: {
      quartier: '$_id.quartier', type: '$_id.type',
      prix_moyen: { $round: ['$prix_moyen', 2] }, count: 1, _id: 0
    }}
  ]);
  console.log('\nR9 — Prix moyen par quartier ET type :'); console.table(R9);

  // R10 — Hôtes les plus actifs avec leurs stats
  const R10 = await Listing.aggregate([
    { $group: {
      _id: '$host_name',
      nb_annonces:  { $sum: 1 },
      prix_moyen:   { $avg: '$price' },
      total_avis:   { $sum: '$number_of_reviews' }
    }},
    { $match:   { nb_annonces: { $gte: 5 } }},
    { $sort:    { nb_annonces: -1 }},
    { $limit:   5 },
    { $project: {
      hote: '$_id', nb_annonces: 1,
      prix_moyen: { $round: ['$prix_moyen', 2] },
      total_avis: 1, _id: 0
    }}
  ]);
  console.log('\nR10 — Top hôtes actifs :'); console.table(R10);

  await mongoose.disconnect();
  console.log('\n✅ Toutes les requêtes exécutées.');
};

run().catch(err => { console.error(err); process.exit(1); });