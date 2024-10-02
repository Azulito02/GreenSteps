import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
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
          <Image
            source={require('../IMAGENES/Iconos/Sin título-1.png')} 
            style={styles.navIcon}
          />
          <Text style={styles.navText}>Reportes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => setActiveComponent(<NoticiasContent />)}>
          <Image
            source={require('../IMAGENES/Iconos/Sin título-2.png')} 
            style={styles.navIcon}
          />
          <Text style={styles.navText}>News</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => setActiveComponent(<ImagePickerComponent />)}>
          <Image
            source={require('../IMAGENES/Iconos/Sin título-3.png')} 
            style={styles.navIcon}
          />
          <Text style={styles.navText}>Cámara</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => setActiveComponent(<MapContent />)}>
          <Image
            source={require('../IMAGENES/Iconos/Sin título-4.png')} 
            style={styles.navIcon}
          />
          <Text style={styles.navText}>Mapa</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => setActiveComponent(<SettingsContent />)}>
          <Image
            source={require('../IMAGENES/Iconos/Sin título-1.png')} 
            style={styles.navIcon}
          />
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
    backgroundColor: '#dfccb2',
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
    backgroundColor: '#F4EFEC',
    height: 60,
    width: '109%',
    position: 'absolute',
    bottom: 0,
  },
  navButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  navIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  navText: {
    color: '#000E5C',
    fontSize: 12,
  },
});
