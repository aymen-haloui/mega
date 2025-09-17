# 🍕 Mega Pizza

Une plateforme moderne de restaurants multi-branches en Algérie avec un système de gestion des rôles et des commandes en ligne.

## ✨ Caractéristiques

### 🎨 Design & UI/UX
- **Thème sombre** avec fond noir
- **Couleurs primaires** : Rouge (#ff0000) et Jaune (#ffcc00)
- **Animations fluides** avec Framer Motion
- **Interface responsive** (mobile → desktop)
- **Composants modernes** avec shadcn/ui

### 🔐 Système d'Authentification
- **3 rôles utilisateurs** : Client, Admin Branche, Admin Général
- **Protection des routes** basée sur les rôles
- **Gestion des sessions** avec Zustand
- **Comptes de démonstration** inclus

### 👥 Rôles & Permissions

#### 👤 **Client**
- Accès aux menus des restaurants
- Gestion du panier d'achat
- Suivi des commandes
- Favoris et profil personnel

#### 🏪 **Admin Branche**
- Dashboard de la branche
- Gestion des commandes
- Gestion des produits
- Paramètres de la branche

#### 🏢 **Admin Général**
- Dashboard global
- Gestion des branches
- Gestion des utilisateurs
- Vue d'ensemble des commandes

## 🚀 Technologies Utilisées

- **Frontend** : React 18 + TypeScript
- **Build Tool** : Vite
- **Styling** : TailwindCSS
- **Animations** : Framer Motion
- **State Management** : Zustand
- **Routing** : React Router DOM
- **UI Components** : shadcn/ui
- **Icons** : Lucide React
- **Charts** : Recharts (préparé)
- **Maps** : React-Leaflet (préparé)

## 📁 Structure du Projet

```
src/
├── components/
│   ├── ui/           # Composants UI de base
│   └── layout/       # Composants de mise en page
├── pages/
│   ├── auth/         # Pages d'authentification
│   ├── client/       # Pages pour les clients
│   ├── branch/       # Pages pour les admins de branche
│   └── general/      # Pages pour l'admin général
├── store/            # Stores Zustand
├── types/            # Types TypeScript
├── data/             # Données mockées
└── lib/              # Utilitaires
```

## 🛠️ Installation

### Prérequis
- Node.js 18+ 
- npm ou yarn

### Étapes d'installation

1. **Cloner le projet**
```bash
git clone <repository-url>
cd algeria-eats-hub
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Lancer le serveur de développement**
```bash
npm run dev
```

4. **Ouvrir dans le navigateur**
```
http://localhost:5173
```

## 🔑 Comptes de Démonstration

### 👑 Admin Général
- **Email** : `ahmed@admin.com`
- **Mot de passe** : `password123`
- **Accès** : Dashboard global, gestion des branches et utilisateurs

### 🏪 Admin Branche Alger
- **Email** : `fatima@alger.com`
- **Mot de passe** : `password123`
- **Accès** : Dashboard de la branche Alger

### 🏪 Admin Branche Oran
- **Email** : `karim@oran.com`
- **Mot de passe** : `password123`
- **Accès** : Dashboard de la branche Oran

### 👤 Client Amina
- **Email** : `amina@client.com`
- **Mot de passe** : `password123`
- **Accès** : Menu, panier, commandes

### 👤 Client Youssef
- **Email** : `youssef@client.com`
- **Mot de passe** : `password123`
- **Accès** : Menu, panier, commandes

## 🎯 Fonctionnalités Implémentées

### ✅ **Complètes**
- [x] Système d'authentification avec rôles
- [x] Navigation adaptative selon le rôle
- [x] Page d'accueil avec animations
- [x] Protection des routes
- [x] Layout responsive
- [x] Thème sombre avec couleurs personnalisées
- [x] Animations Framer Motion
- [x] Structure des composants UI

### 🚧 **En Développement**
- [ ] Gestion complète des commandes
- [ ] Système de panier
- [ ] Gestion des produits
- [ ] Dashboard avec graphiques
- [ ] Intégration des cartes
- [ ] Système de notifications

### 📋 **Prévues**
- [ ] Intégration API backend
- [ ] Système de paiement
- [ ] Gestion des livraisons
- [ ] Système de reviews
- [ ] Notifications push
- [ ] Mode hors ligne

## 🎨 Personnalisation du Thème

### Couleurs
```css
/* Couleurs principales */
--background: #000000          /* Noir */
--primary: #ff0000            /* Rouge */
--secondary: #ffcc00          /* Jaune */
--accent: #ffcc00             /* Jaune (accent) */
```

### Animations
- **Fade In/Out** : Transitions de pages
- **Scale** : Effets de survol
- **Glow** : Effets lumineux
- **Bounce** : Animations subtiles
- **Float** : Éléments flottants

## 🔧 Scripts Disponibles

```bash
npm run dev          # Serveur de développement
npm run build        # Build de production
npm run preview      # Prévisualisation du build
npm run lint         # Vérification du code
```

## 📱 Responsive Design

- **Mobile First** : Design optimisé pour mobile
- **Breakpoints** : sm, md, lg, xl
- **Navigation** : Menu hamburger sur mobile
- **Sidebar** : Collapsible sur desktop

## 🚀 Déploiement

### Build de Production
```bash
npm run build
```

### Déploiement sur Vercel
```bash
npm install -g vercel
vercel --prod
```

### Déploiement sur Netlify
```bash
npm run build
# Uploader le dossier dist/
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 📞 Support

Pour toute question ou support :
- 📧 Email : habib19092004@gmail.com
- 🐛 Issues : GitHub Issues
- 📖 Documentation : Wiki du projet

## 🙏 Remerciements

- **shadcn/ui** pour les composants de base
- **Framer Motion** pour les animations
- **TailwindCSS** pour le styling
- **Zustand** pour la gestion d'état
- **React Team** pour le framework

---

**Algeria Eats Hub** - Découvrez les saveurs authentiques de l'Algérie 🍽️🇩🇿
