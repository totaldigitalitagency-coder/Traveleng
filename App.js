import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView, 
  StatusBar 
} from 'react-native';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState(null);

  const modules = [
    { id: 'pocetna', title: 'Početna', subtitle: 'Dnevni napredak i ciljevi', icon: '🏠' },
    { id: 'ucenje', title: 'Učenje engleskog', subtitle: 'Lekcije po nivoima (A1-B2)', icon: '📚' },
    { id: 'dolch', title: 'Dolch lista reči', subtitle: '315 osnovnih reči i imenica', icon: '🔤' },
    { id: 'recnik', title: 'Rečnik', subtitle: 'Pretraga 2000+ englesko-srpskih reči', icon: '📖' },
    { id: 'kvizovi', title: 'Kvizovi i testovi', subtitle: 'Provera znanja kroz 8 tipova pitanja', icon: '🧩' },
    { id: 'gramatika', title: 'Gramatika', subtitle: 'Lekcije i objašnjenja na srpskom', icon: '📝' },
    { id: 'prevodilac', title: 'Prevodilac', subtitle: 'Englesko-srpski prevod', icon: '🌐' },
    { id: 'izgovor', title: 'Izgovor i slušanje', subtitle: 'Slušanje i vežbe izgovora', icon: '🎧' },
    { id: 'putovanja', title: 'Engleski za putovanja', subtitle: 'Aerodrom, hotel, restoran, apoteka', icon: '✈️' },
    { id: 'moje_reci', title: 'Moje reči', subtitle: 'Lični rečnik i omiljene reči', icon: '⭐' },
    { id: 'statistika', title: 'Statistika napretka', subtitle: 'Praćenje savladanih reči', icon: '📊' },
    { id: 'podesavanja', title: 'Podešavanja', subtitle: 'Dnevni cilj i opcije', icon: '⚙️' },
  ];

  const handleModulePress = (module) => {
    setSelectedCategory(module);
    setCurrentScreen('detail');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1e293b" />
      
      {/* Header Banner */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dobrodošli u Traveleng! 🚀</Text>
        <Text style={styles.headerSubtitle}>Dnevni cilj: 10/20 minuta | Streak: 🔥 3 dana</Text>
      </View>

      {currentScreen === 'home' ? (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.sectionTitle}>Glavni moduli za tablet</Text>
          <View style={styles.grid}>
            {modules.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.card}
                activeOpacity={0.7}
                onPress={() => handleModulePress(item)}
              >
                <Text style={styles.cardIcon}>{item.icon}</Text>
                <View style={styles.cardTextContainer}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      ) : (
        <View style={styles.detailContainer}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => setCurrentScreen('home')}
          >
            <Text style={styles.backButtonText}>⬅ Nazad na početnu</Text>
          </TouchableOpacity>
          
          <View style={styles.detailCard}>
            <Text style={styles.detailIcon}>{selectedCategory?.icon}</Text>
            <Text style={styles.detailTitle}>{selectedCategory?.title}</Text>
            <Text style={styles.detailSubtitle}>{selectedCategory?.subtitle}</Text>
            <Text style={styles.detailBody}>
              Modul je uspešno pokrenut! Ovde možete ubaciti vašu specifičnu logiku i lekcije za {selectedCategory?.title}.
            </Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#1e293b',
    padding: 20,
    borderRadius: 12,
    margin: 16,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#4ade80',
    fontSize: 14,
    marginTop: 6,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: '#ffffff',
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  detailContainer: {
    flex: 1,
    padding: 16,
  },
  backButton: {
    backgroundColor: '#2563eb',
    padding: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  backButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  detailCard: {
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3,
  },
  detailIcon: {
    fontSize: 64,
    marginBottom: 12,
  },
  detailTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  detailSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  detailBody: {
    fontSize: 16,
    color: '#334155',
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 24,
  },
});
