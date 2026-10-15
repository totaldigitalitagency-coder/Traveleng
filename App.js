import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView, 
  StatusBar,
  FlatList,
  TextInput
} from 'react-native';

// Uvoz lokalnih podataka iz JSON fajla
import appData from './data.json';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [activeModule, setActiveModule] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [quizScore, setQuizScore] = useState(0);

  const modules = [
    { id: 'dolch', title: 'Dolch lista reči', subtitle: 'Osnovne reči sa prevodom', icon: '🔤' },
    { id: 'putovanja', title: 'Engleski za putovanja', subtitle: 'Fraze za aerodrom, hotel, restoran', icon: '✈️' },
    { id: 'kvizovi', title: 'Kvizovi i testovi', subtitle: 'Proveri svoje znanje', icon: '🧩' },
  ];

  const openModule = (mod) => {
    setActiveModule(mod);
    setCurrentScreen('module');
    setSearchQuery('');
  };

  const filteredDolch = appData.dolchWords.filter(item => 
    item.en.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.sr.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1e293b" />
      
      {/* Header Banner */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dobrodošli u Traveleng! 🚀</Text>
        <Text style={styles.headerSubtitle}>Lokalna baza učitana | Status: Offline spreman</Text>
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
                onPress={() => openModule(item)}
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
          
          <Text style={styles.detailTitle}>{activeModule?.icon} {activeModule?.title}</Text>

          {/* RENDERING DOLCH LISTA */}
          {activeModule?.id === 'dolch' && (
            <View style={{ flex: 1 }}>
              <TextInput
                style={styles.searchInput}
                placeholder="Pretraži reči (engleski ili srpski)..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              <FlatList
                data={filteredDolch}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View style={styles.listItem}>
                    <Text style={styles.wordEn}>{item.en}</Text>
                    <Text style={styles.wordSr}>{item.sr}</Text>
                  </View>
                )}
              />
            </View>
          )}

          {/* RENDERING PUTOVANJA */}
          {activeModule?.id === 'putovanja' && (
            <FlatList
              data={appData.travelPhrases}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.listItem}>
                  <Text style={styles.categoryBadge}>{item.category}</Text>
                  <Text style={styles.wordEn}>{item.en}</Text>
                  <Text style={styles.wordSr}>{item.sr}</Text>
                </View>
              )}
            />
          )}

          {/* RENDERING KVIZOVI */}
          {activeModule?.id === 'kvizovi' && (
            <ScrollView style={{ flex: 1 }}>
              {appData.quizzes.map((q) => (
                <View key={q.id} style={styles.quizCard}>
                  <Text style={styles.quizQuestion}>{q.question}</Text>
                  {q.options.map((opt, idx) => (
                    <TouchableOpacity 
                      key={idx} 
                      style={styles.optionBtn}
                      onPress={() => {
                        if (opt === q.correct) {
                          alert('Tačno! 🎉');
                        } else {
                          alert('Netačno, pokušaj ponovo.');
                        }
                      }}
                    >
                      <Text style={styles.optionText}>{opt}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ))}
            </ScrollView>
          )}

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
  detailTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    marginBottom: 12,
  },
  listItem: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#2563eb',
  },
  wordEn: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  wordSr: {
    fontSize: 15,
    color: '#475569',
    marginTop: 4,
  },
  categoryBadge: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 4,
  },
  quizCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  quizQuestion: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 12,
  },
  optionBtn: {
    backgroundColor: '#f1f5f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  optionText: {
    fontSize: 16,
    color: '#334155',
  },
});
