// Couleurs et dimensions partagées par tous les écrans,
// pour garder un style uniforme et un bon contraste.
export const COLORS = {
  fond: '#f3f4f6', // fond des écrans (gris très clair)
  carte: '#ffffff', // fond des cartes et des champs
  texte: '#111827', // texte principal (presque noir)
  texteSecondaire: '#374151', // texte courant
  texteDiscret: '#4b5563', // indications, placeholders (reste lisible sur fond clair)
  bordure: '#9ca3af',
  bordureLegere: '#e5e7eb',
  primaire: '#1d4ed8', // bleu des boutons principaux
  primairePresse: '#1e3a8a',
  danger: '#b91c1c', // rouge : erreurs, dépassement, suppression
  dangerPresse: '#7f1d1d',
  dangerFond: '#fef2f2',
  succes: '#15803d', // vert : confirmation, statut ok
};

// Hauteur minimale d'une zone tactile (recommandation Apple : 44 points).
export const TAILLE_TACTILE = 44;
