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
  TextInput,
  Alert
} from 'react-native';

import * as Speech from 'expo-speech';
import appData from './data.json';

export default function App() {
  const [activeTab, setActiveTab] = useState('learn'); // 'learn', 'quiz', 'dictionary'
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);
  const [learnedIds, setLearnedIds] = useState([]);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  // Kviz stanja
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);

  const currentWord = appData.dictionary[currentIndex];

  const speakText = (text) => {
    Speech.speak(text, {
      language: 'en-US',
      pitch: 1.0,
      rate: 0.85,
    });
  };

  const toggleLearned = (id) => {
    if (learnedIds.includes(id)) {
      setLearnedIds(learnedIds.filter(item => item !== id));
    } else {
      setLearnedIds([...learnedIds, id]);
    }
  };

  const handleNextWord = () => {
    setShowTranslation(false);
    if (currentIndex < appData.dictionary.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const handlePrevWord = () => {
    setShowTranslation(false);
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const filteredDictionary = appData.dictionary.filter(item =>
    item.en.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.sr.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.phonetic.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#064e3b" />
      
      {/* Header sa statistikama sa tvojih slika */}
      <View style={styles.header}>
        <Text style={styles.appTitle}>Travel – Uči engleski</Text>
        <Text style={styles.appSubtitle}>Engleski od početka · srpski prevod · učenje bez interneta</Text>
        
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>2.000</Text>
            <Text style={styles.statLabel}>stavki u bazi</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{learnedIds.length}</Text>
            <Text style={styles.statLabel}>označeno naučeno</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{correctAnswersCount}</Text>
            <Text style={styles.statLabel}>tačni odgovori</Text>
          </View>
        </View>

        {/* Meni Dugmad */}
        <View style={styles.tabRow}>
          <TouchableOpacity 
            style={[styles.tabBtn, activeTab === 'learn' && styles.tabBtnActive]}
            onPress={() => setActiveTab('learn')}
          >
            <Text style={[styles.tabBtnText, activeTab === 'learn' && styles.tabBtnTextActive]}>Uči</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.tabBtn, activeTab === 'quiz' && styles.tabBtnActive]}
            onPress={() => setActiveTab('quiz')}
          >
            <Text style={[styles.tabBtnText, activeTab === 'quiz' && styles.tabBtnTextActive]}>Kviz</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.tabBtn, activeTab === 'dictionary' && styles.tabBtnActive]}
            onPress={() => setActiveTab('dictionary')}
          >
            <Text style={[styles.tabBtnText, activeTab === 'dictionary' && styles.tabBtnTextActive]}>Rečnik</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* MODUL: UČI (FLASHCARDS) */}
      {activeTab === 'learn' && (
        <ScrollView style={styles.contentContainer}>
          <Text style={styles.categoryInfo}>
            Stavka {currentIndex + 1} od {appData.dictionary.length} · {currentWord.category}
          </Text>

          <View style={styles.flashcard}>
            <Text style={styles.wordMain}>{currentWord.en}</Text>
            <Text style={styles.wordPhonetic}>{currentWord.phonetic}</Text>

            {showTranslation && (
              <View style={styles.translationBox}>
                <Text style={styles.wordTranslation}>{currentWord.sr}</Text>
                <Text style={styles.exampleText}>{currentWord.exampleEn}</Text>
              </View>
            )}

            {/* Dugmad za akciju */}
            <View style={styles.actionRow}>
              <TouchableOpacity 
                style={styles.primaryBtn}
                onPress={() => setShowTranslation(!showTranslation)}
              >
                <Text style={styles.primaryBtnText}>
                  {showTranslation ? "Sakrij prevod" : "Prikaži prevod"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.speakerBtn}
                onPress={() => speakText(currentWord.en)}
              >
                <Text style={styles.speakerBtnText}>🔊 Izgovori</Text>
              </TouchableOpacity>
            </View>

            {/* Navigacija + Naučeno */}
            <View style={styles.navRow}>
              <TouchableOpacity 
                style={[styles.navBtn, currentIndex === 0 && { opacity: 0.5 }]}
                onPress={handlePrevWord}
                disabled={currentIndex === 0}
              >
                <Text style={styles.navBtnText}>← Prethodna</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[
                  styles.learnedBtn, 
                  learnedIds.includes(currentWord.id) && styles.learnedBtnActive
                ]}
                onPress={() => toggleLearned(currentWord.id)}
              >
                <Text style={styles.learnedBtnText}>
                  {learnedIds.includes(currentWord.id) ? "✓ Naučeno" : "✓ Naučio/la sam"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.navBtn}
                onPress={handleNextWord}
              >
                <Text style={styles.navBtnText}>Sledeća →</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      )}

      {/* MODUL: KVIZ */}
      {activeTab === 'quiz' && (
        <ScrollView style={styles.contentContainer}>
          <Text style={styles.categoryInfo}>Pitanje {quizIndex + 1} od {appData.quizzes.length}</Text>
          <View style={styles.quizCard}>
            <Text style={styles.quizQuestion}>{appData.quizzes[quizIndex].question}</Text>

            {appData.quizzes[quizIndex].options.map((option, idx) => (
              <TouchableOpacity 
                key={idx}
                style={[
                  styles.optionCard,
                  selectedOption === option && styles.optionCardSelected
                ]}
                onPress={() => setSelectedOption(option)}
              >
                <Text style={styles.optionText}>{option}</Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity 
              style={styles.nextQuestionBtn}
              onPress={() => {
                if (!selectedOption) {
                  Alert.alert("Izaberi odgovor", "Molimo vas izaberite jedan odgovor.");
                  return;
                }
                if (selectedOption === appData.quizzes[quizIndex].correct) {
                  setCorrectAnswersCount(correctAnswersCount + 1);
                  speakText("Correct!");
                  Alert.alert("Tačno! 🎉", "Odlično urađeno!");
                } else {
                  speakText("Wrong answer");
                  Alert.alert("Netačno", `Tačan odgovor je: ${appData.quizzes[quizIndex].correct}`);
                }
                setSelectedOption(null);
                if (quizIndex < appData.quizzes.length - 1) {
                  setQuizIndex(quizIndex + 1);
                } else {
                  setQuizIndex(0);
                  Alert.alert("Kviz završen!", `Uspešno ste prešli sve pitanja.`);
                }
              }}
            >
              <Text style={styles.nextQuestionBtnText}>Sledeće pitanje</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {/* MODUL: REČNIK */}
      {activeTab === 'dictionary' && (
        <View style={styles.contentContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Pretraži engleski ili srpski (npr. hotel, voda, hello)..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <FlatList
            data={filteredDictionary}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.dictItem}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.dictEn}>{item.en} — <Text style={styles.dictSr}>{item.sr}</Text></Text>
                  <Text style={styles.dictPhonetic}>{item.phonetic} · {item.category}</Text>
                  <Text style={styles.dictExample}>{item.exampleEn}</Text>
                </View>
                <TouchableOpacity 
                  style={styles.dictAudioBtn}
                  onPress={() => speakText(item.en)}
                >
                  <Text style={{ fontSize: 20 }}>🔊</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f8',
  },
  header: {
    backgroundColor: '#064e3b',
    padding: 16,
  },
  appTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  appSubtitle: {
    color: '#a7f3d0',
    fontSize: 13,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statBox: {
    backgroundColor: '#ffffff',
    padding: 10,
    borderRadius: 8,
    width: '31%',
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#064e3b',
  },
  statLabel: {
    fontSize: 11,
    color: '#4b5563',
    textAlign: 'center',
  },
  tabRow: {
    flexDirection: 'row',
  },
  tabBtn: {
    backgroundColor: '#047857',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginRight: 8,
  },
  tabBtnActive: {
    backgroundColor: '#ffffff',
  },
  tabBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  tabBtnTextActive: {
    color: '#064e3b',
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  categoryInfo: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  flashcard: {
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
  },
  wordMain: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#111827',
  },
  wordPhonetic: {
    fontSize: 18,
    color: '#6b7280',
    marginTop: 4,
  },
  translationBox: {
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    width: '100%',
  },
  wordTranslation: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#047857',
  },
  exampleText: {
    fontSize: 14,
    color: '#4b5563',
    marginTop: 6,
    fontStyle: 'italic',
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: 20,
  },
  primaryBtn: {
    backgroundColor: '#064e3b',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginRight: 8,
  },
  primaryBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  speakerBtn: {
    backgroundColor: '#d1fae5',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  speakerBtnText: {
    color: '#064e3b',
    fontWeight: 'bold',
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    width: '100%',
  },
  navBtn: {
    backgroundColor: '#064e3b',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  navBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  learnedBtn: {
    backgroundColor: '#e5e7eb',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  learnedBtnActive: {
    backgroundColor: '#10b981',
  },
  learnedBtnText: {
    color: '#111827',
    fontWeight: 'bold',
    fontSize: 12,
  },
  searchInput: {
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    marginBottom: 12,
  },
  dictItem: {
    backgroundColor: '#ffffff',
    padding: 14,
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dictEn: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  dictSr: {
    fontWeight: 'normal',
    color: '#047857',
  },
  dictPhonetic: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  dictExample: {
    fontSize: 12,
    color: '#4b5563',
    marginTop: 4,
  },
  dictAudioBtn: {
    backgroundColor: '#f3f4f6',
    padding: 8,
    borderRadius: 50,
  },
  quizCard: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
  },
  quizQuestion: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  optionCard: {
    backgroundColor: '#f3f4f6',
    padding: 14,
    borderRadius: 8,
    marginBottom: 8,
  },
  optionCardSelected: {
    backgroundColor: '#a7f3d0',
    borderColor: '#047857',
    borderWidth: 1,
  },
  optionText: {
    fontSize: 15,
    color: '#1f2937',
  },
  nextQuestionBtn: {
    backgroundColor: '#064e3b',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  nextQuestionBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
