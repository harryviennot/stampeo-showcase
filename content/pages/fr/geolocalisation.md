# Geolocalisation — Page Feature

> Brouillon de contenu pour la page dediee a la geolocalisation (geofencing). Fonctionnalite Growth.

---

## Hero

**Titre :** Rappelez-leur que vous existez. Au bon moment.

**Sous-titre :** Quand votre client passe pres de votre commerce, son telephone lui rappelle qu'il a une carte de fidelite chez vous. Sans que vous ne fassiez rien.

**Badge :** [Pro]

**CTA :** Devenir Partenaire Fondateur → /onboarding

<!-- COMPONENT: GeofencingHeroAnimation
- Stylized top-down map view (CSS gradients, no real map)
- Center: map pin icon (MapPin from Phosphor, accent color, 48px)
- 3 concentric circles pulse outward from pin (CSS animation, 2s interval)
- Right side: phone mockup sliding up from bottom (framer-motion y: 100→0)
- Phone lock screen shows a WalletCard appearing with fade-in
- Interaction: hovering the map pin pauses the pulse and shows radius label "~300m"
-->

---

## Le probleme

**Titre :** Votre client fidele vous oublie. Ce n'est pas de sa faute.

Marc passe devant votre cafe tous les matins. Mais ce matin, il est presse. Il ne pense pas a s'arreter. Il ne pense pas a sa carte de fidelite a 8 tampons sur 10. Il va au Starbucks d'en face, par reflexe.

Le probleme n'est pas la concurrence. C'est l'oubli. Votre client vous aime bien — il ne pense juste pas a vous au bon moment.

Et si son telephone pouvait le faire a votre place ?

---

## Comment ca marche

**Titre :** Le geofencing natif d'Apple Wallet

### Le mecanisme (aucun effort de votre part)

1. **Vous renseignez l'adresse de votre commerce** dans le dashboard Stampeo.
2. **Stampeo encode cette adresse** dans chaque carte Apple Wallet de vos clients.
3. **Apple Wallet detecte la proximite** — quand le client est a quelques centaines de metres de votre adresse, le systeme affiche votre carte sur l'ecran de verrouillage.
4. **Le client voit sa carte apparaitre** — avec son nombre de tampons actuel. Un rappel visuel et silencieux.

C'est tout. Pas de notification intrusive. Pas de pop-up. Juste la carte qui apparait au bon moment.

### Ce que voit le client

Imaginez : Marc sort du metro a 8h12. Son iPhone affiche discretement sa carte de fidelite de votre cafe — "7/10 tampons". Il se dit : "Tiens, je suis a 3 du cafe gratuit." Et il traverse la rue.

Ce n'est pas une publicite. C'est un rappel contextuel. Et ca fait toute la difference.

---

## 3 scenarios concrets

### Le cafe de Marc

Marc travaille a 200m de votre cafe. Chaque matin, quand il sort du metro, sa carte apparait sur son ecran de verrouillage. Il ne l'ouvre pas forcement — mais il y pense. Et 4 matins sur 5, il passe vous voir.

Sans geofencing, Marc aurait continue a alterner entre votre cafe et le coffee shop d'en face. Avec, il pense a vous d'abord.

### Le salon de Claire

Claire a rendez-vous chez vous tous les mois pour sa couleur. Mais entre les rendez-vous, elle passe souvent dans le quartier — courses, medecin, dejeuner. Chaque fois, sa carte de fidelite apparait. Un jour, elle entre sur un coup de tete pour un soin rapide.

Le geofencing ne cree pas de nouvelles visites a partir de rien. Il capture les opportunites qui existaient deja mais que vous ratiez.

### Le restaurant de Thomas

Thomas dejeune pres de son bureau. Votre restaurant est a 5 minutes a pied, mais il y en a 10 autres sur le trajet. Quand sa carte apparait a midi avec "4/8 tampons", ca suffit a faire pencher la balance.

Le geofencing est le petit coup de pouce qui transforme "peut-etre" en "allez, on y va".

<!-- COMPONENT: GeofencingScenarios
- 3 cards in a row (stack on mobile)
- Each card:
  - Top: mini WalletCard (ScaledCardWrapper baseWidth=160) with sector colors:
    - Cafe Marc: bg=#3C2415, accent=#D4A574
    - Salon Claire: bg=#F8E8F0, accent=#D4688E
    - Restaurant Thomas: bg=#1A2332, accent=#4A90D9
  - Middle: persona name + avatar initial circle (like DashboardPreview customer list)
  - Bottom: one-line italic quote from the scenario
- Cards use ScrollReveal variant="stagger"
- Subtle map pin icon (Phosphor MapPin) in top-right corner of each card
-->

---

## Details techniques et limites

**Titre :** Ce qu'il faut savoir

### Precision
Apple Wallet utilise un rayon d'environ 100 a 500 metres autour de l'adresse. Ce n'est pas du GPS temps reel — c'est base sur les donnees de localisation que le telephone collecte deja (Wi-Fi, antennes, GPS occasionnel). La precision est suffisante pour les commerces de proximite.

### Multi-etablissement [Pro]
Si vous avez plusieurs adresses (2 boulangeries, 3 restaurants...), chaque adresse peut etre encodee dans la carte. Le client est rappele pres de chacun de vos etablissements.

### Google Wallet — en toute transparence
Google Wallet ne supporte pas encore le geofencing natif. Les clients Android beneficient de toutes les autres fonctionnalites Stampeo (notifications push, mise a jour en temps reel), mais pas de l'affichage contextuel par proximite. Nous ajouterons cette fonctionnalite des qu'elle sera disponible cote Google.

---

## Vie privee

**Titre :** La vie privee de vos clients est protegee

C'est un point important, et on veut etre transparent :

- **Stampeo ne localise personne.** C'est Apple Wallet qui gere la detection de proximite en local, sur le telephone du client. Nous n'avons acces a aucune donnee de localisation.
- **Pas de tracking.** Nous ne savons pas quand le client passe pres de votre commerce. Nous ne savons pas ou il va. Nous fournissons juste une adresse a Apple Wallet.
- **Le client controle tout.** Il peut desactiver les suggestions de lieu dans les reglages de son wallet, ou tout simplement supprimer la carte.
- **Conforme au RGPD.** Aucune donnee de localisation n'est collectee ni stockee par Stampeo.

---

## CTA

**Titre :** Soyez present au bon moment

**Sous-titre :** Le geofencing est inclus dans le plan Growth. Rejoignez le programme fondateur pour en beneficier des maintenant.

**CTA :** Devenir Partenaire Fondateur → /onboarding

---

## Decouvrez aussi

- [Notifications push](/features/notifications-push) — L'autre facon de rester dans l'esprit de vos clients
- [Analytiques](/features/analytiques) — Mesurez l'impact sur la frequence de visite
- [Design de carte](/features/design-de-carte) — La carte que vos clients verront sur leur ecran
