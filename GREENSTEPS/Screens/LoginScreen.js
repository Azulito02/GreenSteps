import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TextInput, Button, Alert, Image } from 'react-native';
import { collection, addDoc, getDoc, doc } from 'firebase/firestore';
import { db } from '../bd/firebaseconfig';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Asegúrate de instalar esta librería
import * as ImagePicker from 'expo-image-picker';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('usuario'); // 'usuario' o 'administrador'
  const [fotoPerfil, setFotoPerfil] = useState(null);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const userLoggedIn = await AsyncStorage.getItem('userLoggedIn');
      const userRole = await AsyncStorage.getItem('rol');
      if (userLoggedIn && userRole) {
        navigation.navigate('GreenSteps', { role: userRole });
      }
    } catch (error) {
      console.error('Error al verificar el estado de login: ', error);
    }
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Se requieren permisos para acceder a la biblioteca de imágenes.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setFotoPerfil(result.assets[0].uri);
    }
  };

  const handleRegister = async () => {
    if (!email || !password || !name || !fotoPerfil) {
      Alert.alert('Error', 'Todos los campos son obligatorios.');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Por favor ingrese un email válido.');
      return;
    }

    try {
      const docRef = await addDoc(collection(db, 'usuarios'), {
        email: email,
        password: password,
        name: name,
        foto_perfil: fotoPerfil,
        rol: role, // Guardar el rol asignado
      });

      // Guardar los detalles de la sesión
      await AsyncStorage.setItem('userLoggedIn', 'true');
      await AsyncStorage.setItem('rol', role);
      navigation.navigate('GreenSteps', { role });

      console.log('Documento agregado correctamente con ID: ', docRef.id);
    } catch (error) {
      console.error('Error al registrar el usuario: ', error);
    }
  };

  return (
    <View style={styles.container}>
      <Image 
        source={require('../IMAGENES/logo2.png')}
        style={styles.logo}
      />
      {fotoPerfil && (
        <Image source={{ uri: fotoPerfil }} style={styles.profileImage} />
      )}
      <Button title="Seleccionar Foto de Perfil" onPress={pickImage} />
      <TextInput  
        style={styles.input}
        placeholder="Correo"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder="Nombre"
        value={name}
        onChangeText={setName}
      />
      <Button title="Registrar como Administrador" onPress={() => setRole('administrador')} />
      <Button title="Registrar como Usuario" onPress={() => setRole('usuario')} />
      <Button title="Iniciar Sesion" onPress={handleRegister} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  logo: {
    width: 200,
    height: 119,
    alignSelf: 'center',
    marginBottom: 40,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 8,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
    marginBottom: 20,
  },
});
