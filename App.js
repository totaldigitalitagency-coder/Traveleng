import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView, 
  FlatList,
  StatusBar
} from 'react-native';
import * as Speech from 'expo-speech';
import appData from './data.json';

export default function App() {
  const [activeModule, setActiveModule] = useState('home');

  const speak = (text) => {
    Speech.stop();
    Speech.speak(text, { language: 'en-US', rate: 0.85 });
  };

  if (activeModule === 'numbers') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => setActiveModule('home')}>
            <Text style={styles.backButtonText}>← Nazad na Meni</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.moduleTitle}>🔢 Učimo Brojeve</Text>
        <Text style={styles.moduleSubtitle}>Dodirni karticu za zvučni izgovor</Text>

        <FlatList
          data={appData.numbers || []}
          keyExtractor={(item, index) => item.id || index.toString()}
          numColumns={2}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.numberCard} onPress={() => speak(item.word)}>
              <Text style={styles.numberDigit}>{item.number}</Text>
              <Text style={styles.numberWord}>{item.word}</Text>
              <Text style={styles.phoneticBadge}>{item.phonetic}</Text>
              <Text style={styles.audioIcon}>🔊</Text>
            </TouchableOpacity>
          )}
        />
      </SafeAreaView>
    );
  }

  if (activeModule === 'spelling') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => setActiveModule('home')}>
            <Text style={styles.backButtonText}>← Nazad na Meni</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.moduleTitle}>🔤 Slova i Spelovanje</Text>
        <Text style={styles.moduleSubtitle}>Izgovor alfabeta i primera reči</Text>

        <FlatList
          data={appData.alphabet || []}
          keyExtractor={(item) => item.letter}
          numColumns={3}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.letterCard} onPress={() => speak(item.letter)}>
              <Text style={styles.letterBig}>{item.letter}</Text>
              <Text style={styles.letterPhonetic}>{item.izgovor || item.phonetic}</Text>
              <Text style={styles.letterExample}>{item.word}</Text>
            </TouchableOpacity>
          )}
        />
      </SafeAreaView>
    );
  }

  if (activeModule === 'dictionary') {
    const dictionaryList = appData.words || [];
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => setActiveModule('home')}>
            <Text style={styles.backButtonText}>← Nazad na Meni</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.moduleTitle}>📚 Rečnik</Text>
        <Text style={styles.moduleSubtitle}>Ukupno uneto: {dictionaryList.length} reči</Text>

        <FlatList
          data={dictionaryList}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.wordRow} onPress={() => speak(item.word || '')}>
              <View style={{ flex: 1 }}>
                <Text style={styles.wordEnglish}>{item.word}</Text>
                <Text style={styles.wordSerbian}>{item.translation}</Text>
              </View>
              <Text style={styles.audioIcon}>🔊</Text>
            </TouchableOpacity>
          )}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.topBanner}>
          <Text style={styles.welcomeTitle}>Dobrodošli u Traveleng! 🚀</Text>
          <View style={styles.streakPill}>
            <Text style={styles.streakText}>Dnevni cilj: 10/20 minuta | Streak: 🔥 3 dana</Text>
          </View>
        </View>

        <Text style={styles.sectionHeader}>Glavni moduli za tablet</Text>

        <View style={styles.bentoGrid}>
          
          <TouchableOpacity style={styles.bentoCard} onPress={() => setActiveModule('dictionary')}>
            <View style={styles.iconContainer}>
              <Text style={styles.cardIcon}>📖</Text>
            </View>
            <View style={styles.cardTextContent}>
              <Text style={styles.cardTitle}>Rečnik</Text>
              <Text style={styles.cardSubtitle}>Pretraga 2000+ englesko-srpskih reči</Text>
            </View>
            <Text style={styles.arrowIcon}>➔</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.bentoCard} onPress={() => setActiveModule('numbers')}>
            <View style={styles.iconContainer}>
              <Text style={styles.cardIcon}>🔢</Text>
            </View>
            <View style={styles.cardTextContent}>
              <Text style={styles.cardTitle}>Učimo Brojeve</Text>
              <Text style={styles.cardSubtitle}>Brojanje, pisanje i zvučni izgovor</Text>
            </View>
            <Text style={styles.arrowIcon}>➔</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.bentoCard} onPress={() => setActiveModule('spelling')}>
            <View style={styles.iconContainer}>
              <Text style={styles.cardIcon}>🔤</Text>
            </View>
            <View style={styles.cardTextContent}>
              <Text style={styles.cardTitle}>Slova i Spelovanje</Text>
              <Text style={styles.cardSubtitle}>Alfabet, izgovor i primeri</Text>
            </View>
            <Text style={styles.arrowIcon}>➔</Text>
          </TouchableOpacity>

        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  topBanner: {
    backgroundColor: '#0F172A',
    borderRadius: 20,
    padding: 20,
    marginTop: 10,
    marginBottom: 20,
  },
  welcomeTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
  },
  streakPill: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  streakText: {
    color: '#34D399',
    fontSize: 13,
    fontWeight: '700',
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 14,
    marginLeft: 4,
  },
  bentoGrid: {
    gap: 12,
  },
  bentoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  cardIcon: {
    fontSize: 24,
  },
  cardTextContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  arrowIcon: {
    fontSize: 16,
    color: '#10B981',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  backButton: {
    paddingVertical: 8,
    paddingRight: 12,
  },
  backButtonText: {
    color: '#10B981',
    fontWeight: '700',
    fontSize: 16,
  },
  moduleTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
  },
  moduleSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
  },
  numberCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    margin: 6,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  numberDigit: {
    fontSize: 32,
    fontWeight: '800',
    color: '#10B981',
  },
  numberWord: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 4,
  },
  phoneticBadge: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  audioIcon: {
    fontSize: 14,
    marginTop: 8,
  },
  letterCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    margin: 5,
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  letterBig: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
  },
  letterPhonetic: {
    fontSize: 13,
    color: '#10B981',
    fontWeight: '700',
    marginTop: 2,
  },
  letterExample: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 4,
  },
  wordRow: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  wordEnglish: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  wordSerbian: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  }
});
