import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TextInput, Button, Alert, Image } from 'react-native';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { collection, setDoc, doc, getDoc } from 'firebase/firestore';
import { app, db } from '../bd/firebaseconfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

const auth = getAuth(app);

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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
    if (!email || !password) {
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
        rol: role,
      });

      await AsyncStorage.setItem('userLoggedIn', 'true');
      await AsyncStorage.setItem('rol', role);
      navigation.navigate('GreenSteps', { role });
    } catch (error) {
      console.error('Error al crear cuenta: ', error);
      Alert.alert('Error', error.message);
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
      <Button title="Iniciar Sesión" onPress={handleLogin} />
      <Button title="Crear Cuenta como Administrador" onPress={() => handleCreateAccount('administrador')} color="red" />
      <Button title="Crear Cuenta como Usuario" onPress={() => handleCreateAccount('usuario')} color="green" />
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
});
