import React, { useState, useEffect } from 'react';
import { View, Text, Switch, StyleSheet, TouchableOpacity, Image, TextInput, Button, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import { getFirestore, doc, getDoc, collection, addDoc, Timestamp } from 'firebase/firestore';
import { app } from '../bd/firebaseconfig';

const AjustesScreen = () => {
  const navigation = useNavigation(); // Para manejar la navegación
  const db = getFirestore(app);

  // Estado para los ajustes
  const [foto, setFoto] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNotificaciones, setIsNotificaciones] = useState(false);
  const [idioma, setIdioma] = useState('es');

  // Estado para el formulario de notificaciones
  const [mensaje, setMensaje] = useState('');
  const [titulo, setTitulo] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Obtener foto de perfil
  useEffect(() => {
    const fetchProfileImage = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'usuarios', 'id')); // Reemplaza 'id' con el ID real del usuario
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

  // Manejo del envío de notificaciones
  const handleSendNotification = async () => {
    if (!mensaje || !titulo) {
      Alert.alert('Error', 'Por favor, completa todos los campos.');
      return;
    }

    try {
      setIsSending(true);
      await addDoc(collection(db, 'notificaciones'), {
        mensaje,
        titulo,
        fecha_creacion: Timestamp.now(),
      });
      Alert.alert('Éxito', 'Notificación enviada exitosamente.');
      setMensaje('');
      setTitulo('');
    } catch (error) {
      console.error('Error al enviar la notificación:', error);
      Alert.alert('Error', `No se pudo enviar la notificación: ${error.message}`);
    } finally {
      setIsSending(false);
    }
  };

  const goToEstadisticas = () => {
    navigation.navigate('HomeTabs', { screen: 'Estadísticas' });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Ajustes</Text>

      {/* Foto de perfil */}
      <TouchableOpacity>
        {isLoading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <Image source={{ uri: foto }} style={styles.profileImage} />
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

      {/* Botón para ir a estadísticas */}
      <Button title="Ir a Estadísticas" onPress={goToEstadisticas} />

      {/* Formulario de notificaciones */}
      <Text style={styles.subTitle}>Enviar Notificación</Text>
      <TextInput
        style={styles.input}
        placeholder="Título"
        value={titulo}
        onChangeText={setTitulo}
      />
      <TextInput
        style={styles.input}
        placeholder="Mensaje"
        value={mensaje}
        onChangeText={setMensaje}
      />
      <TouchableOpacity style={styles.button} onPress={handleSendNotification} disabled={isSending}>
        <Text style={styles.buttonText}>
          {isSending ? 'Enviando...' : 'Enviar Notificación'}
        </Text>
      </TouchableOpacity>
      {isSending && <ActivityIndicator size="large" color="#0000ff" />}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  subTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  profileImage: {
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
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    width: '100%',
    paddingHorizontal: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#28a745',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default AjustesScreen;
