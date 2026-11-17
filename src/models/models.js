// Modèles de données de l'application MonBudget.
// Ces fonctions "fabriquent" des objets au bon format, pour que toute
// l'application manipule des données cohérentes.

// Liste fixe des catégories proposées à l'utilisateur.
export const CATEGORIES = ['Alimentation', 'Transport', 'Loisirs', 'Factures', 'Autre'];

// Génère un identifiant unique : l'heure actuelle en millisecondes
// + 5 caractères aléatoires (évite les doublons si deux dépenses
// sont créées dans la même milliseconde).
function generateId() {
  return Date.now().toString() + '-' + Math.random().toString(36).slice(2, 7);
}

// Crée une dépense { id, montant, categorie, date }.
// - montant est converti en nombre (les champs texte renvoient des chaînes).
// - date : si aucune date n'est fournie, on prend la date du jour au format ISO.
export function createDepense({ montant, categorie, date }) {
  return {
    id: generateId(),
    montant: Number(montant),
    categorie: categorie,
    date: date ? new Date(date).toISOString() : new Date().toISOString(),
  };
}

// Crée un budget { categorie, plafond } : le plafond mensuel d'une catégorie.
// Le plafond est converti en nombre pour pouvoir faire des calculs dessus.
export function createBudget({ categorie, plafond }) {
  return {
    categorie: categorie,
    plafond: Number(plafond),
  };
}
