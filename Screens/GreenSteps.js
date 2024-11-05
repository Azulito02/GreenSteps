import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import ReportContent from './Reportes';
import NoticiasContent from './News';
import NoticiasContentUser from './Usuarios/NewsUser';
import MapContent from './MapContent';
import ImagePickerComponent from '../Componentes/ImagePickerComponent';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AjustesScreen from './AjustesScreen';
import Icon from 'react-native-vector-icons/Ionicons'; // He cambiado a 'Ionicons' para una apariencia más moderna

export default function GreenSteps() {
  const [activeComponent, setActiveComponent] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const storedRole = await AsyncStorage.getItem('rol');
        if (storedRole) {
          setUserRole(storedRole);
          if (storedRole === 'administrador') {
            setActiveComponent(<NoticiasContent />);
          } else {
            setActiveComponent(<ReportContent />);
          }
        }
      } catch (error) {
        console.error('Error fetching user role: ', error);
      }
    };

    fetchUserRole();
  }, []);

  const renderButtonsForadministrador = () => (
    <>
      <TouchableOpacity style={styles.navButton} onPress={() => setActiveComponent(<ReportContent />)}>
        <Icon name="document-text-outline" size={26} color="#1E88E5" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.navButton} onPress={() => setActiveComponent(<MapContent />)}>
        <Icon name="map-outline" size={26} color="#1E88E5" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.navButton} onPress={() => setActiveComponent(<NoticiasContent />)}>
        <Icon name="newspaper-outline" size={26} color="#1E88E5" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.navButton} onPress={() => setActiveComponent(<ImagePickerComponent />)}>
        <Icon name="camera-outline" size={26} color="#1E88E5" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.navButton} onPress={() => setActiveComponent(<AjustesScreen />)}>
        <Icon name="settings-outline" size={26} color="#1E88E5" />
      </TouchableOpacity>
    </>
  );

  const renderButtonsForUser = () => (
    <>
      <TouchableOpacity style={styles.navButton} onPress={() => setActiveComponent(<ReportContent />)}>
        <Icon name="document-text-outline" size={26} color="#1E88E5" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.navButton} onPress={() => setActiveComponent(<NoticiasContentUser />)}>
        <Icon name="newspaper-outline" size={26} color="#1E88E5" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.navButton} onPress={() => setActiveComponent(<ImagePickerComponent />)}>
        <Icon name="camera-outline" size={26} color="#1E88E5" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.navButton} onPress={() => setActiveComponent(<AjustesScreen />)}>
        <Icon name="settings-outline" size={26} color="#1E88E5" />
      </TouchableOpacity>
    </>
  );

  return (
    <View style={styles.container}>
      <View style={styles.contentArea}>{activeComponent}</View>

      {/* Barra de navegación */}
      <View style={styles.navBar}>
        {userRole === 'administrador' ? renderButtonsForadministrador() : renderButtonsForUser()}
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
    width: '105%',
    position: 'absolute',
    bottom: 0,
  },
  navButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
