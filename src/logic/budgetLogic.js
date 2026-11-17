// Règles métier de MonBudget.
// Fonctions PURES : elles ne modifient rien et ne lisent rien d'extérieur ;
// pour les mêmes paramètres, elles renvoient toujours le même résultat.
import { CATEGORIES } from '../models/models';

// Indique si une date (chaîne ISO) tombe dans le même mois ET la même année
// que la date de référence.
function estDansLeMois(dateIso, referenceDate) {
  const date = new Date(dateIso);
  return (
    date.getFullYear() === referenceDate.getFullYear() &&
    date.getMonth() === referenceDate.getMonth()
  );
}

// Garde uniquement les dépenses du mois de referenceDate (par défaut : le mois en cours).
// Utilisée par les calculs ci-dessous ET par la liste du tableau de bord,
// pour que la liste et le récapitulatif portent toujours sur la même période.
export function getExpensesOfMonth(expenses, referenceDate = new Date()) {
  return expenses.filter((d) => estDansLeMois(d.date, referenceDate));
}

// Total dépensé dans une catégorie pendant le mois de referenceDate.
// 1. on garde les dépenses du bon mois, puis de la bonne catégorie ;
// 2. on additionne leurs montants (reduce part de 0).
export function getMonthlyTotalByCategory(expenses, categorie, referenceDate = new Date()) {
  return getExpensesOfMonth(expenses, referenceDate)
    .filter((d) => d.categorie === categorie)
    .reduce((somme, d) => somme + d.montant, 0);
}

// Total de TOUTES les dépenses du mois de referenceDate (toutes catégories confondues).
export function getMonthlyTotal(expenses, referenceDate = new Date()) {
  return getExpensesOfMonth(expenses, referenceDate).reduce((somme, d) => somme + d.montant, 0);
}

// Récapitulatif du mois pour chaque catégorie qui a un budget OU des dépenses ce mois-ci.
// Retourne une liste de { categorie, total, plafond, reste, pourcentage, statut } :
// - total   = somme des dépenses du mois dans la catégorie ;
// - plafond = plafond du budget (null si aucun budget n'est défini) ;
// - reste   = plafond - total (null si pas de plafond) ;
// - pourcentage = part du plafond déjà dépensée, arrondie (null si pas de plafond) ;
// - statut  = "non suivi" s'il n'y a pas de budget,
//             sinon "dépassé" si total > plafond, sinon "ok".
export function getCategorySummaries(expenses, budgets, referenceDate = new Date()) {
  const resumes = [];

  for (const categorie of CATEGORIES) {
    const budget = budgets.find((b) => b.categorie === categorie);
    const total = getMonthlyTotalByCategory(expenses, categorie, referenceDate);

    // Ni budget ni dépense ce mois-ci : rien à afficher pour cette catégorie.
    if (budget === undefined && total === 0) {
      continue;
    }

    const plafond = budget !== undefined ? budget.plafond : null;
    const reste = plafond !== null ? plafond - total : null;
    // Ex. 75 dépensés sur 100 -> 75 (%). Peut dépasser 100 si le budget est dépassé.
    const pourcentage = plafond !== null ? Math.round((total / plafond) * 100) : null;

    let statut;
    if (plafond === null) {
      statut = 'non suivi'; // dépenses sans budget : on ne peut pas comparer
    } else if (total > plafond) {
      statut = 'dépassé'; // alerte
    } else {
      statut = 'ok';
    }

    resumes.push({ categorie, total, plafond, reste, pourcentage, statut });
  }

  return resumes;
}
