import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Card, Button } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';

export default function DashboardScreen({ navigation }) {
  const dashboardItems = [
    {
      title: 'My Profile',
      icon: 'person',
      onPress: () => navigation.navigate('Profile'),
      color: '#556B2F',
    },
    {
      title: 'Projects',
      icon: 'work',
      onPress: () => {},
      color: '#6B8E23',
    },
    {
      title: 'Messages',
      icon: 'message',
      onPress: () => {},
      color: '#8FBC8F',
    },
    {
      title: 'Settings',
      icon: 'settings',
      onPress: () => {},
      color: '#9ACD32',
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome back!</Text>
        <Text style={styles.subtitle}>What would you like to do today?</Text>
      </View>

      <View style={styles.statsContainer}>
        <Card style={styles.statCard}>
          <Card.Content>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Active Projects</Text>
          </Card.Content>
        </Card>
        
        <Card style={styles.statCard}>
          <Card.Content>
            <Text style={styles.statNumber}>5</Text>
            <Text style={styles.statLabel}>New Messages</Text>
          </Card.Content>
        </Card>
      </View>

      <View style={styles.menuContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        {dashboardItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={item.onPress}
          >
            <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
              <MaterialIcons name={item.icon} size={24} color="#fff" />
            </View>
            <Text style={styles.menuText}>{item.title}</Text>
            <MaterialIcons name="chevron-right" size={24} color="#ccc" />
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.recentContainer}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <Card style={styles.activityCard}>
          <Card.Content>
            <Text style={styles.activityText}>Project "Bridge Builder" updated</Text>
            <Text style={styles.activityTime}>2 hours ago</Text>
          </Card.Content>
        </Card>
        
        <Card style={styles.activityCard}>
          <Card.Content>
            <Text style={styles.activityText}>New message from John Doe</Text>
            <Text style={styles.activityTime}>4 hours ago</Text>
          </Card.Content>
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#556B2F',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
    marginTop: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#556B2F',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  menuContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  recentContainer: {
    padding: 20,
  },
  activityCard: {
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  activityText: {
    fontSize: 16,
    color: '#333',
  },
  activityTime: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
});