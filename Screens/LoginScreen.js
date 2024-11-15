import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Text, Alert, Image } from 'react-native';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { collection, setDoc, doc, getDoc } from 'firebase/firestore';
import { app, db } from '../bd/firebaseconfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

const auth = getAuth(app);

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState(''); // Estado para el nombre

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

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Todos los campos son obligatorios.');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Por favor ingrese un email válido.');
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid;

      const userDoc = await getDoc(doc(db, 'usuarios', userId));
      if (userDoc.exists()) {
        const role = userDoc.data().rol;
        await AsyncStorage.setItem('userLoggedIn', 'true');
        await AsyncStorage.setItem('rol', role);
        navigation.navigate('GreenSteps', { role });
      } else {
        Alert.alert('Error', 'No se encontró el rol del usuario.');
      }
    } catch (error) {
      console.error('Error al iniciar sesión: ', error);
      Alert.alert('Error', error.message);
    }
  };

  const handleCreateAccount = async (role) => {
    if (!nombre || !email || !password) {
      Alert.alert('Error', 'Todos los campos son obligatorios.');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Por favor ingrese un email válido.');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid;

      await setDoc(doc(db, 'usuarios', userId), {
        email: email,
        nombre: nombre, // Agregar el nombre
        rol: role,
      });

      await AsyncStorage.setItem('userLoggedIn', 'true');
      await AsyncStorage.setItem('rol', role);
      navigation.navigate('GreenSteps', { role });
    } catch (error) {
      console.error('Error al crear cuenta: ', error);
      Alert.alert('Error cuenta ya existente');
    }
  };

  return (
    <View style={styles.container}>
      <Image 
        source={require('../IMAGENES/logo2.png')}
        style={styles.logo}
      />
      <TextInput  
        style={styles.input}
        placeholder="Nombre"
        value={nombre}
        onChangeText={setNombre}
        placeholderTextColor="#a9a9a9"
      />
      <TextInput  
        style={styles.input}
        placeholder="Correo"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        placeholderTextColor="#a9a9a9"
      />
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholderTextColor="#a9a9a9"
      />
      
      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.buttonText}>Iniciar Sesión</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.createButton, { backgroundColor: '#4CAF50' }]} onPress={() => handleCreateAccount('usuario')}>
        <Text style={styles.buttonText}>Crear Cuenta como Usuario</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.createButton, { backgroundColor: '#FF6347' }]} onPress={() => handleCreateAccount('administrador')}>
        <Text style={styles.buttonText}>Crear Cuenta como Administrador</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f0f4f7',
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 40,
  },
  input: {
    height: 50,
    width: '100%',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  loginButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginBottom: 15,
  },
  createButton: {
    width: '100%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
