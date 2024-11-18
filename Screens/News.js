import React, { useState, useEffect } from 'react';
import { getApp } from 'firebase/app';
import { StyleSheet, View, Text, Image, TouchableOpacity, TextInput, FlatList, Linking, ActivityIndicator, Alert } from 'react-native';
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
    };

    return (
      <View style={styles.card}>
        <TouchableOpacity onPress={handlePress}>
          <Image source={{ uri: noticia.foto }} style={styles.cardImage} />
          <Text style={styles.cardTitle}>{noticia.titulo}</Text>
        </TouchableOpacity>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={() => eliminarNoticia(noticia.id)}>
            <Icon name="trash" size={20} color="#fff" />
            <Text style={styles.buttonText}>Eliminar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleUpdatePress}>
            <Icon name="pencil" size={20} color="#fff" />
            <Text style={styles.buttonText}>Actualizar</Text>
          </TouchableOpacity>
        </View>

        {isUpdating && currentNoticiaId === noticia.id && (
          <View style={styles.formContainer}>
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
            <TouchableOpacity style={styles.button} onPress={actualizarNoticia}>
              <Icon name="checkmark-circle-outline" size={20} color="#fff" />
              <Text style={styles.buttonText}>Actualizar Noticia</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" style={styles.loading} />;
  }

  return (
    <FlatList
      data={noticias}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <NoticiaItem noticia={item} />}
    />
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    marginBottom: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  cardImage: {
    width: '100%',
    height: 150,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    padding: 15,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007bff',
    borderRadius: 5,
    padding: 10,
    flex: 1,
    justifyContent: 'center',
    marginHorizontal: 5,
  },
  buttonText: {
    color: '#fff',
    marginLeft: 5,
  },
  formContainer: {
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 8,
    marginVertical: 5,
    borderRadius: 5,
  },
  selectImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#28a745',
    borderRadius: 5,
    padding: 10,
    justifyContent: 'center',
    marginTop: 5,
  },
  selectedImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginVertical: 10,
  },
});

export default NoticiasContent;
