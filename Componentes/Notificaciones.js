import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { collection, getFirestore, getDocs, doc, getDoc } from 'firebase/firestore';
import { getApp } from 'firebase/app';

const app = getApp();
const firestore = getFirestore(app);

const NotificacionesComponent = () => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [reportes, setReportes] = useState([]);

  const fetchNotificaciones = async () => {
    try {
      const notificacionesSnapshot = await getDocs(collection(firestore, 'notificaciones'));
      const notificacionesArray = await Promise.all(
        notificacionesSnapshot.docs.map(async (notificacionDoc) => {
          const notificacionData = notificacionDoc.data();
          let nombre = 'Usuario desconocido';

          if (notificacionData.userId) {
            const userRef = doc(firestore, 'usuarios', notificacionData.userId);
            const userDoc = await getDoc(userRef);
            if (userDoc.exists()) {
              nombre = userDoc.data().nombre || 'Usuario sin nombre';
            }
          }

          return {
            id: notificacionDoc.id,
            ...notificacionData,
            nombre,
          };
        })
      );
      setNotificaciones(notificacionesArray);
    } catch (error) {
      console.error('Error al obtener las notificaciones:', error);
    }
  };

  const fetchReportes = async () => {
    try {
      const reportesSnapshot = await getDocs(collection(firestore, 'reportes'));
      const reportesArray = await Promise.all(
        reportesSnapshot.docs.map(async (reporteDoc) => {
          const reporteData = reporteDoc.data();
          let nombre = 'Usuario desconocido';

          if (reporteData.userId) {
            const userRef = doc(firestore, 'usuarios', reporteData.userId);
            const userDoc = await getDoc(userRef);
            if (userDoc.exists()) {
              nombre = userDoc.data().nombre || 'Usuario sin nombre';
            }
          }

          return {
            id: reporteDoc.id,
            ...reporteData,
            nombre,
          };
        })
      );
      setReportes(reportesArray);
    } catch (error) {
      console.error('Error al obtener los reportes:', error);
    }
  };

  useEffect(() => {
    fetchNotificaciones();
    fetchReportes();
  }, []);

  const renderNotificacion = ({ item }) => (
    <View style={styles.notificacionItem}>
      <Text style={styles.notificacionTitle}>{item.titulo}</Text>
      <Text style={styles.notificacionText}>{item.mensaje}</Text>
      {item.fecha_creacion && (
        <Text style={styles.notificacionDate}>
          Fecha: {item.fecha_creacion.toDate().toLocaleDateString()}
        </Text>
      )}
    </View>
  );

  const renderReporte = ({ item }) => {
    const mensaje = `${item.nombre} reportó: ${item.titulo || 'Sin título'} - ${item.descripcion || 'Sin descripción'}`;
  
    return (
      <View style={styles.notificacionItem}>
        <Text style={styles.notificacionText}>{mensaje}</Text>
        {item.fecha_reportes && (
          <Text style={styles.notificacionDate}>
            Fecha: {item.fecha_reportes.toDate().toLocaleDateString()}
          </Text>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.sectionTitle}>Notificaciones</Text>
        <FlatList
          data={notificaciones}
          renderItem={renderNotificacion}
          keyExtractor={(item) => item.id}
        />
      </View>
      <View>
        <Text style={styles.sectionTitle}>Reportes</Text>
        <FlatList
          data={reportes}
          renderItem={renderReporte}
          keyExtractor={(item) => item.id}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f4f4f4',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  notificacionItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },
  notificacionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  notificacionText: {
    fontSize: 14,
    marginBottom: 5,
    color: '#555',
  },
  notificacionUser: {
    fontSize: 14,
    marginBottom: 5,
    color: '#333',
  },
  notificacionDate: {
    fontSize: 12,
    color: '#888',
  },
});

export default NotificacionesComponent;
