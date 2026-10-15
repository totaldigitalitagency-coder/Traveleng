import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import * as Speech from 'expo-speech';

export default function HomeScreen() {
  const speak = (text: string) => {
    Speech.speak(text, { language: 'en-US' });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>Dobrodošli u Traveleng! 🚀</Text>
        <Text style={styles.bannerSubtitle}>Aplikacija za učenje engleskog jezika</Text>
      </View>

      <Text style={styles.sectionHeader}>Brzi vežba izgovora</Text>

      <TouchableOpacity style={styles.card} onPress={() => speak("Welcome to Traveleng app")}>
        <Text style={styles.cardTitle}>🔊 Klikni da čuješ izgovor</Text>
        <Text style={styles.cardDesc}>"Welcome to Traveleng app"</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  content: { padding: 16 },
  banner: { backgroundColor: '#1A2530', padding: 20, borderRadius: 12, marginBottom: 20 },
  bannerTitle: { color: '#FFF', fontSize: 22, fontWeight: 'bold' },
  bannerSubtitle: { color: '#2E8B57', fontSize: 16, marginTop: 4 },
  sectionHeader: { fontSize: 18, fontWeight: 'bold', color: '#1C2833', marginBottom: 12 },
  card: { backgroundColor: '#FFF', padding: 20, borderRadius: 12, elevation: 2 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#3498DB' },
  cardDesc: { fontSize: 15, color: '#7F8C8D', marginTop: 6 }
});
