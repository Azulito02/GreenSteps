import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import ReportContent from './Reportes';
import NoticiasContent from './News';
import MapContent from './Mapa';
import SettingsContent from './Ajustes';
import ImagePickerComponent from '../Componentes/ImagePickerComponent'; // Asegúrate de que la ruta sea correcta

export default function GreenSteps() {
  const [activeComponent, setActiveComponent] = useState(<ReportContent />);

  return (
    <View style={styles.container}>
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
        <TouchableOpacity style={styles.navButton} onPress={() => setActiveComponent(<ImagePickerComponent />)}>
          <MaterialIcons name="camera" size={24} color="white" />
          <Text style={styles.navText}>Cámara</Text>
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
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    padding: 10,
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
});