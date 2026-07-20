# Architecture du portfolio

## Objectif éditorial

Le site est organisé pour permettre à un recruteur technique de vérifier rapidement :

1. le positionnement C++/Linux ;
2. la capacité à expliquer une architecture ;
3. les preuves de compilation, de tests et d’exécution ;
4. l’expérience full-stack et produit issue du poste actuel.

## Structure

```text
P-Pix.github.io/
├── index.html
├── assets/
│   ├── demos/                  # MP4 H.264 et posters PNG
│   ├── images/                 # portrait optimisé
│   └── pdf/cv.pdf
└── src/
    ├── css/style.css           # design system et responsive
    ├── js/script.js            # menu, reveal, copie et vidéos
    └── html/
        ├── projets.html
        ├── projet-*.html       # six études de cas
        ├── cv.html
        └── contact.html
```

## Pages projet

Toutes les études de cas suivent le même parcours de lecture :

- résumé et stack ;
- problème d’ingénierie ;
- architecture ;
- décisions techniques ;
- démonstration réelle ;
- preuves vérifiables dans le dépôt ;
- projet suivant.

Cette répétition est intentionnelle : elle permet de comparer les projets sans réapprendre la page.

## Déploiement

Le dépôt reste un site statique directement compatible avec GitHub Pages. Aucun secret, backend ou appel API n’est requis en production.
