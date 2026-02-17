# Design de Carte — Page Feature

> Brouillon de contenu pour la page dediee au design de carte de fidelite.

---

## Hero

**Titre :** Votre carte. Vos couleurs. En 5 minutes.

**Sous-titre :** Pas besoin d'etre designer. Importez votre logo, choisissez vos couleurs, et votre carte est prete. Ou mieux : on la cree pour vous.

**CTA :** Devenir Partenaire Fondateur → /onboarding

<!-- COMPONENT: DesignPlayground
- Simplified mini DesignEditorV2: 3 controls only
  1. Background color (4 preset swatches: dark #1c1c1e, cream #F5E6D3, navy #1A2332, rose #F8E8F0)
  2. Stamp icon picker (4 options from StampIconPicker: checkmark, coffee, heart, star)
  3. Stamp count slider (6-12)
- Live WalletCard preview (ScaledCardWrapper baseWidth=280) updates in real-time
- "Envie de plus d'options ? →" link to /onboarding
- Mobile: stacks vertically with controls above card
-->

<!-- COMPONENT: CardColorDemo (simpler alternative if playground is too heavy)
- A WalletCard (ScaledCardWrapper baseWidth=280, interactive3D={true}) centered
- Below it: 4 color swatch pairs (bg + accent):
  1. Dark mode: bg=#1c1c1e, accent=#f97316 (default Stampeo)
  2. Cream: bg=#F5E6D3, accent=#8B4513
  3. Navy: bg=#1A2332, accent=#60A5FA
  4. Rose: bg=#F8E8F0, accent=#D4688E
- Clicking a swatch smoothly transitions the card colors (framer-motion animate)
- Card shows 5/8 stamps, organization name "Votre Commerce"
- Demonstrates real-time customization without needing the full editor
-->

---

## Le probleme

**Titre :** Creer une carte pro ne devrait pas etre un projet

Vous avez deja essaye de creer un visuel sur Canva ? Ou pire, de configurer un logiciel avec 47 options de personnalisation ? Vous avez un commerce a gerer — pas une agence de design a diriger.

Le resultat : soit vous passez 2 heures a bricoler quelque chose de moyen, soit vous ne le faites pas du tout. Votre programme de fidelite n'existe pas parce que la carte etait trop compliquee a creer.

---

## 3 facons de creer votre carte

**Titre :** Choisissez votre methode

### Option 1 : On la cree pour vous (notre recommandation) [Pay] [Pro]

C'est notre approche preferee et ce qui nous differencie. Vous nous envoyez vos elements, et on s'occupe du reste.

**Comment ca marche :**
1. Lors de l'inscription, uploadez une photo de votre carte existante, votre logo, ou simplement un lien vers votre site ou Instagram.
2. Notre equipe cree votre carte digitale en respectant votre identite visuelle.
3. Vous recevez un apercu en 24-48h.
4. Vous validez ou demandez des ajustements.
5. Votre carte est publiee.

**Pourquoi c'est mieux :**
- Zero effort de votre cote
- Resultat professionnel garanti
- On connait les contraintes d'Apple Wallet et Google Wallet — votre carte sera parfaitement lisible sur tous les ecrans
- Inclus dans tous les plans, pas de frais supplementaires

### Option 2 : Creation assistee par IA — Bientot disponible [Pay] [Pro]

Prenez une photo de votre carte en carton actuelle. Notre IA extrait :
- Votre logo
- Vos couleurs
- Votre structure de recompense ("10e cafe offert")
- Le nom de votre commerce

En quelques secondes, vous obtenez une carte digitale pre-remplie. Ajustez ce que vous voulez, puis publiez.

### Option 3 : L'editeur en libre-service [Pay] [Pro]

Pour ceux qui aiment tout controler, l'editeur complet est disponible.

**Ce que vous pouvez personnaliser :**
- Logo (upload de votre fichier)
- Couleurs principales et secondaires
- Icones de tampon (bibliotheque incluse + upload personnalise)
- Image de fond (optionnel)
- Texte de la recompense
- Informations affichees au dos de la carte

**Apercu en temps reel :** Chaque modification est visible immediatement dans un mockup realiste de wallet. Vous voyez exactement ce que vos clients verront.

---

## Ce qui est sur la carte

**Titre :** Anatomie d'une carte Stampeo

### Face avant
- **Logo** de votre commerce
- **Nom** de votre commerce
- **Bande de tampons** — visuelle, avec les tampons remplis et les emplacements vides
- **Texte de recompense** — "10e cafe offert" ou "Dessert offert a 100 points"
- **Nom du client** (si collecte)

### Dos de la carte
- **Adresse** de votre commerce (cliquable pour navigation GPS)
- **Telephone** (cliquable pour appeler)
- **Site web** (cliquable)
- **Conditions du programme** (optionnel)
- **QR code du client** — c'est ce que l'employe scanne

### Couleurs et lisibilite

Apple Wallet et Google Wallet ont des contraintes specifiques de contraste et de lisibilite. Notre editeur (et notre equipe de design) respecte automatiquement ces contraintes. Votre carte sera toujours lisible, meme en plein soleil.

<!-- COMPONENT: AnnotatedWalletCard
- Full-size WalletCard (ScaledCardWrapper baseWidth=300) with showQR={true}
- 5 floating annotation labels connected by thin SVG lines:
  1. "Logo" → pointing to logo area (top-left)
  2. "Nom du commerce" → pointing to org name (top-center)
  3. "Bande de tampons" → pointing to stamp grid (middle)
  4. "Récompense" → pointing to secondary field (below stamps)
  5. "QR code client" → pointing to QR code (bottom)
- Labels appear with ScrollReveal stagger (100ms apart)
- Labels use absolute positioning with responsive offset
- Lines are SVG paths from label edge to target point on card
- On mobile: labels stack below card as a numbered legend instead
-->

---

## Fonctionnalites avancees

### Plusieurs modeles de carte [Pro]

Creez differents programmes de fidelite avec des cartes distinctes :
- Une carte "cafe" et une carte "brunch"
- Une carte classique et une carte VIP
- Des cartes saisonnieres

Chaque carte a son propre design, ses propres recompenses, et sa propre base de clients.

### Designs programmes [Pro] — Bientot disponible

Planifiez vos changements de design a l'avance :
- Design "Noel" actif du 1er au 31 decembre
- Retour automatique au design par defaut apres la periode
- Planifiez toute une annee de designs saisonniers

Le changement est transparent pour le client : sa carte se met a jour automatiquement dans son wallet.

---

## CTA

**Titre :** Votre carte, prete en 5 minutes

**Sous-titre :** On la cree pour vous, ou vous la creez vous-meme. Dans tous les cas, elle sera professionnelle.

**CTA :** Devenir Partenaire Fondateur → /onboarding

---

## Decouvrez aussi

- [Scanner mobile](/features/scanner-mobile) — L'appli qui scanne les cartes que vous creez
- [Notifications push](/features/notifications-push) — Les messages qui accompagnent votre carte
- [Programme fondateur](/programme-fondateur) — Votre premiere carte designee gratuitement
