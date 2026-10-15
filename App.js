import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions, Alert } from 'react-native';

const MODULES = [
  { id: '1', title: 'Početna', desc: 'Dnevni napredak i ciljevi', icon: '🏠' },
  { id: '2', title: 'Učenje engleskog', desc: 'Lekcije po nivoima (A1-B2)', icon: '📚' },
  { id: '3', title: 'Dolch lista reči', desc: '315 osnovnih reči i imenica', icon: '🔤' },
  { id: '4', title: 'Rečnik', desc: 'Pretraga 2000+ englesko-srpskih reči', icon: '📖' },
  { id: '5', title: 'Kvizovi i testovi', desc: 'Provera znanja kroz 8 tipova pitanja', icon: '🧩' },
  { id: '6', title: 'Gramatika', desc: 'Lekcije i objašnjenja na srpskom', icon: '📝' },
  { id: '7', title: 'Prevodilac', desc: 'Englesko-srpski prevod', icon: '🌐' },
  { id: '8', title: 'Izgovor i slušanje', desc: 'Slušanje i vežbe izgovora', icon: '🎧' },
  { id: '9', title: 'Engleski za putovanja', desc: 'Aerodrom, hotel, restoran, apoteka', icon: '✈️' },
  { id: '10', title: 'Moje reči', desc: 'Lični rečnik i omiljene reči', icon: '⭐' },
  { id: '11', title: 'Statistika napretka', desc: 'Praćenje savladanih reči', icon: '📊' },
  { id: '12', title: 'Podešavanja', desc: 'Dnevni cilj i opcije', icon: '⚙️' },
];

export default function App() {
  const { width } = useWindowDimensions();
  const isTablet = width > 600;
  const cardWidth = isTablet ? (width - 60) / 2 : width - 32;

  const handlePress = (title) => {
    Alert.alert("Traveleng", `Otvaram modul: ${title}`);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>Dobrodošli u Traveleng! 🚀</Text>
        <Text style={styles.bannerSubtitle}>Dnevni cilj: 10/20 minuta | Streak: 🔥 3 dana</Text>
      </View>

      <Text style={styles.sectionHeader}>Glavni moduli za tablet</Text>

      <View style={styles.grid}>
        {MODULES.map((item) => (
          <TouchableOpacity 
            key={item.id} 
            style={[styles.card, { width: cardWidth }]}
            onPress={() => handlePress(item.title)}
            activeOpacity={0.7}
          >
            <Text style={styles.cardIcon}>{item.icon}</Text>
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardDesc}>{item.desc}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  content: { padding: 16 },
  banner: { backgroundColor: '#1A2530', borderRadius: 12, padding: 20, marginBottom: 20 },
  bannerTitle: { color: '#FFFFFF', fontSize: 22, fontWeight: 'bold' },
  bannerSubtitle: { color: '#2E8B57', fontSize: 15, marginTop: 6, fontWeight: '600' },
  sectionHeader: { fontSize: 18, fontWeight: 'bold', color: '#1C2833', marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 10, padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center', elevation: 2 },
  cardIcon: { fontSize: 28, marginRight: 14 },
  cardTextContainer: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#1C2833' },
  cardDesc: { fontSize: 13, color: '#7F8C8D', marginTop: 2 },
});
