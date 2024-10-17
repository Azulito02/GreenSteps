import React, { useState, useEffect } from 'react';
import { getApp, initializeApp } from 'firebase/app';
import { StyleSheet, View, Text, Image, TouchableOpacity, TextInput, FlatList, Linking, Button, ActivityIndicator, Alert } from 'react-native';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import { getFirestore, collection, getDocs, addDoc } from 'firebase/firestore';


const app = getApp();
const firestore = getFirestore(app);
const storage = getStorage(app);

const NoticiasContent = () => {
  const [noticias, setNoticias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [titulo, setTitulo] = useState('');
  const [foto, setFoto] = useState(null);
  const [url, setUrl] = useState('');

  useEffect(() => {
    const fetchNoticias = async () => {
      try {
        const querySnapshot = await getDocs(collection(firestore, 'articulos')); // Reemplaza 'noticias' con el nombre de tu colección
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

    fetchNoticias();
  }, []);

  const agregarNoticia = async () => {
    if (titulo && foto && url) {
      try {
        // Convertir la imagen en una URL accesible
        const response = await fetch(foto);
        const blob = await response.blob();
        const imageRef = ref(storage, `images/${new Date().toISOString()}.jpg`); // Define el nombre de la imagen en tu almacenamiento

        // Subir la imagen a Firebase Storage
        await uploadBytes(imageRef, blob);

        // Obtener la URL de descarga de la imagen
        const photoURL = await getDownloadURL(imageRef);

        // Agregar la noticia con la URL de la imagen
        await addDoc(collection(firestore, 'articulos'), {
          titulo,
          foto: photoURL,
          url,
          fecha: new Date(),
        });

        Alert.alert('Noticia agregada', 'La noticia se ha agregado correctamente.');
        setTitulo('');
        setFoto(null);
        setUrl('');
        // Refrescar la lista de noticias
        const querySnapshot = await getDocs(collection(firestore, 'articulos'));
        const noticiasArray = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setNoticias(noticiasArray);
      } catch (error) {
        console.error('Error al agregar la noticia:', error);
        Alert.alert('Error', 'No se pudo agregar la noticia. Intenta nuevamente.');
      }
    } else {
      Alert.alert('Campos incompletos', 'Por favor, completa todos los campos.');
    }
  };

  const seleccionarImagen = async () => {
    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!resultado.canceled) {
      setFoto(resultado.assets[0].uri); // Establecer la URI de la imagen seleccionada
    }
  };

  const NoticiaItem = ({ noticia }) => {
    const handlePress = () => {
      Linking.openURL(noticia.url).catch(err => console.error("Error al abrir URL:", err));
    };

    return (
      <TouchableOpacity onPress={handlePress} style={styles.card}>
        <Image source={{ uri: noticia.foto }} style={styles.cardImage} />
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{noticia.titulo}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" style={styles.loading} />;
  }

  return (
    <View style={styles.contentContainer}>
      <Text style={styles.headerText}>Noticias</Text>

      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Título de la noticia"
          value={titulo}
          onChangeText={setTitulo}
        />
        <Button title="Seleccionar Imagen" onPress={seleccionarImagen} />
        {foto && <Image source={{ uri: foto }} style={styles.selectedImage} />}
        <TextInput
          style={styles.input}
          placeholder="URL de la noticia"
          value={url}
          onChangeText={setUrl}
        />
        <Button title="Agregar Noticia" onPress={agregarNoticia} />
      </View>

      <FlatList
        data={noticias}
        renderItem={({ item }) => <NoticiaItem noticia={item} />}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f9f9f9',
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
  },
  formContainer: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 8,
    marginVertical: 5,
    borderRadius: 5,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  cardContent: {
    flex: 1,
  },
  cardImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    borderRadius: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginVertical: 10,
  },
});

export default NoticiasContent;