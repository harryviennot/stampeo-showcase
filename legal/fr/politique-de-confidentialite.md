# Politique de Confidentialité : Stampeo

**Dernière mise à jour : 21 avril 2026**

## 1. Introduction

La présente politique de confidentialité décrit comment Stampeo (ci-après « nous », « notre » ou « la Plateforme »), opéré par Harry Viennot, auto-entrepreneur immatriculé en France sous le numéro SIRET **en cours d'obtention**, collecte, utilise, stocke et protège les données personnelles dans le cadre de son service de cartes de fidélité numériques.

Nous nous engageons à respecter le Règlement Général sur la Protection des Données (RGPD, Règlement UE 2016/679) ainsi que la loi française Informatique et Libertés.

Cette politique s'applique à tous les utilisateurs de la Plateforme, qu'ils soient propriétaires d'entreprise, employés ou clients finaux détenteurs d'une carte de fidélité.

## 2. Responsable de traitement et sous-traitant

### 2.1 Pour les utilisateurs Business (propriétaires et employés)

Stampeo agit en tant que **responsable de traitement** pour les données des comptes professionnels (inscription, authentification, facturation).

### 2.2 Pour les clients finaux (détenteurs de cartes de fidélité)

L'entreprise utilisant Stampeo est le **responsable de traitement** des données de ses propres clients. Stampeo agit en tant que **sous-traitant** : nous traitons les données des clients finaux uniquement pour le compte de l'entreprise et selon ses instructions.

Chaque entreprise choisit les informations qu'elle collecte auprès de ses clients (anonyme, email seul, prénom + email, ou champs personnalisés). Par défaut, l'email et le prénom sont activés.

## 3. Données collectées

### 3.1 Utilisateurs Business

| Donnée | Finalité | Base légale | Obligatoire |
|--------|----------|-------------|-------------|
| Adresse email | Création de compte, communication | Exécution du contrat | Oui |
| Mot de passe (hashé) | Authentification | Exécution du contrat | Oui |
| Nom et prénom | Identification du compte | Exécution du contrat | Oui |
| Nom de l'entreprise | Personnalisation du service | Exécution du contrat | Oui |
| Site web de l'entreprise | Vérification et personnalisation | Intérêt légitime | Non |
| Numéro de téléphone | Contact et support | Intérêt légitime | Non |
| Source de découverte (y compris le champ libre « autre ») | Statistiques internes (comment vous avez connu Stampeo) | Intérêt légitime | Non |
| Informations de paiement | Facturation via Stripe | Exécution du contrat | Oui |
| Logo et visuels de marque | Fonctionnement du service | Exécution du contrat | Oui |
| Langue préférée (locale) | Localisation de l'interface et des emails transactionnels | Intérêt légitime | Non |

Le site web, le numéro de téléphone et la réponse « comment vous avez connu Stampeo » sont collectés à l'inscription et stockés dans une table interne accessible uniquement à l'administration, utilisée pour le support, les relances et l'analyse de l'onboarding. Ces informations ne sont pas exposées aux autres utilisateurs de la Plateforme.

### 3.2 Employés (Scanners)

| Donnée | Finalité | Base légale |
|--------|----------|-------------|
| Adresse email | Invitation et authentification | Exécution du contrat |
| Nom et prénom | Identification | Exécution du contrat |

### 3.3 Clients finaux

Les données collectées dépendent entièrement de la configuration choisie par l'entreprise. Les trois champs d'identification sont tous optionnels et désactivables indépendamment :

| Donnée | Collecte | Finalité |
|--------|----------|----------|
| Identifiant unique de carte | Toujours | Fonctionnement du service |
| Adresse email | Par défaut (désactivable) | Récupération du pass, communication |
| Prénom / Nom | Par défaut (désactivable) | Personnalisation |
| Numéro de téléphone | Optionnel (désactivable) | Communication |
| Historique de visites | Automatique | Suivi de fidélité et statistiques |
| Tampons/points accumulés | Automatique | Programme de fidélité |

Il est possible de configurer la Plateforme en mode entièrement anonyme (aucune donnée personnelle collectée, uniquement un identifiant de carte).

### 3.4 Données techniques

Pour tous les utilisateurs, nous pouvons collecter :

- Type de pass (Apple Wallet ou Google Wallet)
- Jeton d'appareil (device token) pour les mises à jour du pass
- Données d'utilisation envoyées à PostHog pour nos statistiques internes : nom de l'événement, horodatage, page consultée, adresse IP du visiteur et, une fois le compte Business créé, l'identifiant de l'entreprise concernée. Aucun cookie n'est déposé et aucun identifiant n'est conservé dans le stockage du navigateur (voir §5)
- Contexte de supervision des erreurs envoyé à Sentry en cas d'exception : identifiant utilisateur, identifiant d'entreprise, chemin de la requête et pile d'exécution (pas d'adresse email, pas de mot de passe, pas de données de paiement)

## 4. Services tiers

Nous faisons appel aux sous-traitants suivants :

| Service | Rôle | Localisation des données |
|---------|------|--------------------------|
| Supabase | Hébergement base de données | Irlande (UE) |
| OVH | Serveur VPS | France (UE) |
| Stripe | Traitement des paiements | UE (transferts possibles vers les US sous Data Privacy Framework) |
| Resend | Envoi d'emails transactionnels | Irlande (UE) |
| Apple (APNs) | Mises à jour des pass Apple Wallet | États-Unis (Data Privacy Framework) |
| Google (Wallet API) | Mises à jour des pass Google Wallet | États-Unis (Data Privacy Framework) |
| PostHog | Statistiques du site (sans cookies) | UE |
| Sentry | Supervision des erreurs | Allemagne (UE) |
| Redis (auto-hébergé, via Taskiq) | File d'attente de tâches et cache court terme pour les visuels de pass et la livraison des notifications | France (UE), même infrastructure que notre VPS |

### Revendeurs (le cas échéant)

Stampeo propose un programme optionnel de revendeurs. Lorsqu'une entreprise choisit d'être gérée par un partenaire revendeur, ce revendeur dispose d'un accès complet au tableau de bord de l'entreprise qu'il gère (y compris les données de ses clients finaux) afin d'exploiter le programme de fidélité pour son compte.

Au sens du RGPD, cela crée une chaîne responsable de traitement → sous-traitant → sous-traitant ultérieur : l'entreprise gérée demeure responsable de traitement des données de ses clients finaux, Stampeo agit en qualité de sous-traitant, et le revendeur intervient comme sous-traitant ultérieur, autorisé uniquement dans le périmètre convenu avec cette entreprise. Toute relation de revente fait l'objet d'un accord de partenariat signé comprenant les obligations de traitement de données décrites dans les CGU (§9.1). Stampeo peut révoquer l'accès d'un revendeur en cas de manquement ou d'abus.

Une entreprise qui n'est pas gérée par un revendeur n'est exposée à aucun accès de revendeur.

### Transferts hors UE

Certains de nos sous-traitants (Stripe, Apple, Google) peuvent transférer des données vers les États-Unis. Ces transferts sont encadrés par le EU-US Data Privacy Framework ou par des clauses contractuelles types approuvées par la Commission européenne. Supabase, OVH, Resend, PostHog, Sentry et notre Redis auto-hébergé traitent les données exclusivement dans l'UE.

## 5. Cookies

Stampeo utilise PostHog (hébergé dans l'UE) pour ses statistiques internes de mesure d'audience. PostHog est configuré de manière à ne **déposer aucun cookie de suivi** et à ne **conserver aucun identifiant dans le stockage du navigateur** (cookie, localStorage ou équivalent). Les événements sont limités à la session de navigation en cours et ne sont pas corrélés d'une visite à l'autre. L'adresse IP du visiteur est transmise au serveur PostHog pour la journalisation technique et la dédoublonnage des événements, mais elle n'est pas associée à un identifiant persistant, n'est pas utilisée à des fins de profilage ou de publicité, et n'est pas partagée avec des tiers. L'hébergement est réalisé dans l'Union européenne.

Dans ces conditions, la mesure d'audience Stampeo relève de l'exemption de consentement prévue par la directive ePrivacy et les lignes directrices de la CNIL pour la mesure d'audience strictement nécessaire au bon fonctionnement du service, et ne nécessite pas de bannière de consentement.

Des cookies strictement nécessaires peuvent être utilisés pour l'authentification et la gestion de session sur le tableau de bord. Ces cookies ne requièrent pas de consentement.

## 6. Utilisation des données

Nous utilisons les données collectées pour :

- Fournir et maintenir le service de cartes de fidélité numériques
- Générer et mettre à jour les pass wallet
- Envoyer des notifications de fidélité (tampons, récompenses)
- Gérer les comptes, les abonnements et la facturation
- Envoyer des emails transactionnels et opérationnels (confirmation de compte, récupération de pass, notifications liées à l'essai et à la facturation ; voir CGU §5.5)
- Produire des statistiques anonymisées pour les entreprises
- Produire des statistiques internes agrégées sur l'utilisation de la Plateforme à travers l'ensemble des entreprises, détecter les abus et prioriser les améliorations
- Améliorer la Plateforme

Nous **ne vendons jamais** de données personnelles. Nous n'effectuons **aucun suivi inter-entreprises** : les données d'un client dans une entreprise sont totalement isolées de celles dans une autre.

## 7. Notifications

Lorsqu'un client ajoute un pass à son wallet, ce pass peut recevoir des notifications de la part de l'entreprise émettrice. Deux catégories existent, chacune avec une base légale distincte.

### 7.1 Notifications transactionnelles

Envoyées automatiquement en réaction à l'activité du client : tampon reçu, jalon atteint, récompense obtenue, récompense utilisée.

- **Base légale** : exécution du service de fidélité (article 6.1.b du RGPD), pour le compte de l'entreprise responsable de traitement.
- **Contenu** : strictement lié à l'activité de la propre carte de fidélité du client.

### 7.2 Campagnes promotionnelles

Les entreprises abonnées aux tiers Growth et Pro peuvent envoyer des messages de diffusion (broadcast) à leurs détenteurs de carte (par exemple : une offre saisonnière, un nouveau produit au menu, un événement). Growth dispose d'un quota mensuel ; Pro est illimité. Le tier Starter ne peut pas envoyer de campagne.

- **Base légale** : l'intérêt légitime de l'entreprise à communiquer avec ses clients existants (article 6.1.f du RGPD), combiné à l'exemption dite du « soft opt-in » prévue par la directive ePrivacy (article 13(2)) et l'article L34-5 de la LCEN. Cette exemption à l'exigence de consentement préalable s'applique car (a) les coordonnées du client ont été obtenues à l'occasion d'un service (l'installation du pass de fidélité de l'entreprise), (b) le message porte sur des produits ou services similaires de la même entreprise, et (c) un moyen simple et gratuit de s'y opposer est disponible à tout moment (voir 7.3).
- **Portée, strictement première partie.** Une entreprise ne peut utiliser les broadcasts que pour s'adresser à **ses propres** détenteurs de carte au sujet de **ses propres** produits, services ou offres. Les broadcasts ne peuvent être utilisés ni pour de la publicité pour un tiers, ni pour des promotions croisées entre entreprises, ni pour du partage de données, ni pour du contenu étranger à l'offre de l'entreprise. Ces restrictions figurent dans les CGU (§8) et leur violation constitue un motif de suspension. Ce sont elles qui permettent le maintien de l'exemption « soft opt-in ».

### 7.3 Désinscription

Chaque pass expose un interrupteur de notifications par pass dans Apple Wallet et Google Wallet. Le désactiver constitue l'unique moyen de désinscription, conforme aux pratiques du secteur et juridiquement suffisant pour les notifications transactionnelles comme promotionnelles sur ce pass. C'est la même commande que celle utilisée par l'ensemble des grands programmes de fidélité basés sur le wallet.

Comme le système d'exploitation du wallet expose un unique interrupteur par pass, sa désactivation désactive **à la fois** les notifications transactionnelles et promotionnelles pour ce pass. Il s'agit d'une contrainte du medium wallet, non d'un choix de Stampeo. Un client qui souhaite bloquer uniquement les messages promotionnels peut : soit demander à l'entreprise de l'exclure des futurs broadcasts (les entreprises sont tenues par les CGU de respecter ces demandes), soit retirer le pass de son wallet.

### 7.4 Obligations de l'entreprise

Les entreprises utilisant les broadcasts doivent publier leur propre politique de confidentialité à destination de leurs clients, se maintenir dans la portée premier partie décrite ci-dessus, et respecter les demandes d'opposition reçues par quelque canal que ce soit (oral, email, en personne) en excluant le client des futurs broadcasts ou en révoquant le pass. Ces obligations sont détaillées dans les CGU §8.

## 8. Durée de conservation

| Donnée | Durée de conservation |
|--------|----------------------|
| Compte Business actif | Durée de l'abonnement |
| Compte Business après annulation | 60 jours, puis suppression |
| Données des clients finaux | Durée de l'activité de l'entreprise sur la Plateforme |
| Données de facturation | 10 ans (obligation légale française) |
| Logs techniques | 12 mois maximum |
| Jetons d'enregistrement push (device tokens) | Supprimés lorsque le client retire le pass de son wallet, ou lorsque le service push du wallet signale le jeton comme invalide de manière permanente |
| Dernier message de notification wallet | Seul le dernier message est conservé par client (écrasé à chaque notification), sans historique |
| Statistiques de livraison des broadcasts (agrégées) | 24 mois |
| Journalisation des échecs de webhooks Stripe (débogage interne) | 90 jours |

Après suppression d'un compte Business, toutes les données associées (y compris celles de ses clients) sont supprimées dans un délai de 60 jours.

## 9. Suppression d'un pass par un client final

Lorsqu'un client supprime son pass :

- Ses données identifiantes (email, prénom, téléphone) sont **anonymisées** sur demande
- Son historique de visites est conservé sous forme anonymisée pour les statistiques de l'entreprise
- Le client peut demander la suppression complète en contactant l'entreprise concernée ou Stampeo

## 10. Droits des utilisateurs

Conformément au RGPD, vous disposez des droits suivants :

- **Accès** : obtenir une copie de vos données personnelles
- **Rectification** : corriger des données inexactes
- **Effacement** : demander la suppression de vos données
- **Limitation** : restreindre le traitement
- **Portabilité** : recevoir vos données dans un format structuré
- **Opposition** : vous opposer au traitement

**Utilisateurs Business et employés :** contactez-nous à contact@stampeo.app.

**Clients finaux :** contactez en priorité l'entreprise gérant votre carte. Vous pouvez aussi nous écrire à contact@stampeo.app.

Nous répondons dans un délai de 30 jours. En cas de litige, vous pouvez saisir la CNIL : www.cnil.fr.

## 11. Sécurité

Nous mettons en œuvre des mesures techniques et organisationnelles pour protéger vos données :

- Chiffrement en transit (TLS/HTTPS)
- Mots de passe hashés avec algorithmes sécurisés
- Accès aux bases de données restreint et contrôlé
- Isolation des données entre entreprises (multi-tenant)
- Hébergement dans l'UE (Supabase Irlande, OVH France)
- Certificats de signature Apple Pass propres à chaque entreprise, chiffrés au repos (AES-256-GCM)

En cas de violation de données à caractère personnel, Stampeo notifiera la CNIL dans un délai de 72 heures à compter de sa découverte, ainsi que les responsables de traitement concernés (ou, le cas échéant, les personnes concernées) conformément aux articles 33–34 du RGPD.

## 12. Mineurs

La Plateforme n'est pas destinée aux personnes de moins de 16 ans. Nous ne collectons pas sciemment de données de mineurs de moins de 16 ans. Les comptes Business sont réservés aux personnes de 18 ans ou plus.

## 13. Modifications

Nous pouvons mettre à jour cette politique. En cas de modifications substantielles, les utilisateurs Business seront informés par email. La date de mise à jour figure en haut de ce document.

## 14. Contact

- **Email :** contact@stampeo.app
- **Responsable :** Harry Viennot, Stampeo
- **SIRET :** en cours d'obtention
- **Adresse :** 20 rue Marcel Paul, Bat. D Apt. 133-B, 94800 Villejuif, France