// ProfileView.js
import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';

const News = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Noticias medio ambientales</Text>
    <Text>Articulos</Text>
    <Button title="Articulos" onPress={() => alert('Revisar nuevos articulos')} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
  },
});

export default News;
