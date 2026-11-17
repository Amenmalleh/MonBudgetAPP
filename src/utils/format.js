// Fonctions d'affichage partagées par tous les écrans.

// Affiche un montant suivi de " DT".
// Nombre entier : affiché tel quel ("30 DT").
// Sinon : 2 décimales ("12.50 DT"), ce qui évite aussi les erreurs d'arrondi
// des nombres à virgule (ex. 0.1 + 0.2 = 0.30000000000000004).
export function formatMontant(n) {
  const texte = Number.isInteger(n) ? String(n) : n.toFixed(2);
  return texte + ' DT';
}

// Transforme une date ISO en "JJ/MM/AAAA" (ex. "16/11/2026").
// padStart(2, '0') ajoute un zéro devant si besoin : 5 -> "05".
// getMonth() commence à 0 (janvier = 0), d'où le + 1.
export function formatDate(isoString) {
  const date = new Date(isoString);
  const jour = String(date.getDate()).padStart(2, '0');
  const mois = String(date.getMonth() + 1).padStart(2, '0');
  const annee = date.getFullYear();
  return `${jour}/${mois}/${annee}`;
}
