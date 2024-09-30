import React, { useState } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, TextInput, FlatList, Button, ActivityIndicator } from 'react-native';
import { Video } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';
import { getApp } from 'firebase/app';  // Importa Firebase App

// Inicializa Firebase (asegúrate de tener la configuración de Firebase en otro archivo o en este)
const app = getApp();  // Obtén la instancia de la app Firebase
const firestore = getFirestore(app);  // Inicializa Firestore
const storage = getStorage(app);  // Inicializa Storage

const ReportContent = () => {
  const [media, setMedia] = useState([]);
  const [descripcion, setDescripcion] = useState('');
  const [titulo, setTitulo] = useState('');
  const [estado, setEstado] = useState('');
  const [comentario, setComentario] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const pickMedia = async () => {
    setIsLoading(true);
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: true,
      selectionLimit: 10,
      aspect: [4, 3],
      quality: 1,
    });

    setIsLoading(false);

    if (!result.canceled) {
      setMedia(result.assets || []);
    }
  };

  const uploadMedia = async (uri, type) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const filename = `${Date.now()}_${type}`;
      const storageRef = ref(storage, `media/${filename}`);
      await uploadBytes(storageRef, blob);
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error("Error al subir archivo a Firebase Storage: ", error);
      throw error;
    }
  };
  
  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      let fotoURL = '';
      let videoURL = '';

      // Subir imágenes y videos a Firebase Storage
      for (const item of media) {
        if (item.type === 'image') {
          fotoURL = await uploadMedia(item.uri, 'image');
        } else if (item.type === 'video') {
          videoURL = await uploadMedia(item.uri, 'video');
        }
      }

      // Guardar datos en Firestore
      await addDoc(collection(firestore, 'reportes'), {
        descripcion,
        titulo,
        estado,
        fecha_reportes: Timestamp.now(),  // Genera la fecha automáticamente
        foto: fotoURL,
        video: videoURL,
        comentario
      });

      alert('Reporte enviado exitosamente.');
      setDescripcion('');
      setTitulo('');
      setComentario('');
      setIsLoading(false);
    } catch (error) {
      console.error("Error al subir datos: ", error);
      alert(`Error al subir datos: ${error.message}`);
      setIsLoading(false);
    }
  };

  const renderItem = ({ item }) => {
    if (item.type === 'image') {
      return <Image source={{ uri: item.uri }} style={{ width: 300, height: 300 }} />;
    } else if (item.type === 'video') {
      return (
        <Video
          source={{ uri: item.uri }}
          style={{ width: 300, height: 300 }}
          useNativeControls
          resizeMode="contain"
          isLooping
        />
      );
    } else {
      return null;
    }
  };

  return (
    <View>
      <TextInput
        style={styles.input}
        placeholder="Título"
        value={titulo}
        onChangeText={setTitulo}
      />
      <TextInput
        style={styles.input}
        placeholder="Descripción"
        value={descripcion}
        onChangeText={setDescripcion}
      />
      <TextInput
        style={styles.input}
        placeholder="Comentario"
        value={comentario}
        onChangeText={setComentario}
      />
      <TextInput
        style={styles.input}
        placeholder="Estado"
        value={estado}
        onChangeText={setEstado}
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Enviar Reporte</Text>
      </TouchableOpacity>

      <Button title="Agregar Imagen o Video" onPress={pickMedia} />
      {isLoading && <ActivityIndicator size="large" color="#0000ff" />}
      
      <FlatList
        data={media}
        renderItem={renderItem}
        keyExtractor={(item) => item.uri}
        contentContainerStyle={{ marginVertical: 50, paddingBottom: 100 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    width: '100%',
    paddingHorizontal: 10,
  },
  button: {
    backgroundColor: '#008000',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
  },
});

export default ReportContent;
