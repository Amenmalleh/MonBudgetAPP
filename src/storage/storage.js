// Couche de persistance : lecture/écriture des données sur le téléphone
// avec AsyncStorage (stockage clé -> valeur texte, conservé après fermeture de l'app).
import AsyncStorage from '@react-native-async-storage/async-storage';

// Clés sous lesquelles les données sont rangées dans AsyncStorage.
export const EXPENSES_KEY = '@monbudget_expenses';
export const BUDGETS_KEY = '@monbudget_budgets';

// Lit une liste enregistrée sous "key".
// AsyncStorage ne stocke que du texte : on doit donc reconvertir le JSON en tableau.
// Retourne [] si rien n'est enregistré, si le contenu n'est pas un tableau,
// ou en cas d'erreur (lecture ou JSON invalide) : l'app ne plante jamais.
async function loadList(key) {
  try {
    const json = await AsyncStorage.getItem(key);
    if (json === null) {
      return []; // premier lancement : rien d'enregistré
    }
    const data = JSON.parse(json);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.warn('Erreur de lecture (' + key + ') :', error);
    return [];
  }
}

// Enregistre une liste sous "key" après l'avoir convertie en texte JSON.
// En cas d'erreur on l'affiche dans la console sans faire planter l'app.
async function saveList(key, liste) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(liste));
  } catch (error) {
    console.warn("Erreur d'enregistrement (" + key + ') :', error);
  }
}

// Fonctions publiques utilisées par le reste de l'application.
export async function loadExpenses() {
  return loadList(EXPENSES_KEY);
}

export async function saveExpenses(liste) {
  return saveList(EXPENSES_KEY, liste);
}

export async function loadBudgets() {
  return loadList(BUDGETS_KEY);
}

export async function saveBudgets(liste) {
  return saveList(BUDGETS_KEY, liste);
}
