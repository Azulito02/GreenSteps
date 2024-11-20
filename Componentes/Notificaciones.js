import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  collection,
  getFirestore,
  getDocs,
  doc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { getApp } from 'firebase/app';

const app = getApp();
const firestore = getFirestore(app);

const NotificacionesComponent = () => {
  const [items, setItems] = useState([]);

  const fetchData = async () => {
    try {
      // Obtener notificaciones
      const notificacionesSnapshot = await getDocs(
        collection(firestore, 'notificaciones')
      );
      const notificacionesArray = notificacionesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        tipo: 'notificacion',
      }));

      // Obtener reportes
      const reportesSnapshot = await getDocs(collection(firestore, 'reportes'));
      const reportesArray = reportesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        tipo: 'reporte',
      }));

      // Combinar y ordenar por fecha
      const combinedArray = [...notificacionesArray, ...reportesArray].sort(
        (a, b) => {
          const fechaA = a.fecha_creacion?.toDate() || a.fecha_reportes?.toDate();
          const fechaB = b.fecha_creacion?.toDate() || b.fecha_reportes?.toDate();
          return fechaB - fechaA; // Más recientes primero
        }
      );

      setItems(combinedArray);
    } catch (error) {
      console.error('Error al obtener los datos:', error);
    }
  };

  const marcarTodoComoLeido = async () => {
    try {
      const batch = writeBatch(firestore);

      // Crear operaciones en el batch para cada elemento no leído
      items.forEach((item) => {
        if (item.tipo === 'notificacion' && !item.leida) {
          const ref = doc(firestore, 'notificaciones', item.id);
          batch.update(ref, { leida: true });
        } else if (item.tipo === 'reporte' && !item.leido) {
          const ref = doc(firestore, 'reportes', item.id);
          batch.update(ref, { leido: true });
        }
      });

      // Ejecutar el batch
      await batch.commit();

      // Actualizar el estado local
      setItems((prev) =>
        prev.map((item) => ({
          ...item,
          leida: item.tipo === 'notificacion' ? true : item.leida,
          leido: item.tipo === 'reporte' ? true : item.leido,
        }))
      );

      Alert.alert('Éxito', 'Todas las notificaciones y reportes se han marcado como leídos.');
    } catch (error) {
      console.error('Error al marcar todo como leído:', error);
      Alert.alert('Error', 'Hubo un problema al marcar todo como leído.');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const renderItem = ({ item }) => (
    <View
      style={[
        styles.itemContainer,
        item.leida || item.leido
          ? styles.itemLeido
          : styles.itemNoLeido,
      ]}
    >
      <Text style={styles.itemTitle}>
        {item.tipo === 'notificacion' ? 'Notificación' : 'Reporte'}
      </Text>
      <Text style={styles.itemText}>
        {item.titulo || 'Sin título'}
        {item.tipo === 'reporte' && ` - ${item.descripcion || 'Sin descripción'}`}
      </Text>
      <Text style={styles.itemDate}>
        Fecha:{' '}
        {(item.fecha_creacion || item.fecha_reportes)?.toDate().toLocaleDateString() ||
          'Sin fecha'}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Notificaciones y Reportes</Text>
      <TouchableOpacity
        style={styles.markAllAsReadButton}
        onPress={marcarTodoComoLeido}
      >
        <Text style={styles.markAsReadButtonText}>
          Marcar todo como leído
        </Text>
      </TouchableOpacity>
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
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
  itemContainer: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },
  itemNoLeido: {
    backgroundColor: '#e0f7fa',
  },
  itemLeido: {
    backgroundColor: '#fff',
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  itemText: {
    fontSize: 14,
    marginBottom: 5,
    color: '#555',
  },
  itemDate: {
    fontSize: 12,
    color: '#888',
  },
  markAllAsReadButton: {
    marginBottom: 15,
    backgroundColor: '#28a745',
    paddingVertical: 10,
    paddingHorizontal: 20,
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
