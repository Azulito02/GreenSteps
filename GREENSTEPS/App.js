import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Image, ImageBackground, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { doc, setDoc } from "firebase/firestore"; 
import { db } from "./bd/firebaseconfig.js";
import GreenSteps from './Screens/GreenSteps.js';
import LoginScreen from './Screens/LoginScreen.js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MapContent from './Screens/MapContent.js';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import TabNavigator from './Screens/TabNavigator.js';


const Stack = createStackNavigator();

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    const checkLoginStatus = async () => {
      const loggedIn = await AsyncStorage.getItem('usuarios');
      setIsLoggedIn(loggedIn === 'true');
      setIsLoading(false); // Cambia a false cuando termina de verificar
    };
    checkLoginStatus();
  }, []);

  if (isLoading) {
    return null; // Aquí puedes retornar una pantalla de carga si prefieres
  }
  

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={isLoggedIn ? "GreenSteps" : "Home"}>
        <Stack.Screen name="Home" component={HomeScreen} options={{headerShown: false}} />
        <Stack.Screen name="LoginScreen" component={LoginScreen} options={{title: 'Iniciar Sesión'}} />
        <Stack.Screen name="GreenSteps" component={GreenSteps} options={{title: 'GreenSteps'}} />
        <Stack.Screen name="Mapa" component={MapContent} options={{title: 'Mapa'}} />
        <Stack.Screen name="HomeTabs" component={TabNavigator} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const HomeScreen = ({ navigation }) => {
  const addUser = async () => {
    try {
      await setDoc(doc(db, "usuarios", "2"), {
        contraseña: "12345678",
        correo_electronico: "milton@gmail.com",
        foto_perfil: "milton.png",
        nombre: "Milton Augusto Oporta Lopez"
      });
      console.log("Documento agregado correctamente.");
    } catch (error) {
      console.error("Error al agregar el documento: ", error);
    }
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('./IMAGENES/atras.png')}
        style={styles.background}
      >
        <Image 
          source={require('./IMAGENES/logo0.png')} 
          style={styles.logo}
        />
        <Text style={styles.texto}>
          Green
          <Text style={styles.textBlue}>Step</Text>
        </Text>
      </ImageBackground>

      <View style={styles.topContent}>
        <Text style={styles.topText}>Crea un futuro más verde.</Text>
      </View>

      <View style={styles.bottomContent}>
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => {addUser(); navigation.navigate('GreenSteps');}}
        >
          <Text style={styles.buttonText}>Inicio</Text>
        </TouchableOpacity>
      </View>
    </View>

    
  );
};



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  background: {
    width: '100%',
    height: '80%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  logo: {
    width: 250,
    height: 250,
    marginTop: 220,
  },
  texto: {
    fontSize: 50,
    fontWeight: 'bold',
    marginTop: 50,
    color: 'turquoise',
  },
  textBlue: {
    fontSize: 50,
    fontWeight: 'bold',
    marginTop: 50,
    color: 'blue',
  },
  topContent: {
    marginTop: '120%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topText: {
    fontSize: 15,
    color: 'green',
    marginTop: '1%',
  },
  bottomContent: {
    position: 'absolute',
    bottom: 70,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#F9DBAE',
    paddingVertical: 15,
    paddingHorizontal: 85,
    borderRadius: 10,
  },
  buttonText: {
    color: 'blue',
    fontSize: 32,
    fontWeight: 'bold',
  },
});
