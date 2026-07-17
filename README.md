# 2 ans ensemble ♥

Site anniversaire React + Vite + Tailwind, déployable sur Vercel.

## Développement local

```bash
npm install
npm run dev
```

Crée un fichier `.env.local` pour tester l’ajout de souvenirs :

```
VITE_ADMIN_PASSWORD=ton-mot-de-passe
```

## Déploiement Vercel

1. Pousse ce repo sur GitHub (branche `main`)
2. Sur [vercel.com](https://vercel.com) → **Add New Project** → importe le repo
3. Vercel détecte **Vite** automatiquement — ne change pas :
   - **Root Directory** : `.` (racine du repo)
   - **Build Command** : `npm run build`
   - **Output Directory** : `dist`
4. Ajoute les variables d’environnement (Settings → Environment Variables) :
   - `ADMIN_PASSWORD` — mot de passe pour ajouter un souvenir
   - `ADMIN_SECRET` — chaîne aléatoire longue (ex. `openssl rand -hex 32`)
   - `BLOB_READ_WRITE_TOKEN` — créé en connectant **Vercel Blob** (Storage)
5. **Deploy**

## LoveSign (paiement)

L’espace de vente se trouve dans `paiment_lovesign/` :

```bash
cd paiment_lovesign
npm install
npm run dev
```

- Devise : **EUR** ou **USD**
- Après paiement → redirection vers `/setup` pour créer le mot de passe (frise + poèmes)
- Sans `STRIPE_SECRET_KEY` : mode démo (activation directe)
- Avec Stripe : Checkout réel

Variables utiles (Vercel / `.env`) :

- `SITE_ORIGIN` — URL du site couple
- `LOVESIGN_ORIGIN` — URL de la page paiement
- `STRIPE_SECRET_KEY` — optionnel
- `ADMIN_SECRET` — signature des sessions
