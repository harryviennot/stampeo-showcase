# Politique de Confidentialité : Stampeo

**Dernière mise à jour : 10 octobre 2026**

## 1. Introduction

La présente politique de confidentialité décrit comment Stampeo (ci-après « nous », « notre » ou « la Plateforme »), opéré par Harry Viennot, auto-entrepreneur immatriculé en France sous le numéro SIRET **10477625700016**, collecte, utilise, stocke et protège les données personnelles dans le cadre de son service de cartes de fidélité numériques.

Nous nous engageons à respecter le Règlement Général sur la Protection des Données (RGPD, Règlement UE 2016/679) ainsi que la loi française Informatique et Libertés.

Cette politique s'applique à tous les utilisateurs de la Plateforme, qu'ils soient propriétaires d'entreprise, employés ou clients finaux détenteurs d'une carte de fidélité.

## 2. Responsable de traitement et sous-traitant

### 2.1 Pour les utilisateurs Business (propriétaires et employés)

Stampeo agit en tant que **responsable de traitement** pour les données des comptes professionnels (inscription, authentification, facturation).

### 2.2 Pour les clients finaux (détenteurs de cartes de fidélité)

L'entreprise utilisant Stampeo est le **responsable de traitement** des données de ses propres clients. Stampeo agit en tant que **sous-traitant** : nous traitons les données des clients finaux uniquement pour le compte de l'entreprise et selon ses instructions.

Chaque entreprise choisit les informations qu'elle collecte auprès de ses clients (anonyme, email seul, prénom + email, ou champs personnalisés). Par défaut, l'email et le prénom sont activés.

### 2.3 Accès support par le personnel Stampeo

Des membres autorisés du personnel Stampeo peuvent, de manière strictement encadrée, accéder au tableau de bord d'un utilisateur Business à seule fin de fournir un support technique ou commercial, de diagnostiquer une anomalie signalée ou de répondre à une obligation légale. Cet accès :

- est **en lecture seule** : aucune donnée ne peut être modifiée, créée ou supprimée pendant la session ;
- peut être accordé dans le contexte de n'importe quel rôle d'utilisateur (propriétaire, administrateur ou scanner), et peut viser un rôle générique ou un utilisateur nommé spécifique, afin de reproduire fidèlement les anomalies propres à un rôle ;
- déclenche une **notification automatique par email au propriétaire de l'entreprise** au démarrage de la session, indépendamment du rôle ou de l'utilisateur ciblé ;
- est limité à une durée maximale de **60 minutes**, à l'issue desquelles la session expire automatiquement ;
- est consigné à des fins d'audit : identité du membre du personnel, entreprise concernée, utilisateur et rôle visés, motif déclaré, horodatages de début et de fin, adresse IP du membre du personnel, et pages consultées durant la session.

Base légale : intérêt légitime (intérêt de l'exploitant à fournir un support et à assurer la sécurité de la plateforme), mis en balance avec les intérêts de l'utilisateur Business par les garanties décrites ci-dessus (lecture seule, durée limitée, audité, notifié). Les journaux d'accès support sont conservés pendant 24 mois (voir §8).

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
| Journaux d'accès support (sessions, horodatages, pages consultées, IP du personnel) | Traçabilité d'audit des sessions support prévues au §2.3 | Intérêt légitime | Oui (opérationnel) |

Le site web, le numéro de téléphone et la réponse « comment vous avez connu Stampeo » sont collectés à l'inscription et stockés dans une table interne accessible uniquement à l'administration, utilisée pour le support, les relances et l'analyse de l'onboarding. Ces informations ne sont pas exposées aux autres utilisateurs de la Plateforme.

### 3.2 Employés (Scanners)

| Donnée | Finalité | Base légale |
|--------|----------|-------------|
| Adresse email | Invitation et authentification | Exécution du contrat |
| Nom et prénom | Identification | Exécution du contrat |
| Statistiques d'activité (nombre de scans enregistrés, date de dernière activité) | Statistiques d'activité de l'équipe présentées au propriétaire de l'entreprise | Intérêt légitime |
| Attribution par scan (quel employé a enregistré chaque scan) | Piste d'audit de fidélité et statistiques de l'entreprise | Intérêt légitime |

Ces statistiques d'activité sont visibles par le propriétaire de l'entreprise afin de lui donner une vue de l'activité de son équipe. Stampeo ne les utilise pas à ses propres fins.

### 3.3 Clients finaux

Les données collectées dépendent entièrement de la configuration choisie par l'entreprise. Les trois champs d'identification sont tous optionnels et désactivables indépendamment :

| Donnée | Collecte | Finalité |
|--------|----------|----------|
| Identifiant unique de carte | Toujours | Fonctionnement du service |
| Adresse email | Par défaut (désactivable) | Récupération du pass, communication |
| Prénom / Nom | Par défaut (désactivable) | Personnalisation |
| Numéro de téléphone | Optionnel (désactivable) | Communication |
| Anniversaire (jour et mois) | Optionnel (désactivable) | Cadeaux d'anniversaire et personnalisation |
| Champs définis par l'entreprise | Optionnel (défini par l'entreprise) | Fixée par l'entreprise, indiquée sur le formulaire d'inscription |
| Historique de visites | Automatique | Suivi de fidélité et statistiques |
| Tampons/points accumulés | Automatique | Programme de fidélité |
| Montant d'achat / valeur de la transaction | Automatique (programmes à points uniquement) | Calcul des points et statistiques de l'entreprise |

L'anniversaire est collecté **au jour et au mois uniquement**. Aucune année n'est conservée : nous ne détenons donc ni date de naissance, ni âge.

Les entreprises abonnées aux offres Croissance et Pro peuvent ajouter leurs propres champs à leur formulaire d'inscription (par exemple une préférence ou une taille). Pour chacun de ces champs, l'entreprise définit la question ainsi qu'une courte ligne expliquant pourquoi elle est posée, affichée au client au-dessus du bouton d'inscription. L'entreprise décide seule de ce qu'elle demande et agit en tant que responsable de traitement pour ces réponses ; Stampeo les héberge en tant que sous-traitant, sur instruction de l'entreprise, et leur applique les mêmes règles de conservation, d'anonymisation et de suppression qu'à tout autre champ client. Il est contractuellement interdit aux entreprises d'utiliser ces champs pour collecter des données bancaires, des documents d'identité, ou des données relevant de l'article 9 du RGPD (santé, convictions religieuses ou philosophiques, origine raciale ou ethnique, opinions politiques, appartenance syndicale, orientation sexuelle, données biométriques ou génétiques). La suppression d'un champ du formulaire efface également toutes les réponses déjà enregistrées pour ce champ.

Il est possible de configurer la Plateforme en mode entièrement anonyme (aucune donnée personnelle collectée, uniquement un identifiant de carte).

### 3.4 Données techniques

Pour tous les utilisateurs, nous pouvons collecter :

- Type de pass (Apple Wallet ou Google Wallet)
- Jeton d'appareil (device token) pour les mises à jour du pass
- Données d'utilisation envoyées à PostHog pour nos statistiques internes : nom de l'événement, horodatage, page consultée, adresse IP du visiteur et, une fois le compte Business créé, l'identifiant de l'entreprise concernée. Aucun cookie n'est déposé et aucun identifiant n'est conservé dans le stockage du navigateur (voir §5)
- Contexte de supervision des erreurs envoyé à Sentry en cas d'exception : identifiant utilisateur, identifiant d'entreprise, chemin de la requête et pile d'exécution (pas d'adresse email, pas de mot de passe, pas de données de paiement)
- Pour les emails que nous adressons aux utilisateurs Business, les événements d'engagement enregistrés par notre prestataire d'envoi (Resend) : remise, ouverture, clic (y compris le lien cliqué), rejet (bounce) et signalement comme spam, rattachés à l'identifiant de l'entreprise et de l'utilisateur destinataire. Ils servent uniquement à mesurer et améliorer nos propres communications et à maintenir la qualité de nos listes, jamais à des fins publicitaires

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
| Google (Analytics 4) : Google Ireland Limited, avec Google LLC | Mesure d'audience et signalement des conversions, selon votre choix en matière de cookies (voir 5.3 et 5.5) | UE (transferts possibles vers les US sous Data Privacy Framework) |
| PostHog | Statistiques du site (sans cookies) | UE |
| Sentry | Supervision des erreurs | Allemagne (UE) |
| Trustpilot A/S | Invitations à laisser un avis, envoyées aux propriétaires d'entreprise (adresse email, nom, identifiant de l'entreprise, langue) | Danemark (UE), transferts possibles hors UE sous clauses contractuelles types |
| Redis (auto-hébergé, via Taskiq) | File d'attente de tâches et cache court terme pour les visuels de pass et la livraison des notifications | France (UE), même infrastructure que notre VPS |

### Revendeurs (le cas échéant)

Stampeo propose un programme optionnel de revendeurs. Lorsqu'une entreprise choisit d'être gérée par un partenaire revendeur, ce revendeur dispose d'un accès complet au tableau de bord de l'entreprise qu'il gère (y compris les données de ses clients finaux) afin d'exploiter le programme de fidélité pour son compte.

Au sens du RGPD, cela crée une chaîne responsable de traitement → sous-traitant → sous-traitant ultérieur : l'entreprise gérée demeure responsable de traitement des données de ses clients finaux, Stampeo agit en qualité de sous-traitant, et le revendeur intervient comme sous-traitant ultérieur, autorisé uniquement dans le périmètre convenu avec cette entreprise. Toute relation de revente fait l'objet d'un accord de partenariat signé comprenant les obligations de traitement de données décrites dans les CGU (§9.1). Stampeo peut révoquer l'accès d'un revendeur en cas de manquement ou d'abus.

Une entreprise qui n'est pas gérée par un revendeur n'est exposée à aucun accès de revendeur.

### Transferts hors UE

Certains de nos sous-traitants (Stripe, Apple, Google, Trustpilot) peuvent transférer des données vers les États-Unis. Ces transferts sont encadrés par le EU-US Data Privacy Framework ou par des clauses contractuelles types approuvées par la Commission européenne. Supabase, OVH, Resend, PostHog, Sentry et notre Redis auto-hébergé traitent les données exclusivement dans l'UE. Les plateformes publicitaires auxquelles nous signalons des conversions au titre du §5.5, Google (Google Ireland Limited, avec Google LLC aux États-Unis) et Meta (Meta Platforms Ireland Limited, avec Meta Platforms, Inc. aux États-Unis), peuvent traiter ces données aux États-Unis, dans le même cadre.

## 5. Cookies

### 5.1 Votre choix

Les cookies de mesure et de publicité ne sont chargés qu'après votre acceptation. Tant que vous n'avez pas accepté, leurs scripts ne sont pas placés sur la page : aucune requête n'atteint Google ou Meta, et aucun de leurs cookies n'est créé. Refuser ne laisse donc rien derrière soi à supprimer.

Refuser prend un clic, dans le même bandeau et avec la même visibilité qu'accepter, et le site fonctionne à l'identique dans les deux cas. Votre choix est conservé 6 mois, au terme desquels nous pouvons vous le redemander. Vous pouvez le modifier à tout moment via **Préférences cookies**, dans le pied de page de chaque page où nos cookies de mesure et de publicité peuvent être déposés. Retirer un consentement supprime les cookies concernés et recharge la page pour que les scripts cessent de s'exécuter.

Si votre navigateur émet un signal Global Privacy Control, nous le traitons comme un refus et rien n'est chargé. Aux États-Unis, il prime même sur un choix que vous auriez fait ici auparavant, et aucun message ne vous est présenté, puisque vous avez déjà répondu. Dans chacun des États américains, nous le respectons comme une opposition à la vente, au partage et à la publicité ciblée, et tant qu'il est activé, la mesure d'audience est aussi désactivée. En Europe, un choix que vous faites vous-même prime sur le signal : tant que vous n'en avez pas fait, le bandeau reste proposé, afin que vous puissiez accepter délibérément si vous le souhaitez.

Les visiteurs situés aux États-Unis sont traités différemment, les lois des États applicables exigeant une information et une possibilité de refus plutôt qu'un consentement préalable. Les cookies de mesure et de publicité y sont chargés dès l'arrivée, un message l'indique, et le lien **Vos choix de confidentialité** permet de les désactiver à tout moment. Il figure dans le pied de page de chaque page où nos cookies de mesure et de publicité peuvent être déposés, et le message comporte un bouton du même nom. Un refus est conservé 13 mois et renouvelé à chacune de vos visites, et il est restauré depuis votre compte lorsque vous vous connectez au tableau de bord.

Les règles qui s'appliquent à vous sont déterminées d'après le fuseau horaire de votre appareil. Lorsque les signaux divergent, les règles les plus strictes s'appliquent, et lorsque nous ne pouvons pas vous situer, ce sont les règles strictes (opt-in) qui s'appliquent. Nous n'utilisons pas votre adresse IP pour cela.

### 5.2 Cookies présents quel que soit votre choix

Ils sont strictement nécessaires et ne sont pas soumis au consentement.

| Cookie | Finalité | Durée |
|---|---|---|
| `NEXT_LOCALE` | Retient la langue dans laquelle vous consultez le site. | 1 an |
| `stampeo_market` | Retient le pays dont vous avez ouvert les pages, pour préremplir un champ plus tard. | 30 jours |
| `stampeo_consent` | Enregistre le choix que vous avez fait sur les cookies du 5.3, ainsi que l'identifiant aléatoire reliant vos choix successifs (voir 5.6). | 6 mois. Aux États-Unis, un refus est conservé 13 mois et renouvelé à chaque visite. |
| `stampeo_sid` | Un identifiant aléatoire qui enregistre vos choix et les relie au compte que vous créez, afin qu'un refus ultérieur s'y applique (voir 5.6). | 13 mois |
| Cookies de session Supabase | Vous maintient connecté au tableau de bord. | Session |

### 5.3 Cookies soumis à votre consentement

Ces cookies ne sont utilisés que si vous les autorisez (aux États-Unis, tant que vous ne les avez pas désactivés via **Vos choix de confidentialité** ; ailleurs, via **Préférences cookies**).

| Finalité | Destinataire | Cookies |
|---|---|---|
| Mesure d'audience | Google (Google Analytics 4) | `_ga`, `_ga_*`, `_gid` |
| Mesure publicitaire | Meta | `_fbp`, `_fbc` |

Les trois cookies ci-dessous sont les nôtres. Notre serveur les dépose, et ils sont partagés entre stampeo.app et le tableau de bord.

| Cookie | Finalité | Catégorie | Durée |
|---|---|---|---|
| `stampeo_src` | L'origine de votre visite (paramètres de campagne, page d'arrivée, site d'origine). | Mesure d'audience ou publicité | 6 mois |
| `stampeo_ga` | Les identifiants Google Analytics de votre visite. | Mesure d'audience | 6 mois |
| `stampeo_ad` | L'identifiant de clic de la plateforme publicitaire et l'identifiant de navigateur de Meta, uniquement si votre visite provient d'une publicité. | Publicité | 6 mois |

L'ancien cookie `stampeo_attribution` n'est plus déposé ; un navigateur qui l'a reçu auparavant peut encore le conserver jusqu'à son expiration.

### 5.4 Mesure d'audience sans cookie

Stampeo utilise PostHog (hébergé dans l'UE) pour ses statistiques internes de mesure d'audience. PostHog est configuré de manière à ne **déposer aucun cookie de suivi** et à ne **conserver aucun identifiant dans le stockage du navigateur** (cookie, localStorage ou équivalent). Les événements sont limités à la session de navigation en cours et ne sont pas corrélés d'une visite à l'autre. L'adresse IP du visiteur est transmise au serveur PostHog pour la journalisation technique et la dédoublonnage des événements, mais elle n'est pas associée à un identifiant persistant, n'est pas utilisée à des fins de profilage ou de publicité, et n'est pas partagée avec des tiers. L'hébergement est réalisé dans l'Union européenne.

Rien n'étant stocké sur votre appareil, cette mesure relève de l'exemption de consentement prévue par la directive ePrivacy et les lignes directrices de la CNIL pour la mesure d'audience strictement nécessaire. Elle fonctionne donc que vous acceptiez ou refusiez les cookies du 5.3, et un refus ne nous prive pas de la mesure du site lui-même.

Des cookies strictement nécessaires peuvent être utilisés pour l'authentification et la gestion de session sur le tableau de bord. Ces cookies ne requièrent pas de consentement.

### 5.5 Mesure des conversions depuis nos serveurs

Si vous acceptez les cookies du 5.3 (aux États-Unis, tant que vous ne les avez pas désactivés), nous conservons, dans les cookies `stampeo_src`, `stampeo_ga` et `stampeo_ad` listés au 5.3 : l'origine de votre visite, c'est-à-dire les paramètres de campagne présents dans l'adresse, la page d'arrivée et le site d'origine ; les identifiants Google Analytics de votre visite ; et, si votre visite provient d'une publicité, l'identifiant que la régie publicitaire a ajouté au lien que vous avez suivi (pour Google, le `gclid` ; pour Meta, le `fbclid`), ainsi que l'identifiant de navigateur de Meta. Chaque cookie n'est conservé que tant que vous autorisez la catégorie indiquée pour lui au 5.3. Notre serveur les dépose, et ils sont partagés entre stampeo.app et le tableau de bord, hébergé sur un autre sous-domaine, afin que ces informations subsistent lors du passage de ce site au tableau de bord. Si vous revenez plus tard par une autre publicité, ce nouveau clic remplace le précédent.

Si vous créez un compte, nous signalons jusqu'à quatre étapes **depuis nos serveurs** : la création du compte, l'ouverture de la page de paiement, le début de votre essai gratuit et le règlement d'une première facture. La première est signalée à la confirmation du compte (par le code reçu par email, ou par une connexion avec Google ou Apple), avant toute création de commerce. S'agissant d'un envoi côté serveur, il intervient après ce qui se passe dans votre navigateur, et indépendamment de celui-ci.

À chaque étape, la plateforme reçoit ses propres identifiants lorsqu'elle en dispose (l'identifiant de clic et son identifiant de navigateur) et la campagne, ainsi que, pour les trois dernières étapes, le prix de l'offre choisie ou le montant réglé, et sa devise. Chaque plateforme ne reçoit que ses propres identifiants : un identifiant de clic Google n'est jamais transmis à Meta, ni un identifiant de clic Meta à Google.

Meta reçoit en outre :

- votre adresse IP et les caractéristiques techniques de votre navigateur (type, version, système d'exploitation), telles qu'enregistrées à la création de votre compte, ainsi que l'adresse de notre tableau de bord. Nous conservons ces deux données 45 jours au plus, puis nous les supprimons ;
- votre adresse email, votre numéro de téléphone, vos prénom et nom, le pays, la ville et le code postal de votre commerce, ainsi qu'un identifiant dérivé de votre compte, chacun **haché** par l'algorithme SHA-256 avant de quitter nos serveurs. Le hachage transforme chaque donnée en un code à partir duquel on ne peut pas retrouver vos informations. Ce code vous identifie pourtant auprès de Meta, qui calcule le même code à partir des informations de ses propres utilisateurs : il reste donc une donnée personnelle. Meta compare ces codes à ceux de ses utilisateurs pour savoir si vous avez un compte Facebook ou Instagram, y compris si vous avez vu la publicité sur un autre appareil, et s'en sert pour mesurer et améliorer l'affichage de nos publicités. Meta peut aussi utiliser ces données selon ses propres conditions, par exemple pour améliorer ses systèmes publicitaires, comme le décrit [la politique de confidentialité de Meta](https://www.facebook.com/privacy/policy).

Meta reçoit ces étapes que vous soyez arrivé ou non par l'une de ses publicités, dès lors que vous avez accepté les cookies publicitaires du 5.3 (aux États-Unis, tant que vous ne les avez pas désactivés). Google reçoit son propre identifiant de session à chaque étape, de sorte que l'étape se rattache à votre visite. Il ne reçoit jamais vos coordonnées, votre adresse IP ni les caractéristiques de votre navigateur.

Nous ne transmettons jamais votre mot de passe, vos données de paiement, ni quoi que ce soit concernant vos clients (les personnes qui détiennent vos cartes de fidélité).

Pour chaque étape, nous conservons aussi des éléments de diagnostic de l'envoi : son statut, les heures des tentatives et le code de réponse renvoyé par la plateforme, ainsi que les messages de réponse de la plateforme. Le §8 indique la durée de conservation de chacun.

- **Destinataires** : Google désigne Google Ireland Limited, avec Google LLC aux États-Unis. Meta désigne Meta Platforms Ireland Limited, avec Meta Platforms, Inc. aux États-Unis.
- **Base légale** : votre consentement (article 6.1.a du RGPD), donné dans le bandeau cookies ou via **Préférences cookies**. Aux États-Unis, où le consentement préalable n'est pas exigé, nous nous appuyons sur l'information et sur votre possibilité de refus, via **Vos choix de confidentialité** (voir 5.1 et §6).
- **Responsables conjoints avec Meta** : Stampeo et Meta Platforms Ireland Limited sont responsables conjoints du traitement (article 26 du RGPD) pour la collecte de données par les cookies Meta du 5.3 et par les signalements décrits ici, ainsi que pour leur transmission à Meta, dans le cadre de l'avenant « Controller Addendum » de Meta. Meta est seule responsable de ce qu'elle fait des données une fois reçues, comme le décrit [la politique de confidentialité de Meta](https://www.facebook.com/privacy/policy). Vous pouvez exercer vos droits (§10) auprès de Stampeo comme auprès de Meta.

Vous pouvez retirer chaque choix séparément, via **Préférences cookies** ou, aux États-Unis, via **Vos choix de confidentialité** :

- Désactiver la publicité met fin à tout nouveau signalement à Meta et supprime les identifiants publicitaires que nous avions conservés.
- Désactiver la mesure d'audience produit le même effet pour Google.
- Désactiver les deux supprime aussi l'origine de campagne conservée.

Un refus exprimé sur ce site après la création de votre compte s'applique à votre compte et à vos commerces, grâce à l'identifiant aléatoire décrit au 5.6. Les étapes déjà transmises ne peuvent pas être rappelées. Ces données sont supprimées en même temps que le compte professionnel auquel elles se rattachent (voir §8).

### 5.6 Conservation de vos choix en matière de cookies

Lorsque vous acceptez ou refusez les cookies — sur la bannière, sur le bandeau affiché aux visiteurs situés aux États-Unis, ou plus tard via **Préférences cookies** ou, aux États-Unis, **Vos choix de confidentialité** — nous conservons une trace de cette décision sur nos serveurs. Le RGPD nous impose d'être en mesure de démontrer que le consentement a bien été donné (article 7.1), et un choix conservé uniquement dans votre navigateur ne démontre rien : il réside sur votre appareil, vous pouvez le modifier, et votre décision suivante l'écrase.

Chaque enregistrement contient la décision elle-même et rien qui vous concerne : les catégories que vous avez acceptées ou refusées, la version du texte qui vous a été présentée, le régime applicable (opt-in ou opt-out), le support sur lequel vous avez répondu, et deux horodatages — celui indiqué par votre appareil et celui de la réception par notre serveur.

Pour relier entre elles les décisions d'un même visiteur, nous plaçons un identifiant aléatoire dans le cookie `stampeo_sid` mentionné en 5.2, et le cookie `stampeo_consent` porte le même identifiant. Il est aléatoire, n'est déduit ni de votre adresse IP, ni d'une empreinte de navigateur, ni de quoi que ce soit d'autre vous concernant, et n'a aucune signification en dehors de cet enregistrement. Si vous créez ensuite un compte, nous rattachons vos décisions antérieures à ce compte afin de pouvoir établir quels choix vous avez faits, et pour qu'un refus exprimé plus tard sur ce site s'y applique (voir 5.5) ; les décisions elles-mêmes ne sont jamais modifiées.

Les refus sont enregistrés exactement comme les acceptations. Un registre ne conservant que les personnes ayant accepté donnerait une image fausse de la réalité et n'aurait aucune valeur probante.

**Nous conservons ces enregistrements pendant 3 ans à compter de la fin du consentement qu'ils décrivent** — c'est-à-dire à partir du moment où il est remplacé par une décision plus récente ou retiré — conformément aux recommandations de la CNIL sur la preuve du consentement. Ils sont supprimés à l'issue de ce délai.

**Ces enregistrements constituent la seule exception à la suppression sur la Plateforme.** Si vous demandez l'effacement de vos données, nous opposerons un refus pour ces seuls enregistrements, sur le fondement de l'article 17.3 b) et e) du RGPD : conservation nécessaire au respect d'une obligation légale et à la constatation, l'exercice ou la défense de droits en justice. Supprimer la preuve de votre consentement reviendrait à détruire notre seule justification pour des traitements déjà réalisés, y compris ceux que vous aviez demandés. Pour la même raison, ils ne sont pas supprimés à la clôture d'un compte professionnel : le lien vers le compte est retiré et l'enregistrement subsiste, décrivant une décision et non plus une personne identifiable. Tous les autres droits prévus au §10 — accès, rectification, limitation, portabilité et opposition — s'y appliquent normalement.

## 6. Utilisation des données

Nous utilisons les données collectées pour :

- Fournir et maintenir le service de cartes de fidélité numériques
- Générer et mettre à jour les pass wallet
- Envoyer des notifications de fidélité (tampons, récompenses)
- Gérer les comptes, les abonnements et la facturation
- Envoyer des emails transactionnels et opérationnels (confirmation de compte, récupération de pass, notifications liées à l'essai, confirmations de changement de plan, rappel envoyé avant chaque renouvellement annuel, et autres notifications de facturation ; voir CGU §5.7)
- Produire des statistiques anonymisées pour les entreprises
- Produire des statistiques internes agrégées sur l'utilisation de la Plateforme à travers l'ensemble des entreprises, détecter les abus et prioriser les améliorations
- Adresser aux utilisateurs Business un nombre limité d'emails de cycle de vie et marketing, sous réserve de l'opposition décrite au §6.1
- Inviter les propriétaires d'entreprise ayant un abonnement payant à laisser un avis sur Stampeo via Trustpilot, sur la base de notre intérêt légitime à recueillir des retours sur notre service (article 6.1.f du RGPD ; destinataire décrit au §4)
- Améliorer la Plateforme

Nous **ne vendons jamais** de données personnelles contre de l'argent. Nous n'effectuons **aucun suivi inter-entreprises** : les données d'un client dans une entreprise sont totalement isolées de celles dans une autre.

**Aux États-Unis :** transmettre des données à Meta et à Google, pour notre publicité, comme décrit au 5.5, peut constituer un « partage » au sens du droit de la Californie. Vous pouvez vous y opposer à tout moment via **Vos choix de confidentialité**, dans le pied de page de chaque page où nos cookies de mesure et de publicité peuvent être déposés et dans le message d'information, ou par un signal Global Privacy Control, que nous respectons dans chacun des États américains comme décrit au 5.1.

### 6.1 Emails de cycle de vie et marketing adressés aux utilisateurs Business

Outre les emails transactionnels et opérationnels listés ci-dessus, nous adressons aux utilisateurs Business un nombre limité d'emails de cycle de vie et marketing : conseils de prise en main et d'activation, relances lorsqu'un compte est créé mais pas encore utilisé, un récapitulatif d'activité périodique, des annonces de nouveautés produit, et des messages de reconquête après résiliation.

- **Base légale** : notre intérêt légitime à aider les utilisateurs Business à tirer parti de la Plateforme et à promouvoir les fonctionnalités d'un service qu'ils utilisent déjà (article 6.1.f du RGPD), en nous appuyant pour la prospection sur le « soft opt-in » entre professionnels prévu par la directive ePrivacy et l'article L34-5 de la LCEN.
- **Opposition** : chacun de ces emails comporte un lien de désinscription en un clic ainsi qu'un lien vers une page de préférences permettant à l'utilisateur Business de se désinscrire indépendamment par catégorie : réengagement, marketing et nouveautés produit. Les emails transactionnels et opérationnels décrits au §5.7 des CGU sont exclus de cette opposition car ils sont nécessaires à l'administration du compte.
- Pour mesurer et améliorer ces communications, nous enregistrons les événements d'engagement décrits au §3.4.

Cela ne concerne que les emails que Stampeo adresse à ses propres utilisateurs Business. C'est distinct des notifications wallet qu'une entreprise envoie à ses clients finaux, traitées au §7.

## 7. Notifications

Lorsqu'un client ajoute un pass à son wallet, ce pass peut recevoir des notifications de la part de l'entreprise émettrice. Deux catégories existent, chacune avec une base légale distincte.

### 7.1 Notifications transactionnelles

Envoyées automatiquement en réaction à l'activité du client : tampon reçu, points gagnés, jalon atteint, récompense obtenue, récompense utilisée.

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
| Compte Business après annulation | Jusqu'à 12 mois d'inactivité, puis suppression des données personnelles. Deux e-mails d'avertissement sont envoyés (30 et 14 jours avant), et le compte est conservé si le propriétaire se reconnecte ou se réabonne |
| Données des clients finaux | Conservées tant que l'entreprise est active ; anonymisées de manière irréversible lors de la suppression du compte Business (des statistiques anonymisées peuvent être conservées) |
| Données de facturation | 10 ans (obligation légale française) |
| Logs techniques | 12 mois maximum |
| Jetons d'enregistrement push (device tokens) | Supprimés lorsque le client retire le pass de son wallet, ou lorsque le service push du wallet signale le jeton comme invalide de manière permanente |
| Dernier message de notification wallet | Seul le dernier message est conservé par client (écrasé à chaque notification), sans historique |
| Statistiques de livraison des broadcasts (agrégées) | 24 mois |
| Journaux d'envoi et d'engagement des emails adressés aux utilisateurs Business (remise, ouverture, clic, rejet, signalement spam) | 24 mois |
| Journalisation des échecs de webhooks Stripe (débogage interne) | 90 jours |
| Journaux d'accès support (sessions et entrées d'audit associées, voir §2.3) | 24 mois, puis suppression |
| Attribution publicitaire (identifiant de clic, campagne) | Supprimée avec le compte Business auquel elle se rattache |
| Adresse IP et caractéristiques du navigateur utilisées pour la mesure des conversions (§5.5) | 45 jours au plus, puis supprimées |
| Éléments de diagnostic de l'envoi de chaque étape signalée au titre du §5.5 (statut, heures des tentatives, code de réponse de la plateforme) | 13 mois |
| Messages de réponse des plateformes aux étapes signalées au titre du §5.5 | 90 jours |
| Enregistrements de consentement — preuve de vos choix en matière de cookies (§5.6) | 3 ans à compter de la fin du consentement (remplacement ou retrait). **Non** supprimés avec le compte Business : le lien vers le compte est retiré et l'enregistrement est conservé, au titre de l'article 17.3 b) et e) du RGPD |

La durée de conservation de 24 mois pour les journaux d'accès support est définie pour permettre l'instruction d'un éventuel incident de sécurité tout en restant proportionnée à sa finalité, conformément aux recommandations de la CNIL en matière de journalisation des accès.

Lorsqu'un compte Business devient inactif, nous conservons ses données pendant une durée maximale de 12 mois afin d'en permettre la réactivation, en envoyant deux e-mails d'avertissement avant toute suppression définitive. Lors de la suppression, les données personnelles du compte Business sont supprimées et les données personnelles des Clients Finaux sont anonymisées de manière irréversible ; des statistiques anonymisées peuvent être conservées. Les données de facturation sont conservées pendant 10 ans, comme l'exige la loi.

## 9. Suppression d'un pass par un client final

Lorsqu'un client supprime son pass :

- Ses données identifiantes (email, prénom, téléphone) sont **anonymisées** sur demande
- Son historique de visites est conservé sous forme anonymisée pour les statistiques de l'entreprise
- Le client peut demander la suppression complète en contactant l'entreprise concernée ou Stampeo

## 10. Droits des utilisateurs

Conformément au RGPD, vous disposez des droits suivants :

- **Accès** : obtenir une copie de vos données personnelles
- **Rectification** : corriger des données inexactes
- **Effacement** : demander la suppression de vos données (sous réserve de l'exception documentée au §5.6 concernant les enregistrements de consentement)
- **Limitation** : restreindre le traitement
- **Portabilité** : recevoir vos données dans un format structuré
- **Opposition** : vous opposer au traitement

**Utilisateurs Business et employés :** contactez-nous à contact@stampeo.app.

**Clients finaux :** contactez en priorité l'entreprise gérant votre carte. Vous pouvez aussi nous écrire à contact@stampeo.app.

Nous répondons dans un délai de 30 jours. Vous avez aussi le droit d'introduire une réclamation auprès de la CNIL, l'autorité française de protection des données (www.cnil.fr), ou auprès de l'autorité de contrôle du pays où vous résidez ou travaillez.

### 10.1 Droit d'opposition à l'accès support

Les utilisateurs Business peuvent, par demande écrite adressée à contact@stampeo.app, demander qu'aucun accès support (§2.3) ne soit ouvert sur leur compte en dehors d'un ticket de support qu'ils ont eux-mêmes ouvert. Cette possibilité est offerte à titre de courtoisie contractuelle et ne s'applique pas aux cas où un tel accès est requis par la loi, par une décision judiciaire, ou par un incident de sécurité imminent affectant la Plateforme.

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
- **SIRET :** 10477625700016
- **Adresse :** 20 rue Marcel Paul, Bat. D Apt. 133-B, 94800 Villejuif, France