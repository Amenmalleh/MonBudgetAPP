import { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet } from 'react-native';

import { useBudget } from '../context/BudgetContext';
import { CATEGORIES } from '../models/models';
import { formatMontant } from '../utils/format';
import { COLORS, TAILLE_TACTILE } from '../theme';

// Vérifie la saisie du plafond.
// Retourne un message d'erreur (texte) si la saisie est invalide, sinon null.
function validerPlafond(texte) {
  if (texte.trim() === '') {
    return 'Veuillez saisir un plafond.';
  }
  const valeur = Number(texte);
  if (Number.isNaN(valeur)) {
    return 'Le plafond doit être un nombre.';
  }
  if (valeur <= 0) {
    return 'Le plafond doit être supérieur à 0.';
  }
  return null; // aucune erreur
}

// Une ligne de l'écran : une catégorie, son champ de saisie et son bouton.
// Chaque ligne garde sa propre saisie et son propre message.
function BudgetRow({ categorie, plafondActuel, onDefinir }) {
  // Champ pré-rempli avec le plafond déjà enregistré (sinon vide).
  const [saisie, setSaisie] = useState(plafondActuel !== undefined ? String(plafondActuel) : '');
  // Message affiché sous la ligne : { type: 'erreur' | 'succes', texte } ou null.
  const [message, setMessage] = useState(null);

  function handleChange(texte) {
    setSaisie(texte);
    setMessage(null); // on efface l'ancien message dès que l'utilisateur modifie la saisie
  }

  function handleDefinir() {
    // Le clavier iPhone en français tape une virgule : "12,5" devient "12.5".
    const texte = saisie.replace(',', '.');
    const erreur = validerPlafond(texte);
    if (erreur !== null) {
      setMessage({ type: 'erreur', texte: erreur }); // saisie invalide : on ne sauvegarde pas
      return;
    }
    onDefinir(categorie, Number(texte));
    setMessage({ type: 'succes', texte: 'Budget enregistré ✓' });
  }

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.categorie}>{categorie}</Text>
        <Text style={styles.plafondActuel}>
          {plafondActuel !== undefined ? `Plafond : ${formatMontant(plafondActuel)}` : 'Non défini'}
        </Text>
      </View>

      <View style={styles.inputRow}>
        <TextInput
          style={[styles.input, message?.type === 'erreur' && styles.inputErreur]}
          value={saisie}
          onChangeText={handleChange}
          keyboardType="numeric"
          placeholder="Plafond mensuel"
          placeholderTextColor={COLORS.texteDiscret}
          returnKeyType="done"
          onSubmitEditing={handleDefinir}
        />
        <Pressable
          style={({ pressed }) => [styles.bouton, pressed && styles.boutonPresse]}
          onPress={handleDefinir}
        >
          <Text style={styles.boutonTexte}>Définir</Text>
        </Pressable>
      </View>

      {message !== null && (
        <Text style={message.type === 'erreur' ? styles.erreur : styles.succes}>{message.texte}</Text>
      )}
    </View>
  );
}

// Écran Budgets : l'utilisateur fixe un plafond mensuel pour chaque catégorie.
export default function BudgetsScreen() {
  const { budgets, loading, setBudget } = useBudget();

  if (loading) {
    return (
      <View style={styles.centre}>
        <Text style={styles.intro}>Chargement…</Text>
      </View>
    );
  }

  // Retrouve le plafond enregistré pour une catégorie (undefined s'il n'existe pas).
  function plafondDe(categorie) {
    const budget = budgets.find((b) => b.categorie === categorie);
    return budget ? budget.plafond : undefined;
  }

  return (
    <ScrollView
      style={styles.ecran}
      contentContainerStyle={styles.contenu}
      keyboardShouldPersistTaps="handled" // le bouton "Définir" répond même clavier ouvert
      automaticallyAdjustKeyboardInsets // iOS : le clavier ne cache pas le champ en cours
    >
      <Text style={styles.intro}>Fixez un plafond mensuel pour chaque catégorie.</Text>
      {CATEGORIES.map((categorie) => (
        <BudgetRow
          key={categorie}
          categorie={categorie}
          plafondActuel={plafondDe(categorie)}
          onDefinir={setBudget}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  ecran: { flex: 1, backgroundColor: COLORS.fond },
  contenu: { padding: 16, gap: 12, paddingBottom: 32 },
  centre: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.fond },
  intro: { fontSize: 16, color: COLORS.texteSecondaire },
  card: {
    backgroundColor: COLORS.carte,
    borderRadius: 12,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: COLORS.bordureLegere,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  categorie: { fontSize: 17, fontWeight: '600', color: COLORS.texte },
  plafondActuel: { fontSize: 15, color: COLORS.texteSecondaire },
  inputRow: { flexDirection: 'row', gap: 8 },
  input: {
    flex: 1,
    minHeight: TAILLE_TACTILE,
    borderWidth: 1,
    borderColor: COLORS.bordure,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    color: COLORS.texte,
    backgroundColor: COLORS.carte,
  },
  inputErreur: { borderColor: COLORS.danger, borderWidth: 2 },
  bouton: {
    minHeight: TAILLE_TACTILE,
    backgroundColor: COLORS.primaire,
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  boutonPresse: { backgroundColor: COLORS.primairePresse },
  boutonTexte: { color: '#fff', fontSize: 16, fontWeight: '600' },
  erreur: { color: COLORS.danger, fontSize: 15, fontWeight: '600' },
  succes: { color: COLORS.succes, fontSize: 15, fontWeight: '600' },
});
