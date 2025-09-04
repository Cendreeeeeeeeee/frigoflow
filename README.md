# FrigoFlow - PWA de Liste de Courses Familiale

Une Progressive Web App (PWA) moderne développée avec Next.js 14 et TypeScript pour gérer vos listes de courses en famille de manière collaborative et intelligente.

## ✨ Fonctionnalités Principales

### 👥 Collaboration Familiale
- **Authentification sécurisée** : Connexion par magic links Supabase
- **Onboarding intelligent** : Création de famille ou acceptation d'invitation
- **Invitations familiales** : Génération de liens d'invitation sécurisés
- **Temps réel** : Synchronisation instantanée entre tous les membres
- **Gestion des membres** : Affichage des membres actifs et historique

### 🛒 Gestion des Listes
- **Création rapide** : Bouton flottant (FAB) pour ajouter instantanément des articles
- **Listes collaboratives** : Partage en temps réel avec les membres de la famille
- **Suivi de progression** : Barres de progression visuelles pour chaque liste
- **Membres actifs** : Affichage du nombre de collaborateurs par liste

### 💰 Gestion des Prix
- **Format CHF** : Tous les prix affichés en francs suisses (CHF 5.90)
- **Total approximatif** : Estimation automatique du coût total
- **Suivi des dépenses** : Calcul en temps réel pendant les courses

### 🏪 Mode Magasin
- **Magasins supportés** : Denner, Coop, Migros, Aldi, Lidl
- **Organisation par rayons** : Articles triés par catégories et emplacements
- **Navigation optimisée** : Parcours efficace dans le magasin

### 🎯 Système de Promos
- **Badges stylés** : Icônes % avec réductions calculées (-20%)
- **Score personnalisé** : Algorithme basé sur vos habitudes d'achat
- **Promos ciblées** : Suggestions adaptées à vos listes actuelles
- **Calcul automatique** : Pourcentage de réduction affiché

### 📱 Scanner de Codes-Barres
- **Ajout rapide** : Scan direct pour ajouter des produits
- **Base de données** : Intégration Open Food Facts
- **Informations produit** : Prix, catégorie, informations nutritionnelles

## 🛠 Technologies Utilisées

- **Framework** : Next.js 14 (App Router)
- **Langage** : TypeScript
- **UI/UX** : shadcn/ui + Tailwind CSS
- **Icônes** : Lucide React
- **Backend** : Supabase (Auth + Database + Realtime)
- **PWA** : Service Worker + Manifest
- **Scanner** : @zxing/browser

## 🚀 Installation et Démarrage

\`\`\`bash
# Cloner le projet
git clone [url-du-repo]
cd frigoflow

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env.local

# Démarrer en développement
npm run dev
\`\`\`

## 📱 Fonctionnalités PWA

- **Installation** : Ajout à l'écran d'accueil mobile
- **Hors ligne** : Fonctionnement sans connexion internet (désactivé en développement)
- **Notifications** : Alertes pour les promos et rappels
- **Synchronisation** : Mise à jour automatique des données

## 🔧 Configuration

### Variables d'Environnement Requises
\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/auth/callback
\`\`\`

**Important** : Configurez ces variables dans les Paramètres du Projet Vercel ou votre fichier `.env.local`.

### Base de Données Supabase

#### Tables Requises
\`\`\`sql
-- Familles
CREATE TABLE families (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Membres de famille
CREATE TABLE members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Invitations
CREATE TABLE invites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days')
);

-- Listes de courses
CREATE TABLE items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  checked BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES members(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
\`\`\`

#### Fonctions RPC Requises
\`\`\`sql
-- Créer une famille et s'ajouter comme membre
CREATE OR REPLACE FUNCTION create_family_and_self(family_name TEXT, display_name TEXT)
RETURNS UUID AS $$
DECLARE
  new_family_id UUID;
BEGIN
  INSERT INTO families (name) VALUES (family_name) RETURNING id INTO new_family_id;
  INSERT INTO members (user_id, family_id, display_name) 
  VALUES (auth.uid(), new_family_id, display_name);
  RETURN new_family_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer une invitation
CREATE OR REPLACE FUNCTION create_invite(family_id UUID)
RETURNS TEXT AS $$
DECLARE
  invite_code TEXT;
BEGIN
  invite_code := encode(gen_random_bytes(16), 'base64');
  INSERT INTO invites (family_id, code) VALUES (family_id, invite_code);
  RETURN invite_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Accepter une invitation
CREATE OR REPLACE FUNCTION accept_invite(inv_code TEXT, display_name TEXT)
RETURNS UUID AS $$
DECLARE
  invite_family_id UUID;
BEGIN
  SELECT family_id INTO invite_family_id 
  FROM invites 
  WHERE code = inv_code AND expires_at > NOW();
  
  IF invite_family_id IS NULL THEN
    RAISE EXCEPTION 'Invitation invalide ou expirée';
  END IF;
  
  INSERT INTO members (user_id, family_id, display_name) 
  VALUES (auth.uid(), invite_family_id, display_name);
  
  DELETE FROM invites WHERE code = inv_code;
  
  RETURN invite_family_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
\`\`\`

## 🔐 Processus d'Authentification

### 1. Connexion (`/login`)
- Saisie de l'email
- Envoi d'un magic link par Supabase
- Redirection automatique après clic sur le lien

### 2. Onboarding (`/onboarding`)
**Nouveau utilisateur sans invitation :**
- Saisie du nom de famille + prénom
- Création automatique de la famille
- Redirection vers l'application

**Utilisateur avec invitation (?invite=CODE) :**
- Saisie du prénom uniquement
- Ajout automatique à la famille existante
- Redirection vers l'application

### 3. Vérification Bootstrap
- Vérification automatique de l'appartenance à une famille
- Redirection vers `/onboarding` si nécessaire
- Chargement des données familiales

## 👨‍👩‍👧‍👦 Gestion Collaborative

### Inviter un Membre
1. Aller dans **Paramètres** depuis l'écran principal
2. Cliquer sur **"Générer un lien d'invitation"**
3. Partager le lien généré : `https://votre-app.com/onboarding?invite=CODE`
4. Le nouveau membre suit le processus d'onboarding

### Rejoindre une Famille
1. Cliquer sur le lien d'invitation reçu
2. Saisir son prénom sur la page d'onboarding
3. Accès immédiat aux listes familiales partagées

### Collaboration Temps Réel
- **Modifications simultanées** : Tous les membres voient les changements instantanément
- **Indicateurs visuels** : Nombre de membres actifs affiché
- **Historique** : Filtre par "Ajouté par" dans l'historique des courses

## 🎨 Interface Utilisateur

### Design Mobile-First
- **Palette verte** : Couleurs cohérentes et apaisantes
- **Grandes zones tactiles** : Optimisé pour l'usage mobile
- **Navigation intuitive** : Onglets et boutons clairement identifiés
- **Accessibilité** : Respect des standards WCAG

### Composants Principaux
- **FAB (Floating Action Button)** : Ajout rapide d'articles
- **Cartes de listes** : Aperçu avec progression et membres
- **Mode magasin** : Interface optimisée pour les courses
- **Gestionnaire de promos** : Badges et scores visuels

## 🔒 Sécurité et Confidentialité

- **Authentification** : Magic links Supabase sécurisés
- **RLS (Row Level Security)** : Protection des données au niveau base
- **Données chiffrées** : Protection des informations personnelles
- **RGPD** : Conformité aux réglementations européennes
- **Invitations temporaires** : Liens d'invitation avec expiration (7 jours)

## 📈 Roadmap

- [ ] Mode sombre
- [ ] Géolocalisation des magasins
- [ ] Historique des achats avec filtres par membre
- [ ] Suggestions IA basées sur l'historique familial
- [ ] Export des listes
- [ ] Intégration calendrier
- [ ] Notifications push pour les modifications

## 🤝 Contribution

Les contributions sont les bienvenues ! Consultez le guide de contribution pour plus d'informations.

## 📄 Licence

MIT License - voir le fichier LICENSE pour plus de détails.

---

**FrigoFlow** - Simplifiez vos courses en famille ! 🛒✨
