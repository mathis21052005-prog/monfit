// Bibliothèque d'exercices intégrée.
// type : w = charge × reps, bw = poids du corps (+ lest), time = durée (s), cardio = distance (km) + durée (min)
window.EXERCISES = [
  // Pectoraux
  { id: 'bench-bb', name: 'Développé couché (barre)', group: 'Pectoraux', type: 'w' },
  { id: 'bench-db', name: 'Développé couché (haltères)', group: 'Pectoraux', type: 'w' },
  { id: 'incline-bb', name: 'Développé incliné (barre)', group: 'Pectoraux', type: 'w' },
  { id: 'incline-db', name: 'Développé incliné (haltères)', group: 'Pectoraux', type: 'w' },
  { id: 'decline-bb', name: 'Développé décliné (barre)', group: 'Pectoraux', type: 'w' },
  { id: 'chest-press', name: 'Développé pectoraux (machine)', group: 'Pectoraux', type: 'w' },
  { id: 'fly-db', name: 'Écarté couché (haltères)', group: 'Pectoraux', type: 'w' },
  { id: 'cable-fly', name: 'Écarté à la poulie (vis-à-vis)', group: 'Pectoraux', type: 'w' },
  { id: 'pec-deck', name: 'Pec deck (butterfly)', group: 'Pectoraux', type: 'w' },
  { id: 'pushup', name: 'Pompes', group: 'Pectoraux', type: 'bw' },
  { id: 'dips', name: 'Dips', group: 'Pectoraux', type: 'bw' },

  // Dos
  { id: 'pullup', name: 'Tractions', group: 'Dos', type: 'bw' },
  { id: 'chinup', name: 'Tractions supination', group: 'Dos', type: 'bw' },
  { id: 'lat-pulldown', name: 'Tirage vertical (poulie haute)', group: 'Dos', type: 'w' },
  { id: 'lat-pulldown-close', name: 'Tirage vertical prise serrée', group: 'Dos', type: 'w' },
  { id: 'seated-row', name: 'Tirage horizontal (poulie basse)', group: 'Dos', type: 'w' },
  { id: 'row-bb', name: 'Rowing barre', group: 'Dos', type: 'w' },
  { id: 'row-db', name: 'Rowing haltère un bras', group: 'Dos', type: 'w' },
  { id: 'row-machine', name: 'Rowing (machine)', group: 'Dos', type: 'w' },
  { id: 'tbar-row', name: 'Rowing T-bar', group: 'Dos', type: 'w' },
  { id: 'deadlift', name: 'Soulevé de terre', group: 'Dos', type: 'w' },
  { id: 'pullover-cable', name: 'Pull-over à la poulie', group: 'Dos', type: 'w' },
  { id: 'shrug', name: 'Shrugs (haltères)', group: 'Dos', type: 'w' },
  { id: 'hyperext', name: 'Extensions lombaires', group: 'Dos', type: 'bw' },

  // Épaules
  { id: 'ohp', name: 'Développé militaire (barre)', group: 'Épaules', type: 'w' },
  { id: 'shoulder-press-db', name: 'Développé épaules (haltères)', group: 'Épaules', type: 'w' },
  { id: 'shoulder-press-m', name: 'Développé épaules (machine)', group: 'Épaules', type: 'w' },
  { id: 'lateral-raise', name: 'Élévations latérales (haltères)', group: 'Épaules', type: 'w' },
  { id: 'lateral-raise-cable', name: 'Élévations latérales (poulie)', group: 'Épaules', type: 'w' },
  { id: 'front-raise', name: 'Élévations frontales', group: 'Épaules', type: 'w' },
  { id: 'rear-delt', name: 'Oiseau (haltères)', group: 'Épaules', type: 'w' },
  { id: 'reverse-pec-deck', name: 'Pec deck inversé', group: 'Épaules', type: 'w' },
  { id: 'face-pull', name: 'Face pull', group: 'Épaules', type: 'w' },
  { id: 'upright-row', name: 'Rowing menton', group: 'Épaules', type: 'w' },

  // Biceps
  { id: 'curl-bb', name: 'Curl barre', group: 'Biceps', type: 'w' },
  { id: 'curl-ez', name: 'Curl barre EZ', group: 'Biceps', type: 'w' },
  { id: 'curl-db', name: 'Curl haltères', group: 'Biceps', type: 'w' },
  { id: 'hammer-curl', name: 'Curl marteau', group: 'Biceps', type: 'w' },
  { id: 'incline-curl', name: 'Curl incliné', group: 'Biceps', type: 'w' },
  { id: 'preacher-curl', name: 'Curl pupitre', group: 'Biceps', type: 'w' },
  { id: 'cable-curl', name: 'Curl à la poulie', group: 'Biceps', type: 'w' },

  // Triceps
  { id: 'pushdown-rope', name: 'Extension triceps poulie (corde)', group: 'Triceps', type: 'w' },
  { id: 'pushdown-bar', name: 'Extension triceps poulie (barre)', group: 'Triceps', type: 'w' },
  { id: 'skullcrusher', name: 'Barre au front', group: 'Triceps', type: 'w' },
  { id: 'overhead-ext', name: 'Extension nuque (haltère)', group: 'Triceps', type: 'w' },
  { id: 'close-bench', name: 'Développé couché prise serrée', group: 'Triceps', type: 'w' },
  { id: 'kickback', name: 'Kickback triceps', group: 'Triceps', type: 'w' },
  { id: 'bench-dips', name: 'Dips sur banc', group: 'Triceps', type: 'bw' },

  // Quadriceps
  { id: 'squat', name: 'Squat (barre)', group: 'Quadriceps', type: 'w' },
  { id: 'front-squat', name: 'Front squat', group: 'Quadriceps', type: 'w' },
  { id: 'leg-press', name: 'Presse à cuisses', group: 'Quadriceps', type: 'w' },
  { id: 'hack-squat', name: 'Hack squat', group: 'Quadriceps', type: 'w' },
  { id: 'leg-ext', name: 'Leg extension', group: 'Quadriceps', type: 'w' },
  { id: 'lunge-db', name: 'Fentes (haltères)', group: 'Quadriceps', type: 'w' },
  { id: 'bulgarian', name: 'Squat bulgare', group: 'Quadriceps', type: 'w' },
  { id: 'goblet', name: 'Goblet squat', group: 'Quadriceps', type: 'w' },

  // Ischios
  { id: 'rdl', name: 'Soulevé de terre roumain', group: 'Ischios', type: 'w' },
  { id: 'leg-curl-lying', name: 'Leg curl allongé', group: 'Ischios', type: 'w' },
  { id: 'leg-curl-seated', name: 'Leg curl assis', group: 'Ischios', type: 'w' },
  { id: 'good-morning', name: 'Good morning', group: 'Ischios', type: 'w' },

  // Fessiers
  { id: 'hip-thrust', name: 'Hip thrust (barre)', group: 'Fessiers', type: 'w' },
  { id: 'glute-bridge', name: 'Pont fessier', group: 'Fessiers', type: 'bw' },
  { id: 'abduction', name: 'Abduction (machine)', group: 'Fessiers', type: 'w' },
  { id: 'glute-kickback', name: 'Kickback fessier (poulie)', group: 'Fessiers', type: 'w' },

  // Mollets
  { id: 'calf-standing', name: 'Mollets debout (machine)', group: 'Mollets', type: 'w' },
  { id: 'calf-seated', name: 'Mollets assis', group: 'Mollets', type: 'w' },
  { id: 'calf-press', name: 'Mollets à la presse', group: 'Mollets', type: 'w' },

  // Abdos
  { id: 'crunch', name: 'Crunch', group: 'Abdos', type: 'bw' },
  { id: 'cable-crunch', name: 'Crunch à la poulie', group: 'Abdos', type: 'w' },
  { id: 'hanging-leg-raise', name: 'Relevés de jambes suspendu', group: 'Abdos', type: 'bw' },
  { id: 'ab-wheel', name: 'Roue abdominale', group: 'Abdos', type: 'bw' },
  { id: 'russian-twist', name: 'Russian twist', group: 'Abdos', type: 'bw' },
  { id: 'plank', name: 'Gainage (planche)', group: 'Abdos', type: 'time' },
  { id: 'side-plank', name: 'Gainage latéral', group: 'Abdos', type: 'time' },

  // Cardio
  { id: 'treadmill', name: 'Tapis de course', group: 'Cardio', type: 'cardio' },
  { id: 'bike', name: 'Vélo', group: 'Cardio', type: 'cardio' },
  { id: 'rower', name: 'Rameur', group: 'Cardio', type: 'cardio' },
  { id: 'elliptical', name: 'Vélo elliptique', group: 'Cardio', type: 'cardio' },
  { id: 'stairs', name: 'Stairmaster', group: 'Cardio', type: 'cardio' },
  { id: 'jump-rope', name: 'Corde à sauter', group: 'Cardio', type: 'time' },
];

// Routines d'exemple proposées au premier lancement
window.ROUTINE_TEMPLATES = [
  { name: 'Push (pecs, épaules, triceps)', items: [
    ['bench-bb', 4, '6-8'], ['incline-db', 3, '8-12'], ['shoulder-press-db', 3, '8-12'],
    ['lateral-raise', 3, '12-15'], ['pushdown-rope', 3, '10-12'], ['overhead-ext', 2, '10-12'] ] },
  { name: 'Pull (dos, biceps)', items: [
    ['lat-pulldown', 4, '8-10'], ['row-bb', 3, '8-10'], ['seated-row', 3, '10-12'],
    ['face-pull', 3, '12-15'], ['curl-ez', 3, '8-12'], ['hammer-curl', 2, '10-12'] ] },
  { name: 'Legs (jambes, abdos)', items: [
    ['squat', 4, '6-8'], ['rdl', 3, '8-10'], ['leg-press', 3, '10-12'],
    ['leg-curl-seated', 3, '10-12'], ['calf-standing', 4, '12-15'], ['plank', 3, '45'] ] },
  { name: 'Full body', items: [
    ['squat', 3, '8'], ['bench-bb', 3, '8'], ['row-bb', 3, '8'],
    ['ohp', 2, '10'], ['curl-db', 2, '12'], ['plank', 2, '45'] ] },
];
