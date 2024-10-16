import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Alert, View, TouchableOpacity } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

const MapContent = ({ route, navigation }) => {
  // Obtén las coordenadas desde los parámetros de la ruta o usa las iniciales si no están disponibles
  const initialLatitude = route?.params?.latitude || 12.8654; // Coordenada predeterminada
  const initialLongitude = route?.params?.longitude || -85.2072; // Coordenada predeterminada

  const mapRef = useRef(null);
  const [markers, setMarkers] = useState([
    {
      latitude: initialLatitude,
      longitude: initialLongitude,
      title: 'Ubicación inicial',
      description: 'Este es el lugar preciso al que se hace referencia',
      severity: 'blue',
    },
  ]); // Estado inicial de los marcadores
  const [location, setLocation] = useState(null);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);

  useEffect(() => {
    (async () => {
      // Pedir permisos de ubicación al usuario
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Necesitamos acceso a tu ubicación para centrar el mapa.');
        return;
      }
      setHasLocationPermission(true);
    })();
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

    // Centrar el mapa en la ubicación actual del usuario
    mapRef.current.animateToRegion({
      latitude,
      longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  };

  // Función para agregar un nuevo pin (marcador) en la ubicación donde el usuario tocó
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
          text: 'Verde (no serio)',
          onPress: () => addNewPin(latitude, longitude, 'green'),
        },
        {
          text: 'Cancelar',
          style: 'cancel',
        },
      ]
    );
  };

  // Función para añadir el nuevo pin al estado de markers
  const addNewPin = (latitude, longitude, severity) => {
    setMarkers((currentMarkers) => [
      ...currentMarkers,
      {
        latitude,
        longitude,
        title: 'Nuevo pin',
        description: 'Pin añadido por el usuario',
        severity,
      },
    ]);
  };

  // Función para obtener el color del pin en función de la severidad
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

  // Función para cambiar el color de un pin al hacer clic
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
          text: 'Verde (no serio)',
          onPress: () => changePinColor(index, 'green'),
        },
        {
          text: 'Cancelar',
          style: 'cancel',
        },
      ]
    );
  };

  // Función para cambiar la severidad de un pin y actualizar el estado
  const changePinColor = (index, newSeverity) => {
    setMarkers((currentMarkers) =>
      currentMarkers.map((marker, markerIndex) =>
        markerIndex === index ? { ...marker, severity: newSeverity } : marker
      )
    );
  };

  return (
    <View style={styles.mapContainer}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: initialLatitude,
          longitude: initialLongitude,
          latitudeDelta: 0.02, // Ajustar para acercar más al punto
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
            title={marker.title}
            description={marker.description}
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
