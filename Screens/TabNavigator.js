// TabNavigator.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import EstadisticasScreen from './EstadisticasScreen';


const Tab = createBottomTabNavigator();

const TabNavigator = () => (
  <Tab.Navigator>
    <Tab.Screen name="Estadísticas" component={EstadisticasScreen} />
  </Tab.Navigator>
);

export default TabNavigator;
