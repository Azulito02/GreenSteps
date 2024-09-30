import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, TextInput, FlatList, Button, ActivityIndicator } from 'react-native';
import { Video } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirestore, collection, addDoc, getDocs, Timestamp } from 'firebase/firestore';
import { getApp } from 'firebase/app';

const app = getApp();
const firestore = getFirestore(app);
const storage = getStorage(app);

const ReportContent = () => {
  const [media, setMedia] = useState([]);
  const [descripcion, setDescripcion] = useState('');
  const [titulo, setTitulo] = useState('');
  const [estado, setEstado] = useState('');
  const [comentario, setComentario] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [reportes, setReportes] = useState([]);
  const [isViewingReportes, setIsViewingReportes] = useState(true); // Estado para alternar entre vistas

  useEffect(() => {
    fetchReportes();
  }, []);

  // Función para recuperar los reportes de Firestore
  const fetchReportes = async () => {
    try {
      const querySnapshot = await getDocs(collection(firestore, 'reportes'));
      const reportesArray = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setReportes(reportesArray);
    } catch (error) {
      console.error('Error al obtener los reportes: ', error);
    }
  };

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

      for (const item of media) {
        if (item.type === 'image') {
          fotoURL = await uploadMedia(item.uri, 'image');
        } else if (item.type === 'video') {
          videoURL = await uploadMedia(item.uri, 'video');
        }
      }

      await addDoc(collection(firestore, 'reportes'), {
        descripcion,
        titulo,
        estado,
        fecha_reportes: Timestamp.now(),
        foto: fotoURL,
        video: videoURL,
        comentario,
      });

      alert('Reporte enviado exitosamente.');
      setDescripcion('');
      setTitulo('');
      setComentario('');
      setMedia([]);
      fetchReportes(); // Actualiza la lista de reportes después de subir uno nuevo
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

  const renderReporte = ({ item }) => (
    <View style={styles.reporteItem}>
      <Text>Título: {item.titulo}</Text>
      <Text>Descripción: {item.descripcion}</Text>
      {item.foto && <Image source={{ uri: item.foto }} style={{ width: 100, height: 100 }} />}
      {item.video && (
        <Video
          source={{ uri: item.video }}
          style={{ width: 100, height: 100 }}
          useNativeControls
          resizeMode="contain"
          isLooping
        />
      )}
      <Text>Estado: {item.estado}</Text>
      <Text>Comentario: {item.comentario}</Text>
      <Text>Fecha: {item.fecha_reportes.toDate().toString()}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.toggleButton}
        onPress={() => setIsViewingReportes(!isViewingReportes)}
      >
        <Text style={styles.toggleButtonText}>
          {isViewingReportes ? 'Agregar Reporte' : 'Ver Reportes'}
        </Text>
      </TouchableOpacity>

      {isViewingReportes ? (
        <View>
          <Text style={styles.sectionTitle}>Top Reportes</Text>
          <FlatList
            data={reportes}
            renderItem={renderReporte}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 100 }}
          />
        </View>
      ) : (
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
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 20,
  },
  reporteItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 10,
  },
  toggleButton: {
    backgroundColor: '#008000',
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
    alignItems: 'center',
  },
  toggleButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default ReportContent;
