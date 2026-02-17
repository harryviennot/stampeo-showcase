# Scanner Mobile — Page Feature

> Brouillon de contenu pour la page dediee au scanner mobile.

---

## Hero

**Titre :** Un scan. Un tampon. C'est tout.

**Sous-titre :** Pas de caisse connectee. Pas de materiel special. Votre telephone suffit pour tamponner vos clients en une seconde.

**CTA :** Devenir Partenaire Fondateur → /onboarding

<!-- COMPONENT: ScanSimulator
- Interactive: user clicks "Scanner" button on phone mockup
- The phone camera "activates" (dark → viewfinder overlay)
- A QR code target appears
- User clicks/taps the QR code to "scan" it
- Result: haptic animation + customer card pops up:
  "Marc D. — 7/10 tampons" with StampProgress (md size)
  + green "Tampon ajouté ✓" toast
- Timer shows "0.8s" — total scan time
- User can repeat — each time shows a different customer
- Gamified: makes visitors want to try it multiple times
-->

<!-- COMPONENT: ScanDemo (fallback/auto-play version)
- PhoneMockup with camera viewfinder inside (dark bg with corner brackets)
- Animation sequence (loops every 6s):
  1. QR code floats into frame from right (framer-motion x: 200→center)
  2. Viewfinder brackets tighten (scale animation)
  3. Green overlay flash + checkmark (CircleStamp animates from empty→filled)
  4. Phone vibrates (CSS transform: translateX alternating ±2px, 3 cycles, 50ms)
  5. Result card slides up: "Marc — 5/10 tampons" with StampProgress bar
  6. Holds 2s, fades out, repeat
-->

---

## Le probleme

**Titre :** Tamponner devrait etre invisible

Vous connaissez la scene. Le client paie, vous cherchez le tampon, la carte est au fond du sac, la file s'allonge. Ou pire : vous oubliez de proposer la carte.

Avec un tampon physique, l'acte de fideliser ralentit votre service. Et tout ce qui ralentit le service finit par disparaitre. L'employe oublie. Le client ne demande plus. Le programme meurt en silence.

Le tamponnage doit etre aussi rapide qu'un paiement sans contact : une seconde, puis on passe au client suivant.

---

## Comment ca marche

**Titre :** Deux facons de scanner

### Option 1 : L'application dediee [Pay] [Pro]

L'appli Stampeo est une application legere, dediee au scan. Elle fait une seule chose et elle le fait bien.

**Le flux :**
1. Ouvrez l'appli (elle se souvient de votre connexion)
2. Pointez la camera vers le QR code du client
3. Un tampon est ajoute — vibration haptique de confirmation
4. Le client recoit une notification push en quelques secondes

**Temps total :** 1 seconde entre l'ouverture de la camera et la confirmation.

**Disponible sur :** iOS et Android

### Option 2 : Le scanner web [Pay] [Pro]

Pas envie d'installer une app ? Scannez directement depuis le navigateur de votre telephone ou tablette.

**Le flux :**
1. Ouvrez le scanner web depuis votre dashboard (un favori suffit)
2. Autorisez la camera (une seule fois)
3. Scannez le QR code du client
4. Tampon ajoute, meme confirmation

**Ideal pour :** Les commerces qui preferent ne rien installer, ou qui utilisent une tablette partagee au comptoir.

---

## Le mode hors ligne

**Titre :** Ca marche meme sans internet

C'est la question que tout le monde pose — et c'est normal. Votre commerce n'a peut-etre pas toujours une connexion fiable.

### Les situations concernees
- **Marches et marches de Noel** — Pas de Wi-Fi, reseau mobile sature
- **Sous-sols et rez-de-chaussee** — Certains locaux n'ont pas de signal
- **Evenements et pop-ups** — Connexion imprevisible
- **Pannes internet** — Ca arrive a tout le monde

### Comment ca marche

1. **Vous scannez normalement.** L'appli detecte qu'il n'y a pas de connexion.
2. **Le scan est enregistre localement** avec l'heure exacte et l'identifiant du client.
3. **Un indicateur "en attente de sync"** apparait — vous savez que le scan est sauvegarde.
4. **Des que la connexion revient**, tous les scans en attente sont synchronises automatiquement.
5. **Le client recoit sa notification** a ce moment-la. Sa carte se met a jour.

### Ce que le client voit

Le seul inconvenient du mode hors ligne : le client ne recoit pas sa notification immediatement. Sa carte se mettra a jour quand votre telephone retrouvera une connexion. Dans la pratique, ca prend quelques minutes a quelques heures. Le scan est toujours enregistre — aucun tampon n'est perdu.

<!-- COMPONENT: OfflineToggleDemo
- Interactive toggle switch: "En ligne" ↔ "Hors ligne"
- When online (default):
  - Mini scan animation → instant notification icon flying to phone → "Tampon ajouté ✓"
  - Green status dot
- When offline (user toggles):
  - Same scan animation → stamp saves with clock icon → "En attente de sync" badge (amber)
  - "3 scans en attente" counter appears
  - After 2s, auto-toggles back to online → syncing animation (stamps fly up) → "Synchronisé ✓"
- Uses framer-motion AnimatePresence for state transitions
-->

---

## L'experience employe

**Titre :** Pret en 30 secondes, sans formation

### Simplicite radicale

L'appli Stampeo n'a qu'un seul ecran : la camera. Pas de menu complexe, pas de parametres a configurer. Votre employe ouvre l'appli et scanne. C'est tout.

**Ce que l'employe voit apres un scan :**
- Nom du client (si collecte)
- Nombre de tampons actuels (ex : "5/10")
- Si une recompense est prete → bouton "Valider la recompense"
- Confirmation visuelle + vibration haptique

**Temps de formation :** Montrez une fois. "Tu ouvres l'appli, tu scannes." Il n'y a rien d'autre a savoir.

### Retour haptique

A chaque scan reussi, le telephone vibre brievement. Ce retour physique est important : l'employe sait que ca a marche sans regarder l'ecran. Particulierement utile en rush quand chaque seconde compte.

---

## Gestion d'equipe

**Titre :** Qui peut scanner ?

### Plan Pay — Jusqu'a 3 membres [Pay]

Le proprietaire du commerce peut inviter jusqu'a 3 employes. Chaque employe recoit un email d'invitation, cree un compte (ou se connecte si il en a deja un), et peut scanner immediatement.

L'employe n'a acces qu'au scanner. Il ne voit pas le dashboard, les statistiques, ni la liste complete des clients.

### Plan Pro — Equipe illimitee [Pro]

Aucune limite sur le nombre de scanners. Ideal pour les commerces avec beaucoup de personnel ou plusieurs etablissements.

**En plus :** Vous voyez quel employe a effectue chaque scan. Utile pour le suivi d'activite et la verification.

---

## Securite

**Titre :** Chaque scan est unique et securise

- **QR code unique par client** — Impossible de copier ou deviner un code.
- **Scan lie a un employe authentifie** — Chaque tampon est trace.
- **Pas de double scan accidentel** — L'appli detecte si le meme client est scanne deux fois d'affilee et demande confirmation.
- **Pas de tampon generique** — Contrairement aux cartes en carton ou n'importe qui peut tamponner a la maison, le scan ne peut etre effectue que par un compte autorise.

---

## CTA

**Titre :** Tamponnez en une seconde

**Sous-titre :** Application gratuite sur iOS et Android. Scanner web disponible sur tous les appareils.

**CTA :** Devenir Partenaire Fondateur → /onboarding

---

## Decouvrez aussi

- [Notifications push](/features/notifications-push) — Ce que le client recoit apres le scan
- [Design de carte](/features/design-de-carte) — La carte que vos clients montrent pour se faire scanner
- [Analytiques](/features/analytiques) — Suivez chaque scan dans votre tableau de bord
