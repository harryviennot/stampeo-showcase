# Analytiques — Page Feature

> Brouillon de contenu pour la page dediee au tableau de bord et aux analytiques.

---

## Hero

**Titre :** Connaissez vos habitues. Pas juste de vue.

**Sous-titre :** Avec une carte en carton, vous ne savez rien de vos clients. Avec Stampeo, vous voyez qui revient, a quelle frequence, et ce qui fonctionne.

**CTA :** Devenir Partenaire Fondateur → /onboarding

---

## Le probleme

**Titre :** Ce que vous ne savez pas aujourd'hui

Posez-vous ces questions :

- **Combien de clients reguliers avez-vous ?** Pas "a peu pres" — un vrai chiffre.
- **A quelle frequence reviennent-ils ?** Toutes les semaines ? Tous les mois ? Vous ne savez pas.
- **Qui a arrete de venir ?** Marc ne vient plus depuis 3 semaines. Vous ne l'avez meme pas remarque.
- **Quel jour est le plus calme ?** Vous avez une intuition, mais pas de donnees.
- **Combien de recompenses ont ete reclamees ce mois-ci ?** Aucune idee.
- **Est-ce que votre programme de fidelite fonctionne ?** Impossible de repondre.

Avec des cartes en carton, ces questions n'ont pas de reponse. Vous gerez votre fidelisation a l'aveugle. C'est comme tenir votre comptabilite de tete — ca marche un temps, mais vous passez a cote de tout ce qui compte.

<!-- COMPONENT: BlindSpotCards
- 6 cards in 3×2 grid (2×3 on mobile)
- Each card is a flip card (framer-motion rotateY: 0→180 on hover/tap)
- Front: question text + "?" icon (muted)
  - "Combien de clients réguliers ?"
  - "À quelle fréquence reviennent-ils ?"
  - "Qui a arrêté de venir ?"
  - "Quel jour est le plus calme ?"
  - "Combien de récompenses ce mois ?"
  - "Votre programme fonctionne-t-il ?"
- Back: shrug emoji or "???" with muted background
- Drives home: paper cards = zero data
-->

---

## Le tableau de bord basique [Pay]

**Titre :** L'essentiel pour commencer

Le plan Starter inclut un tableau de bord simple et clair qui repond aux questions fondamentales.

### Ce que vous voyez

**Chiffres cles :**
- Nombre total de clients inscrits
- Nombre de scans cette semaine / ce mois
- Nombre de recompenses reclamees

**Liste de clients :**
- Nom (si collecte) et email
- Nombre de tampons actuels
- Progression vers la recompense (barre visuelle)
- Date de derniere visite
- Indicateur "Visite aujourd'hui"

**Recherche :**
- Recherchez un client par nom ou email
- Retrouvez instantanement son historique

### Ce que ca change

Vous passez de "je ne sais rien" a "je vois l'essentiel". Vous savez combien de clients vous avez, qui est proche d'une recompense, et qui est venu aujourd'hui. C'est deja enorme par rapport a une carte en carton.

<!-- COMPONENT: DashboardMockups
- Pay section: reuse DashboardPreview (existing showcase component) scaled to fit
- Wrap in browser chrome mockup with stats + customer list visible
- Below or alongside: LiveActivityFeed (small panel, auto-generating fake scan events)
-->

---

## Les analytiques avancees [Pro]

**Titre :** Comprenez les tendances, pas juste les chiffres

Le plan Growth ajoute une couche d'analyse qui vous aide a prendre des decisions.

### Tendances dans le temps

Visualisez l'evolution de vos metriques jour par jour, semaine par semaine, mois par mois :
- Nombre de scans par periode
- Nouveaux clients par periode
- Recompenses reclamees par periode

**Exemple :** Vous lancez une offre "double tampon le mercredi". En deux semaines, vous voyez si ca fonctionne — pas besoin d'attendre votre intuition.

### Heures de pointe

Decouvrez quand vos clients viennent :
- Repartition par jour de la semaine
- Repartition par heure de la journee
- Identification des creux

**Exemple :** Vous decouvrez que le jeudi apres-midi est votre jour le plus calme. Vous lancez un "double tampon le jeudi 14h-17h" pour lisser l'affluence.

### Frequence de visite

Comprenez le rythme de vos clients :
- Frequence moyenne entre deux visites
- Repartition : quotidiens, hebdomadaires, mensuels, occasionnels
- Evolution de la frequence dans le temps

**Exemple :** Votre frequence moyenne passe de 8 jours a 6 jours apres l'introduction de votre programme. La preuve que ca marche.

### Retention — Bientot disponible [Pro]

Bientot, vous pourrez suivre :
- Taux de retention a 30 / 60 / 90 jours
- Clients "a risque" (frequence en baisse)
- Clients "perdus" (pas de visite depuis X jours)

Cette fonctionnalite est en cours de developpement et arrivera dans les prochains mois.

<!-- COMPONENT: ProChartCards
- 3 mini chart cards side by side (stack on mobile)
- Each card has a ProBadge in top-right corner
  1. Line chart (SVG path that draws on scroll, framer-motion pathLength 0→1)
     Label: "Scans / semaine", trending up
  2. Heatmap grid (7×5 grid of colored cells, cells fill with stagger animation)
     Label: "Heures de pointe", darker = busier
  3. Donut chart (SVG circle with stroke-dasharray animation)
     Label: "Rétention 30j", showing "72%" in center
- All charts are pure CSS/SVG, no charting library
- Charts animate on scroll-enter (useInView from framer-motion)
-->

---

## CTA

**Titre :** Arretez de deviner. Commencez a savoir.

**Sous-titre :** Le tableau de bord est inclus dans tous les plans. Les analytiques avancees sont disponibles sur le plan Growth.

**CTA :** Devenir Partenaire Fondateur → /onboarding

---

## Decouvrez aussi

- [Notifications push](/features/notifications-push) — Mesurez l'impact de vos notifications
- [Scanner mobile](/features/scanner-mobile) — Chaque scan alimente votre tableau de bord
- [Programme fondateur](/programme-fondateur) — Acces aux analytiques Growth inclus
