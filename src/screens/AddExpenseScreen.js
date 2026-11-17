import { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet } from 'react-native';

import { useBudget } from '../context/BudgetContext';
import { CATEGORIES } from '../models/models';
import { formatDate } from '../utils/format';
import { COLORS, TAILLE_TACTILE } from '../theme';

// Vérifie le formulaire.
// Retourne un objet d'erreurs { montant?, categorie? } : vide si tout est valide.
function validerFormulaire(montantTexte, categorie) {
  const erreurs = {};
  const montant = Number(montantTexte);
  // Montant invalide si : champ vide, pas un nombre, ou inférieur/égal à 0.
  if (montantTexte.trim() === '' || Number.isNaN(montant) || montant <= 0) {
    erreurs.montant = 'Montant invalide';
  }
  // Une catégorie doit avoir été choisie.
  if (categorie === null) {
    erreurs.categorie = 'Choisissez une catégorie';
  }
  return erreurs;
}

// Écran d'ajout d'une dépense : montant + catégorie, la date est celle du jour.
export default function AddExpenseScreen({ navigation }) {
  const { addExpense } = useBudget();

  const [montant, setMontant] = useState(''); // texte saisi dans le champ montant
  const [categorie, setCategorie] = useState(null); // catégorie choisie (null = aucune)
  const [erreurs, setErreurs] = useState({}); // messages d'erreur à afficher

  function handleMontantChange(texte) {
    setMontant(texte);
    setErreurs((prev) => ({ ...prev, montant: undefined })); // efface l'erreur du champ modifié
  }

  function handleChoixCategorie(cat) {
    setCategorie(cat);
    setErreurs((prev) => ({ ...prev, categorie: undefined }));
  }

  function handleAjouter() {
    // Le clavier iPhone en français tape une virgule : "12,5" devient "12.5".
    const montantTexte = montant.replace(',', '.');
    const nouvellesErreurs = validerFormulaire(montantTexte, categorie);
    setErreurs(nouvellesErreurs);

    // S'il y a au moins une erreur, on n'enregistre rien.
    if (Object.keys(nouvellesErreurs).length > 0) {
      return;
    }

    // Formulaire valide : on enregistre (la date du jour est ajoutée par createDepense).
    addExpense({ montant: Number(montantTexte), categorie });

    // Réinitialisation du formulaire puis retour à l'accueil.
    setMontant('');
    setCategorie(null);
    setErreurs({});
    navigation.navigate('Accueil');
  }

  return (
    <ScrollView
      style={styles.ecran}
      contentContainerStyle={styles.contenu}
      keyboardShouldPersistTaps="handled" // les boutons répondent même clavier ouvert
      automaticallyAdjustKeyboardInsets // iOS : le clavier ne cache pas le contenu
    >
      {/* Champ montant */}
      <Text style={styles.label}>Montant (DT)</Text>
      <TextInput
        style={[styles.input, erreurs.montant && styles.inputErreur]}
        value={montant}
        onChangeText={handleMontantChange}
        keyboardType="numeric"
        placeholder="Ex. 25"
        placeholderTextColor={COLORS.texteDiscret}
      />
      {erreurs.montant && <Text style={styles.erreur}>{erreurs.montant}</Text>}

      {/* Choix de la catégorie : une "chip" par catégorie, la sélectionnée est en bleu */}
      <Text style={styles.label}>Catégorie</Text>
      <View style={styles.chips}>
        {CATEGORIES.map((cat) => {
          const selectionnee = cat === categorie;
          return (
            <Pressable
              key={cat}
              onPress={() => handleChoixCategorie(cat)}
              style={[styles.chip, selectionnee && styles.chipSelectionnee]}
            >
              <Text style={[styles.chipTexte, selectionnee && styles.chipTexteSelectionne]}>{cat}</Text>
            </Pressable>
          );
        })}
      </View>
      {erreurs.categorie && <Text style={styles.erreur}>{erreurs.categorie}</Text>}

      {/* Date : automatique, en lecture seule */}
      <Text style={styles.label}>
        Date : aujourd'hui ({formatDate(new Date().toISOString())})
      </Text>

      <Pressable
        style={({ pressed }) => [styles.bouton, pressed && styles.boutonPresse]}
        onPress={handleAjouter}
      >
        <Text style={styles.boutonTexte}>Ajouter la dépense</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  ecran: { flex: 1, backgroundColor: COLORS.fond },
  contenu: { padding: 16, gap: 8, paddingBottom: 32 },
  label: { fontSize: 17, fontWeight: '600', color: COLORS.texte, marginTop: 14 },
  input: {
    minHeight: TAILLE_TACTILE,
    backgroundColor: COLORS.carte,
    borderWidth: 1,
    borderColor: COLORS.bordure,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 18,
    color: COLORS.texte,
  },
  inputErreur: { borderColor: COLORS.danger, borderWidth: 2 },
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
  chipSelectionnee: { backgroundColor: COLORS.primaire },
  chipTexte: { fontSize: 15, color: COLORS.primaire },
  chipTexteSelectionne: { color: '#fff', fontWeight: '600' },
  erreur: { color: COLORS.danger, fontSize: 15, fontWeight: '600' },
  bouton: {
    minHeight: TAILLE_TACTILE + 8,
    backgroundColor: COLORS.primaire,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  boutonPresse: { backgroundColor: COLORS.primairePresse },
  boutonTexte: { color: '#fff', fontSize: 17, fontWeight: '600' },
});
