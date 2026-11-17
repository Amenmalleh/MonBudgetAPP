// État central de l'application : les dépenses et les budgets sont gardés ici
// et partagés avec tous les écrans grâce au Context React.
import { createContext, useContext, useEffect, useState } from 'react';

import { createDepense, createBudget } from '../models/models';
import { loadExpenses, saveExpenses, loadBudgets, saveBudgets } from '../storage/storage';

// Le "canal" par lequel les écrans accèdent aux données.
const BudgetContext = createContext(null);

// Composant qui entoure l'application et fournit l'état + les actions.
export function BudgetProvider({ children }) {
  const [expenses, setExpenses] = useState([]); // liste des dépenses
  const [budgets, setBudgets] = useState([]); // liste des budgets par catégorie
  const [loading, setLoading] = useState(true); // true tant que les données ne sont pas chargées

  // Au démarrage (montage du composant) : on charge les données enregistrées.
  useEffect(() => {
    async function chargerDonnees() {
      // Les deux lectures sont lancées en parallèle.
      const [savedExpenses, savedBudgets] = await Promise.all([loadExpenses(), loadBudgets()]);
      setExpenses(savedExpenses);
      setBudgets(savedBudgets);
      setLoading(false);
    }
    chargerDonnees();
  }, []); // [] = exécuté une seule fois

  // Ajoute une nouvelle dépense puis sauvegarde la liste.
  // On utilise la forme "setExpenses(prev => ...)" pour partir de la liste
  // la plus récente (évite de perdre une dépense en cas de clics rapides).
  function addExpense({ montant, categorie, date }) {
    const nouvelle = createDepense({ montant, categorie, date });
    setExpenses((prev) => {
      const next = [...prev, nouvelle];
      saveExpenses(next);
      return next;
    });
  }

  // Supprime la dépense dont l'id correspond, puis sauvegarde.
  function deleteExpense(id) {
    setExpenses((prev) => {
      const next = prev.filter((depense) => depense.id !== id);
      saveExpenses(next);
      return next;
    });
  }

  // Définit le plafond d'une catégorie :
  // - si un budget existe déjà pour cette catégorie, on le remplace ;
  // - sinon on l'ajoute. Puis on sauvegarde.
  function setBudget(categorie, plafond) {
    const nouveau = createBudget({ categorie, plafond });
    setBudgets((prev) => {
      const existe = prev.some((budget) => budget.categorie === categorie);
      const next = existe
        ? prev.map((budget) => (budget.categorie === categorie ? nouveau : budget))
        : [...prev, nouveau];
      saveBudgets(next);
      return next;
    });
  }

  const value = { expenses, budgets, loading, addExpense, deleteExpense, setBudget };

  return <BudgetContext.Provider value={value}>{children}</BudgetContext.Provider>;
}

// Hook pratique pour les écrans : const { expenses, addExpense } = useBudget();
export function useBudget() {
  const context = useContext(BudgetContext);
  if (context === null) {
    throw new Error('useBudget doit être utilisé à l’intérieur de <BudgetProvider>');
  }
  return context;
}
