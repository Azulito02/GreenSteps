import React, { useState } from 'react';
import { StyleSheet, Alert, View, Text, Image, TouchableOpacity, TextInput, FlatList, useWindowDimensions, Linking, Button, ActivityIndicator } from 'react-native';
import residuosmarinos from '../IMAGENES/residuos-marinos.webp';
import Clima from '../IMAGENES/Climatico.webp';
import Tecno from '../IMAGENES/Tecnologia.jpeg';

// Array de noticias

const noticias = [
    {
      id: '1',
      titulo: 'Cambio climático amenaza a la biodiversidad',
      descripcion: 'El calentamiento global pone en riesgo a miles de especies.',
      url: 'https://www.bbc.com/mundo/noticias-58143985#:~:text=El%20calentamiento%20global%20provocado%20por%20los%20humanos%20ha%20causado',
      imagen: Clima,
    },
    {
      id: '2',
      titulo: 'Innovaciones verdes para el futuro',
      descripcion: 'Nuevas tecnologías están cambiando la manera en que cuidamos el planeta.',
      url: 'https://es.weforum.org/agenda/2024/09/10-nuevas-tendencias-tecnologicas-transformando-la-observacion-de-la-tierra-y-la-inteligencia-climatica/#:~:text=Cuando%20se%20utilizan%20junto%20con%20los%20datos%20de%20sat%C3%A9lite,%2010',
      imagen: Tecno,
    },
    {
      id: '3',
      titulo: 'Reducción del plástico en los océanos',
      descripcion: 'Proyectos globales buscan reducir los desechos plásticos en los océanos.',
      url: 'https://news.un.org/es/story/2021/10/1498752#:~:text=Una%20estrategia%20que%20conlleve%20una%20soluci%C3%B3n%20%C3%BAnica%20destinada%20a',
      imagen: residuosmarinos,
    },
  ];
  
  // Componente NoticiaItem (Tarjeta)
  const NoticiaItem = ({ noticia }) => {
    const handlePress = () => {
      Linking.openURL(noticia.url).catch(err => console.error("Error al abrir URL:", err));
    };
  
    return (
      <TouchableOpacity onPress={handlePress} style={styles.card}>
       <Image source={noticia.imagen} style={styles.cardImage} /> 
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{noticia.titulo}</Text>
          <Text style={styles.cardDescription}>{noticia.descripcion}</Text>
        </View>
      </TouchableOpacity>
    );
  };
  
  // Componente principal
  const NoticiasContent = () => {
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
  
  // Estilos
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
    cardDescription: {
      fontSize: 14,
      color: '#666',
    },
  });
  
  export default NoticiasContent;