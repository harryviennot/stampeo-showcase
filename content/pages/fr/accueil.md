# Page d'accueil — Brouillon de contenu

> Ce document decrit le contenu de la homepage reworkee (13 sections). Il sert de reference pour l'implementation, pas de fichier renderable.

---

## 1. Hero (existant — garder tel quel)

**Badge :** Acces Anticipe — France

**Titre :** Des cartes de fidelite que vos clients **gardent vraiment.**

**Sous-titre :** Des cartes digitales directement dans Apple Wallet. Importez votre logo, choisissez vos couleurs, et votre carte est prete en quelques minutes. Aucune application a telecharger pour vos clients.

**CTA primaire :** Devenir Partenaire Fondateur → /onboarding
**CTA secondaire :** Voir comment ca marche → #how-it-works

**Demo interactive :** QR code + ajout de tampon en temps reel (c'est le killer feature, ne pas toucher)

---

## 2. Barre de preuve sociale (ACTIVER `SocialProofBar.tsx` — composant existant inutilise)

> Le composant existe deja avec les traductions. Adapter les chiffres pour la phase early-stage. nous n'avons aucun client pour le moment.

**Texte d'accroche :** Des commerces francais nous font deja confiance

**Chiffres a afficher (adapter les valeurs a la realite du moment) :**

| Stat | Valeur | Label |
|------|--------|-------|
| Partenaires fondateurs | 50+ | partenaires fondateurs |
| Cartes creees | 2 000+ | cartes en circulation |
| Satisfaction | 4.9/5 | note de satisfaction |

**Note implementation :** Mettre a jour les traductions dans `messages/fr/landing.json` → `socialProof`. Les stats actuelles disent "200+ commerces" et "50K+ cartes" — beaucoup trop eleve pour le lancement. Adapter a la realite.

---

## 3. Probleme (existant — ETENDRE avec une 3e carte)

**Phrase d'accroche (existante) :** Les cartes papier se perdent. *Les applis de fidelite ne sont jamais telechargees. Il existe une meilleure solution.*

**Carte 1 — Perdues dans les tiroirs (existante)**
Les cartes papier se froissent, s'oublient dans les poches ou finissent a la poubelle. Votre programme de fidelite devient invisible.

**Carte 2 — La lassitude des applis (existante)**
Vos clients ne vont pas telecharger une enieme application juste pour des tampons. Cette friction tue l'engagement avant meme qu'il commence.

**Carte 3 — Zero visibilite (NOUVEAU)**
Titre : Zero visibilite sur vos clients
Description : Avec une carte en carton, vous ne savez pas qui revient, a quelle frequence, ni quand un client arrete de venir. Vous pilotez a l'aveugle.
Icone : ChartIcon ou EyeSlashIcon

**Solution (existante) :** Stampeo place votre carte de fidelite la ou vos clients regardent deja : **Leur portefeuille telephone.**

---

## 4. Comment ca marche (ACTIVER `HowItWorks.tsx` — composant existant inutilise)

> Le composant et les 5 etapes de traduction existent deja. Juste l'ajouter a la page.

**Badge :** Comment ca marche
**Titre :** Le moment magique en 5 etapes.
**Sous-titre :** Du premier scan au client fidele en quelques secondes

**Etapes (existantes dans les traductions) :**

1. **Le client scanne le QR code** — Affichez un QR code a votre comptoir ou sur vos recus. Les clients le scannent avec l'appareil photo de leur telephone.
2. **Telecharge la carte dans son wallet** — Un tap suffit pour ajouter votre carte de fidelite a Apple Wallet ou Google Wallet. Aucune appli a installer, aucun compte a creer.
3. **Presente sa carte a l'employe** — A la prochaine visite, les clients ouvrent leur wallet et vous montrent la carte. Elle est toujours avec eux, toujours prete.
4. **L'employe scanne, le tampon est ajoute** — Vous scannez leur QR code avec l'appli Stampeo. Tampon ajoute instantanement. Simple pour tout le monde.
5. **Le client est notifie** — Sa carte se met a jour en temps reel avec une notification push. Il voit sa progression et sent la recompense se rapprocher.

---

## 5. Avantages (existant — AJOUTER un 4e avantage par onglet)

**Titre :** Ca marche pour tout le monde
**Sous-titre :** Une experience fluide pensee pour les clients modernes et les commerces en croissance.

### Onglet "Pour vos clients" (3 existants + 1 nouveau)

1. **Toujours avec eux** — Directement dans Apple Wallet ou Google Wallet. Pas d'appli a telecharger, pas d'identifiant a retenir.
2. **Fonctionne partout** — Pas besoin d'internet pour afficher leur carte. Fiable sur les marches, en sous-sol, partout.
3. **Retour instantane** — Une notification apparait des qu'ils gagnent un tampon. Satisfaisant et impossible a rater.
4. **Recompenses claires** *(NOUVEAU)* — Vos clients voient exactement ou ils en sont. Plus de "j'ai perdu ma carte au 7e tampon". La progression est toujours visible.

### Onglet "Pour votre commerce" (3 existants + 1 nouveau)

1. **Pret en quelques minutes** — Importez votre logo, choisissez vos couleurs, visualisez votre carte instantanement. Aucune competence en design requise.
2. **Voyez ce qui fonctionne** — Sachez qui revient, a quelle frequence et quand. Des statistiques simples, sans tableur.
3. **Scannez comme vous voulez** — Utilisez notre application gratuite ou scannez depuis n'importe quel navigateur. Aucun equipement special, aucune integration caisse.
4. **Notifications qui arrivent** *(NOUVEAU)* — 85 % de taux de lecture sur les notifications wallet, contre 20 % par email. Vos messages sont lus, pas ignores. [Pay] [Pro]

**Note implementation :** Ajouter un 4e element aux arrays `customers` et `business` dans les traductions. Ajouter une 4e icone dans chaque array d'icones du composant.

---

## 6. Tableau comparatif (NOUVEAU — a creer)

**Titre :** Pourquoi le wallet ?
**Sous-titre :** Comparez les solutions de fidelisation pour un commerce independant.

| Critere | Carte papier | App mobile | Stampeo (Wallet) |
|---------|-------------|------------|-----------------|
| Cout de demarrage | ~0 € (tampon + cartons) | 50-200 €/mois | A partir de 14,99 €/mois |
| Adoption client | Moyenne — il faut y penser | Faible — personne ne telecharge | Elevee — deja dans le telephone |
| Notifications push | Impossible | Oui (si l'app est installee) | Oui, directement dans le wallet |
| Fonctionne hors ligne | Oui | Ca depend | Oui, toujours |
| Risque de fraude | Eleve (tampon generique) | Faible | Aucun (QR unique + chiffre) |
| Donnees clients | Aucune | Oui, mais peu de gens installent | Oui, des le premier scan |
| Temps de mise en place | 1 heure (imprimeur) | 2-4 semaines | 5 minutes |

**Note de bas :** Les cartes wallet combinent le meilleur des deux mondes : la simplicite du carton et la puissance du digital — sans les inconvenients de chacun.

<!-- COMPONENT: ComparisonTable
- Animated table: rows stagger-reveal on scroll (ScrollReveal variant="stagger")
- 3 columns: Carte papier (muted) | App mobile (muted) | Stampeo (accent)
- Stampeo column: checkmarks animate in with CircleStamp fill effect
- Competitor columns: ✗ use subtle red with shake micro-animation
- Mobile: stack as cards instead of table
-->

<!-- COMPONENT: BeforeAfterSlider (below table)
- Draggable divider: crumpled paper card ↔ sleek WalletCard
- Left side: sad paper card illustration (crumpled, stamped, faded)
- Right side: sleek WalletCard with same business branding
- As divider moves right→left, paper card crumples more (CSS transform: rotate + skew)
- As divider moves left→right, WalletCard glows brighter (box-shadow increases)
- Touch-friendly with momentum
- Compact: fits in a single section, not full-width
- Visual proof of the table's claims
-->

---

## 7. Apercu du tableau de bord (ACTIVER `DashboardPreview.tsx` — composant existant inutilise)

> Le composant existe deja avec les traductions et un mockup de dashboard. Juste l'ajouter a la page.

**Badge :** Tableau de bord analytique
**Titre :** Connaissez vos habitues.
**Sous-titre :** Votre tableau de bord vous montre qui visite, a quelle frequence, et quand ils approchent d'une recompense. Reperez vos meilleurs clients. Voyez ce qui fonctionne. Prenez de meilleures decisions.

**Features checklist :**
- Frequence et habitudes de visite
- Recompenses reclamees et en attente
- Identifiez vos clients les plus fideles
- Exportez vos donnees a tout moment

**Mockup :** Dashboard avec stats (Clients totaux, Visites cette semaine, Recompenses reclamees) + liste de clients recents avec barres de progression.

<!-- COMPONENT: LiveActivityFeed (alongside DashboardPreview)
- Small panel next to or below the dashboard mockup
- Auto-generates fake scan events every 2-3s
- Random French names: "Sophie M.", "Marc D.", "Claire T.", "Thomas R."
- Random stamp counts: "3 → 4", "7 → 8", "9 → 10 🎉"
- Random timestamps: "il y a 2 min", "il y a 5 min"
- StampIconSvg with colored circles (like real ActivityItem from web app)
- New items slide in from top with framer-motion
- Old items fade out at bottom (max 5 visible)
- Creates "this is a living platform" feeling
-->

---

## 8. Cas d'usage / Secteurs (NOUVEAU — a creer)

**Titre :** Stampeo s'adapte a votre commerce
**Sous-titre :** Que vous vendiez des cafes, des baguettes ou des coupes de cheveux, le principe est le meme : recompensez la fidelite.

### 4 cartes sectorielles

**Cafe**
> Marc commande son allonge tous les matins depuis deux ans. Avec Stampeo, il gagne son 10e cafe automatiquement — et vous, vous savez qu'il est votre meilleur client.
- Recompense type : 10 cafes achetes = 1 offert
- Avantage cle : Le scan prend 1 seconde, aucun ralentissement au comptoir
- Lien : [Lire le guide pour les cafes](/blog/carte-fidelite-cafe)

**Boulangerie**
> Sophie passe chercher sa baguette chaque matin. Sa carte en carton ? Perdue dans son sac depuis la semaine derniere. Avec le wallet, elle l'a toujours — et elle decouvre qu'elle est a 2 tampons de sa viennoiserie offerte.
- Recompense type : 8 achats = 1 viennoiserie offerte
- Avantage cle : Pas de carte a sortir, le telephone suffit
- Lien : [Lire le guide pour les boulangeries](/blog/carte-fidelite-boulangerie)

**Salon de coiffure / Institut**
> Claire vient tous les mois pour sa couleur. Elle ne sait meme pas que vous avez un programme de fidelite — la derniere fois, l'esthe n'a pas pense a tamponner. Avec Stampeo, c'est automatique et Claire recoit un soin offert au bout de 6 visites.
- Recompense type : 6 prestations = 1 soin offert
- Avantage cle : Notification de geolocalisation quand elle passe pres du salon [Pro]
- Liens : [Salon de coiffure](/blog/programme-fidelite-salon-coiffure) · [Institut de beaute](/blog/fidelite-institut-beaute)

**Restaurant**
> Thomas dejeune chez vous deux fois par semaine. Il adorerait etre recompense, mais il ne va pas telecharger une app pour ca. Avec la carte wallet, il scanne au comptoir et gagne des points sur chaque addition.
- Recompense type : 1 € depense = 1 point, dessert offert a 100 points
- Avantage cle : Campagnes promotionnelles pour remplir les jours creux [Pro]
- Lien : [Lire le guide pour les restaurants](/blog/carte-fidelite-restaurant)

<!-- COMPONENT: SectorCards
- 4 cards in a 2×2 grid (1 col on mobile)
- Each card contains a mini WalletCard (ScaledCardWrapper baseWidth=200) with themed colors:
  - Cafe: bg=#3C2415, accent=#D4A574 (warm brown)
  - Boulangerie: bg=#F5E6D3, accent=#C8956D (golden)
  - Salon: bg=#F8E8F0, accent=#D4688E (pink)
  - Restaurant: bg=#1A2332, accent=#4A90D9 (navy/blue)
- Cards have interactive3D={true} for hover effect
- Below each card: persona name, one-line scenario, blog link
- On hover: card lifts, scenario text fades in (framer-motion opacity+y)
- Uses ScrollReveal for entrance animation
-->

---

## 9. Fonctionnalites en vedette (NOUVEAU — a creer)

**Titre :** Tout ce qu'il faut pour fideliser
**Sous-titre :** Six fonctionnalites pensees pour les commerces independants. Pas de superflu.

### Grille 3x2 (liens vers les pages dediees)

| Feature | Icone | Description courte | Lien |
|---------|-------|--------------------|------|
| Notifications push | BellIcon | Vos clients lisent enfin vos messages. 85 % de taux d'ouverture. | /features/notifications-push |
| Geolocalisation | MapPinIcon | Rappelez-leur que vous existez quand ils passent a cote. [Pro] | /features/geolocalisation |
| Scanner mobile | CameraIcon | Un scan, un tampon. Meme sans internet. | /features/scanner-mobile |
| Analytiques | ChartIcon | Connaissez vos habitues. Pas juste de vue. | /features/analytiques |
| Design de carte | PaletteIcon | Vos couleurs, votre logo, pret en 5 minutes. | /features/design-de-carte |
| Programme fondateur | StarIcon | 3 mois offerts. Tarif bloque a vie. | /programme-fondateur |

<!-- COMPONENT: FeatureGrid
- 3×2 grid of clickable cards (links to /features/*)
- Each card: Phosphor icon (duotone, 32px) + title + one-line description
- Hover: icon scales 1.1 + shifts to accent color, card lifts with shadow
- Icons: BellRinging, MapPin, DeviceMobileCamera, ChartLine, Palette, Star
- Use ScrollReveal with stagger delay per card (100ms apart)
- Mobile: 1 column stack
-->

---

## 10. Partenaire fondateur (existant — ETENDRE)

**Badge :** Programme Partenaire Fondateur
**Titre :** Aidez-nous a construire un produit que vous adorerez

**Sous-titre (a enrichir) :** Nous cherchons 50 commercants francais prets a tester Stampeo en avant-premiere. En echange de vos retours, vous beneficiez du meilleur tarif — a vie. Places limitees.

**Propositions de valeur (4 existantes + 2 nouvelles) :**
- Faconnez le produit avec vos retours directs
- Canal direct avec notre equipe (pas un chatbot, un humain)
- 3 mois offerts, puis 14,99 €/mois a vie (au lieu de 29,99 €)
- Toutes les fonctionnalites Growth incluses des le premier jour
- *Places limitees — nous acceptons les candidatures par vagues* (NOUVEAU)
- *Votre premiere carte de fidelite designee par notre equipe, gratuitement* (NOUVEAU)

**CTA :** Devenir Partenaire Fondateur → /onboarding

**Element d'urgence :** Ajouter un indicateur subtil du type "XX places restantes" ou "Prochaine vague : mars 2026"

---

## 11. Tarifs (existant — garder tel quel)

### Starter — 14,99 €/mois
- 1 modele de carte actif
- Clients et scans illimites
- Jusqu'a 3 membres d'equipe
- Scan hors ligne
- Notifications push

### Growth — 29,99 €/mois (14,99 € pour les fondateurs)
- 3 mois offerts
- Plusieurs modeles de carte
- Membres d'equipe illimites
- Support multi-etablissement
- Messages de notification personnalises
- Analytiques avancees
- Campagnes programmees

**CTA :** Demander l'acces anticipe → /onboarding

---

## 12. FAQ (existant — ETENDRE avec 3 nouvelles questions)

### Questions existantes (6)
1. Qu'est-ce que le programme partenaire fondateur ?
2. Comment creer ma carte de fidelite ?
3. Mes clients doivent-ils telecharger une application ?
4. De quel equipement ai-je besoin ?
5. Comment les clients se font-ils tamponner ?
6. Comment fonctionne l'acces anticipe ?

### Nouvelles questions (3)

**7. Est-ce que ca marche avec Google Wallet ?**
Oui. Stampeo genere des cartes compatibles avec Apple Wallet et Google Wallet. La grande majorite des smartphones (iPhone et Android) sont couverts. Les fonctionnalites sont identiques sur les deux plateformes, a l'exception des notifications de geolocalisation qui ne sont disponibles que sur Apple Wallet pour le moment.

**8. Un commerce peut-il avoir plusieurs cartes de fidelite ?**
Avec le plan Growth, oui. Vous pouvez creer plusieurs modeles de carte — par exemple une carte "cafe" et une carte "brunch du dimanche" — chacune avec ses propres recompenses. Sur le plan Starter, vous avez un modele actif a la fois, ce qui suffit pour la plupart des commerces.

**9. Peut-on envoyer des campagnes promotionnelles ?**
Avec le plan Growth, vous pourrez envoyer des notifications promotionnelles a tous vos clients ou a des segments specifiques (par exemple, les clients qui ne sont pas venus depuis 30 jours). Cette fonctionnalite est en cours de developpement et sera disponible dans les prochains mois. En attendant, les notifications automatiques (tampon, jalon, recompense) sont actives sur tous les plans.

---

## 13. CTA final (existant — garder tel quel)

**Titre :** Pret a transformer vos visiteurs en **habitues ?**

**CTA :** Devenir Partenaire Fondateur → /onboarding

**Sous-titre :** Acces anticipe · 3 mois offerts · 14,99 €/mois a vie
