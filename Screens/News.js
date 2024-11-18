import React, { useState, useEffect } from 'react';
import { getApp } from 'firebase/app';
import { StyleSheet, View, Text, Image, TouchableOpacity, TextInput, FlatList, Linking, ActivityIndicator, Alert, Dimensions, ScrollView } from 'react-native';
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

        {isUpdating && currentNoticiaId === noticia.id && (
          <View style={styles.formContainer}>
            <Text style={styles.formHeader}>Actualizar Noticia</Text>
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
            <TouchableOpacity style={[styles.button, styles.updateButton]} onPress={actualizarNoticia}>
              <Icon name="checkmark-circle-outline" size={20} color="#fff" />
              <Text style={styles.buttonText}>Actualizar Noticia</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#007bff" style={styles.loading} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Noticias</Text>

      {isFormVisible && !isUpdating && (
        <View style={styles.formContainer}>
          <Text style={styles.formHeader}>Agregar Nueva Noticia</Text>
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
          <TouchableOpacity style={[styles.button, styles.addButton]} onPress={agregarNoticia}>
            <Icon name="add-circle-outline" size={20} color="#fff" />
            <Text style={styles.buttonText}>Agregar Noticia</Text>
          </TouchableOpacity>
        </View>
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
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingTop: 40,
    paddingHorizontal: 10,
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  listContent: {
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    marginBottom: 20,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  cardContent: {
    padding: 15,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#222',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingBottom: 15,
    marginTop: -10,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flex: 1,
    justifyContent: 'center',
    marginHorizontal: 5,
  },
  deleteButton: {
    backgroundColor: '#e63946',
  },
  updateButton: {
    backgroundColor: '#457b9d',
  },
  addButton: {
    backgroundColor: '#1d3557',
  },
  buttonText: {
    color: '#fff',
    marginLeft: 5,
    fontSize: 16,
  },
  formContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  formHeader: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#f9fafb',
  },
  selectImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a9d8f',
    borderRadius: 8,
    padding: 10,
    justifyContent: 'center',
    marginBottom: 15,
  },
  selectedImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 15,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 80, // Aumenta este valor para evitar que lo tape la barra
    right: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default NoticiasContent;
