import React, { useState, useEffect } from 'react';
import { Button, Image, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

export default function ImagePickerComponent() {
    const [selectedImage, setSelectedImage] = useState(null);
    const [result, setResult] = useState(null);
  
    // Pedir permisos para acceder a la cámara y la galería al iniciar la app
    useEffect(() => {
      (async () => {
        const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
        const mediaLibraryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (cameraStatus.status !== 'granted' || mediaLibraryStatus.status !== 'granted') {
          alert('Se requieren permisos para usar la cámara y la galería.');
        }
      })();
    }, []);
  
    // Función para tomar una foto usando la cámara
    const takePhoto = async () => {
      let result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
  
      if (!result.canceled) {
        setSelectedImage(result.assets[0].uri);
        analyzeImage(result.assets[0].uri);
      }
    };
  
    // Función para analizar la imagen tomada o seleccionada
    const analyzeImage = async (imageUri) => {
      try {
        const base64 = await getBase64(imageUri);
        
        const apiKey = 'AIzaSyCmaQTu8gDQAPjW9fRxjrqWEUHtSYZyjfc';  
    
        const response = await axios.post(
          `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
          {
            requests: [
              {
                image: {
                  content: base64,
                },
                features: [
                  { type: 'LABEL_DETECTION', maxResults: 5 },
                ],
                imageContext: {
                  languageHints: ["fr"],  // Aquí especificamos que el idioma preferido es español
                },
              },
            ],
          }
        );
    
        const labels = response.data.responses[0].labelAnnotations.map(
          (label) => label.description
        );
        setResult(labels.join(', '));
      } catch (error) {
        console.error('Error al analizar la imagen:', error.response?.data || error.message);
      }
    };
    
    // Función para convertir la imagen en Base64
    const getBase64 = async (uri) => {
      const response = await fetch(uri);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result.split(',')[1];  // Separa la cabecera 'data:' del contenido real.
          resolve(base64String);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    };
    
  
    return (
      <View style={styles.container}>
        <Button title="Tomar Foto" onPress={takePhoto} />
        {selectedImage && <Image source={{ uri: selectedImage }} style={styles.image} />}
        {result && <Text style={styles.result}>Resultados: {result}</Text>}
      </View>
    );
  }
  
const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    image: {
      width: 300,
      height: 300,
      marginTop: 20,
    },
    result: {
      marginTop: 20,
      fontSize: 18,
      textAlign: 'center',
    },
});
