// TabNavigator.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AjustesScreen from './AjustesScreen';
import EstadisticasScreen from './EstadisticasScreen';


const Tab = createBottomTabNavigator();

const TabNavigator = () => (
  <Tab.Navigator>
    <Tab.Screen name="Ajustes" component={AjustesScreen} />
    <Tab.Screen name="Estadísticas" component={EstadisticasScreen} />
  </Tab.Navigator>
);

export default TabNavigator;
