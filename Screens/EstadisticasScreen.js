import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { app } from '../bd/firebaseconfig';
import { jsPDF } from 'jspdf';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const EstadisticasScreen = () => {
  const db = getFirestore(app);
  const [data, setData] = useState({ usuarios: 0, articulos: 0, reportes: 0 });
  const [reportesPorUsuario, setReportesPorUsuario] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, 'usuarios'));
        const usuariosData = {};
        let usuariosCount = 0;

        usersSnapshot.forEach(doc => {
          const nombre = doc.data().nombre || 'Usuario Desconocido';
          usuariosData[doc.id] = nombre;
          usuariosCount += 1;
        });

        const reportesSnapshot = await getDocs(collection(db, 'reportes'));
        const reportesPorUsuarioData = {};
        let reportesCount = 0;

        reportesSnapshot.forEach(doc => {
          const reporte = doc.data();
          const userId = reporte.userId;
          reportesCount += 1;

          if (userId && usuariosData[userId]) {
            reportesPorUsuarioData[userId] = (reportesPorUsuarioData[userId] || 0) + 1;
          }
        });

        const articulosSnapshot = await getDocs(collection(db, 'articulos'));
        const articulosCount = articulosSnapshot.size;

        setData({
          usuarios: usuariosCount,
          articulos: articulosCount,
          reportes: reportesCount,
        });

        setReportesPorUsuario(Object.keys(reportesPorUsuarioData)
          .map(userId => ({
            usuario: usuariosData[userId],
            cantidad: reportesPorUsuarioData[userId],
          }))
          .filter(item => item.cantidad > 0)
        );
      } catch (error) {
        console.error('Error al obtener estadísticas:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const generatePDF = async (title, data) => {
    try {
      const doc = new jsPDF();
      doc.text(title, 10, 10);

      data.forEach((item, index) => {
        doc.text(`${item.label}: ${item.value}`, 10, 20 + index * 10);
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

  const CustomButton = ({ title, onPress }) => (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {isLoading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <>
          <Text style={styles.subtitle}>Estadísticas Generales</Text>
          <PieChart
            data={[
              { name: 'Usuarios', population: data.usuarios, color: '#FF6384', legendFontColor: "#7F7F7F", legendFontSize: 12 },
              { name: 'Artículos', population: data.articulos, color: '#36A2EB', legendFontColor: "#7F7F7F", legendFontSize: 12 },
              { name: 'Reportes', population: data.reportes, color: '#FFCE56', legendFontColor: "#7F7F7F", legendFontSize: 12 }
            ]}
            width={Dimensions.get('window').width - 30}
            height={220}
            chartConfig={{
              backgroundColor: '#1cc910',
              backgroundGradientFrom: '#eff3ff',
              backgroundGradientTo: '#efefef',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(0, 123, 255, ${opacity})`,
            }}
            accessor="population"
            backgroundColor="transparent"
          />
          <CustomButton title="Generar PDF de Estadísticas Generales" onPress={() => generatePDF('Estadísticas Generales', [
            { label: 'Usuarios', value: data.usuarios },
            { label: 'Artículos', value: data.articulos },
            { label: 'Reportes', value: data.reportes },
          ])} />

          <Text style={styles.subtitle}>Reportes por Usuario</Text>
          <PieChart
            data={reportesPorUsuario.map(item => ({
              name: item.usuario,
              population: item.cantidad,
              color: `hsl(${Math.random() * 360}, 70%, 60%)`,
              legendFontColor: "#7F7F7F",
              legendFontSize: 12
            }))}
            width={Dimensions.get('window').width - 30}
            height={220}
            chartConfig={{
              backgroundColor: '#FF5733',
              backgroundGradientFrom: '#eff3ff',
              backgroundGradientTo: '#efefef',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(0, 123, 255, ${opacity})`,
            }}
            accessor="population"
            backgroundColor="transparent"
          />
          <CustomButton title="Generar PDF de Reportes por Usuario" onPress={() => generatePDF('Reportes por Usuario', reportesPorUsuario.map(item => ({
            label: item.usuario,
            value: item.cantidad,
          })))} />
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    marginVertical: 5,
  },
  button: {
    backgroundColor: '#007BFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginVertical: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EstadisticasScreen;
