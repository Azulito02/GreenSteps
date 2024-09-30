import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';

const SettingsContent = () => (
  <View style={styles.contentContainer}>
    <Text style={styles.contentText}>Configuración de la App</Text>
    <TouchableOpacity style={styles.button} onPress={() => alert('Configuración guardada')}>
      <Text style={styles.buttonText}>Guardar configuración</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  contentText: {
    fontSize: 18,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default SettingsContent;
