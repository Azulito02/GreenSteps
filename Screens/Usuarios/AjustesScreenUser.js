import React, { useState } from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const AjustesScreenUser = () => {
  const [isNotificaciones, setIsNotificaciones] = useState(false);
  const [idioma, setIdioma] = useState('es');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ajustes</Text>

      {/* Configuración de Notificaciones */}
      <View style={styles.setting}>
        <Text>Notificaciones</Text>
        <Switch
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={isNotificaciones ? "#f5dd4b" : "#f4f3f4"}
          onValueChange={() => setIsNotificaciones(!isNotificaciones)}
          value={isNotificaciones}
        />
      </View>

      {/* Configuración de Idioma */}
      <View style={styles.setting}>
        <Text>Idioma</Text>
        <Picker
          selectedValue={idioma}
          style={{ height: 50, width: 150 }}
          onValueChange={(itemValue) => setIdioma(itemValue)}
        >
          <Picker.Item label="Español" value="es" />
          <Picker.Item label="Inglés" value="en" />
          <Picker.Item label="Francés" value="fr" />
        </Picker>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  setting: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});

export default AjustesScreenUser;
