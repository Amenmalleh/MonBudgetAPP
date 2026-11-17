import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import DashboardScreen from './src/screens/DashboardScreen';
import AddExpenseScreen from './src/screens/AddExpenseScreen';
import BudgetsScreen from './src/screens/BudgetsScreen';
import { BudgetProvider } from './src/context/BudgetContext';

// Pile de navigation : chaque écran est empilé par-dessus le précédent.
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    // BudgetProvider rend les dépenses et budgets accessibles à tous les écrans.
    <BudgetProvider>
      <NavigationContainer>
        {/* "Accueil" est le premier écran affiché au lancement */}
        <Stack.Navigator initialRouteName="Accueil">
          <Stack.Screen name="Accueil" component={DashboardScreen} />
          <Stack.Screen name="Ajouter" component={AddExpenseScreen} />
          <Stack.Screen name="Budgets" component={BudgetsScreen} />
        </Stack.Navigator>
        <StatusBar style="auto" />
      </NavigationContainer>
    </BudgetProvider>
  );
}
