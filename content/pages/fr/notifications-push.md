# Notifications Push — Page Feature

> Brouillon de contenu pour la page dediee aux notifications push.

---

## Hero

**Titre :** Vos clients lisent vos messages. Enfin.

**Sous-titre :** Les emails finissent en spam. Les SMS coutent cher. Les notifications wallet apparaissent directement sur l'ecran de verrouillage — et 85 % sont lues.

**CTA :** Devenir Partenaire Fondateur → /onboarding

<!-- COMPONENT: NotificationPhoneDemo
- PhoneMockup (new component): iPhone frame with notch, rounded corners
- Inside: lock screen with time "9:41" + date
- Animation (framer-motion, loops every 5s):
  1. Wallet notification banner slides down from top (spring, damping: 15)
  2. Shows: Stampeo icon + "Vous avez gagné un tampon !" + "Plus que 7."
  3. Holds 2.5s, then slides back up
  4. 1.5s pause, repeat
- Subtle phone shadow that shifts with the notification weight
-->

---

## Le probleme

**Titre :** Le probleme avec les canaux classiques

Vous avez des choses a dire a vos clients. Sauf qu'ils ne vous entendent pas.

| Canal | Taux de lecture | Cout | Friction |
|-------|----------------|------|----------|
| Email | ~20 % | Gratuit / faible | Finit en spam, rarement ouvert |
| SMS | ~45 % | 0,03-0,07 € / SMS | Intrusif, desabonnement facile |
| App push | ~30 % | Inclus (si l'app est installee) | Personne n'installe votre app |
| **Wallet push** | **~85 %** | **Inclus dans Stampeo** | **Deja sur l'ecran de verrouillage** |

La notification wallet a un avantage enorme : votre client a deja votre carte dans son telephone. Pas d'app a ouvrir, pas de boite mail a checker. Le message apparait comme une notification native, au meme niveau qu'un iMessage ou un rappel de calendrier.

<!-- COMPONENT: ChannelComparisonBars
- 4 horizontal bars, stacked vertically
- Labels left: Email, SMS, App push, Wallet push
- Bars fill on scroll-enter (useInView from framer-motion)
- Fill animation: 0.8s ease-out, staggered 0.15s apart
- Values: 20%, 45%, 30%, 85%
- Colors: first 3 = muted gray, last = accent color
- Numbers count up (0→20, 0→45, etc.) during fill
- Wallet bar has a subtle pulse glow after filling
-->

---

## Comment ca marche

**Titre :** Comment les notifications Stampeo fonctionnent

### Le mecanisme

1. **Un evenement se produit** — Un tampon est ajoute, un jalon est atteint, une recompense est debloquee.
2. **Stampeo envoie une notification push** — Via Apple Push Notification Service (APNs) pour Apple Wallet, ou via l'API Google Pay pour Google Wallet.
3. **La carte se met a jour** — Le client voit sa carte actualisee dans son wallet avec le nouveau nombre de tampons.
4. **Le client recoit la notification** — Elle apparait sur son ecran de verrouillage, comme n'importe quelle notification native.

Tout ca se passe en quelques secondes. Le client scanne, sort du magasin, et voit la notification en remettant son telephone dans sa poche.

---

## Types de notifications

**Titre :** Trois types de notifications automatiques

### 1. Notification de tampon [Pay] [Pro]
> "Vous avez gagne un tampon ! Plus que 7 avant votre recompense."

Envoyee a chaque scan. Le client sait immediatement que son passage a ete enregistre. C'est le retour instantane qui rend l'experience satisfaisante.

### 2. Notification de jalon [Pay] [Pro]
> "Plus que 2 tampons ! Votre cafe offert est presque la."

Envoyee quand le client approche de la recompense (configurable : a 2 tampons, a mi-chemin, etc.). Cree un sentiment d'anticipation et motive le retour.

### 3. Notification de recompense [Pay] [Pro]
> "Felicitations ! Vous avez debloque votre recompense. Montrez cette carte a la caisse."

Le moment de satisfaction maximale. La carte affiche clairement "RECOMPENSE PRETE" et le client sait qu'il a quelque chose a reclamer lors de sa prochaine visite.

<!-- COMPONENT: WalletNotificationStack
- Stack of 3 notification cards, slightly offset (iOS notification stack style)
- Cards layer: bottom (oldest, most blurred), middle, top (newest, sharp)
- Top card shows the latest notification with full detail
- Clicking/tapping peels off the top card (swipe-up animation) to reveal the next
- 3 notifications cycle:
  1. "Tampon ajouté ! Plus que 6."
  2. "Plus que 2 ! Presque là."
  3. "🎉 Récompense prête ! Montrez cette carte."
- After all 3 are swiped, they reset with a shuffle animation
- Much more engaging than static text describing notification types
-->

<!-- COMPONENT: NotificationSequenceDemo
- 3 tabs/steps: "Tampon" | "Jalon" | "Récompense"
- Each tab shows a phone screen (PhoneMockup) with:
  - A mini WalletCard (ScaledCardWrapper baseWidth=180) showing different stamp counts
  - A notification banner on top matching the type
- Tab 1 (Tampon): stamps=4, notification "Tampon gagné ! Plus que 6."
- Tab 2 (Jalon): stamps=8, notification "Plus que 2 ! Votre café est presque là."
- Tab 3 (Récompense): stamps=10, notification "Félicitations ! Récompense prête."
  - WalletCard shows "RÉCOMPENSE PRÊTE" badge
- Clicking tabs transitions the phone content (framer-motion AnimatePresence)
- Auto-advances every 3s if user hasn't interacted
-->

---

## Fonctionnalites avancees

**Titre :** Allez plus loin avec les notifications

### Messages personnalises [Pro]

Sur le plan Pay, les messages sont predefinis et fonctionnent tres bien. Sur le plan Pro, vous pouvez ecrire vos propres messages pour chaque type de notification.

Exemples :
- Tampon : "Merci Marc ! Ton allonge du matin est note. Plus que 5 !"
- Jalon : "Hey Marc, encore 2 cafes et le prochain est pour nous !"
- Recompense : "Marc, ton 10e cafe est offert ! Passe nous voir."

### Campagnes promotionnelles [Pro] — Bientot disponible

Envoyez des notifications a tous vos clients ou a des segments specifiques :
- "Double tampon ce vendredi !" → a tous les clients
- "Ca fait un moment ! Votre prochain tampon compte double." → clients inactifs depuis 30 jours
- "Nouveau menu d'ete ! Venez decouvrir." → a tous les clients

### Segmentation client [Pro] — Bientot disponible

Ciblez vos messages selon :
- La frequence de visite (habitues, occasionnels, perdus)
- Le nombre de tampons actuels
- La date de derniere visite
- Le nombre de recompenses reclamees

---

## Vie privee et consentement

**Titre :** Respectueux par design

- Les notifications sont liees a la carte wallet — si le client supprime sa carte, il ne recoit plus rien.
- Aucun spam : les notifications automatiques sont liees a des actions concretes (tampon, jalon, recompense).
- Les campagnes promotionnelles (Pro) respectent les limites raisonnables — pas de bombardement.
- Le client garde le controle total : il peut desactiver les notifications dans les reglages de son wallet a tout moment.

---

## CTA

**Titre :** Des messages que vos clients lisent vraiment

**Sous-titre :** Rejoignez le programme fondateur et commencez a communiquer avec vos clients via leur wallet.

**CTA :** Devenir Partenaire Fondateur → /onboarding

---

## Decouvrez aussi

- [Scanner mobile](/features/scanner-mobile) — Le scan qui declenche la notification
- [Analytiques](/features/analytiques) — Mesurez l'impact de vos notifications
- [Programme fondateur](/features/programme-fondateur) — Acces a toutes les fonctionnalites Pro
