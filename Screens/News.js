import React, { useState, useEffect } from 'react';
import { getApp } from 'firebase/app';
import { StyleSheet, View, Text, Image, TouchableOpacity, TextInput, FlatList, Linking, ActivityIndicator, Alert, Dimensions, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import Icon from 'react-native-vector-icons/Ionicons';

const app = getApp();
const firestore = getFirestore(app);
const storage = getStorage(app);

const NoticiasContent = () => {
  const [noticias, setNoticias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [titulo, setTitulo] = useState('');
  const [foto, setFoto] = useState(null);
  const [url, setUrl] = useState('');
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [currentNoticiaId, setCurrentNoticiaId] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchNoticias();
  }, []);

  const fetchNoticias = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(firestore, 'articulos'));
      const noticiasArray = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setNoticias(noticiasArray);
    } catch (error) {
      console.error('Error al obtener las noticias: ', error);
      Alert.alert('Error', 'No se pudieron obtener las noticias. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const agregarNoticia = async () => {
    if (titulo && foto && url) {
      try {
        const response = await fetch(foto);
        const blob = await response.blob();
        const imageRef = ref(storage, `images/${new Date().toISOString()}.jpg`);
        await uploadBytes(imageRef, blob);
        const photoURL = await getDownloadURL(imageRef);

        await addDoc(collection(firestore, 'articulos'), {
          titulo,
          foto: photoURL,
          url,
          fecha: new Date(),
        });

        Alert.alert('Noticia agregada', 'La noticia se ha agregado correctamente.');
        resetForm();
        fetchNoticias();
      } catch (error) {
        console.error('Error al agregar la noticia:', error);
        Alert.alert('Error', 'No se pudo agregar la noticia. Intenta nuevamente.');
      }
    } else {
      Alert.alert('Campos incompletos', 'Por favor, completa todos los campos.');
    }
  };

  const eliminarNoticia = async (id) => {
    try {
      await deleteDoc(doc(firestore, 'articulos', id));
      Alert.alert('Noticia eliminada', 'La noticia se ha eliminado correctamente.');
      fetchNoticias();
    } catch (error) {
      console.error('Error al eliminar la noticia:', error);
      Alert.alert('Error', 'No se pudo eliminar la noticia. Intenta nuevamente.');
    }
  };

  const actualizarNoticia = async () => {
    if (titulo && foto && url) {
      try {
        const response = await fetch(foto);
        const blob = await response.blob();
        const imageRef = ref(storage, `images/${new Date().toISOString()}.jpg`);
        await uploadBytes(imageRef, blob);
        const photoURL = await getDownloadURL(imageRef);

        await updateDoc(doc(firestore, 'articulos', currentNoticiaId), {
          titulo,
          foto: photoURL,
          url,
          fecha: new Date(),
        });

        Alert.alert('Noticia actualizada', 'La noticia se ha actualizado correctamente.');
        resetForm();
        fetchNoticias();
      } catch (error) {
        console.error('Error al actualizar la noticia:', error);
        Alert.alert('Error', 'No se pudo actualizar la noticia. Intenta nuevamente.');
      }
    } else {
      Alert.alert('Campos incompletos', 'Por favor, completa todos los campos.');
    }
  };

  const resetForm = () => {
    setTitulo('');
    setFoto(null);
    setUrl('');
    setIsFormVisible(false);
    setCurrentNoticiaId(null);
    setIsUpdating(false);
  };

  const seleccionarImagen = async () => {
    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!resultado.canceled) {
      setFoto(resultado.assets[0].uri);
    }
  };

  const NoticiaItem = ({ noticia }) => {
    const handlePress = () => {
      Linking.openURL(noticia.url).catch(err => console.error("Error al abrir URL:", err));
    };

    const handleUpdatePress = () => {
      setIsUpdating(true);
      setCurrentNoticiaId(noticia.id);
      setTitulo(noticia.titulo);
      setFoto(noticia.foto);
      setUrl(noticia.url);
      setIsFormVisible(true);
    };

    return (
      <View style={styles.card}>
        <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
          <Image source={{ uri: noticia.foto }} style={styles.cardImage} />
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>{noticia.titulo}</Text>
          </View>
        </TouchableOpacity>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={() => eliminarNoticia(noticia.id)}>
            <Icon name="trash" size={20} color="#fff" />
            <Text style={styles.buttonText}>Eliminar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.updateButton]} onPress={handleUpdatePress}>
            <Icon name="pencil" size={20} color="#fff" />
            <Text style={styles.buttonText}>Actualizar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#007bff" style={styles.loading} />;
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <View style={styles.container}>
        <Text style={styles.headerText}>Noticias</Text>

        {isFormVisible && (
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.formContainer}>
              <Text style={styles.formHeader}>
                {isUpdating ? 'Actualizar Noticia' : 'Agregar Nueva Noticia'}
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Título de la noticia"
                value={titulo}
                onChangeText={setTitulo}
              />
              <TouchableOpacity style={styles.selectImageButton} onPress={seleccionarImagen}>
                <Icon name="image-outline" size={20} color="#fff" />
                <Text style={styles.buttonText}>Seleccionar Imagen</Text>
              </TouchableOpacity>
              {foto && <Image source={{ uri: foto }} style={styles.selectedImage} />}
              <TextInput
                style={styles.input}
                placeholder="URL de la noticia"
                value={url}
                onChangeText={setUrl}
              />
              <TouchableOpacity
                style={[styles.button, isUpdating ? styles.updateButton : styles.addButton]}
                onPress={isUpdating ? actualizarNoticia : agregarNoticia}
              >
                <Icon
                  name={isUpdating ? "checkmark-circle-outline" : "add-circle-outline"}
                  size={20}
                  color="#fff"
                />
                <Text style={styles.buttonText}>
                  {isUpdating ? 'Actualizar Noticia' : 'Agregar Noticia'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}

        <FlatList
          data={noticias}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <NoticiaItem noticia={item} />}
          contentContainerStyle={styles.listContent}
        />

        <TouchableOpacity
          style={styles.floatingButton}
          onPress={() => setIsFormVisible(!isFormVisible)}
          activeOpacity={0.7}
        >
          <Icon name={isFormVisible ? "close-circle" : "add-circle"} size={60} color="#007bff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  cardImage: {
    width: '100%',
    height: 200,
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  deleteButton: {
    backgroundColor: '#d9534f',
  },
  updateButton: {
    backgroundColor: '#5bc0de',
  },
  addButton: {
    backgroundColor: '#5cb85c',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  formHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  selectImageButton: {
    backgroundColor: '#007bff',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  selectedImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 50,
    right: 20,
    elevation: 5,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  listContent: {
    paddingBottom: 80,
  },
});

export default NoticiasContent;
