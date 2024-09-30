import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Alert, View, Text, Image, TouchableOpacity, TextInput, FlatList, useWindowDimensions, Linking, Button, ActivityIndicator } from 'react-native';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore'; 
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { getApp } from 'firebase/app';  
import MapContent from './Mapa'; 
import ReportContent from './Reportes';
import NoticiasContent from './News';
import SettingsContent from './Ajustes';


export default function GreenSteps() {
  const [activeComponent, setActiveComponent] = useState(<ReportContent />);

  return (
    <View style={styles.container}>
      <Image source={require('../IMAGENES/logo2.png')} style={styles.logo} />
      <Text style={styles.text}>Green Steps</Text>

      <View style={styles.contentArea}>
        {activeComponent}
      </View>

      {/* Barra de navegación */}
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.navButton} onPress={() => setActiveComponent(<ReportContent />)}>
          <MaterialIcons name="home" size={24} color="white" />
          <Text style={styles.navText}>Reportes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => setActiveComponent(<NoticiasContent />)}>
          <MaterialIcons name="newspaper" size={24} color="white" />
          <Text style={styles.navText}>News</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => setActiveComponent(<MapContent />)}>
          <MaterialIcons name="map" size={24} color="white" />
          <Text style={styles.navText}>Mapa</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => setActiveComponent(<SettingsContent />)}>
          <MaterialIcons name="settings" size={24} color="white" />
          <Text style={styles.navText}>Ajustes</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
  },
  noticiaContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    width: '100%',
    paddingHorizontal: 10,
  },
  button: {
    backgroundColor: '#008000',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    textAlign: 'down',
  },

  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    padding: 10,
  },
  logo: {
    width: 50,
    height: 50,
    marginBottom: 10,
  },
  text: {
    fontSize: 18,
  },
  contentArea: {
    flex: 1,
    width: '100%',
    paddingTop: 10,
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#008000',
    height: 60,
    width: '109%',
    position: 'absolute',
    bottom: 0,
  },
  navButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  navText: {
    color: 'white',
    fontSize: 12,
  },
  contentContainer: {
    alignItems: 'center',
  },
  contentImage: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  contentText: {
    fontSize: 18,
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    width: '100%',
    paddingHorizontal: 10,
  },
  button: {
    backgroundColor: '#008000',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
  },
  mapContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
 
});