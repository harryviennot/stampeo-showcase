# Programme Fondateur — Page Feature

> Brouillon de contenu pour la page dediee au programme partenaire fondateur.

---

## Hero

**Titre :** Vous n'etes pas juste un client. Vous construisez le produit avec nous.

**Sous-titre :** Stampeo est un produit jeune. On cherche 50 commercants francais prets a tester, critiquer, et facon le meilleur outil de fidelisation digitale. En echange, vous beneficiez de conditions qu'on ne proposera plus jamais.

**CTA :** Devenir Partenaire Fondateur → /onboarding

---

## Ce que vous obtenez

**Titre :** Les avantages concrets

### 3 mois entierement gratuits

Pas de carte bancaire a l'inscription. Pas de piege. Vous testez Stampeo pendant 3 mois sans rien payer. Si ca ne vous convient pas, vous partez — sans frais, sans engagement.

### 14,99 €/mois a vie (au lieu de 29,99 €)

Apres la periode gratuite, votre tarif est bloque a 14,99 €/mois. Pour toujours. Meme quand le prix augmentera pour les nouveaux clients. C'est notre facon de remercier ceux qui nous font confiance des le debut.

### Toutes les fonctionnalites Growth incluses

Pas de plan basique pour les fondateurs. Vous avez acces a tout :
- Plusieurs modeles de carte
- Membres d'equipe illimites
- Support multi-etablissement
- Messages de notification personnalises
- Analytiques avancees
- Campagnes programmees (des que disponible)
- Geolocalisation (des que disponible)
- Segmentation client (des que disponible)

### Canal direct avec l'equipe

Pas de chatbot. Pas de ticket #47832. Un canal direct (email, WhatsApp, ou ce qui vous arrange) avec les gens qui construisent Stampeo. Vous avez un bug ? Vous voulez une fonctionnalite ? Vous nous le dites et on s'en occupe.

### Votre premiere carte designee par nos soins

Envoyez-nous votre logo, vos couleurs (ou juste un lien vers votre Instagram). On cree votre carte de fidelite digitale — professionnelle, aux normes Apple Wallet et Google Wallet. Inclus, sans frais supplementaires.

### Priorite sur le support et les nouvelles fonctionnalites

Les partenaires fondateurs sont nos premiers utilisateurs. Quand on developpe une nouvelle fonctionnalite, vous la testez en premier. Quand vous avez un probleme, vous passez en tete de file.

---

## Pourquoi un programme fondateur ?

**Titre :** On joue cartes sur table

Stampeo est un produit jeune. On ne va pas pretendre qu'on a 10 000 utilisateurs et 5 ans d'experience. Voici ou on en est :

**Ce qui marche deja :**
- Generation de cartes Apple Wallet et Google Wallet
- Scan QR code avec notification push en temps reel
- Tableau de bord avec liste de clients et statistiques de base
- Mode hors ligne pour le scanner
- Editeur de carte avec apercu en temps reel

**Ce qui arrive bientot :**
- Campagnes promotionnelles et segmentation
- Analytiques avancees (tendances, heures de pointe, retention)
- Creation de carte assistee par IA
- Designs programmes et saisonniers
- Geolocalisation (Apple Wallet)

**Ce qu'on attend de vous :**
- Que vous utilisiez Stampeo au quotidien dans votre commerce
- Que vous nous disiez ce qui marche et ce qui ne marche pas
- Que vous nous suggereriez des ameliorations
- Que vous soyez patients quand quelque chose ne fonctionne pas encore parfaitement

Ce n'est pas pour tout le monde. Si vous cherchez un produit fini et rodee, attendez quelques mois. Si vous voulez participer a la creation d'un outil qui colle vraiment a vos besoins — alors on est faits pour s'entendre.

---

## Est-ce que ca vaut le coup ?

<!-- COMPONENT: ROICalculator
- "Est-ce que ça vaut le coup ?" section
- 2 slider inputs:
  - Clients/jour (10-200, default 50) with label + current value display
  - Panier moyen (2-50€, default 5€) with label + current value display
- Fixed assumption: +15% return rate from loyalty program (shown as static stat)
- Animated output panel:
  - "Revenus supplémentaires: XX€/mois" (spring animation on value change)
  - vs "Stampeo: 14,99€/mois"
  - → "ROI: +XXX%" (large, accent color, spring scale bounce)
- Math: extra_revenue = clients × average × 0.15 × 30
- Even 30 clients/day × 5€ × 15% × 30 = 675€ extra vs 14.99€ cost = 4400% ROI
- Numbers update with spring animation as sliders move
- Drives home value before showing the price
-->

<!-- COMPONENT: PriceReveal
- Layout: centered, large text
- Line 1: "29,99 €/mois" in muted color
  - On scroll-enter: red line-through animates across (CSS width 0→100%, 0.5s)
- Line 2: "14,99 €/mois" in accent color, bold
  - Appears 0.3s after strike-through with spring scale (0.8→1.0, bounce)
- Line 3: "à vie" fades in 0.3s after price (opacity 0→1)
- Total sequence: ~1.2s, feels satisfying
-->

---

## Comment ca marche

**Titre :** 4 etapes pour devenir partenaire fondateur

### 1. Remplissez le formulaire de candidature (2 minutes)

Dites-nous qui vous etes : nom de votre commerce, type d'activite (cafe, boulangerie, salon, restaurant...), nombre d'employes, et si vous utilisez deja un programme de fidelite.

### 2. On examine votre candidature

On accepte les candidatures par petites vagues pour assurer un accompagnement de qualite. Vous recevez une reponse sous 48h.

**Ce qu'on cherche :** Des commerces francais avec une clientele reguliere, prets a tester et a donner leur avis. Pas de critere de taille — un cafe avec 50 clients reguliers nous interesse autant qu'une boulangerie avec 500.

### 3. On configure votre compte et votre carte

Une fois accepte :
- Votre compte est active avec toutes les fonctionnalites Growth
- On cree votre premiere carte de fidelite (envoyez-nous vos elements visuels)
- On vous installe l'appli scanner et on fait un test ensemble
- Vous recevez votre QR code a afficher au comptoir

### 4. Vous lancez votre programme

Votre premier client peut scanner des le premier jour. On reste disponible pour tout ajustement.

<!-- COMPONENT: FounderTimeline
- Vertical timeline, same visual pattern as HowItWorks component
- 4 steps with NumberStamp (1-4) in different colors:
  1. Orange (#f97316): "Remplissez le formulaire" — "2 minutes, c'est tout"
  2. Pink (#ec4899): "On examine votre candidature" — "Réponse sous 48h"
  3. Violet (#8b5cf6): "On configure votre compte" — "Carte + app + QR code"
  4. Green (#22c55e): "Vous lancez votre programme" — "Premier client dès le jour 1"
- Stamps fill in as user scrolls past each step (useInView from framer-motion)
- Connector lines draw between steps (SVG, stroke-dashoffset animation)
- Can literally reuse HowItWorks component with different content/colors
-->

---

## FAQ du programme fondateur

### Combien de places sont disponibles ?

On accepte les partenaires fondateurs par vagues de 10-15 commerces. Le nombre total n'est pas fixe — on arretera quand on estimera avoir assez de retours pour avancer. Mais le tarif fondateur (14,99 €/mois a vie) ne sera plus propose apres la cloture du programme.

### Que se passe-t-il apres les 3 mois gratuits ?

Vous passez automatiquement a 14,99 €/mois. On vous previent 2 semaines avant la fin de la periode gratuite. Si vous ne souhaitez pas continuer, vous annulez en un clic — sans frais. Vos clients conservent leurs cartes mais ne recevront plus de mises a jour.

### Est-ce que je garde le tarif fondateur si vous augmentez les prix ?

Oui. 14,99 €/mois a vie signifie a vie. Meme si le plan Growth passe a 49,99 € dans 3 ans, votre tarif ne change pas. C'est contractuel.

### Puis-je changer d'avis et annuler ?

A tout moment. Pas de periode d'engagement apres les 3 mois gratuits. Si vous annulez, vous perdez l'acces a Stampeo mais vos clients gardent leurs cartes (elles ne se mettront plus a jour).

---

## CTA

**Titre :** Rejoignez les premiers

**Sous-titre :** Places limitees. 3 mois gratuits. 14,99 €/mois a vie. Toutes les fonctionnalites Growth.

**CTA :** Devenir Partenaire Fondateur → /onboarding

**Element d'urgence (subtil) :** Prochaine vague d'acceptation : mars 2026

---

## Decouvrez aussi

- [Notifications push](/features/notifications-push) — Inclus dans votre plan fondateur
- [Scanner mobile](/features/scanner-mobile) — L'appli que vous utiliserez au quotidien
- [Design de carte](/features/design-de-carte) — On cree votre premiere carte gratuitement
