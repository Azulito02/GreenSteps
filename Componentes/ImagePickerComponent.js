import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
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
              features: [{ type: 'LABEL_DETECTION', maxResults: 5 }],
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
        const base64String = reader.result.split(',')[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Analizador de Imágenes</Text>

      <TouchableOpacity style={styles.button} onPress={takePhoto}>
        <Text style={styles.buttonText}>Tomar Foto</Text>
      </TouchableOpacity>

      {selectedImage && (
        <Image source={{ uri: selectedImage }} style={styles.image} />
      )}

      {result && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Resultados:</Text>
          <Text style={styles.resultText}>{result}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f9fc', // Fondo suave y claro
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#4CAF50', // Verde moderno
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5, // Sombra para Android
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  image: {
    width: 320,
    height: 240,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#4CAF50',
    marginVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  resultContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    marginTop: 20,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  resultText: {
    fontSize: 16,
    color: '#555',
    lineHeight: 22,
  },
});
