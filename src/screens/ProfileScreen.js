import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Avatar, Card, Button, Switch } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';

export default function ProfileScreen({ navigation }) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);

  const profileData = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    location: 'New York, NY',
    joinDate: 'January 2024',
  };

  const menuItems = [
    {
      title: 'Edit Profile',
      icon: 'edit',
      onPress: () => {},
    },
    {
      title: 'Change Password',
      icon: 'lock',
      onPress: () => {},
    },
    {
      title: 'Privacy Settings',
      icon: 'security',
      onPress: () => {},
    },
    {
      title: 'Help & Support',
      icon: 'help',
      onPress: () => {},
    },
    {
      title: 'About',
      icon: 'info',
      onPress: () => {},
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Avatar.Text 
          size={80} 
          label={profileData.name.split(' ').map(n => n[0]).join('')}
          style={styles.avatar}
          color="#fff"
        />
        <Text style={styles.name}>{profileData.name}</Text>
        <Text style={styles.email}>{profileData.email}</Text>
      </View>

      <View style={styles.infoContainer}>
        <Card style={styles.infoCard}>
          <Card.Content>
            <View style={styles.infoRow}>
              <MaterialIcons name="phone" size={20} color="#556B2F" />
              <Text style={styles.infoText}>{profileData.phone}</Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialIcons name="location-on" size={20} color="#556B2F" />
              <Text style={styles.infoText}>{profileData.location}</Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialIcons name="calendar-today" size={20} color="#556B2F" />
              <Text style={styles.infoText}>Member since {profileData.joinDate}</Text>
            </View>
          </Card.Content>
        </Card>
      </View>

      <View style={styles.settingsContainer}>
        <Text style={styles.sectionTitle}>Settings</Text>
        
        <Card style={styles.settingCard}>
          <Card.Content>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <MaterialIcons name="notifications" size={24} color="#556B2F" />
                <Text style={styles.settingText}>Push Notifications</Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                color="#556B2F"
              />
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.settingCard}>
          <Card.Content>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <MaterialIcons name="dark-mode" size={24} color="#556B2F" />
                <Text style={styles.settingText}>Dark Mode</Text>
              </View>
              <Switch
                value={darkModeEnabled}
                onValueChange={setDarkModeEnabled}
                color="#556B2F"
              />
            </View>
          </Card.Content>
        </Card>
      </View>

      <View style={styles.menuContainer}>
        <Text style={styles.sectionTitle}>Account</Text>
        
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={item.onPress}
          >
            <View style={styles.menuLeft}>
              <MaterialIcons name={item.icon} size={24} color="#556B2F" />
              <Text style={styles.menuText}>{item.title}</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#ccc" />
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.logoutContainer}>
        <Button
          mode="outlined"
          onPress={() => navigation.navigate('Welcome')}
          style={styles.logoutButton}
          textColor="#d32f2f"
          buttonColor="transparent"
        >
          Sign Out
        </Button>
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
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#556B2F',
  },
  avatar: {
    backgroundColor: '#6B8E23',
    marginBottom: 15,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  infoContainer: {
    padding: 20,
  },
  infoCard: {
    backgroundColor: '#fff',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  settingsContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  settingCard: {
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  menuContainer: {
    padding: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  logoutContainer: {
    padding: 20,
  },
  logoutButton: {
    borderColor: '#d32f2f',
  },
});