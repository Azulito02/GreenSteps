// src/screens/EstadisticasScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { app } from '../bd/firebaseconfig';

const EstadisticasScreen = () => {
  const db = getFirestore(app);
  const [data, setData] = useState({ usuarios: 0, articulos: 0, reportes: 0 });
  const [reportesPorUsuario, setReportesPorUsuario] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtén datos de usuarios
        const usersSnapshot = await getDocs(collection(db, 'usuarios'));
        const usuariosCount = usersSnapshot.size;

        // Mapea usuarios por ID
        const usuariosData = {};
        usersSnapshot.forEach(doc => {
          usuariosData[doc.id] = doc.data().nombre || 'Usuario Desconocido';
        });

        // Obtén datos de articulos
        const articulosSnapshot = await getDocs(collection(db, 'articulos'));
        const articulosCount = articulosSnapshot.size;

        // Obtén datos de reportes
        const reportesSnapshot = await getDocs(collection(db, 'reportes'));
        const reportesCount = reportesSnapshot.size;

        // Procesar reportes por usuario
        const reportesPorUsuarioData = {};
        reportesSnapshot.forEach(doc => {
          const reporte = doc.data();
          const usuarioId = reporte.usuarioId;
          if (reportesPorUsuarioData[usuarioId]) {
            reportesPorUsuarioData[usuarioId]++;
          } else {
            reportesPorUsuarioData[usuarioId] = 1;
          }
        });

        // Transformar los datos a un formato que sea útil para el gráfico
        const reportesPorUsuarioArray = Object.keys(reportesPorUsuarioData).map(usuarioId => ({
          usuario: usuariosData[usuarioId] || 'Usuario Desconocido',
          cantidad: reportesPorUsuarioData[usuarioId],
        }));

        setData({
          usuarios: usuariosCount,
          articulos: articulosCount,
          reportes: reportesCount,
        });
        setReportesPorUsuario(reportesPorUsuarioArray);
      } catch (error) {
        console.error('Error al obtener estadísticas:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const chartData = {
    labels: ['Usuarios', 'Artículos', 'Reportes'],
    datasets: [
      {
        data: [data.usuarios, data.articulos, data.reportes],
      },
    ],
  };

  const reportesPorUsuarioData = {
    labels: reportesPorUsuario.map(item => item.usuario),
    datasets: [
      {
        data: reportesPorUsuario.map(item => item.cantidad),
      },
    ],
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Estadísticas</Text>
      {isLoading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <>
          <BarChart
            data={chartData}
            width={Dimensions.get('window').width - 30}
            height={220}
            yAxisLabel=""
            chartConfig={{
              backgroundColor: '#1cc910',
              backgroundGradientFrom: '#eff3ff',
              backgroundGradientTo: '#efefef',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(0, 0, 255, ${opacity})`,
              style: {
                borderRadius: 16,
              },
            }}
            style={{
              marginVertical: 8,
              borderRadius: 16,
            }}
          />
          <Text style={styles.subtitle}>Reportes por Usuario</Text>
          <BarChart
            data={reportesPorUsuarioData}
            width={Dimensions.get('window').width - 30}
            height={220}
            yAxisLabel=""
            chartConfig={{
              backgroundColor: '#1cc910',
              backgroundGradientFrom: '#eff3ff',
              backgroundGradientTo: '#efefef',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(0, 0, 255, ${opacity})`,
              style: {
                borderRadius: 16,
              },
            }}
            style={{
              marginVertical: 8,
              borderRadius: 16,
            }}
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
});

export default EstadisticasScreen;
