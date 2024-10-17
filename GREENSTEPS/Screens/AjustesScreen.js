// src/screens/AjustesScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, Switch, StyleSheet, TouchableOpacity, Image, Button, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { app } from '../bd/firebaseconfig';
import EstadisticasScreen from './EstadisticasScreen';



const AjustesScreen = () => {
  const navigation = useNavigation();
  const goToEstadisticas = () => {
    navigation.navigate('HomeTabs', { screen: 'Estadísticas' });
  };
  const db = getFirestore(app);
  const [foto, setFoto] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isNotificaciones, setIsNotificaciones] = useState(false);
  const [idioma, setIdioma] = useState('es');

  useEffect(() => {
    const fetchProfileImage = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'usuarios', 'id')); // Reemplaza 'userId' por el ID del usuario actual
        if (userDoc.exists()) {
          const data = userDoc.data();
          setFoto(data.foto); // Suponiendo que el campo es 'foto'
        }
      } catch (error) {
        console.error('Error al obtener la foto de perfil:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfileImage();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ajustes</Text>
      <Button title="Ir a Estadísticas" onPress={goToEstadisticas} />
      {/* Foto de perfil */}
      <TouchableOpacity onPress={() => navigation.navigate('Estadísticas')}>
        {isLoading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <Image source={{ uri: foto }} style={styles.profileImage}

          />
        )}
      </TouchableOpacity>

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
  profileImage: { // Cambiado el nombre de 'foto' a 'profileImage'
    width: 100,
    height: 100,
    borderRadius: 50,
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

export default AjustesScreen;
