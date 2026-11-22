// Programmes Upper / Lower de coachs reconnus, ADAPTÉS pour un objectif « prendre du muscle et s'affiner »
// (pas de powerlifting) : fourchettes 8-15 répétitions, repos 1 à 2 min, mouvements plus doux pour
// les articulations. Chaque programme liste ce qui a été modifié par rapport à l'original.
// Chaque exercice : [id exercice, séries min, séries max, répétitions, repos (s), note]

window.GENERAL_TIPS = [
  'Charge : choisis un poids avec lequel les 2 dernières répétitions sont vraiment difficiles, en gardant 1 à 2 répétitions en réserve. Des poids trop légers construisent peu de muscle.',
  'Progression : quand tu atteins le haut de la fourchette sur toutes les séries, augmente un peu la charge à la séance suivante.',
  'Échauffement : 5 à 10 min de cardio léger et de mobilité, puis 1 à 2 séries légères sur le premier exercice.',
  'Semaine type : Upper – Lower – repos – Upper – Lower – repos – repos. Ajoute 2 à 3 séances de cardio modéré (marche rapide, vélo…) les autres jours si tu veux.',
  'S\'affiner, c\'est surtout l\'alimentation : un léger déficit calorique et assez de protéines, pendant que la musculation entretient et construit le muscle.',
  'Contrôle chaque répétition (environ 2 s à la descente). En cas de douleur articulaire (pas de simple fatigue musculaire), remplace l\'exercice par sa variante machine.',
  'Garde les deux séances upper et les deux séances lower d\'un même programme : elles sont pensées pour se compléter.',
];

window.PROGRAMS = [
  {
    id: 'phul', name: 'PHUL – version hypertrophie', short: 'PHUL', full: 'D\'après Power Hypertrophy Upper Lower', author: 'Brandon Campbell',
    level: 'Intermédiaire', freq: '4 séances / semaine',
    summary: 'Deux séances à charges modérées (8-10 répétitions) et deux séances de volume (10-15 répétitions), pour le haut et pour le bas du corps.',
    schedule: 'Lun : Upper 1 · Mar : Lower 1 · Jeu : Upper 2 · Ven : Lower 2',
    adapted: [
      'Séances « power » (3-5 répétitions) transformées en séances à charges modérées (8-10 répétitions).',
      'Soulevé de terre classique remplacé par le soulevé de terre roumain.',
      'Développé militaire barre → développé épaules haltères ; barre au front → poulie corde (plus doux pour épaules et coudes).',
      'Hip thrust et abduction ajoutés pour les fessiers ; front squat → goblet squat.',
    ],
    rules: [
      'Repos d\'environ 90 s, jusqu\'à 2 min sur les gros mouvements (programme original : environ 90 s).',
      'Garde 1 à 2 répétitions en réserve ; l\'échec complet est à utiliser rarement.',
      'Progression : la force gagnée sur les séances 1 te permet de charger plus lourd sur les séances 2.',
      'Commence par le bas des fourchettes de séries et augmente progressivement.',
    ],
    source: 'https://www.muscleandstrength.com/workouts/phul-workout',
    sessions: [
      { id: 'upper-power', name: 'Upper 1 – Charges modérées', kind: 'upper', focus: 'Haut du corps, 8-10 répétitions', items: [
        ['bench-bb', 3, 4, '8-10', 120, 'Ou développé couché haltères.'],
        ['incline-db', 3, 4, '10-12', 90, ''],
        ['row-bb', 3, 4, '8-10', 120, 'Ou rowing machine si le bas du dos fatigue.'],
        ['lat-pulldown', 3, 4, '10-12', 90, ''],
        ['shoulder-press-db', 2, 3, '10-12', 90, 'Remplace le développé militaire barre.'],
        ['curl-ez', 2, 3, '10-12', 60, ''],
        ['pushdown-rope', 2, 3, '10-12', 60, 'Remplace la barre au front.'],
      ] },
      { id: 'lower-power', name: 'Lower 1 – Charges modérées', kind: 'lower', focus: 'Bas du corps, 8-10 répétitions', items: [
        ['squat', 3, 4, '8-10', 120, 'Ou goblet squat / presse si le squat barre te gêne.'],
        ['rdl', 3, 4, '8-10', 120, 'Remplace le soulevé de terre classique.'],
        ['leg-press', 3, 3, '12-15', 90, ''],
        ['leg-curl-lying', 3, 3, '10-12', 90, ''],
        ['hip-thrust', 3, 3, '10-12', 90, 'Ajouté pour les fessiers.'],
        ['calf-standing', 3, 3, '12-15', 60, ''],
      ] },
      { id: 'upper-hyp', name: 'Upper 2 – Volume', kind: 'upper', focus: 'Haut du corps, 10-15 répétitions', items: [
        ['incline-bb', 3, 4, '10-12', 90, 'Ou haltères.'],
        ['pec-deck', 3, 3, '12-15', 60, 'Ou écarté haltères.'],
        ['seated-row', 3, 4, '10-12', 90, ''],
        ['row-db', 3, 3, '10-12', 60, 'Par bras.'],
        ['lateral-raise', 3, 4, '12-15', 60, ''],
        ['incline-curl', 3, 3, '10-12', 60, ''],
        ['pushdown-bar', 3, 3, '12-15', 60, ''],
      ] },
      { id: 'lower-hyp', name: 'Lower 2 – Volume', kind: 'lower', focus: 'Bas du corps, 10-15 répétitions', items: [
        ['goblet', 3, 4, '10-12', 90, 'Remplace le front squat.'],
        ['lunge-db', 3, 3, '10-12', 90, 'Par jambe.'],
        ['leg-ext', 3, 3, '12-15', 60, ''],
        ['leg-curl-seated', 3, 3, '12-15', 60, ''],
        ['abduction', 3, 3, '15-20', 60, 'Ajouté pour les fessiers.'],
        ['calf-seated', 3, 3, '12-15', 60, ''],
      ] },
    ],
  },
  {
    id: 'gbr', name: 'Generic Bulking Routine – version hypertrophie', short: 'GBR', full: 'D\'après la Generic Bulking Routine', author: 'Lyle McDonald',
    level: 'Intermédiaire', freq: '4 séances / semaine',
    summary: 'Le plus orienté « construction musculaire » des trois : un gros mouvement en 8-10 répétitions, puis du travail en 10-12 et 12-15.',
    schedule: 'Lun : Lower A · Mar : Upper A · Jeu : Lower B · Ven : Upper B',
    adapted: [
      'Zone lourde 6-8 répétitions remontée à 8-10 ; repos 2 min au lieu de 3.',
      'Bras en 2 séries minimum (au lieu de 1-2) pour plus de volume.',
      'Soulevé de terre (Lower B) remplacé par le hip thrust ; un leg curl remplacé par le squat bulgare.',
      'Barre au front → extension nuque haltère ; élévations latérales ajoutées en Upper B.',
    ],
    rules: [
      'Trois zones : 3-4 × 8-10 (repos 2 min), 2-3 × 10-12 (repos 1 min 30), 2 × 12-15 (repos 1 min).',
      'Progression (Lyle McDonald) : quand tu atteins le haut de la fourchette à la 1re série avec 1-2 répétitions en réserve, ajoute du poids.',
      'Si tu ne peux pas ajouter de poids, ajoute des répétitions.',
      'Commence par le bas des fourchettes de séries ; à suivre au moins 8 semaines.',
    ],
    source: 'https://jcdfitness.com/2009/01/lyle-mcdonalds-bulking-routine/',
    sessions: [
      { id: 'lower-a', name: 'Lower A', kind: 'lower', focus: 'Squat + soulevé roumain', items: [
        ['squat', 3, 4, '8-10', 120, 'Ou presse si le squat barre te gêne.'],
        ['rdl', 3, 4, '8-10', 120, ''],
        ['leg-press', 2, 3, '10-12', 90, ''],
        ['leg-curl-seated', 2, 3, '10-12', 90, ''],
        ['hip-thrust', 2, 3, '10-12', 90, 'Remplace un exercice de mollets.'],
        ['calf-standing', 3, 3, '12-15', 60, ''],
      ] },
      { id: 'upper-a', name: 'Upper A', kind: 'upper', focus: 'Développé couché + rowing', items: [
        ['bench-bb', 3, 4, '8-10', 120, 'Ou haltères.'],
        ['row-bb', 3, 4, '8-10', 120, 'Ou rowing machine.'],
        ['incline-db', 2, 3, '10-12', 90, ''],
        ['lat-pulldown', 2, 3, '10-12', 90, ''],
        ['pushdown-rope', 2, 2, '12-15', 60, ''],
        ['curl-db', 2, 2, '12-15', 60, ''],
      ] },
      { id: 'lower-b', name: 'Lower B', kind: 'lower', focus: 'Fessiers + ischios', items: [
        ['hip-thrust', 3, 4, '8-10', 120, 'Remplace le soulevé de terre.'],
        ['leg-curl-lying', 3, 4, '8-10', 90, ''],
        ['leg-press', 2, 3, '10-12', 90, ''],
        ['bulgarian', 2, 3, '10-12', 90, 'Par jambe. Remplace le 2e leg curl.'],
        ['calf-seated', 3, 3, '12-15', 60, ''],
      ] },
      { id: 'upper-b', name: 'Upper B', kind: 'upper', focus: 'Incliné + tirage en premier', items: [
        ['incline-db', 3, 4, '8-10', 120, ''],
        ['lat-pulldown', 3, 4, '8-10', 120, ''],
        ['bench-db', 2, 3, '10-12', 90, ''],
        ['seated-row', 2, 3, '10-12', 90, ''],
        ['lateral-raise', 2, 3, '12-15', 60, 'Ajouté pour les épaules.'],
        ['overhead-ext', 2, 2, '12-15', 60, 'Remplace la barre au front.'],
        ['hammer-curl', 2, 2, '12-15', 60, ''],
      ] },
    ],
  },
  {
    id: 'strengthlog', name: 'StrengthLog Upper/Lower – version hypertrophie', short: 'StrengthLog', full: 'D\'après Upper/Lower Body Split, 4x/semaine', author: 'Daniel Richter (StrengthLog)',
    level: 'Débutant à intermédiaire', freq: '4 séances / semaine',
    summary: 'Le plus simple et le plus court : peu d\'exercices, surtout des mouvements de base. Idéal si tu as moins de temps.',
    schedule: 'Lun : Upper 1 · Mar : Lower 1 · Jeu : Upper 2 · Ven : Lower 2',
    adapted: [
      'Toutes les séries de 5 × 5 (orientées force) remplacées par du 3-4 × 8-10.',
      'Soulevé de terre → hip thrust ; front squat → goblet squat ; développé militaire barre → haltères.',
      'Roue abdominale → gainage (moins de contrainte sur le bas du dos).',
      'Élévations latérales, squat bulgare et abduction ajoutés.',
    ],
    rules: [
      'Augmente la charge quand tu réussis toutes les répétitions de toutes les séries avec une bonne technique.',
      'Le programme laisse le repos libre (« le temps nécessaire ») : les repos indiqués sont des suggestions.',
      'Les exercices marqués « optionnel » peuvent être retirés si tu manques de temps.',
    ],
    source: 'https://www.strengthlog.com/strengthlogs-upper-lower-program-4-days-week/',
    sessions: [
      { id: 'upper-1', name: 'Upper 1', kind: 'upper', focus: 'Développé couché + tirage', items: [
        ['bench-bb', 3, 4, '8-10', 120, 'Remplace le 5 × 5. Ou haltères.'],
        ['lat-pulldown', 3, 4, '10-12', 90, ''],
        ['incline-db', 3, 3, '10-12', 90, ''],
        ['row-bb', 3, 4, '10-12', 90, 'Ou rowing machine.'],
        ['pushdown-bar', 3, 3, '12-15', 60, 'Optionnel.'],
        ['curl-bb', 3, 3, '12-15', 60, 'Optionnel.'],
      ] },
      { id: 'lower-1', name: 'Lower 1', kind: 'lower', focus: 'Squat + soulevé roumain', items: [
        ['squat', 3, 4, '8-10', 120, 'Remplace le 5 × 5. Ou presse.'],
        ['rdl', 3, 4, '10-12', 120, ''],
        ['bulgarian', 3, 3, '10-12', 90, 'Par jambe.'],
        ['hanging-leg-raise', 3, 3, '10-12', 60, 'Optionnel. Ou crunch.'],
      ] },
      { id: 'upper-2', name: 'Upper 2', kind: 'upper', focus: 'Épaules + dos', items: [
        ['shoulder-press-db', 3, 4, '8-10', 120, 'Remplace le développé militaire barre 5 × 5.'],
        ['lat-pulldown', 3, 4, '10-12', 90, ''],
        ['close-bench', 3, 3, '10-12', 90, 'Ou dips assistés.'],
        ['row-db', 3, 4, '10-12', 60, 'Par bras.'],
        ['lateral-raise', 3, 3, '12-15', 60, 'Ajouté pour les épaules.'],
        ['curl-bb', 3, 3, '12-15', 60, 'Optionnel.'],
      ] },
      { id: 'lower-2', name: 'Lower 2', kind: 'lower', focus: 'Fessiers + quadriceps', items: [
        ['hip-thrust', 3, 4, '8-10', 120, 'Remplace le soulevé de terre 5 × 5.'],
        ['goblet', 3, 4, '10-12', 90, 'Remplace le front squat 5 × 5.'],
        ['leg-curl-lying', 3, 3, '10-12', 90, ''],
        ['abduction', 3, 3, '15-20', 60, 'Ajouté pour les fessiers.'],
        ['plank', 3, 3, '30-45', 60, 'Remplace la roue abdominale.'],
      ] },
    ],
  },
];
