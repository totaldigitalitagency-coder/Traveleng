import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Speech from 'expo-speech';

// Učitavanje baze reči
import rawDictionaryData from './data.json';

const { width } = Dimensions.get('window');
const IS_TABLET = width >= 600;

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('HOME');
  const [dictionary, setDictionary] = useState([]);
  const [learnedWords, setLearnedWords] = useState([]);
  const [favoriteWords, setFavoriteWords] = useState([]);
  const [dailyTarget, setDailyTarget] = useState(20);
  const [streakDays, setStreakDays] = useState(3);

  // Učitavanje sačuvanih podataka pri pokretanju
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setDictionary(rawDictionaryData || []);
      
      const savedLearned = await AsyncStorage.getItem('@traveleng_learned');
      if (savedLearned) setLearnedWords(JSON.parse(savedLearned));

      const savedFavorites = await AsyncStorage.getItem('@traveleng_favorites');
      if (savedFavorites) setFavoriteWords(JSON.parse(savedFavorites));
    } catch (e) {
      console.error('Greška pri učitavanju lokalnih podataka:', e);
    }
  };

  // Funkcija za označi/odznači naučenu reč
  const toggleLearned = async (wordId) => {
    let updated;
    if (learnedWords.includes(wordId)) {
      updated = learnedWords.filter(id => id !== wordId);
    } else {
      updated = [...learnedWords, wordId];
    }
    setLearnedWords(updated);
    await AsyncStorage.setItem('@traveleng_learned', JSON.stringify(updated));
  };

  // Funkcija za izgovor reči (TTS)
  const speakWord = (text) => {
    try {
      Speech.speak(text, { language: 'en-US' });
    } catch (e) {
      Alert.alert('Greška', 'Sinteza govora nije dostupna na ovom uređaju.');
    }
  };

  // RENDEROVANJE EKRANA

  // 1. POČETNI EKRAN (Sa Slike 2)
  const renderHomeScreen = () => {
    const modules = [
      { id: 'HOME', name: 'Početna', desc: 'Dnevni napredak i ciljevi', icon: '🏠' },
      { id: 'LEARN', name: 'Učenje engleskog', desc: 'Lekcije po nivoima (A1-B2)', icon: '📚' },
      { id: 'DOLCH', name: 'Dolch lista reči', desc: '315 osnovnih reči i imenica', icon: '🔤' },
      { id: 'DICT', name: 'Rečnik', desc: `Pretraga ${dictionary.length}+ englesko-srpskih reči`, icon: '📖' },
      { id: 'QUIZ', name: 'Kvizovi i testovi', desc: 'Provera znanja kroz 8 tipova pitanja', icon: '🧩' },
      { id: 'GRAMMAR', name: 'Gramatika', desc: 'Lekcije i objašnjenja na srpskom', icon: '📝' },
      { id: 'TRANSLATE', name: 'Prevodilac', desc: 'Englesko-srpski prevod', icon: '🌐' },
      { id: 'PRONUNCIATION', name: 'Izgovor i slušanje', desc: 'Slušanje i vežbe izgovora', icon: '🎧' },
      { id: 'TRAVEL', name: 'Engleski za putovanja', desc: 'Aerodrom, hotel, restoran, apoteka', icon: '✈️' },
      { id: 'MY_WORDS', name: 'Moje reči', desc: 'Lični rečnik i omiljene reči', icon: '⭐' },
      { id: 'STATS', name: 'Statistika napretka', desc: 'Praćenje savladanih reči', icon: '📊' },
      { id: 'SETTINGS', name: 'Podešavanja', desc: 'Dnevni cilj i opcije', icon: '⚙️' },
    ];

    return (
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Banner - Dobrodošli */}
        <View class={styles.banner}>
          <Text style={styles.bannerTitle}>Dobrodošli u Traveleng! 🚀</Text>
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>
              Dnevni cilj: {learnedWords.length}/{dailyTarget} minuta | Streak: 🔥 {streakDays} dana
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Glavni moduli za tablet</Text>

        {/* Grid Kartica (2 kolone za tablet) */}
        <View style={styles.grid}>
          {modules.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.card, IS_TABLET && styles.cardTablet]}
              onPress={() => setCurrentScreen(item.id)}
            >
              <Text style={styles.cardIcon}>{item.icon}</Text>
              <View style={styles.cardTextContainer}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardDesc}>{item.desc}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    );
  };

  // 2. EKRAN ZA UČENJE REČI (Sa Slike 1)
  const renderLearnScreen = () => {
    const activeWord = dictionary[0] || {
      en: 'welcome',
      sr: 'dobrodošli',
      phonetic_sr: 'velkam',
      category: 'Osnovni pozdravi',
      id: '1'
    };

    const isLearned = learnedWords.includes(activeWord.id);

    return (
      <View style={styles.learnContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => setCurrentScreen('HOME')}>
          <Text style={styles.backButtonText}>← Nazad na početnu</Text>
        </TouchableOpacity>

        <View style={styles.learnCard}>
          <Text style={styles.categoryBadge}>{activeWord.category || 'A1 — Osnovno'}</Text>
          
          <Text style={styles.wordEn}>{activeWord.en.toUpperCase()}</Text>
          <Text style={styles.wordPhonetic}>[{activeWord.phonetic_sr}]</Text>
          <Text style={styles.wordSr}>{activeWord.sr}</Text>

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.btnSpeak} onPress={() => speakWord(activeWord.en)}>
              <Text style={styles.btnText}>🔊 Izgovori</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.btnLearned, isLearned && styles.btnLearnedActive]} 
              onPress={() => toggleLearned(activeWord.id)}
            >
              <Text style={styles.btnText}>
                {isLearned ? '✓ Naučeno' : 'Označi kao naučeno'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#111827" />
      {currentScreen === 'HOME' ? renderHomeScreen() : renderLearnScreen()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f9',
  },
  scrollContent: {
    padding: 16,
  },
  banner: {
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  bannerTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  badgeContainer: {
    backgroundColor: '#064e3b',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  badgeText: {
    color: '#34d399',
    fontWeight: '600',
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: '#ffffff',
    width: '100%',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    elevation: 2,
  },
  cardTablet: {
    width: '48.5%', // 2 kolone za tablet
  },
  cardIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 13,
    color: '#64748b',
  },
  learnContainer: {
    flex: 1,
    padding: 20,
  },
  backButton: {
    paddingVertical: 10,
    marginBottom: 20,
  },
  backButtonText: {
    color: '#2563eb',
    fontSize: 16,
    fontWeight: '600',
  },
  learnCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    elevation: 3,
  },
  categoryBadge: {
    backgroundColor: '#e0e7ff',
    color: '#4338ca',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  wordEn: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 8,
  },
  wordPhonetic: {
    fontSize: 18,
    color: '#64748b',
    marginBottom: 12,
  },
  wordSr: {
    fontSize: 24,
    color: '#1e293b',
    marginBottom: 30,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  btnSpeak: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  btnLearned: {
    backgroundColor: '#10b981',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  btnLearnedActive: {
    backgroundColor: '#059669',
  },
  btnText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
});
