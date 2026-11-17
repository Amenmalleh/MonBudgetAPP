import { useState } from 'react';
import { View, Text, Pressable, FlatList, Alert, StyleSheet } from 'react-native';

import { useBudget } from '../context/BudgetContext';
import { CATEGORIES } from '../models/models';
import { getCategorySummaries, getExpensesOfMonth, getMonthlyTotal } from '../logic/budgetLogic';
import { formatMontant, formatDate } from '../utils/format';
import { COLORS, TAILLE_TACTILE } from '../theme';

const TOUTES = 'Toutes'; // valeur du filtre qui affiche toutes les catégories

// Texte et style du badge de statut affiché sur chaque carte.
const BADGES = {
  ok: { texte: 'OK', style: 'statutOk' },
  dépassé: { texte: '⚠ DÉPASSÉ', style: 'statutDepasse' },
  'non suivi': { texte: 'NON SUIVI', style: 'statutNonSuivi' },
};

// Carte récapitulative d'une catégorie pour le mois en cours.
function SummaryCard({ resume }) {
  const depasse = resume.statut === 'dépassé';
  const badge = BADGES[resume.statut];
  return (
    <View style={[styles.carte, depasse && styles.carteDepassee]}>
      <View style={styles.ligne}>
        <Text style={styles.carteTitre}>{resume.categorie}</Text>
        {/* L'alerte : statut en rouge quand le plafond est dépassé */}
        <Text style={styles[badge.style]}>{badge.texte}</Text>
      </View>
      <Text style={styles.texte}>Dépensé : {formatMontant(resume.total)}</Text>
      {resume.plafond !== null ? (
        <>
          <Text style={styles.texte}>Plafond : {formatMontant(resume.plafond)}</Text>
          <Text style={[styles.texte, depasse && styles.texteRouge]}>
            Reste : {formatMontant(resume.reste)}
          </Text>

          {/* Barre de progression : un fond gris (piste) + une barre colorée dont la
              largeur est le pourcentage dépensé, limité à 100 % pour ne pas déborder. */}
          <View style={styles.ligne}>
            <View style={styles.barrePiste}>
              <View
                style={[
                  styles.barreRemplie,
                  { width: Math.min(resume.pourcentage, 100) + '%' },
                  { backgroundColor: depasse ? COLORS.danger : COLORS.succes },
                ]}
              />
            </View>
            <Text style={[styles.pourcentage, depasse && styles.texteRouge]}>
              {resume.pourcentage} %
            </Text>
          </View>
        </>
      ) : (
        <Text style={styles.texteDiscret}>Plafond non défini</Text>
      )}
    </View>
  );
}

// Écran d'accueil : récapitulatif du mois, filtre et liste des dépenses du mois.
export default function DashboardScreen({ navigation }) {
  const { expenses, budgets, loading, deleteExpense } = useBudget();
  const [filtre, setFiltre] = useState(TOUTES); // catégorie affichée dans la liste

  if (loading) {
    return (
      <View style={styles.centre}>
        <Text style={styles.texte}>Chargement…</Text>
      </View>
    );
  }

  // Règle métier : récapitulatif du mois courant par catégorie.
  const resumes = getCategorySummaries(expenses, budgets);
  const totalDuMois = getMonthlyTotal(expenses);

  // Liste affichée : dépenses du mois en cours (même règle que le récapitulatif),
  // filtrées par catégorie, puis triées de la plus récente à la plus ancienne.
  const depensesAffichees = getExpensesOfMonth(expenses)
    .filter((d) => filtre === TOUTES || d.categorie === filtre)
    .sort((a, b) => b.date.localeCompare(a.date));

  // Demande confirmation avant de supprimer ; la suppression n'a lieu que sur "Oui".
  function confirmerSuppression(depense) {
    Alert.alert(
      'Supprimer cette dépense ?',
      `${formatMontant(depense.montant)} · ${depense.categorie}`,
      [
        { text: 'Non', style: 'cancel' },
        { text: 'Oui', style: 'destructive', onPress: () => deleteExpense(depense.id) },
      ]
    );
  }

  // Tout ce qui est au-dessus de la liste (défile avec elle).
  const enTete = (
    <View style={styles.enTete}>
      {/* Bandeau : total de toutes les dépenses du mois */}
      <View style={styles.bandeau}>
        <Text style={styles.bandeauLibelle}>Total dépensé ce mois</Text>
        <Text style={styles.bandeauMontant}>{formatMontant(totalDuMois)}</Text>
      </View>

      {/* Navigation */}
      <View style={styles.ligne}>
        <Pressable
          style={({ pressed }) => [styles.boutonNav, pressed && styles.boutonNavPresse]}
          onPress={() => navigation.navigate('Ajouter')}
        >
          <Text style={styles.boutonNavTexte}>➕ Ajouter</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.boutonNav, pressed && styles.boutonNavPresse]}
          onPress={() => navigation.navigate('Budgets')}
        >
          <Text style={styles.boutonNavTexte}>🎯 Budgets</Text>
        </Pressable>
      </View>

      {/* Récapitulatif du mois */}
      <Text style={styles.sectionTitre}>Ce mois-ci</Text>
      {resumes.length === 0 ? (
        <Text style={styles.texteDiscret}>Aucun budget ni dépense ce mois-ci.</Text>
      ) : (
        resumes.map((r) => <SummaryCard key={r.categorie} resume={r} />)
      )}

      {/* Filtre par catégorie */}
      <Text style={styles.sectionTitre}>Dépenses du mois</Text>
      <View style={styles.chips}>
        {[TOUTES, ...CATEGORIES].map((cat) => {
          const actif = cat === filtre;
          return (
            <Pressable
              key={cat}
              onPress={() => setFiltre(cat)}
              style={[styles.chip, actif && styles.chipActif]}
            >
              <Text style={[styles.chipTexte, actif && styles.chipTexteActif]}>{cat}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );

  return (
    <FlatList
      style={styles.ecran}
      contentContainerStyle={styles.contenu}
      data={depensesAffichees}
      keyExtractor={(d) => d.id}
      ListHeaderComponent={enTete}
      ListEmptyComponent={<Text style={styles.vide}>Aucune dépense</Text>}
      renderItem={({ item }) => (
        <View style={styles.depense}>
          <View style={styles.depenseInfos}>
            <Text style={styles.depenseMontant}>{formatMontant(item.montant)}</Text>
            <Text style={styles.texte}>
              {item.categorie} · {formatDate(item.date)}
            </Text>
          </View>
          <Pressable
            style={({ pressed }) => [styles.boutonSupprimer, pressed && styles.boutonSupprimerPresse]}
            onPress={() => confirmerSuppression(item)}
          >
            <Text style={styles.boutonSupprimerTexte}>Supprimer</Text>
          </Pressable>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  ecran: { flex: 1, backgroundColor: COLORS.fond },
  contenu: { padding: 16, gap: 10, paddingBottom: 32 },
  centre: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.fond },
  enTete: { gap: 10 },
  ligne: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  bandeau: { backgroundColor: COLORS.primaire, borderRadius: 14, padding: 18, alignItems: 'center', gap: 4 },
  bandeauLibelle: { color: '#fff', fontSize: 16, fontWeight: '600' },
  bandeauMontant: { color: '#fff', fontSize: 30, fontWeight: '800' },
  barrePiste: { flex: 1, height: 10, borderRadius: 5, backgroundColor: COLORS.bordureLegere, overflow: 'hidden' },
  barreRemplie: { height: '100%', borderRadius: 5 },
  pourcentage: { fontSize: 15, fontWeight: '700', color: COLORS.texteSecondaire, minWidth: 48, textAlign: 'right' },
  sectionTitre: { fontSize: 20, fontWeight: '700', color: COLORS.texte, marginTop: 14 },
  texte: { fontSize: 15, color: COLORS.texteSecondaire },
  texteDiscret: { fontSize: 15, color: COLORS.texteDiscret, fontStyle: 'italic' },
  texteRouge: { color: COLORS.danger, fontWeight: '700' },

  boutonNav: {
    flex: 1,
    minHeight: TAILLE_TACTILE,
    backgroundColor: COLORS.primaire,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boutonNavPresse: { backgroundColor: COLORS.primairePresse },
  boutonNavTexte: { color: '#fff', fontSize: 16, fontWeight: '600' },

  carte: {
    backgroundColor: COLORS.carte,
    borderRadius: 12,
    padding: 14,
    gap: 4,
    borderWidth: 1,
    borderColor: COLORS.bordureLegere,
  },
  carteDepassee: { borderColor: COLORS.danger, borderWidth: 2, backgroundColor: COLORS.dangerFond },
  carteTitre: { fontSize: 17, fontWeight: '600', color: COLORS.texte },
  statutOk: { color: COLORS.succes, fontWeight: '700', fontSize: 15 },
  statutDepasse: { color: COLORS.danger, fontWeight: '800', fontSize: 15 },
  statutNonSuivi: { color: COLORS.texteDiscret, fontWeight: '700', fontSize: 13 },

  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    minHeight: TAILLE_TACTILE,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.primaire,
    backgroundColor: COLORS.carte,
    borderRadius: 22,
    paddingHorizontal: 16,
  },
  chipActif: { backgroundColor: COLORS.primaire },
  chipTexte: { fontSize: 15, color: COLORS.primaire },
  chipTexteActif: { color: '#fff', fontWeight: '600' },

  vide: { textAlign: 'center', color: COLORS.texteDiscret, fontSize: 16, marginTop: 24 },
  depense: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.carte,
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  depenseInfos: { flex: 1, gap: 2 },
  depenseMontant: { fontSize: 17, fontWeight: '700', color: COLORS.texte },
  boutonSupprimer: {
    minHeight: TAILLE_TACTILE,
    justifyContent: 'center',
    backgroundColor: COLORS.danger,
    borderRadius: 8,
    paddingHorizontal: 14,
  },
  boutonSupprimerPresse: { backgroundColor: COLORS.dangerPresse },
  boutonSupprimerTexte: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
