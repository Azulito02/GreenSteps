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

  const usuariosChartRef = useRef(); // Referencia al primer gráfico
  const reportesChartRef = useRef(); // Referencia al segundo gráfico

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtener usuarios
        const usersSnapshot = await getDocs(collection(db, 'usuarios'));
        const usuariosCount = usersSnapshot.size;

        // Crear un diccionario de usuarios {usuarioId: nombre}
        const usuariosData = {};
        usersSnapshot.forEach(doc => {
          usuariosData[doc.id] = doc.data().nombre || 'Usuario Desconocido';
        });

        // Obtener artículos y reportes
        const articulosSnapshot = await getDocs(collection(db, 'articulos'));
        const articulosCount = articulosSnapshot.size;

        const reportesSnapshot = await getDocs(collection(db, 'reportes'));
        const reportesCount = reportesSnapshot.size;

        // Procesar los reportes por usuario
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

        // Convertir los datos en un arreglo para el gráfico
        const reportesPorUsuarioArray = Object.keys(reportesPorUsuarioData).map(usuarioId => ({
          usuario: usuariosData[usuarioId] || 'Usuario Desconocido', // Usar el nombre del usuario
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

  // Generar datos para el gráfico de reportes por usuario
  const reportesPorUsuarioData = {
    labels: reportesPorUsuario.map(item => item.usuario), // Muestra los nombres de los usuarios
    datasets: [
      {
        data: reportesPorUsuario.map(item => item.cantidad),
      },
    ],
  };

  const generatePDF = async (chartRef, title, data) => {
    try {
      // Capturar el gráfico como imagen
      const uri = await captureRef(chartRef, {
        format: "png",
        quality: 1,
        width: Dimensions.get('window').width - 30,
        height: 220,
      });

      // Crear una instancia de jsPDF
      const doc = new jsPDF();

      // Agregar título al PDF
      doc.text(title, 10, 10);

      // Leer la imagen capturada y agregarla al PDF
      const chartImage = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      doc.addImage(`data:image/png;base64,${chartImage}`, "PNG", 10, 20, 180, 100);

      // Agregar los datos al PDF en formato de texto
      data.forEach((item, index) => {
        doc.text(`${item.label}: ${item.value}`, 10, 130 + index * 10);
      });

      // Generar el PDF como base64
      const pdfBase64 = doc.output('datauristring').split(',')[1];
      const fileUri = `${FileSystem.documentDirectory}${title.replace(/\s+/g, '_').toLowerCase()}.pdf`;

      // Guardar el archivo PDF
      await FileSystem.writeAsStringAsync(fileUri, pdfBase64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Compartir el archivo PDF
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
          {/* Gráfico de Estadísticas Generales */}
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
          </View>
          <Button title="Generar PDF de Estadísticas Generales" onPress={() => generatePDF(usuariosChartRef, 'Estadísticas Generales', [
            { label: 'Usuarios', value: data.usuarios },
            { label: 'Artículos', value: data.articulos },
            { label: 'Reportes', value: data.reportes },
          ])} />

          {/* Gráfico de Reportes por Usuario */}
          <Text style={styles.subtitle}>Reportes por Usuario</Text>
          <View ref={reportesChartRef} collapsable={false}>
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
          </View>
          <Button title="Generar PDF de Reportes por Usuario" onPress={() => generatePDF(reportesChartRef, 'Reportes por Usuario', reportesPorUsuario.map(item => ({
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
