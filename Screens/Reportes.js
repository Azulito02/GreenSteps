import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Button, Modal, FlatList, Alert, ActivityIndicator, Image } from 'react-native';
import { getFirestore, collection, getDocs, getDoc, doc,addDoc,Timestamp, updateDoc, deleteDoc } from 'firebase/firestore';
import { getApp } from 'firebase/app';
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import Icon from 'react-native-vector-icons/Ionicons'; // Agregar esta línea
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import { Video } from 'expo-av';
import { getAuth } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';

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
        allowsEditing: true,
       quality: 0.5,
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
      console.error('Error en uploadNewPhoto:', error);
  Alert.alert('Error', 'Error al subir la foto actualizada');
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
  const auth = getAuth(); // Autenticación de Firebase
  const [user, loading] = useAuthState(auth);
  const [isAdmin, setIsAdmin] = useState(false); 

 
  useEffect(() => {
    if (user) {
      console.log("User ID:", user.uid); // Asegúrate de que este log imprima el ID correcto
      checkIfAdmin(user.uid); // Llama a la función para verificar si es admin
    }
  }, [user]);

  const checkIfAdmin = async (userId) => {
    try {
      const userRef = doc(firestore, 'usuarios', userId); // Crea una referencia al documento de usuario
      const userDoc = await getDoc(userRef); // Usa getDoc para obtener un único documento

      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log("User Data:", userData); // Imprime los datos del usuario
        setIsAdmin(userData.rol === 'administrador'); // Cambia 'admin' por 'administrador' si ese es el valor correcto
        console.log("isAdmin:", userData.rol === 'administrador'); // Imprime true si el rol es 'administrador'
      } else {
        console.warn("Documento de usuario no encontrado");
      }
    } catch (error) {
      console.error("Error al verificar el rol del usuario: ", error);
    }
  };
  
  const openMap = (latitude, longitude) => {
    navigation.navigate('Mapa', { latitude, longitude });
  };

  useEffect(() => {
    fetchReportes();
  }, []);

  const fetchReportes = async () => {
    try {
      const reportesSnapshot = await getDocs(collection(firestore, 'reportes'));
      const reportesArray = await Promise.all(
        reportesSnapshot.docs.map(async (reporteDoc) => {
          const reporteData = reporteDoc.data();
  
          // Verificar que `userId` exista antes de intentar obtener el usuario
          let nombre = 'Usuario desconocido';
          if (reporteData.userId) {
            const userRef = doc(firestore, 'usuarios', reporteData.userId);
            const userDoc = await getDoc(userRef);
            
            // Obtener el nombre del usuario si el documento existe
            if (userDoc.exists()) {
              nombre = userDoc.data().nombre;
            }
          }
  
          // Retornar los datos del reporte junto con el nombre del usuario
          return {
            id: reporteDoc.id,
            ...reporteData,
            nombre,
          };
        })
      );
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




  const handleSubmit = async () => {
    if (!titulo.trim() || !descripcion.trim() || !estado.trim() || !comentario.trim()) {
      alert('Por favor, completa todos los campos obligatorios.');
      return;
    }
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
        userId: user.uid,
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
      setIsViewingReportes(true); // Cambia a la vista de reportes
    } catch (error) {
      console.error('Error al subir datos: ', error);
      alert(`Error al subir datos: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };


useEffect(() => {
  // Redirige al login si el usuario no está autenticado
  if (!user) {
    navigation.navigate("LoginScreen");
  }
}, [user]);

const renderReporte = ({ item }) => (
    <View style={styles.reporteItem}>
      <Text style={styles.reporteNombreUsuario}>Reportado por: {item.nombre}</Text>
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
      <Text
        style={[styles.reporteText, { color: 'blue' }]}
        onPress={() => openMap(item.coordenadas.latitud, item.coordenadas.longitud)}
      >
        Ver en el mapa
      </Text>
      <Text style={styles.reporteDate}>Fecha: {item.fecha_reportes.toDate().toString()}</Text>
  
      {/* Botones de actualización y eliminación */}
      {user && item.userId === user.uid && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.updateButton} onPress={() => handleUpdateButtonPress(item)}>
            <FontAwesomeIcon name="pencil" size={20} color="white" style={styles.icon} />
            <Text style={styles.buttonText}>Actualizar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteReporte(item.id)}>
            <FontAwesomeIcon name="trash" size={20} color="white" style={styles.icon} />
            <Text style={styles.buttonText}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      )}
  
      {isAdmin && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.updateButton} onPress={() => handleUpdateButtonPress(item)}>
            <FontAwesomeIcon name="pencil" size={20} color="white" style={styles.icon} />
            <Text style={styles.buttonText}>Actualizar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteReporte(item.id)}>
            <FontAwesomeIcon name="trash" size={20} color="white" style={styles.icon} />
            <Text style={styles.buttonText}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
  
  return (
    <View style={styles.container}>
      {user && (
        <>
          {isViewingReportes ? (
            <FlatList
              data={reportes}
              renderItem={renderReporte}
              keyExtractor={(item) => item.id}
            />
          ) : (
            <View>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Título</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Escribe el título del reporte"
                  value={titulo}
                  onChangeText={setTitulo}
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Descripción</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Describe el problema"
                  value={descripcion}
                  onChangeText={setDescripcion}
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Comentario</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Agrega un comentario adicional"
                  value={comentario}
                  onChangeText={setComentario}
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Estado</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Estado del reporte"
                  value={estado}
                  onChangeText={setEstado}
                />
              </View>
              <TouchableOpacity style={styles.mediaButton} onPress={pickMedia}>
                <Text style={styles.mediaButtonText}>
                  Seleccionar Imagen o Video
                </Text>
              </TouchableOpacity>
              {media.length > 0 && (
                <View style={styles.selectedMediaContainer}>
                  {media.map((item, index) => (
                    <Image
                      key={index}
                      source={{ uri: item.uri }}
                      style={styles.selectedImage}
                    />
                  ))}
                </View>
              )}
              <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                <Text style={styles.buttonText}>Enviar Reporte</Text>
              </TouchableOpacity>
            </View>
          )}
  
          <TouchableOpacity
            style={styles.floatingButton}
            onPress={() => setIsViewingReportes(!isViewingReportes)}
          >
            <Icon name="add-circle" size={60} color="#007bff" />
          </TouchableOpacity>
        </>
      )}
  
      {/* Modal para editar reportes */}
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
  reporteTitle: { 
    fontSize: 18, 
    fontWeight: 'bold'
   },
  reporteDescription: {
     fontSize: 16,
    marginBottom: 5
     },
  reporteEstado: { 
    fontSize: 14,
     fontStyle: 'italic',
      color: '#555' 
    },
  reporteComentario: {
     fontSize: 14,
     color: '#333'
     },
  reporteFecha: { 
    fontSize: 14,
     color: '#777'
     },
  updateButton: {
   backgroundColor: '#007bff',
    padding: 10,
     flexDirection: 'row', 
     borderRadius: 8, 
     alignItems: 'center', 
     marginTop: 10
     },
  buttonText: { 
    color: 'white',
     fontWeight: 'bold'
     },
  modalContainer: {
   flex: 1,
    justifyContent: 'center',
     alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)' 
    },
  modalContent: {
     width: '90%', 
     backgroundColor: '#fff',
      padding: 20,
       borderRadius: 10
       },
  modalTitle: {
     fontSize: 20,
      fontWeight: 'bold',
       marginBottom: 20 
      },
      inputContainer: {
        marginBottom: 15,
      },
      inputLabel: {
        fontSize: 14,
        color: '#555',
        marginBottom: 5,
        fontWeight: 'bold',
      },
      input: {
        height: 50,
        borderColor: '#ddd',
        borderWidth: 1,
        backgroundColor: '#fff',
        borderRadius: 10,
        paddingHorizontal: 15,
        fontSize: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
      },
      button: {
        backgroundColor: '#007bff',
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 15,
        flexDirection: 'row',
        justifyContent: 'center',
      },
      buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
      },
      mediaButton: {
        backgroundColor: '#6c757d',
        paddingVertical: 10,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 10,
      },
      mediaButtonText: {
        color: 'white',
        fontWeight: 'bold',
      },  
      selectedMediaContainer: {
        marginTop: 10,
      },
      selectedImage: {
        width: '100%',
        height: 200,
        borderRadius: 10,
        marginTop: 10,
      },  
  cancelButton: {
     backgroundColor: '#dc3545',
      padding: 10,
       borderRadius: 8,
        alignItems: 'center'
       },
  cancelButtonText: { 
    color: 'white',
     fontWeight: 'bold'
     },
  reporteList: {
     paddingBottom: 10 
    },
  buttonContainer: { 
    flexDirection: 'row',
     justifyContent: 'space-between',
      marginTop: 10
     },
  deleteButton: { 
    backgroundColor: '#dc3545', 
    padding: 10, 
    borderRadius: 8, 
    alignItems: 'center',
    marginTop: 10 , 
    flexDirection: 'row',
   },
  icon: {
     marginRight: 5
     }, 
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
  reporteNombreUsuario: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  

});

export default ReportContent;
