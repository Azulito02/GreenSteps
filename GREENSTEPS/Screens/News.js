// Array de noticias
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
  
  // Componente NoticiaItem (Tarjeta)
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
  
  // Estilos
  const styles = StyleSheet.create({
    contentContainer: {
      flex: 1,
      padding: 10,
      backgroundColor: '#f9f9f9',
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
  });
  
  export default ReportContent;