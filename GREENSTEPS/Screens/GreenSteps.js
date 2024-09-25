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

// Inicializa Firebase
const storage = getStorage(getApp());
const firestore = getFirestore(getApp());

const HomeContent = () => {
  const [media, setMedia] = useState([]);
  const [descripcion, setDescripcion] = useState('');
  const [titulo, setTitulo] = useState('');
  const [estado, setEstado] = useState('');
  const [comentario, setComentario] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { width } = useWindowDimensions();

  const pickMedia = async () => {
    setIsLoading(true);
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: true,
      selectionLimit: 10,
      aspect: [4, 3],
      quality: 1,
    });

    setIsLoading(false);

    if (!result.canceled) {
      setMedia(result.assets || []);
    }
  };

  const uploadMedia = async (uri, type) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const filename = `${Date.now()}_${type}`;
      const storageRef = ref(storage, `media/${filename}`);
      await uploadBytes(storageRef, blob);
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error("Error al subir archivo a Firebase Storage: ", error);
      throw error;
    }
  };
  
  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      let fotoURL = '';
      let videoURL = '';

      // Subir imágenes y videos a Firebase Storage
      for (const item of media) {
        if (item.type === 'image') {
          fotoURL = await uploadMedia(item.uri, 'image');
        } else if (item.type === 'video') {
          videoURL = await uploadMedia(item.uri, 'video');
        }
      }

      // Guardar datos en Firestore
      await addDoc(collection(firestore, 'reportes'), {
        descripcion,
        titulo,
        estado,
        fecha_reportes: Timestamp.now(),  // Genera la fecha automáticamente
        foto: fotoURL,
        video: videoURL,
        comentario
      });

      alert('Reporte enviado exitosamente.');
      setDescripcion('');
      setTitulo('');
      setComentario('');
    } catch (error) {
      console.error("Error al subir datos: ", error);
      alert(`Error al subir datos: ${error.message}`);
      setIsLoading(false);
    }
  };

  const renderItem = ({ item }) => {
    if (item.type === 'image') {
      return <Image source={{ uri: item.uri }} style={{ width: width, height: 270}} />;
    } else if (item.type === 'video') {
      return (
        <Video
          source={{ uri: item.uri }}
          style={{ width: width, height: 270 }}
          useNativeControls
          resizeMode="contain"
          isLooping
        />
      );
    } else {
      return null;
    }
  };

  return (
    <View>
      <TextInput
        style={styles.input}
        placeholder="Título"
        value={titulo}
        onChangeText={setTitulo}
      />
      <TextInput
        style={styles.input}
        placeholder="Descripción"
        value={descripcion}
        onChangeText={setDescripcion}
      />
      <TextInput
        style={styles.input}
        placeholder="Comentario"
        value={comentario}
        onChangeText={setComentario}
      />
      <TextInput
        style={styles.input}
        placeholder="Estado"
        value={estado}
        onChangeText={setEstado}
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Enviar Reporte</Text>
      </TouchableOpacity>

      <Button title="Agregar Imagen o Video" onPress={pickMedia} />
      {isLoading && <ActivityIndicator size="large" color="#0000ff" />}
      
      <FlatList
        data={media}
        renderItem={renderItem}
        keyExtractor={(item) => item.uri}
        contentContainerStyle={{ marginVertical: 50, paddingBottom: 100 }}
      />
    </View>
  );
}

  

// Componente para el contenido de Reporte con imagen y un campo de texto
const noticias = [
  {
    id: '1',
    titulo: 'Cambio climático amenaza a la biodiversidad',
    descripcion: 'El calentamiento global pone en riesgo a miles de especies.',
    url: 'https://www.noticias1.com',
   
  },
  {
    id: '2',
    titulo: 'Innovaciones verdes para el futuro',
    descripcion: 'Nuevas tecnologías están cambiando la manera en que cuidamos el planeta.',
    url: 'https://www.noticias2.com',
    
  },
  {
    id: '3',
    titulo: 'Reducción del plástico en los océanos',
    descripcion: 'Proyectos globales buscan reducir los desechos plásticos en los océanos.',
    url: 'https://www.noticias3.com',
 
  },
];

const NoticiaItem = ({ noticia }) => {
  const handlePress = () => {
    Linking.openURL(noticia.url).catch(err => console.error("Error al abrir URL:", err));
  };

  return (
    <TouchableOpacity onPress={handlePress} style={styles.card}>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{noticia.titulo}</Text>
        <Text style={styles.cardDescription}>{noticia.descripcion}</Text>
      </View>
    </TouchableOpacity>
  );
};

// Componente principal
const ReportContent = () => {
  return (
    <View style={styles.contentContainer}>
      <Text style={styles.headerText}>Noticias</Text>
      
      <FlatList
        data={noticias}
        renderItem={({ item }) => <NoticiaItem noticia={item} />}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};



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

const SettingsContent = () => (
  <View style={styles.contentContainer}>
    <Text style={styles.contentText}>Configuración de la App</Text>
    <TouchableOpacity style={styles.button} onPress={() => alert('Configuración guardada')}>
      <Text style={styles.buttonText}>Guardar configuración</Text>
    </TouchableOpacity>
  </View>
);

export default function GreenSteps() {
  const [activeComponent, setActiveComponent] = useState(<HomeContent />);

  return (
    <View style={styles.container}>
      <Image source={require('../IMAGENES/logo2.png')} style={styles.logo} />
      <Text style={styles.text}>Green Steps</Text>

      <View style={styles.contentArea}>
        {activeComponent}
      </View>

      {/* Barra de navegación */}
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.navButton} onPress={() => setActiveComponent(<HomeContent />)}>
          <MaterialIcons name="home" size={24} color="white" />
          <Text style={styles.navText}>Reportes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => setActiveComponent(<ReportContent />)}>
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
  map: {
    width: '100%',
    height: 200,
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
});