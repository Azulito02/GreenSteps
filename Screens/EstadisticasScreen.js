import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, ActivityIndicator, Button, Alert } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { app } from '../bd/firebaseconfig';
import { jsPDF } from 'jspdf';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';

const EstadisticasScreen = () => {
  const db = getFirestore(app);
  const [data, setData] = useState({ usuarios: 0, articulos: 0, reportes: 0 });
  const [reportesPorUsuario, setReportesPorUsuario] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const usuariosChartRef = useRef(); 
  const reportesChartRef = useRef(); 
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtener usuarios
        const usersSnapshot = await getDocs(collection(db, 'usuarios'));
        const usuariosData = {};
        let usuariosCount = 0;
    
        usersSnapshot.forEach(doc => {
          const nombre = doc.data().nombre || 'Usuario Desconocido';
          usuariosData[doc.id] = nombre;
          usuariosCount += 1; // Contamos cada usuario
        });
        console.log("Usuarios obtenidos:", usuariosData);
    
        // Obtener reportes y procesarlos
        const reportesSnapshot = await getDocs(collection(db, 'reportes'));
        const reportesPorUsuarioData = {};
        let reportesCount = 0;
    
        reportesSnapshot.forEach(doc => {
          const reporte = doc.data();
          const userId = reporte.userId;
          reportesCount += 1; // Contamos cada reporte
    
          if (userId && usuariosData[userId]) {
            reportesPorUsuarioData[userId] = (reportesPorUsuarioData[userId] || 0) + 1;
          } else {
            console.warn(`Usuario con ID ${userId} no encontrado en usuariosData o no tiene nombre.`);
          }
        });
    
        // Obtener artículos (si la colección de artículos existe en Firestore)
        const articulosSnapshot = await getDocs(collection(db, 'articulos'));
        const articulosCount = articulosSnapshot.size; // Contamos los documentos de artículos
    
        // Actualizar el estado `data` con los conteos
        setData({
          usuarios: usuariosCount,
          articulos: articulosCount,
          reportes: reportesCount,
        });
  
        // Filtrar usuarios que tienen al menos un reporte
        const reportesPorUsuarioArray = Object.keys(reportesPorUsuarioData)
          .map(userId => ({
            usuario: usuariosData[userId],
            cantidad: reportesPorUsuarioData[userId],
          }))
          .filter(item => item.cantidad > 0); // Filtrar para incluir solo usuarios con reportes
    
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

  const colors = ['#FF6384', '#36A2EB', '#FFCE56']; // Colores para cada barra

  const generatePDF = async (chartRef, title, data) => {
    try {
      const uri = await captureRef(chartRef, {
        format: "png",
        quality: 1,
        width: Dimensions.get('window').width - 30,
        height: 220,
      });

      const doc = new jsPDF();
      doc.text(title, 10, 10);

      const chartImage = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      doc.addImage(`data:image/png;base64,${chartImage}`, "PNG", 10, 20, 180, 100);

      data.forEach((item, index) => {
        doc.text(`${item.label}: ${item.value}`, 10, 130 + index * 10);
      });

      const pdfBase64 = doc.output('datauristring').split(',')[1];
      const fileUri = `${FileSystem.documentDirectory}${title.replace(/\s+/g, '_').toLowerCase()}.pdf`;

      await FileSystem.writeAsStringAsync(fileUri, pdfBase64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      await Sharing.shareAsync(fileUri);
    } catch (error) {
      console.error("Error al generar o compartir el PDF: ", error);
      Alert.alert('Error', 'No se pudo generar o compartir el PDF.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Estadísticas</Text>
      {isLoading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <>
          <View ref={usuariosChartRef} collapsable={false}>
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
                color: (opacity = 1) => `rgba(0, 123, 255, ${opacity})`,
              }}
              style={{
                borderRadius: 10,
              }}
            />
          </View>
          <Button title="Generar PDF" onPress={() => generatePDF(usuariosChartRef, 'Estadísticas Generales', [
            { label: 'Usuarios', value: data.usuarios },
            { label: 'Artículos', value: data.articulos },
            { label: 'Reportes', value: data.reportes },
          ])} />

          <Text style={styles.subtitle}>Reportes por Usuario</Text>
          <View ref={reportesChartRef} collapsable={false}>
            <BarChart
              data={reportesPorUsuarioData}
              width={Dimensions.get('window').width - 30}
              height={220}
              yAxisLabel=""
              chartConfig={{
                backgroundColor: 'purple',
                backgroundGradientFrom: '#eff3ff',
                backgroundGradientTo: '#efefef',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(0, 123, 255, ${opacity})`,
              }}
              style={{
                borderRadius: 10,
              }}
            />
          </View>
          <Button title="Generar PDF " onPress={() => generatePDF(reportesChartRef, 'Reportes por Usuario', reportesPorUsuario.map(item => ({
            label: item.usuario,
            value: item.cantidad,
          })))} />
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
