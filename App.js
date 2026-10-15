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
  // Stanje za navigaciju: 'home', 'numbers', 'spelling', 'dictionary'
  const [activeModule, setActiveModule] = useState('home');

  // Funkcija za naitvni izgovor teksta (expo-speech)
  const speak = (text) => {
    Speech.stop();
    Speech.speak(text, { 
      language: 'en-US', 
      rate: 0.85 // Blago usporen govor radi jasnijeg izgovora
    });
  };

  // ----------------------------------------------------
  // 1. EKRAN: UČIMO BROJEVE
  // ----------------------------------------------------
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
              <Text style={styles.phoneticBadge}>{item.izgovor || item.phonetic}</Text>
              <Text style={styles.audioIcon}>🔊</Text>
            </TouchableOpacity>
          )}
        />
      </SafeAreaView>
    );
  }

  // ----------------------------------------------------
  // 2. EKRAN: SLOVA I SPELOVANJE (ALFABET)
  // ----------------------------------------------------
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
            <TouchableOpacity style={styles.letterCard} onPress={() => speak(`${item.letter}, for ${item.word || item.letter}`)}>
              <Text style={styles.letterBig}>{item.letter}</Text>
              <Text style={styles.letterPhonetic}>{item.izgovor || item.phonetic}</Text>
              {item.word && <Text style={styles.letterExample}>{item.word}</Text>}
            </TouchableOpacity>
          )}
        />
      </SafeAreaView>
    );
  }

  // ----------------------------------------------------
  // 3. EKRAN: BAZA REČI (2000+ REČI)
  // ----------------------------------------------------
  if (activeModule === 'dictionary') {
    const dictionaryList = appData.words || appData.dictionary || [];
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
            <TouchableOpacity 
              style={styles.wordRow} 
              onPress={() => speak(item.word || item.engleski || '')}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.wordEnglish}>{item.word || item.engleski}</Text>
                <Text style={styles.wordSerbian}>{item.translation || item.srpski}</Text
