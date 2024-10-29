import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import ReportContent from './Reportes';
import NoticiasContent from './News';
import NoticiasContentUser from './Usuarios/NewsUser';
import MapContent from './MapContent';
import ImagePickerComponent from '../Componentes/ImagePickerComponent';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AjustesScreen  from './AjustesScreen';


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
        <Text style={styles.navText}>Reportes</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.navButton} onPress={() => setActiveComponent(<MapContent />)}>
        <Text style={styles.navText}>Mapa</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.navButton} onPress={() => setActiveComponent(<NoticiasContent />)}>
        <Text style={styles.navText}>Noticias</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.navButton} onPress={() => setActiveComponent(<ImagePickerComponent />)}>
        <Text style={styles.navText}>Cámara</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.navButton} onPress={() => setActiveComponent(<AjustesScreen />)}>
        <Text style={styles.navText}>Ajustes</Text>
      </TouchableOpacity>
    </>
  );

  const renderButtonsForUser = () => (
    <>
    <TouchableOpacity style={styles.navButton} onPress={() => setActiveComponent(<ReportContent />)}>
        <Text style={styles.navText}>Reportes</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navButton} onPress={() => setActiveComponent(<NoticiasContentUser />)}>
        <Text style={styles.navText}>Noticias</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navButton} onPress={() => setActiveComponent(<ImagePickerComponent />)}>
        <Text style={styles.navText}>Cámara</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.navButton} onPress={() => setActiveComponent(<AjustesScreen />)}>
        <Text style={styles.navText}>Ajustes</Text>
      </TouchableOpacity>
    </>

    
  );

  return (
    <View style={styles.container}>
      <View style={styles.contentArea}>
        {activeComponent}
      </View>

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
  navText: {
    color: '#000E5C',
    fontSize: 12,
  },
});
