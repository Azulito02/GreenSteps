import React, { useState } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, Modal, Button, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons'; // npm install @expo/vector-icons
import MapView, { Marker } from 'react-native-maps'; // Importamos los componentes del mapa

// Componente para el contenido de Inicio con imagen y un campo de texto
const HomeContent = () => {
  const [inputText, setInputText] = useState('');

  return (
    <View style={styles.contentContainer}>
      <Image source={require('../IMAGENES/logo0.png')} style={styles.contentImage} />
      <Text style={styles.modalText}>Este es el contenido de Inicio.</Text>
      <TextInput
        style={styles.input}
        placeholder="Escribe algo aquí..."
        value={inputText}
        onChangeText={setInputText}
      />
      <Button title="Hacer algo" onPress={() => alert(`Texto ingresado: ${inputText}`)} />
    </View>
  );
};

// Componente para el contenido de Reporte con imagen y un campo de texto
const ReportContent = () => {
  const [reportText, setReportText] = useState('');

  return (
    <View style={styles.contentContainer}>
      <Image source={require('../IMAGENES/logo0.png')} style={styles.contentImage} />
      <Text style={styles.modalText}>Formulario de Reporte</Text>
      <TextInput
        style={styles.input}
        placeholder="Describe tu reporte..."
        value={reportText}
        onChangeText={setReportText}
      />
      <Button title="Enviar Reporte" onPress={() => alert(`Reporte enviado: ${reportText}`)} />
    </View>
  );
};

// Componente para el contenido de Mapa con el mapa integrado
const MapContent = () => (
  <View style={styles.mapContainer}>
    <MapView
      style={styles.map}
      initialRegion={{
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }}
    >
      <Marker
        coordinate={{ latitude: 37.78825, longitude: -122.4324 }}
        title="Ubicación Ejemplo"
        description="Este es un marcador de ejemplo"
      />
    </MapView>
    <Button title="Ver ubicación" onPress={() => alert('Mostrando ubicación en el mapa')} />
  </View>
);

const SettingsContent = () => (
  <View>
    <Text style={styles.modalText}>Configuración de la App</Text>
    <Button title="Guardar configuración" onPress={() => alert('Configuración guardada')} />
  </View>
);

export default function GreenSteps() {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState(null);

  const handleNavClick = (content) => {
    setModalContent(content);
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <Image source={require('../IMAGENES/logo2.png')} style={styles.logo} />
      <Text style={styles.text}>Green Steps</Text>

      {/* Modal */}
      <Modal
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {modalContent}
            <Button title="Cerrar" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>

      {/* Barra de navegación */}
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.navButton} onPress={() => handleNavClick(<HomeContent />)}>
          <MaterialIcons name="home" size={24} color="white" />
          <Text style={styles.navText}>Inicio</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => handleNavClick(<ReportContent />)}>
          <MaterialIcons name="report" size={24} color="white" />
          <Text style={styles.navText}>Reportar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => handleNavClick(<MapContent />)}>
          <MaterialIcons name="map" size={24} color="white" />
          <Text style={styles.navText}>Mapa</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => handleNavClick(<SettingsContent />)}>
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
  logo: {
    width: 50, 
    height: 50,
    marginBottom: 10, 
  },
  text: {
    fontSize: 18, 
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', 
  },
  modalContainer: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
  },
  contentContainer: {
    alignItems: 'center',
  },
  contentImage: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    width: '100%',
    paddingHorizontal: 10,
  },
});
