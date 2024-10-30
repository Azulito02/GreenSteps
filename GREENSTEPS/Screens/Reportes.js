import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Button, Modal, FlatList, Alert, ActivityIndicator, Image } from 'react-native';
import { getFirestore, collection, getDocs, doc,addDoc,Timestamp, updateDoc, deleteDoc } from 'firebase/firestore';
import { getApp } from 'firebase/app';
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import Icon from 'react-native-vector-icons/Ionicons'; // Agregar esta línea
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import { Video } from 'expo-av';

const app = getApp();
const firestore = getFirestore(app);
const storage = getStorage(app);

const EditModal = ({ visible, onClose, reporte, onSave }) => {
  const [editTitulo, setEditTitulo] = useState(reporte?.titulo || '');
  const [editDescripcion, setEditDescripcion] = useState(reporte?.descripcion || '');
  const [editEstado, setEditEstado] = useState(reporte?.estado || '');
  const [editComentario, setEditComentario] = useState(reporte?.comentario || '');
  const [newPhoto, setNewPhoto] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (reporte) {
      setEditTitulo(reporte.titulo);
      setEditDescripcion(reporte.descripcion);
      setEditEstado(reporte.estado);
      setEditComentario(reporte.comentario);
    }
  }, [reporte]);

  const pickNewPhoto = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: false,
        quality: 1,
      });

      if (!result.canceled) {
        setNewPhoto(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Error", "No se pudo seleccionar la imagen");
    }
  };

  const uploadNewPhoto = async () => {
    if (!newPhoto) return null;

    const response = await fetch(newPhoto);
    const blob = await response.blob();
    const filename = `${Date.now()}_updated_image`;
    const storageRef = ref(storage, `media/${filename}`);
    await uploadBytes(storageRef, blob);
    return await getDownloadURL(storageRef);
  };

  const handleSave = async () => {
    if (!editTitulo || !editDescripcion) {
      Alert.alert("Error", "Por favor, complete todos los campos requeridos");
      return;
    }
    setIsLoading(true);
    try {
      const updatedPhotoURL = await uploadNewPhoto();
      const updatedReporte = {
        ...reporte,
        titulo: editTitulo,
        descripcion: editDescripcion,
        estado: editEstado,
        comentario: editComentario,
        foto: updatedPhotoURL || reporte.foto,
      };

      onSave(updatedReporte);
      onClose();
    } catch (error) {
      Alert.alert('Error', `Error al guardar cambios: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Editar Reporte</Text>

          <TextInput style={styles.input} placeholder="Título" value={editTitulo} onChangeText={setEditTitulo} />
          <TextInput style={styles.input} placeholder="Descripción" value={editDescripcion} onChangeText={setEditDescripcion} />
          <TextInput style={styles.input} placeholder="Estado" value={editEstado} onChangeText={setEditEstado} />

          <View style={styles.estadoContainer}>
            <TouchableOpacity 
              style={[styles.estadoButton, editEstado === 'Grave' && styles.estadoButtonSelected]}
              onPress={() => setEditEstado('Grave')}
            >
              <Text style={styles.estadoButtonText}>Grave</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.estadoButton, editEstado === 'Leve' && styles.estadoButtonSelected]}
              onPress={() => setEditEstado('Leve')}
            >
              <Text style={styles.estadoButtonText}>Leve</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.estadoButton, editEstado === 'Saludable' && styles.estadoButtonSelected]}
              onPress={() => setEditEstado('Saludable')}
            >
              <Text style={styles.estadoButtonText}>Estable</Text>
            </TouchableOpacity>
          </View>

          <TextInput style={styles.input} placeholder="Comentario" value={editComentario} onChangeText={setEditComentario} />

          <TouchableOpacity style={styles.button} onPress={pickNewPhoto}>
            <Text style={styles.buttonText}>Seleccionar Nueva Foto</Text>
          </TouchableOpacity>

          {newPhoto && <Text>Foto seleccionada: {newPhoto}</Text>}

          <TouchableOpacity style={styles.button} onPress={handleSave}>
            <Text style={styles.buttonText}>{isLoading ? 'Guardando...' : 'Guardar Cambios'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const ReportContent = () => {
  const [reportes, setReportes] = useState([]);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedReporte, setSelectedReporte] = useState(null);
  const [media, setMedia] = useState([]);
  const [descripcion, setDescripcion] = useState('');
  const [titulo, setTitulo] = useState('');
  const [estado, setEstado] = useState('');
  const [comentario, setComentario] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isViewingReportes, setIsViewingReportes] = useState(true);
  const [location, setLocation] = useState(null);
  const navigation = useNavigation();

  const openMap = (latitude, longitude) => {
    navigation.navigate('Mapa', { latitude, longitude });
  };

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

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Se necesita el permiso de ubicación para continuar.');
        return;
      }
  
      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation.coords);
    })();
  }, []);

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
        coordenadas: {
          latitud: location?.latitude || 0,
          longitud: location?.longitude || 0,
        },
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
  
  const handleDeleteReporte = async (reporteId) => {
    try {
      await deleteDoc(doc(firestore, 'reportes', reporteId));
      fetchReportes();
      Alert.alert('Reporte eliminado exitosamente.');
    } catch (error) {
      console.error('Error al eliminar reporte: ', error);
    }
  };

  const handleUpdateReporte = async (updatedReporte) => {
    try {
      const reporteRef = doc(firestore, 'reportes', updatedReporte.id);
      await updateDoc(reporteRef, updatedReporte);
      Alert.alert('Reporte actualizado exitosamente.');
      fetchReportes();
    } catch (error) {
      Alert.alert('Error al actualizar reporte: ', error.message);
    }
  };

  const handleUpdateButtonPress = (item) => {
    setSelectedReporte(item);
    setIsEditModalVisible(true);
    console.log("Reporte seleccionado para edición:", item);
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
      <Text style={styles.reporteEstado}>Estado: {item.estado}</Text>
      <Text style={styles.reporteComentario}>Comentario: {item.comentario}</Text>
      <Text style={[styles.reporteText, { color: 'blue' }]} onPress={() => openMap(item.coordenadas.latitud, item.coordenadas.longitud)}>
        Ver en el mapa
      </Text>
      <Text style={styles.reporteDate}>Fecha: {item.fecha_reportes.toDate().toString()}</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.updateButton} onPress={() => {
          setSelectedReporte(item);
          setIsEditModalVisible(true);
        }}>
          <FontAwesomeIcon name="pencil" size={20} color="white" style={styles.icon} />
          <Text style={styles.buttonText}>Actualizar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={() => {
          Alert.alert('Eliminar Reporte', '¿Estás seguro de que deseas eliminar este reporte?', [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Eliminar', onPress: () => handleDeleteReporte(item.id) },
          ]);
        }}>
          <FontAwesomeIcon name="trash" size={20} color="white" style={styles.icon} />
          <Text style={styles.buttonText}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

 

return (
  <View style={styles.container}>
    {isViewingReportes ? (
      <View>
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

    {/* Mostrar imagen seleccionada si existe */}
    {media.length > 0 && media[0].type === 'image' && (
      <Image
        source={{ uri: media[0].uri }}
        style={styles.selectedImage}
      />
    )}


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
  onPress={() => {
    console.log("Alternar vista: ", !isViewingReportes);
    setIsViewingReportes(!isViewingReportes);
  }}
>
      <Icon name="add-circle" size={60} color="#007bff" />
    </TouchableOpacity>
    <EditModal
        visible={isEditModalVisible}
        onClose={() => setIsEditModalVisible(false)}
        reporte={selectedReporte} 
        onSave={handleUpdateReporte} 
      />

  </View>
);
};


const styles = StyleSheet.create({
  container: { 
    flex: 1,
     padding: 10, 
     backgroundColor: '#dfccb2' 
  },
  reporteItem: { 
    backgroundColor: '#fff', 
    padding: 15, 
    borderRadius: 10,
     marginBottom: 10 
    },
  reporteImage: {
     width: '100%',
      height: 200, 
      borderRadius: 8,
       marginBottom: 10 
      },
  reporteTitle: { fontSize: 18, fontWeight: 'bold' },
  reporteDescription: { fontSize: 16, marginBottom: 5 },
  reporteEstado: { fontSize: 14, fontStyle: 'italic', color: '#555' },
  reporteComentario: { fontSize: 14, color: '#333' },
  reporteFecha: { fontSize: 14, color: '#777' },
  updateButton: { backgroundColor: '#007bff', padding: 10, flexDirection: 'row', borderRadius: 8, alignItems: 'center', marginTop: 10 },
  buttonText: { color: 'white', fontWeight: 'bold' },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  modalContent: { width: '90%', backgroundColor: '#fff', padding: 20, borderRadius: 10 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  input: { height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 15, paddingHorizontal: 10, borderRadius: 5 },
  button: { backgroundColor: '#28a745', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 10 },
  cancelButton: { backgroundColor: '#dc3545', padding: 10, borderRadius: 8, alignItems: 'center' },
  cancelButtonText: { color: 'white', fontWeight: 'bold' },
  reporteList: { paddingBottom: 10 },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  deleteButton: { backgroundColor: '#dc3545', padding: 10, borderRadius: 8, alignItems: 'center',marginTop: 10 , flexDirection: 'row', },
  icon: { marginRight: 5 }, 
  estadoContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    marginVertical: 15 
  },
  estadoButton: { 
    paddingVertical: 10, 
    paddingHorizontal: 20, 
    borderRadius: 8, 
    backgroundColor: '#ddd' 
  },
  estadoButtonSelected: { 
    backgroundColor: '#007bff' 
  },
  estadoButtonText: { 
    color: 'white', 
    fontWeight: 'bold' 
  },
  floatingButton: {
    position: 'absolute',
    bottom: 70,
    alignSelf: 'center',
    right: 20,
    elevation: 5,
  },
  selectedImage: {
    width: '100%', // O un tamaño específico, como 200
    height: 200,
    borderRadius: 10,
    marginTop: 10,
  },
  

});

export default ReportContent;
