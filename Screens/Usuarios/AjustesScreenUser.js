import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { getAuth, signOut } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';

const AjustesScreenUser = () => {
  const navigation = useNavigation();
  const auth = getAuth();

  // Manejar el cierre de sesión
  const handleLogout = async () => {
    try {
      await signOut(auth); // Cerrar sesión en Firebase
      console.log('Sesión cerrada correctamente');
      navigation.navigate('LoginScreen'); // Navegar a la pantalla de Login
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      Alert.alert('Error', 'No se pudo cerrar sesión.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ajustes</Text>

      {/* Botón de cerrar sesión */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  logoutButton: {
    marginTop: 40,
    backgroundColor: '#dc3545', // Rojo
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AjustesScreenUser;
