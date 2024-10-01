import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, TextInput, FlatList, Button, ActivityIndicator } from 'react-native';
import { Video } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirestore, collection, addDoc, getDocs, Timestamp } from 'firebase/firestore';
import { getApp } from 'firebase/app';
import Icon from 'react-native-vector-icons/Ionicons'; // Agregar esta línea

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
  const [isViewingReportes, setIsViewingReportes] = useState(true);

  useEffect(() => {
    fetchReportes();
  }, []);

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
      fetchReportes();
      setIsLoading(false);
    } catch (error) {
      console.error("Error al subir datos: ", error);
      alert(`Error al subir datos: ${error.message}`);
      setIsLoading(false);
    }
  };

  const renderItem = ({ item }) => {
    if (item.type === 'image') {
      return <Image source={{ uri: item.uri }} style={styles.mediaItem} />;
    } else if (item.type === 'video') {
      return (
        <Video
          source={{ uri: item.uri }}
          style={styles.mediaItem}
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
      <Text style={styles.reporteTitle}>{item.titulo}</Text>
      <Text style={styles.reporteText}>{item.descripcion}</Text>
      {item.foto && <Image source={{ uri: item.foto }} style={styles.reporteImage} />}
      {item.video && (
        <Video
          source={{ uri: item.video }}
          style={styles.reporteImage}
          useNativeControls
          resizeMode="contain"
          isLooping
        />
      )}
      <Text style={styles.reporteText}>Estado: {item.estado}</Text>
      <Text style={styles.reporteText}>Comentario: {item.comentario}</Text>
      <Text style={styles.reporteDate}>Fecha: {item.fecha_reportes.toDate().toString()}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {isViewingReportes ? (
        <View>
          <Text style={styles.sectionTitle}>Top Reportes</Text>
          <FlatList
            data={reportes}
            renderItem={renderReporte}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.reporteList}
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
            contentContainerStyle={styles.mediaList}
          />
        </View>
      )}

      {/* Botón circular flotante */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => setIsViewingReportes(!isViewingReportes)}
      >
        <Icon name="add-circle" size={60} color="#007bff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f0f0f0',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    width: '100%',
    paddingHorizontal: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#28a745',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  reporteItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },
  reporteTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  reporteText: {
    fontSize: 14,
    marginBottom: 5,
    color: '#555',
  },
  reporteImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
  },
  reporteDate: {
    fontSize: 12,
    color: '#888',
  },
  mediaItem: {
    width: 300,
    height: 300,
    borderRadius: 10,
    marginVertical: 10,
  },
  mediaList: {
    paddingBottom: 100,
  },
  reporteList: {
    paddingBottom: 100,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 50,
    right: 1,
    justifyContent: 'center',
    alignItems: 'center',
},
});

export default ReportContent;
