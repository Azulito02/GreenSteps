import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Alert, View, TouchableOpacity } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { collection, getDocs, addDoc, updateDoc, doc, getFirestore } from 'firebase/firestore';
import { getApp } from 'firebase/app';

const app = getApp();
const firestore = getFirestore(app);

const MapContent = ({ route, navigation }) => {
  const initialLatitude = route?.params?.latitude || 12.8654; // Coordenada predeterminada
  const initialLongitude = route?.params?.longitude || -85.2072; // Coordenada predeterminada

  const mapRef = useRef(null);
  const [markers, setMarkers] = useState([
    {
      latitude: initialLatitude,
      longitude: initialLongitude,
      title: 'Ubicación inicial',
      description: 'Este es el lugar preciso al que se hace referencia',
      severity: 'blue', // Pin azul de referencia
    },
  ]);
  const [location, setLocation] = useState(null);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [loadingMarkers, setLoadingMarkers] = useState(true);

  // Pedir permisos de ubicación
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

  // Cargar los pines desde Firestore
  useEffect(() => {
    const fetchMarkers = async () => {
      try {
        const querySnapshot = await getDocs(collection(firestore, 'Marcadores'));
        const loadedMarkers = [];
        querySnapshot.forEach((doc) => {
          loadedMarkers.push({ id: doc.id, ...doc.data() });
        });
        setMarkers((currentMarkers) => [...currentMarkers, ...loadedMarkers]);
        setLoadingMarkers(false); // Marcar que los pines han sido cargados
      } catch (error) {
        console.error('Error al cargar los marcadores:', error);
      }
    };

    fetchMarkers();
  }, []);

  // Función para centrar el mapa en la ubicación actual del usuario
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

  // Función para agregar un nuevo pin al mapa y guardarlo en Firestore
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

  // Añadir un nuevo pin a Firestore
  const addNewPin = async (latitude, longitude, severity) => {
    const newMarker = {
      latitude,
      longitude,
      severity,
    };

    // Actualiza el estado local
    setMarkers((currentMarkers) => [...currentMarkers, newMarker]);

    // Guarda el nuevo pin en Firestore
    try {
      await addDoc(collection(firestore, 'Marcadores'), newMarker);
      console.log('Pin guardado exitosamente en Firestore');
    } catch (error) {
      console.error('Error al guardar el pin:', error);
    }
  };

  // Obtener el color del pin basado en la severidad
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

  // Cambiar el color de un pin al hacer clic
  const handleMarkerPress = (index) => {
    Alert.alert(
      'Cambiar color del pin',
      'Selecciona un color para la gravedad:',
      [
        {
          text: 'Rojo (grave)',
          onPress: () => changePinColor(index, 'red'),
        },
        {
          text: 'Amarillo (leve)',
          onPress: () => changePinColor(index, 'yellow'),
        },
        {
          text: 'Verde (Estable)',
          onPress: () => changePinColor(index, 'green'),
        },
        {
          text: 'Cancelar',
          style: 'cancel',
        },
      ]
    );
  };

  // Cambiar la severidad de un pin y actualizar Firestore
  const changePinColor = async (index, newSeverity) => {
    const markerToUpdate = markers[index];

    // Actualiza el estado local
    setMarkers((currentMarkers) =>
      currentMarkers.map((marker, markerIndex) =>
        markerIndex === index ? { ...marker, severity: newSeverity } : marker
      )
    );

    // Actualiza el pin en Firestore
    try {
      const markerDoc = doc(firestore, 'Marcadores', markerToUpdate.id); // Usa el ID del documento
      await updateDoc(markerDoc, { severity: newSeverity });
      console.log('Pin actualizado exitosamente en Firestore');
    } catch (error) {
      console.error('Error al actualizar el pin:', error);
    }
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

      {/* Botón para centrar en la ubicación actual */}
      <TouchableOpacity style={styles.locationButton} onPress={centerOnUserLocation}>
        <MaterialIcons name="my-location" size={24} color="white" />
      </TouchableOpacity>
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
});

export default MapContent;