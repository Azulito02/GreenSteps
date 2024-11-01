import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Alert, View, TouchableOpacity, Modal, Text } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, getFirestore } from 'firebase/firestore';
import { getApp } from 'firebase/app';

const app = getApp();
const firestore = getFirestore(app);

const MapContent = ({ route, navigation }) => {
  const initialLatitude = route?.params?.latitude || 12.8654;
  const initialLongitude = route?.params?.longitude || -85.2072;

  const mapRef = useRef(null);
  const [markers, setMarkers] = useState([
    {
      latitude: initialLatitude,
      longitude: initialLongitude,
      title: 'Ubicación inicial',
      description: 'Este es el lugar preciso al que se hace referencia',
      severity: 'blue',
    },
  ]);
  const [location, setLocation] = useState(null);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [loadingMarkers, setLoadingMarkers] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedPinIndex, setSelectedPinIndex] = useState(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
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
        const querySnapshot = await getDocs(collection(firestore, 'Marcadores'));
        const loadedMarkers = [];
        querySnapshot.forEach((doc) => {
          loadedMarkers.push({ id: doc.id, ...doc.data() });
        });
        setMarkers((currentMarkers) => [...currentMarkers, ...loadedMarkers]);
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

    let userLocation = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = userLocation.coords;

    setLocation({
      latitude,
      longitude,
    });

    mapRef.current.animateToRegion({
      latitude,
      longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  };

  const handleMapPress = (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;

    Alert.alert(
      'Selecciona el color del pin',
      'Elige la severidad del nuevo pin:',
      [
        {
          text: 'Rojo (grave)',
          onPress: () => addNewPin(latitude, longitude, 'red'),
        },
        {
          text: 'Amarillo (leve)',
          onPress: () => addNewPin(latitude, longitude, 'yellow'),
        },
        {
          text: 'Verde (Estable)',
          onPress: () => addNewPin(latitude, longitude, 'green'),
        },
        {
          text: 'Cancelar',
          style: 'cancel',
        },
      ]
    );
  };

  const addNewPin = async (latitude, longitude, severity) => {
    const newMarker = {
      latitude,
      longitude,
      severity,
    };

    setMarkers((currentMarkers) => [...currentMarkers, newMarker]);

    try {
      await addDoc(collection(firestore, 'Marcadores'), newMarker);
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

  const handleMarkerPress = (index) => {
    setSelectedPinIndex(index);
    setShowModal(true);
  };

  const changePinColor = async (index, newSeverity) => {
    const markerToUpdate = markers[index];
    if (!markerToUpdate.id) {
      console.error('Error: El pin no tiene un ID válido.');
      return;
    }

    setMarkers((currentMarkers) =>
      currentMarkers.map((marker, markerIndex) =>
        markerIndex === index ? { ...marker, severity: newSeverity } : marker
      )
    );

    try {
      const markerDoc = doc(firestore, 'Marcadores', markerToUpdate.id);
      await updateDoc(markerDoc, { severity: newSeverity });
      console.log('Pin actualizado exitosamente en Firestore');
    } catch (error) {
      console.error('Error al actualizar el pin:', error);
    }
    setShowModal(false);
  };

  const deletePin = async (index) => {
    const markerToDelete = markers[index];
    if (!markerToDelete.id) {
      console.error('Error: El pin no tiene un ID válido.');
      return;
    }

    try {
      const markerDoc = doc(firestore, 'Marcadores', markerToDelete.id);
      await deleteDoc(markerDoc);
      console.log('Pin eliminado exitosamente de Firestore');

      setMarkers((currentMarkers) =>
        currentMarkers.filter((_, markerIndex) => markerIndex !== index)
      );
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
        {markers.map((marker, index) => (
          <Marker
            key={index}
            coordinate={{
              latitude: marker.latitude,
              longitude: marker.longitude,
            }}
            title={marker.title || 'Pin'}
            description={marker.description || ''}
            pinColor={getPinColor(marker.severity)}
            onPress={() => handleMarkerPress(index)}
          />
        ))}
      </MapView>

      <TouchableOpacity style={styles.locationButton} onPress={centerOnUserLocation}>
        <MaterialIcons name="my-location" size={24} color="white" />
      </TouchableOpacity>

      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Opciones del Pin</Text>
            <TouchableOpacity onPress={() => changePinColor(selectedPinIndex, 'red')}>
              <Text style={styles.modalOption}>Cambiar a rojo (grave)</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => changePinColor(selectedPinIndex, 'yellow')}>
              <Text style={styles.modalOption}>Cambiar a amarillo (leve)</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => changePinColor(selectedPinIndex, 'green')}>
              <Text style={styles.modalOption}>Cambiar a verde (Estable)</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => deletePin(selectedPinIndex)}>
              <Text style={[styles.modalOption, { color: 'red' }]}>Eliminar pin</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Text style={styles.modalOption}>Cancelar</Text>
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
    bottom: 100,
    right: 20,
    backgroundColor: '#008000',
    padding: 10,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalOption: {
    fontSize: 16,
    color: 'blue',
    paddingVertical: 10,
  },
});

export default MapContent;