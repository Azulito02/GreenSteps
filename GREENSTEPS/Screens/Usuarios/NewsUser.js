import React, { useState, useEffect } from 'react';
import { getApp } from 'firebase/app';
import { StyleSheet, View, Text, Image, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import Icon from 'react-native-vector-icons/Ionicons'; // Asegúrate de tener esta librería instalada

const app = getApp();
const firestore = getFirestore(app);

const NoticiasContentUser = () => {
  const [noticias, setNoticias] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNoticias = async () => {
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

    fetchNoticias();
  }, []);

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
  cardImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    borderRadius: 8,
  },
});

export default NoticiasContentUser;
