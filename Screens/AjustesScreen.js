import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Alert, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';
import { getAuth, signOut } from 'firebase/auth';
import { app } from '../bd/firebaseconfig';

const AjustesScreen = () => {
  const navigation = useNavigation();
  const db = getFirestore(app);
  const auth = getAuth(app);

  // Estado
  const [mensaje, setMensaje] = useState('');
  const [titulo, setTitulo] = useState('');
  const [isSending, setIsSending] = useState(false);

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
      Alert.alert('Error', 'No se pudo enviar la notificación.');
    } finally {
      setIsSending(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.reset({
        index: 0,
        routes: [{ name: 'LoginScreen' }],
      });
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      Alert.alert('Error', 'No se pudo cerrar sesión.');
    }
  };

  const goToEstadisticas = () => navigation.navigate('HomeTabs', { screen: 'Estadísticas' });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Ajustes</Text>

      <TouchableOpacity style={styles.statsButton} onPress={goToEstadisticas}>
        <Icon name="stats-chart" size={20} color="#fff" style={styles.icon} />
        <Text style={styles.buttonText}>Ir a Estadísticas</Text>
      </TouchableOpacity>

      {/* Formulario de notificaciones */}
      <Text style={styles.subTitle}>Enviar Notificación</Text>
      <TextInput
        style={[styles.input, styles.multilineInput]}
        placeholder="Título"
        value={titulo}
        onChangeText={setTitulo}
      />
      <TextInput
        style={[styles.input, styles.multilineInput]}
        placeholder="Mensaje"
        value={mensaje}
        onChangeText={setMensaje}
        multiline={true}
        numberOfLines={4}
      />
      <TouchableOpacity style={styles.button} onPress={handleSendNotification} disabled={isSending}>
        <Text style={styles.buttonText}>{isSending ? 'Enviando...' : 'Enviar Notificación'}</Text>
      </TouchableOpacity>
      {isSending && <ActivityIndicator size="large" color="#0000ff" />}

      {/* Botón de cerrar sesión */}
      <TouchableOpacity style={[styles.buttonsession, { backgroundColor: '#dc3545' }]} onPress={handleLogout}>
        <Text style={styles.buttonText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  subTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  input: {
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    width: '100%',
    paddingHorizontal: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  multilineInput: {
    height: 100, // Altura para mensajes largos
    textAlignVertical: 'top', // Alinea el texto al principio
  },
  button: {
    backgroundColor: '#28a745',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  buttonsession: {
    backgroundColor: '#28a745',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
    width: '50%',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  statsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007bff', // Color azul
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    width: '50%',
  },
  icon: {
    marginRight: 8, // Separación entre el ícono y el texto
  },
});

export default AjustesScreen;
