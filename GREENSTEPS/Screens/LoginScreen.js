import React, { useState } from 'react';
import { StyleSheet, View, TextInput, Button, Text, Alert } from 'react-native';
import { collection, addDoc } from "firebase/firestore";
import { db } from '../bd/firebaseconfig'; // Asegúrate de que esta ruta es correcta

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [fotoPerfil, setFotoPerfil] = useState('');

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
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
      const docRef = await addDoc(collection(db, "usuarios"), {
        email: email,
        password: password,
        name: name,
        foto_perfil: fotoPerfil
      });
      navigation.navigate('GreenSteps');
      console.log("Documento agregado correctamente con ID: ", docRef.id);
    } catch (error) {
      console.error("Error al registrar el usuario: ", error);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput  
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Foto de perfil"
        value={fotoPerfil}
        onChangeText={setFotoPerfil}
      />
      <Button title="Register" onPress={handleRegister} />
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
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 8,
  },
});
