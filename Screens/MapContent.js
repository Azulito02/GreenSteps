import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Alert, View, TouchableOpacity, Modal, Text } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, getFirestore } from 'firebase/firestore';
import { getApp } from 'firebase/app';

const app = getApp();
const firestore = getFirestore(app);

const MapContent = ({ route }) => {
  const initialLatitude = route?.params?.latitude || 12.8654;
  const initialLongitude = route?.params?.longitude || -85.2072;

  const mapRef = useRef(null);
  const [markers, setMarkers] = useState([]);
  const [location, setLocation] = useState(null);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [loadingMarkers, setLoadingMarkers] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedPinId, setSelectedPinId] = useState(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Necesitamos acceso a tu ubicación para centrar el mapa.');
        return;
      }
      setHasLocationPermission(true);
    })();
  }, []);

  useEffect(() => {
    const fetchMarkers = async () => {
      try {
        const querySnapshot = await getDocs(collection(firestore, 'marcadores'));
        const loadedMarkers = [];
        querySnapshot.forEach((doc) => {
          loadedMarkers.push({ id: doc.id, ...doc.data() });
        });
        setMarkers(loadedMarkers);
        setLoadingMarkers(false);
      } catch (error) {
        console.error('Error al cargar los marcadores:', error);
      }
    };

    fetchMarkers();
  }, []);

  const centerOnUserLocation = async () => {
    if (!hasLocationPermission) {
      Alert.alert('Permiso de ubicación no otorgado');
      return;
    }

    try {
      const userLocation = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = userLocation.coords;

      setLocation({ latitude, longitude });

      mapRef.current.animateToRegion({
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    } catch (error) {
      console.error('Error al obtener la ubicación del usuario:', error);
    }
  };

  const handleMapPress = (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;

    Alert.alert(
      'Selecciona el color del pin',
      'Elige la severidad del nuevo pin:',
      [
        { text: 'Rojo (grave)', onPress: () => addNewPin(latitude, longitude, 'red') },
        { text: 'Amarillo (leve)', onPress: () => addNewPin(latitude, longitude, 'yellow') },
        { text: 'Verde (Estable)', onPress: () => addNewPin(latitude, longitude, 'green') },
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };

  const addNewPin = async (latitude, longitude, severity) => {
    const newMarker = { latitude, longitude, severity };

    try {
      const docRef = await addDoc(collection(firestore, 'marcadores'), newMarker);
      setMarkers((currentMarkers) => [...currentMarkers, { ...newMarker, id: docRef.id }]);
      console.log('Pin guardado exitosamente en Firestore');
    } catch (error) {
      console.error('Error al guardar el pin:', error);
    }
  };

  const getPinColor = (severity) => {
    switch (severity) {
      case 'red':
        return 'red';
      case 'yellow':
        return 'yellow';
      case 'green':
        return 'green';
      default:
        return 'blue';
    }
  };

  const handleMarkerPress = (id) => {
    setSelectedPinId(id);
    setShowModal(true);
  };

  const changePinColor = async (id, newSeverity) => {
    try {
      const markerDoc = doc(firestore, 'marcadores', id);
      await updateDoc(markerDoc, { severity: newSeverity });
      setMarkers((currentMarkers) =>
        currentMarkers.map((marker) =>
          marker.id === id ? { ...marker, severity: newSeverity } : marker
        )
      );
      console.log('Pin actualizado exitosamente en Firestore');
    } catch (error) {
      console.error('Error al actualizar el pin:', error);
    }
    setShowModal(false);
  };

  const deletePin = async (id) => {
    try {
      const markerDoc = doc(firestore, 'marcadores', id);
      await deleteDoc(markerDoc);
      setMarkers((currentMarkers) => currentMarkers.filter((marker) => marker.id !== id));
      console.log('Pin eliminado exitosamente de Firestore');
    } catch (error) {
      console.error('Error al eliminar el pin:', error);
    }
    setShowModal(false);
  };

  return (
    <View style={styles.mapContainer}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: initialLatitude,
          longitude: initialLongitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
        onPress={handleMapPress}
      >
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
            title={marker.title || 'Pin'}
            description={marker.description || ''}
            pinColor={getPinColor(marker.severity)}
            onPress={() => handleMarkerPress(marker.id)}
          />
        ))}
      </MapView>

      <TouchableOpacity
        style={styles.locationButton}
        onPress={centerOnUserLocation}
        activeOpacity={0.7}
      >
        <MaterialIcons name="my-location" size={28} color="white" />
      </TouchableOpacity>

      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Opciones del Pin</Text>
            <TouchableOpacity
              style={styles.modalOptionButton}
              onPress={() => changePinColor(selectedPinId, 'red')}
            >
              <Text style={styles.modalOptionText}>Cambiar a rojo (grave)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalOptionButton}
              onPress={() => changePinColor(selectedPinId, 'yellow')}
            >
              <Text style={styles.modalOptionText}>Cambiar a amarillo (leve)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalOptionButton}
              onPress={() => changePinColor(selectedPinId, 'green')}
            >
              <Text style={styles.modalOptionText}>Cambiar a verde (Estable)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalOptionButton, styles.deleteButton]}
              onPress={() => deletePin(selectedPinId)}
            >
              <Text style={styles.modalOptionText}>Eliminar pin</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalOptionButton, styles.cancelButton]}
              onPress={() => setShowModal(false)}
            >
              <Text style={styles.modalOptionText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  map: {
    width: '100%',
    height: '100%',
  },
  locationButton: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
  mapContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    width: '90%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  modalOptionButton: {
    width: '100%',
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    marginBottom: 10,
    elevation: 2,
  },
  modalOptionText: {
    fontSize: 16,
    color: '#555',
  },
  deleteButton: {
    backgroundColor: '#FF5252',
  },
  cancelButton: {
    backgroundColor: '#B0BEC5',
  },
});

export default MapContent;