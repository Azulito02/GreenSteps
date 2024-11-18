import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { collection, getFirestore, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
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

  const marcarNotificacionComoLeida = async (id) => {
    try {
      const notificacionRef = doc(firestore, 'notificaciones', id);
      await updateDoc(notificacionRef, { leida: true });
      setNotificaciones((prev) =>
        prev.map((notif) =>
          notif.id === id ? { ...notif, leida: true } : notif
        )
      );
    } catch (error) {
      console.error('Error al marcar notificación como leída:', error);
    }
  };

  const marcarReporteComoLeido = async (id) => {
    try {
      const reporteRef = doc(firestore, 'reportes', id);
      await updateDoc(reporteRef, { leido: true });
      setReportes((prev) =>
        prev.map((reporte) =>
          reporte.id === id ? { ...reporte, leido: true } : reporte
        )
      );
    } catch (error) {
      console.error('Error al marcar reporte como leído:', error);
    }
  };

  useEffect(() => {
    fetchNotificaciones();
    fetchReportes();
  }, []);

  const renderNotificacion = ({ item }) => (
    <View
      style={[
        styles.notificacionItem,
        item.leida ? styles.notificacionLeida : styles.notificacionNoLeida,
      ]}
    >
      <Text style={styles.notificacionTitle}>{item.titulo}</Text>
      <Text style={styles.notificacionText}>{item.mensaje}</Text>
      {item.fecha_creacion && (
        <Text style={styles.notificacionDate}>
          Fecha: {item.fecha_creacion.toDate().toLocaleDateString()}
        </Text>
      )}
      {!item.leida && (
        <TouchableOpacity
          style={styles.markAsReadButton}
          onPress={() => marcarNotificacionComoLeida(item.id)}
        >
          <Text style={styles.markAsReadButtonText}>Marcar como leída</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderReporte = ({ item }) => (
    <View
      style={[
        styles.notificacionItem,
        item.leido ? styles.notificacionLeida : styles.notificacionNoLeida,
      ]}
    >
      <Text style={styles.notificacionText}>
        {`${item.nombre} reportó: ${item.titulo || 'Sin título'} - ${
          item.descripcion || 'Sin descripción'
        }`}
      </Text>
      {item.fecha_reportes && (
        <Text style={styles.notificacionDate}>
          Fecha: {item.fecha_reportes.toDate().toLocaleDateString()}
        </Text>
      )}
      {!item.leido && (
        <TouchableOpacity
          style={styles.markAsReadButton}
          onPress={() => marcarReporteComoLeido(item.id)}
        >
          <Text style={styles.markAsReadButtonText}>Marcar como leído</Text>
        </TouchableOpacity>
      )}
    </View>
  );

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
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },
  notificacionNoLeida: {
    backgroundColor: '#e0f7fa',
  },
  notificacionLeida: {
    backgroundColor: '#fff',
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
  notificacionDate: {
    fontSize: 12,
    color: '#888',
  },
  markAsReadButton: {
    marginTop: 10,
    backgroundColor: '#007BFF',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  markAsReadButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default NotificacionesComponent;
