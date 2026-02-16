# Politique de Confidentialité — Stampéo

**Dernière mise à jour : 16 février 2026**

## 1. Introduction

La présente politique de confidentialité décrit comment Stampéo (ci-après « nous », « notre » ou « la Plateforme »), opéré par Harry Viennot, auto-entrepreneur immatriculé en France, collecte, utilise, stocke et protège les données personnelles dans le cadre de son service de cartes de fidélité numériques.

Nous nous engageons à respecter le Règlement Général sur la Protection des Données (RGPD — Règlement UE 2016/679) ainsi que la loi française Informatique et Libertés.

Cette politique s'applique à tous les utilisateurs de la Plateforme, qu'ils soient propriétaires d'entreprise, employés ou clients finaux détenteurs d'une carte de fidélité.

## 2. Responsable de traitement et sous-traitant

### 2.1 Pour les utilisateurs Business (propriétaires et employés)

Stampéo agit en tant que **responsable de traitement** pour les données des comptes professionnels (inscription, authentification, facturation).

### 2.2 Pour les clients finaux (détenteurs de cartes de fidélité)

L'entreprise utilisant Stampéo est le **responsable de traitement** des données de ses propres clients. Stampéo agit en tant que **sous-traitant** : nous traitons les données des clients finaux uniquement pour le compte de l'entreprise et selon ses instructions.

Chaque entreprise choisit les informations qu'elle collecte auprès de ses clients (anonyme, email seul, prénom + email, ou champs personnalisés). Par défaut, l'email et le prénom sont activés.

## 3. Données collectées

### 3.1 Utilisateurs Business

| Donnée | Finalité | Base légale |
|--------|----------|-------------|
| Adresse email | Création de compte, communication | Exécution du contrat |
| Mot de passe (hashé) | Authentification | Exécution du contrat |
| Nom et prénom | Identification du compte | Exécution du contrat |
| Nom de l'entreprise | Personnalisation du service | Exécution du contrat |
| Informations de paiement | Facturation via Stripe | Exécution du contrat |
| Logo et visuels de marque | Création de la carte de fidélité | Exécution du contrat |

### 3.2 Employés (Scanners)

| Donnée | Finalité | Base légale |
|--------|----------|-------------|
| Adresse email | Invitation et authentification | Exécution du contrat |
| Nom et prénom | Identification | Exécution du contrat |

### 3.3 Clients finaux

Les données collectées dépendent de la configuration choisie par l'entreprise :

| Donnée | Collecte | Finalité |
|--------|----------|----------|
| Identifiant unique de carte | Toujours | Fonctionnement du service |
| Adresse email | Par défaut (désactivable) | Récupération du pass, communication |
| Prénom | Par défaut (désactivable) | Personnalisation |
| Numéro de téléphone | Optionnel (Pro) | Communication |
| Date d'anniversaire | Optionnel (Pro) | Offres personnalisées |
| Historique de visites | Automatique | Suivi de fidélité et statistiques |
| Tampons/points accumulés | Automatique | Programme de fidélité |

### 3.4 Données techniques

Pour tous les utilisateurs, nous pouvons collecter :

- Type de pass (Apple Wallet ou Google Wallet)
- Jeton d'appareil (device token) pour les mises à jour du pass
- Données de géolocalisation des scans (si disponibles)
- Données d'utilisation anonymisées via Plausible Analytics (sans cookies, sans données personnelles)

## 4. Services tiers

Nous faisons appel aux sous-traitants suivants :

| Service | Rôle | Localisation des données |
|---------|------|--------------------------|
| Supabase | Hébergement base de données | Irlande (UE) |
| OVH | Serveur VPS | France (UE) |
| Stripe | Traitement des paiements | UE (transferts possibles vers les US sous Data Privacy Framework) |
| Resend | Envoi d'emails transactionnels | États-Unis (Data Privacy Framework) |
| Apple (APNs) | Mises à jour des pass Apple Wallet | États-Unis (Data Privacy Framework) |
| Google (Pay API) | Mises à jour des pass Google Wallet | États-Unis (Data Privacy Framework) |
| Plausible Analytics | Statistiques du site | UE |

### Transferts hors UE

Certains de nos sous-traitants (Stripe, Resend, Apple, Google) peuvent transférer des données vers les États-Unis. Ces transferts sont encadrés par le EU-US Data Privacy Framework ou par des clauses contractuelles types approuvées par la Commission européenne.

## 5. Cookies

Stampéo utilise Plausible Analytics, une solution qui **ne dépose aucun cookie** et ne collecte aucune donnée personnelle. Aucun cookie de suivi tiers n'est utilisé.

Des cookies strictement nécessaires peuvent être utilisés pour l'authentification et la gestion de session. Ces cookies ne requièrent pas de consentement conformément à la directive ePrivacy.

## 6. Utilisation des données

Nous utilisons les données collectées pour :

- Fournir et maintenir le service de cartes de fidélité numériques
- Générer et mettre à jour les pass wallet
- Envoyer des notifications de fidélité (tampons, récompenses)
- Gérer les comptes et la facturation
- Envoyer des emails transactionnels (confirmation, récupération de pass)
- Produire des statistiques anonymisées pour les entreprises
- Améliorer la Plateforme

Nous **ne vendons jamais** de données personnelles. Nous n'effectuons **aucun suivi inter-entreprises** : les données d'un client dans une entreprise sont totalement isolées de celles dans une autre.

## 7. Notifications

### Notifications transactionnelles

Lorsqu'un client ajoute un pass à son wallet, il peut recevoir des notifications liées à son programme de fidélité (tampon reçu, jalon atteint, récompense disponible). Le client peut les désactiver à tout moment via les réglages de son pass dans Apple Wallet ou Google Wallet.

### Notifications promotionnelles (tier Pro)

Les entreprises abonnées au tier Pro peuvent envoyer des messages promotionnels. L'entreprise, en tant que responsable de traitement, est responsable du respect de la réglementation applicable. Le client peut désactiver les notifications à tout moment.

## 8. Durée de conservation

| Donnée | Durée de conservation |
|--------|----------------------|
| Compte Business actif | Durée de l'abonnement |
| Compte Business après annulation | 60 jours, puis suppression |
| Données des clients finaux | Durée de l'activité de l'entreprise sur la Plateforme |
| Données de facturation | 10 ans (obligation légale française) |
| Logs techniques | 12 mois maximum |

Après suppression d'un compte Business, toutes les données associées (y compris celles de ses clients) sont supprimées dans un délai de 60 jours.

## 9. Suppression d'un pass par un client final

Lorsqu'un client supprime son pass :

- Ses données identifiantes (email, prénom, téléphone) sont **anonymisées** sur demande
- Son historique de visites est conservé sous forme anonymisée pour les statistiques de l'entreprise
- Le client peut demander la suppression complète en contactant l'entreprise concernée ou Stampéo

## 10. Droits des utilisateurs

Conformément au RGPD, vous disposez des droits suivants :

- **Accès** — obtenir une copie de vos données personnelles
- **Rectification** — corriger des données inexactes
- **Effacement** — demander la suppression de vos données
- **Limitation** — restreindre le traitement
- **Portabilité** — recevoir vos données dans un format structuré
- **Opposition** — vous opposer au traitement

**Utilisateurs Business et employés :** contactez-nous à privacy@stampeo.com.

**Clients finaux :** contactez en priorité l'entreprise gérant votre carte. Vous pouvez aussi nous écrire à privacy@stampeo.com.

Nous répondons dans un délai de 30 jours. En cas de litige, vous pouvez saisir la CNIL : www.cnil.fr.

## 11. Sécurité

Nous mettons en œuvre des mesures techniques et organisationnelles pour protéger vos données :

- Chiffrement en transit (TLS/HTTPS)
- Mots de passe hashés avec algorithmes sécurisés
- Accès aux bases de données restreint et contrôlé
- Isolation des données entre entreprises (multi-tenant)
- Hébergement dans l'UE (Supabase Irlande, OVH France)

## 12. Mineurs

La Plateforme n'est pas destinée aux personnes de moins de 16 ans. Nous ne collectons pas sciemment de données de mineurs de moins de 16 ans. Les comptes Business sont réservés aux personnes de 18 ans ou plus.

## 13. Modifications

Nous pouvons mettre à jour cette politique. En cas de modifications substantielles, les utilisateurs Business seront informés par email. La date de mise à jour figure en haut de ce document.

## 14. Contact

- **Email :** privacy@stampeo.com
- **Responsable :** Harry Viennot, Stampéo
