import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Alert, View, Text, Image, TouchableOpacity, TextInput, FlatList, useWindowDimensions, Linking, Button, ActivityIndicator } from 'react-native';
import { Video } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore'; 
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { getApp } from 'firebase/app';  
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

// Componente para el contenido de Mapa con el mapa integrado

const MapContent = () => {
    const initialLatitude = 12.8654;
    const initialLongitude = -85.2072;
    const zoom = 6; // Nivel de zoom adecuado para ver Nicaragua
  
    const mapRef = useRef(null); // Referencia al mapa para poder moverlo programáticamente
  
    const [markers, setMarkers] = useState([
      {
        latitude: initialLatitude,
        longitude: initialLongitude,
        title: 'Nicaragua',
        description: 'Este es el centro de Nicaragua',
        severity: 'green', // Gravedad inicial en verde
      },
    ]);
  
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
  
    // Función para obtener la ubicación actual del usuario y centrar el mapa en esa posición
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
        latitudeDelta: 0.01, // Zoom para acercar bastante
        longitudeDelta: 0.01,
      });
    };
  
    // Función para agregar un nuevo pin (marcador) en la ubicación donde el usuario tocó
    const handleMapPress = (event) => {
      const { latitude, longitude } = event.nativeEvent.coordinate;
  
      // Mostrar un Alert para que el usuario seleccione el color del pin
      Alert.alert(
        'Selecciona el color del pin',
        'Elige la severidad del nuevo pin:',
        [
          {
            text: 'Rojo (grave)',
            onPress: () => addNewPin(latitude, longitude, 'red'), // Añadir pin rojo
          },
          {
            text: 'Amarillo (leve)',
            onPress: () => addNewPin(latitude, longitude, 'yellow'), // Añadir pin amarillo
          },
          {
            text: 'Verde (no serio)',
            onPress: () => addNewPin(latitude, longitude, 'green'), // Añadir pin verde
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
      setMarkers([
        ...markers,
        {
          latitude,
          longitude,
          title: 'Nuevo pin',
          description: 'Pin añadido por el usuario',
          severity, // Color según la selección del usuario
        },
      ]);
    };
  
    // Función para obtener el color del pin en función de la severidad
    const getPinColor = (severity) => {
      switch (severity) {
        case 'red':
          return 'red'; // Grave
        case 'yellow':
          return 'yellow'; // Leve
        case 'green':
          return 'green'; // No serio
        default:
          return 'blue'; // Color por defecto
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
      const updatedMarkers = markers.map((marker, markerIndex) => {
        if (markerIndex === index) {
          return {
            ...marker,
            severity: newSeverity,
          };
        }
        return marker;
      });
  
      setMarkers(updatedMarkers);
    };
  
    return (
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef} // Referencia al mapa
          style={styles.map}
          initialRegion={{
            latitude: initialLatitude,
            longitude: initialLongitude,
            latitudeDelta: 2.5, // Ajustar para ver más del país
            longitudeDelta: 2.5,
          }}
          onPress={handleMapPress} // Evento al tocar el mapa
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
              pinColor={getPinColor(marker.severity)} // Asignar color basado en la severidad
              onPress={() => handleMarkerPress(index)} // Cambiar color al presionar un marcador
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
        backgroundColor: '#008000', // Color verde para el botón
        padding: 10,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5, // Sombra para que el botón resalte
      },
      mapContainer: {
        flex: 1,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
      },
    });

    export default MapContent;
