# Site AAAA

Site vitrine front-end de l'AAAA (Association des Anciens et Amis de l'AFNEUS).

## Mise en ligne
Ouvrez simplement `index.html` dans un navigateur ou déployez le dossier sur n'importe quel hébergement statique.

## Modifier le contenu sans casser la structure
Tout le contenu principal est centralisé dans `assets/js/data.js`.

Vous pouvez modifier :
- le nom de l'association ;
- l'email de contact ;
- les textes de la page d'accueil ;
- les membres du bureau ;
- les buts de l'association ;
- les textes de la page contact.

## Ajouter un membre du bureau
Dans la liste `members`, dupliquez un bloc existant puis changez :
- `firstName`
- `lastName`
- `role`
- `email`
- `initials`
- `photo` (facultatif)

Si vous ajoutez une photo, placez-la dans `assets/img/bureau/` puis indiquez son chemin, par exemple :
`assets/img/bureau/marie-dupont.jpg`

## Ajouter un but
Dans la liste `goals`, dupliquez un bloc existant puis changez :
- `id`
- `icon`
- `title`
- `shortText`
- `intro`
- `points`

Une nouvelle carte apparaîtra automatiquement sur la page `buts.html` et la page détaillée sera créée via `but.html?id=votre-id`.

## Décor dinosaures
Les dinosaures cartoon sur les côtés apparaissent progressivement au scroll.
Les fichiers SVG se trouvent dans `assets/img/dinos/`.

## Couleurs
Le site utilise une identité principalement violette, avec des accents bleu ciel.
