import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../hooks/useAuth';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ConnectionScreen from '../screens/ConnectionScreen';
import ConnectionDiagnosticsScreen from '../screens/ConnectionDiagnosticsScreen';
import MovementControlScreen from '../screens/MovementControlScreen';
import ProfileScreen from '../screens/ProfileScreen';
import CommandHistoryScreen from '../screens/CommandHistoryScreen';
import { RobotConnectionProvider } from '../context/RobotConnectionContext';
import { CommandHistoryProvider } from '../context/CommandHistoryContext';
import ConnectionStatusBadge from '../components/ConnectionStatusBadge';
import colors from '../config/colors';

const Stack = createNativeStackNavigator();

function AppStackHeaderRight() {
  return <ConnectionStatusBadge compact />;
}

function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

function AppStack() {
  return (
    <RobotConnectionProvider>
      <CommandHistoryProvider>
        <Stack.Navigator
          initialRouteName="Connection"
          screenOptions={{
            headerStyle: { backgroundColor: colors.primary },
            headerTintColor: colors.white,
            headerTitleStyle: { fontWeight: '700' },
            headerRight: () => <AppStackHeaderRight />,
          }}
        >
          <Stack.Screen
            name="Connection"
            component={ConnectionScreen}
            options={{
              headerShown: false,
              headerRight: () => null,
            }}
          />
          <Stack.Screen
            name="ConnectionDiagnostics"
            component={ConnectionDiagnosticsScreen}
            options={{ title: 'Diagnostico' }}
          />
          <Stack.Screen
            name="MovementControl"
            component={MovementControlScreen}
            options={{ title: 'Control de Movimiento' }}
          />
          <Stack.Screen
            name="CommandHistory"
            component={CommandHistoryScreen}
            options={{ title: 'Historial de Comandos' }}
          />
          <Stack.Screen
            name="Profile"
            component={ProfileScreen}
            options={{ title: 'Perfil' }}
          />
        </Stack.Navigator>
      </CommandHistoryProvider>
    </RobotConnectionProvider>
  );
}

export default function AppNavigator() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return isAuthenticated ? <AppStack /> : <AuthStack />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#07111F',
  },
});
