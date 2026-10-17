# Airbnb NYC API : MongoDB Atlas, Express et ReplicaSet

API RESTful construite sur le jeu de données **Airbnb New York City 2019** (48 895 logements), avec une étude de la haute disponibilité de MongoDB par **ReplicaSet** (Primary, Secondaries, Oplog, élections, Read/Write Concerns).

Projet réalisé dans le cadre du cours de Bases de Données Avancées (NoSQL et réparties), ESMT Dakar.

## Contenu du projet

| Partie | Description |
| --- | --- |
| API REST | Node.js, Express 5 et Mongoose, connectée à MongoDB Atlas |
| Requêtes d'analyse | 10 requêtes MongoDB (filtres, agrégations, regroupements) dans `scripts/queries.js` |
| ReplicaSet | Étude et déploiement d'un ReplicaSet de 4 nœuds : Oplog, élections, Read/Write Concerns, failover automatique |
| Limites et perspectives | Limites du ReplicaSet seul et passage possible au Sharded Cluster (voir `docs/`) |

## Technologies

Node.js, Express 5, Mongoose 9, MongoDB Atlas, dotenv, cors.

## Structure

```
airbnb-api/
├── server.js               Point d'entrée
├── config/database.js      Connexion à MongoDB Atlas
├── models/Listing.js       Schéma d'un logement (index sur price, neighbourhood, room_type)
├── routes/listings.js      Routes de l'API
├── scripts/
│   ├── queries.js          10 requêtes MongoDB sur le dataset
│   └── AB_NYC_2019.csv     Jeu de données (48 895 lignes)
└── docs/                   Rapport du projet
```

## Installation

```bash
git clone https://github.com/cheickbougoum90-web/airbnb-api.git
cd airbnb-api
npm install
cp .env.example .env     # puis renseigner MONGODB_URI
```

Importez ensuite `scripts/AB_NYC_2019.csv` dans une collection `listings` de votre base (MongoDB Compass ou `mongoimport`).

```bash
node server.js           # API sur http://localhost:3000
node scripts/queries.js  # exécute les 10 requêtes d'analyse
```

## Routes de l'API

| Méthode | Route | Description |
| --- | --- | --- |
| GET | `/api/listings` | Liste paginée (20 par page). Filtres : `neighbourhood`, `room_type`, `min_price`, `max_price`, `page` |
| GET | `/api/listings/stats` | Nombre de logements et prix moyen, min et max par quartier |
| GET | `/api/listings/:id` | Détail d'un logement |
| POST | `/api/listings` | Ajouter un logement |
| PUT | `/api/listings/:id` | Modifier un logement |
| DELETE | `/api/listings/:id` | Supprimer un logement |

Exemple :

```
GET /api/listings?neighbourhood=Brooklyn&room_type=Private room&max_price=100&page=1
```

## Résumé de l'étude ReplicaSet

- **Réplication** quasi instantanée en environnement local, grâce à l'Oplog (journal de réplication idempotent).
- **Failover automatique** en 10 à 30 secondes sans intervention manuelle, puis réintégration transparente d'un nœud par rattrapage de l'Oplog.
- **Limites** : toutes les écritures passent par un seul Primary, chaque nœud stocke l'intégralité des données, cohérence éventuelle sur les Secondaries.
- **Perspective** : le Sharded Cluster (shards en ReplicaSet, config servers, mongos) pour la scalabilité horizontale.

Le détail figure dans le rapport : `docs/Rapport_Limites_Perspectives_Conclusion.docx`.

## Pistes d'amélioration

- Ajouter une authentification pour les routes POST, PUT et DELETE.
- Valider les entrées avec `express-validator` (déjà installé) et échapper le paramètre `neighbourhood`, utilisé dans une expression régulière.
- Ajouter des tests automatisés.

## Auteur

**Cheïck Abdoul Aziz BOUGOUM**, élève ingénieur Données et IA, ESMT Dakar
[LinkedIn](https://www.linkedin.com/in/che%C3%AFck-abdoul-aziz-bougoum-7264243aa) · [GitHub](https://github.com/cheickbougoum90-web)
