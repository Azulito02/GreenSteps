import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TextInput, Button, Alert, Image } from 'react-native';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { app } from '../bd/firebaseconfig';
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

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('Error', 'Todos los campos son obligatorios.');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Por favor ingrese un email válido.');
      return;
    }

    signInWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        console.log('Signed in!');
        await AsyncStorage.setItem('userLoggedIn', 'true');
        const role = 'usuario'; // Puedes definir el rol aquí o recuperarlo de Firebase
        await AsyncStorage.setItem('rol', role);
        navigation.navigate('GreenSteps', { role });
      })
      .catch((error) => {
        console.log(error);
        Alert.alert(error.message);
      });
  };

  const handleCreateAccount = (role) => {
    if (!email || !password) {
      Alert.alert('Error', 'Todos los campos son obligatorios.');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Por favor ingrese un email válido.');
      return;
    }

    createUserWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        console.log('Account created!');
        await AsyncStorage.setItem('userLoggedIn', 'true');
        await AsyncStorage.setItem('rol', role); // Guardar el rol (usuario o administrador)
        navigation.navigate('GreenSteps', { role });
      })
      .catch((error) => {
        console.log(error);
        Alert.alert(error.message);
      });
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
