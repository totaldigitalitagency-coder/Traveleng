import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView,
  StatusBar, Dimensions, Alert, TextInput
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Speech from 'expo-speech';
import rawDictionaryData from './data.json';

const { width } = Dimensions.get('window');
const IS_TABLET = width >= 600;
const COLORS = {
  bg: '#f4f6f9', navy: '#111827', green: '#064e3b', mint: '#dff4eb',
  text: '#0f172a', muted: '#64748b', white: '#ffffff', border: '#e5e7eb',
  blue: '#2563eb', red: '#b91c1c'
};

const MODULES = [
  { id: 'HOME', name: 'Početna', desc: 'Dnevni napredak i ciljevi', icon: '🏠' },
  { id: 'LEARN', name: 'Učenje engleskog', desc: 'Lekcije po nivoima (A1–B2)', icon: '📚' },
  { id: 'DOLCH', name: 'Dolch lista reči', desc: 'Osnovne reči i imenice', icon: '🔤' },
  { id: 'DICT', name: 'Rečnik', desc: 'Pretraga englesko-srpskih reči', icon: '📖' },
  { id: 'QUIZ', name: 'Kvizovi i testovi', desc: 'Provera znanja kroz 8 tipova pitanja', icon: '🧩' },
  { id: 'GRAMMAR', name: 'Gramatika', desc: 'Lekcije i objašnjenja na srpskom', icon: '📝' },
  { id: 'TRANSLATE', name: 'Prevodilac', desc: 'Englesko-srpski rečnički prevod', icon: '🌐' },
  { id: 'PRONUNCIATION', name: 'Izgovor i slušanje', desc: 'Slušanje i vežbe izgovora', icon: '🎧' },
  { id: 'TRAVEL', name: 'Engleski za putovanja', desc: 'Aerodrom, hotel, restoran, apoteka', icon: '✈️' },
  { id: 'MY_WORDS', name: 'Moje reči', desc: 'Lični rečnik i omiljene reči', icon: '⭐' },
  { id: 'STATS', name: 'Statistika napretka', desc: 'Praćenje savladanih reči', icon: '📊' },
  { id: 'SETTINGS', name: 'Podešavanja', desc: 'Dnevni cilj i opcije', icon: '⚙️' },
];

const GRAMMAR_LESSONS = [
  { title: 'Glagol TO BE', level: 'A1', rule: 'Am, is i are znače „biti“. Oblik zavisi od subjekta.', examples: ['I am happy. — Ja sam srećan/srećna.', 'She is at home. — Ona je kod kuće.', 'They are students. — Oni su učenici/studenti.'] },
  { title: 'Present Simple', level: 'A1', rule: 'Koristi se za navike, činjenice i ponavljajuće radnje. Uz he/she/it glagol obično dobija -s.', examples: ['I work every day. — Radim svakog dana.', 'He works in a bank. — On radi u banci.', 'Do you speak English? — Da li govoriš engleski?'] },
  { title: 'Present Continuous', level: 'A2', rule: 'am/is/are + glagol sa -ing. Koristi se za radnju koja se dešava sada.', examples: ['I am learning English. — Učim engleski (sada).', 'They are waiting. — Oni čekaju.'] },
  { title: 'Past Simple', level: 'A2', rule: 'Koristi se za završene radnje u prošlosti. Pravilni glagoli često dobijaju -ed; nepravilni imaju poseban oblik.', examples: ['I visited London. — Posetio/la sam London.', 'She went home. — Otišla je kući.'] },
  { title: 'Future with going to', level: 'B1', rule: 'am/is/are going to + glagol koristi se za planove i namere.', examples: ['I am going to travel. — Planiram da putujem.', 'We are going to book a hotel. — Rezervisaćemo hotel.'] },
  { title: 'Present Perfect', level: 'B1', rule: 'have/has + past participle. Povezuje prošlo iskustvo ili radnju sa sadašnjošću.', examples: ['I have visited Rome. — Posetio/la sam Rim.', 'She has finished her work. — Završila je posao.'] },
  { title: 'First Conditional', level: 'B1', rule: 'If + Present Simple, will + glagol. Govori o mogućem budućem uslovu.', examples: ['If it rains, we will stay inside. — Ako bude padala kiša, ostaćemo unutra.'] },
  { title: 'Passive Voice', level: 'B2', rule: 'Be + past participle. Važno je šta se desilo, a ne ko je izvršio radnju.', examples: ['The room is cleaned every day. — Soba se čisti svakog dana.'] },
];

const TRAVEL_PHRASES = [
  { category: 'Aerodrom', en: 'Where is the check-in desk?', sr: 'Gde je šalter za prijavu na let?' },
  { category: 'Aerodrom', en: 'Could I see your passport, please?', sr: 'Mogu li da vidim vaš pasoš, molim vas?' },
  { category: 'Hotel', en: 'I have a reservation.', sr: 'Imam rezervaciju.' },
  { category: 'Hotel', en: 'What time is check-out?', sr: 'U koliko sati je odjava iz hotela?' },
  { category: 'Restoran', en: 'Could I see the menu, please?', sr: 'Mogu li da dobijem jelovnik, molim vas?' },
  { category: 'Restoran', en: 'Could I have the bill, please?', sr: 'Mogu li da dobijem račun, molim vas?' },
  { category: 'Apoteka', en: 'Do you have something for a headache?', sr: 'Imate li nešto protiv glavobolje?' },
  { category: 'Smerovi', en: 'How do I get to the city centre?', sr: 'Kako da stignem do centra grada?' },
  { category: 'Prevoz', en: 'Where can I buy a bus ticket?', sr: 'Gde mogu da kupim autobusku kartu?' },
];

const normalizeDictionary = (data) => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.vocabulary)) return data.vocabulary;
  if (data && Array.isArray(data.words)) return data.words;
  return [];
};

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('HOME');
  const [dictionary, setDictionary] = useState([]);
  const [learnedWords, setLearnedWords] = useState([]);
  const [favoriteWords, setFavoriteWords] = useState([]);
  const [dailyTarget, setDailyTarget] = useState(20);
  const [studyMinutes, setStudyMinutes] = useState(0);
  const [streakDays, setStreakDays] = useState(0);
  const [search, setSearch] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('A1');
  const [wordIndex, setWordIndex] = useState(0);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFeedback, setQuizFeedback] = useState('');
  const [translationInput, setTranslationInput] = useState('');
  const [translationDirection, setTranslationDirection] = useState('en-sr');
  const [grammarIndex, setGrammarIndex] = useState(0);
  const [travelCategory, setTravelCategory] = useState('Sve');
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = normalizeDictionary(rawDictionaryData);
        if (mounted) setDictionary(data);
        const [learned, favorites, target, minutes, streak, sound] = await Promise.all([
          AsyncStorage.getItem('@traveleng_learned'),
          AsyncStorage.getItem('@traveleng_favorites'),
          AsyncStorage.getItem('@traveleng_daily_target'),
          AsyncStorage.getItem('@traveleng_study_minutes'),
          AsyncStorage.getItem('@traveleng_streak'),
          AsyncStorage.getItem('@traveleng_sound'),
        ]);
        if (!mounted) return;
        if (learned) setLearnedWords(JSON.parse(learned));
        if (favorites) setFavoriteWords(JSON.parse(favorites));
        if (target) setDailyTarget(Number(target) || 20);
        if (minutes) setStudyMinutes(Number(minutes) || 0);
        if (streak) setStreakDays(Number(streak) || 0);
        if (sound !== null) setSoundEnabled(sound === 'true');
      } catch (error) {
        console.warn('Greška pri učitavanju Traveleng podataka:', error);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const persist = async (key, value) => {
    try { await AsyncStorage.setItem(key, JSON.stringify(value)); }
    catch (error) { console.warn('Čuvanje nije uspelo:', error); }
  };

  const toggleLearned = async (wordId) => {
    const updated = learnedWords.includes(wordId)
      ? learnedWords.filter(id => id !== wordId)
      : [...learnedWords, wordId];
    setLearnedWords(updated);
    await persist('@traveleng_learned', updated);
  };

  const toggleFavorite = async (wordId) => {
    const updated = favoriteWords.includes(wordId)
      ? favoriteWords.filter(id => id !== wordId)
      : [...favoriteWords, wordId];
    setFavoriteWords(updated);
    await persist('@traveleng_favorites', updated);
  };

  useEffect(() => {
    const studyScreens = ['LEARN', 'QUIZ', 'GRAMMAR', 'PRONUNCIATION', 'TRAVEL'];
    if (!studyScreens.includes(currentScreen)) return undefined;
    const timer = setInterval(() => {
      setStudyMinutes(previous => {
        const updated = previous + 1;
        AsyncStorage.setItem('@traveleng_study_minutes', String(updated)).catch(error => console.warn('Čuvanje minuta nije uspelo:', error));
        return updated;
      });
    }, 60000);
    return () => clearInterval(timer);
  }, [currentScreen]);

  const speakWord = (text) => {
    if (!soundEnabled) {
      Alert.alert('Zvuk je isključen', 'Uključite zvuk u Podešavanjima.');
      return;
    }
    if (!text) return;
    Speech.speak(String(text), {
      language: 'en-US',
      onError: () => Alert.alert('Izgovor', 'Sinteza govora nije dostupna. Proverite podešavanja govora na uređaju.'),
    });
  };

  const wordsByLevel = useMemo(() => dictionary.filter(w => !w.level || w.level === selectedLevel), [dictionary, selectedLevel]);
  const searchableWords = useMemo(() => {
    const q = search.trim().toLocaleLowerCase();
    if (!q) return dictionary;
    return dictionary.filter(w =>
      [w.en, w.sr, w.category, w.level].some(v => String(v || '').toLocaleLowerCase().includes(q))
    );
  }, [dictionary, search]);
  const activeWord = wordsByLevel.length ? wordsByLevel[wordIndex % wordsByLevel.length] : dictionary[wordIndex % Math.max(dictionary.length, 1)];
  const quizWord = dictionary.length ? dictionary[(quizIndex * 7) % dictionary.length] : null;
  const quizOptions = useMemo(() => {
    if (!quizWord) return [];
    const others = dictionary.filter(w => w.id !== quizWord.id && w.sr);
    const picked = others.slice((quizIndex * 3) % Math.max(others.length, 1), (quizIndex * 3) % Math.max(others.length, 1) + 3);
    return [...picked, quizWord].sort((a, b) => String(a.sr).localeCompare(String(b.sr)));
  }, [dictionary, quizIndex, quizWord]);

  const goHome = () => { setSearch(''); setCurrentScreen('HOME'); };
  const Header = ({ title, icon }) => (
    <View style={styles.screenHeader}>
      <TouchableOpacity style={styles.backButton} onPress={goHome}><Text style={styles.backButtonText}>← Početna</Text></TouchableOpacity>
      <Text style={styles.screenTitle}>{icon ? `${icon} ` : ''}{title}</Text>
    </View>
  );
  const Button = ({ title, onPress, secondary = false, disabled = false }) => (
    <TouchableOpacity disabled={disabled} style={[styles.button, secondary && styles.buttonSecondary, disabled && styles.disabledButton]} onPress={onPress}>
      <Text style={[styles.buttonText, secondary && styles.buttonSecondaryText]}>{title}</Text>
    </TouchableOpacity>
  );
  const WordCard = ({ word, showExample = true }) => {
    if (!word) return <Text style={styles.muted}>Nema reči za prikaz. Proverite data.json.</Text>;
    const isLearned = learnedWords.includes(word.id);
    const isFavorite = favoriteWords.includes(word.id);
    return (
      <View style={styles.panel}>
        <Text style={styles.eyebrow}>{word.level || 'Rečnik'} · {word.category || 'Opšta kategorija'}</Text>
        <Text style={styles.wordEn}>{word.en}</Text>
        {!!word.ipa && <Text style={styles.phonetic}>{word.ipa}</Text>}
        {!!word.phonetic_sr && <Text style={styles.phonetic}>Približan izgovor: {word.phonetic_sr}</Text>}
        <Text style={styles.wordSr}>{word.sr}</Text>
        {showExample && !!word.example_en && <View style={styles.exampleBox}>
          <Text style={styles.exampleEn}>{word.example_en}</Text>
          {!!word.example_sr && <Text style={styles.exampleSr}>{word.example_sr}</Text>}
        </View>}
        <View style={styles.buttonRow}>
          <Button title="🔊 Izgovori" onPress={() => speakWord(word.en)} />
          <Button title={isFavorite ? '★ Sačuvano' : '☆ Sačuvaj'} secondary onPress={() => toggleFavorite(word.id)} />
        </View>
        <Button title={isLearned ? '✓ Označeno kao naučeno' : 'Označi kao naučeno'} secondary={!isLearned} onPress={() => toggleLearned(word.id)} />
      </View>
    );
  };

  const renderHome = () => (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>Dobrodošli u Traveleng! 🚀</Text>
        <Text style={styles.bannerSubtitle}>Engleski od početka do B2 nivoa</Text>
        <View style={styles.badgeContainer}>
          <Text style={styles.badgeText}>Dnevni cilj: {studyMinutes}/{dailyTarget} minuta  ·  🔥 {streakDays} dana</Text>
        </View>
        <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${Math.min(100, (studyMinutes / Math.max(dailyTarget, 1)) * 100)}%` }]} /></View>
      </View>
      <Text style={styles.sectionTitle}>Glavni moduli</Text>
      <View style={styles.grid}>
        {MODULES.map(item => (
          <TouchableOpacity key={item.id} style={[styles.card, IS_TABLET && styles.cardTablet]} onPress={() => { setSearch(''); setCurrentScreen(item.id); }}>
            <Text style={styles.cardIcon}>{item.icon}</Text>
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardDesc}>{item.id === 'DICT' ? `${dictionary.length} reči u učitanoj bazi` : item.desc}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );

  const renderLearn = () => (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <Header title="Učenje engleskog" icon="📚" />
      <Text style={styles.sectionTitle}>Izaberi CEFR nivo</Text>
      <View style={styles.buttonRow}>{['A1', 'A2', 'B1', 'B2'].map(level => <Button key={level} title={level === selectedLevel ? `✓ ${level}` : level} secondary={level !== selectedLevel} onPress={() => { setSelectedLevel(level); setWordIndex(0); }} />)}</View>
      <Text style={styles.muted}>Reči na nivou {selectedLevel}: {wordsByLevel.length}</Text>
      <WordCard word={activeWord} />
      <View style={styles.buttonRow}>
        <Button title="← Prethodna" secondary onPress={() => setWordIndex(Math.max(0, wordIndex - 1))} disabled={wordIndex <= 0} />
        <Button title="Sledeća →" onPress={() => setWordIndex(wordIndex + 1)} />
      </View>
    </ScrollView>
  );

  const renderDictionary = (dolchOnly = false) => {
    const list = dolchOnly
      ? searchableWords.filter(w => /dolch|osnovn|high.frequency/i.test(`${w.category || ''} ${w.en || ''}`) || ['the','and','a','to','is','in','you','it','he','was'].includes(String(w.en || '').toLowerCase()))
      : searchableWords;
    return (
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Header title={dolchOnly ? 'Dolch lista reči' : 'Rečnik'} icon={dolchOnly ? '🔤' : '📖'} />
        <TextInput style={styles.input} value={search} onChangeText={setSearch} placeholder="Pretraži engleski, srpski ili temu..." placeholderTextColor="#94a3b8" />
        <Text style={styles.muted}>{dolchOnly ? `Pronađeno: ${list.length} reči iz postojeće baze` : `Pronađeno: ${list.length} od ${dictionary.length} reči`}</Text>
        {dolchOnly && <Text style={styles.note}>Napomena: za kompletnu Dolch listu od 315 stavki potreban je poseban, proveren spisak. Ovde se prikazuju samo odgovarajuće reči koje postoje u data.json.</Text>}
        {list.slice(0, 100).map((word, index) => (
          <TouchableOpacity key={word.id || `${word.en}-${index}`} style={styles.listItem} onPress={() => { setWordIndex(dictionary.findIndex(w => w.id === word.id)); setCurrentScreen('WORD_DETAIL'); }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.listTitle}>{word.en}</Text>
              <Text style={styles.listSubtitle}>{word.sr}</Text>
              <Text style={styles.eyebrow}>{word.level || ''} · {word.category || ''}</Text>
            </View>
            <TouchableOpacity style={styles.starButton} onPress={() => toggleFavorite(word.id)}><Text style={styles.starText}>{favoriteWords.includes(word.id) ? '★' : '☆'}</Text></TouchableOpacity>
          </TouchableOpacity>
        ))}
        {list.length > 100 && <Text style={styles.muted}>Prikazano prvih 100 rezultata. Suzi pretragu da pronađeš ostale.</Text>}
      </ScrollView>
    );
  };

  const answerQuiz = (option) => {
    if (!quizWord || quizFeedback) return;
    const correct = option.id === quizWord.id;
    if (correct) setQuizScore(quizScore + 1);
    setQuizFeedback(correct ? 'Tačno! ✓' : `Nije tačno. Tačan odgovor: ${quizWord.sr}`);
    if (correct) toggleLearned(quizWord.id);
  };

  const renderQuiz = () => (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <Header title="Kvizovi i testovi" icon="🧩" />
      <View style={styles.panel}>
        <Text style={styles.eyebrow}>TIP 1 OD 8 · PREVOD</Text>
        <Text style={styles.muted}>Za sada je aktivan kviz izbora prevoda. Ostalih 7 tipova su planirani za narednu fazu.</Text>
        <Text style={styles.wordEn}>{quizWord ? quizWord.en : 'Dodajte reči u data.json'}</Text>
        <Text style={styles.bodyText}>Izaberi tačan prevod:</Text>
        {quizOptions.map(option => <Button key={option.id} title={option.sr} secondary onPress={() => answerQuiz(option)} disabled={!!quizFeedback} />)}
        {!!quizFeedback && <Text style={[styles.feedback, quizFeedback.startsWith('Tačno') ? styles.correct : styles.incorrect]}>{quizFeedback}</Text>}
        <Text style={styles.muted}>Rezultat: {quizScore} tačnih odgovora</Text>
        <Button title="Sledeće pitanje →" onPress={() => { setQuizIndex(quizIndex + 1); setQuizFeedback(''); }} />
      </View>
    </ScrollView>
  );

  const renderGrammar = () => {
    const lesson = GRAMMAR_LESSONS[grammarIndex % GRAMMAR_LESSONS.length];
    return <ScrollView contentContainerStyle={styles.scrollContent}>
      <Header title="Gramatika" icon="📝" />
      <View style={styles.buttonRow}>{['A1', 'A2', 'B1', 'B2'].map(level => <Button key={level} title={level} secondary onPress={() => { const i = GRAMMAR_LESSONS.findIndex(l => l.level === level); if (i >= 0) setGrammarIndex(i); }} />)}</View>
      <View style={styles.panel}>
        <Text style={styles.eyebrow}>NIVO {lesson.level} · LEKCIJA {grammarIndex + 1}</Text>
        <Text style={styles.panelTitle}>{lesson.title}</Text>
        <Text style={styles.bodyText}>{lesson.rule}</Text>
        <Text style={styles.sectionTitle}>Primeri</Text>
        {lesson.examples.map((example, i) => <Text key={i} style={styles.exampleSr}>{'• '}{example}</Text>)}
        <View style={styles.buttonRow}>
          <Button title="← Prethodna" secondary onPress={() => setGrammarIndex((grammarIndex - 1 + GRAMMAR_LESSONS.length) % GRAMMAR_LESSONS.length)} />
          <Button title="Sledeća →" onPress={() => setGrammarIndex((grammarIndex + 1) % GRAMMAR_LESSONS.length)} />
        </View>
      </View>
    </ScrollView>;
  };

  const renderTranslator = () => {
    const q = translationInput.trim().toLocaleLowerCase();
    const matches = q ? dictionary.filter(w => {
      const source = translationDirection === 'en-sr' ? w.en : w.sr;
      return String(source || '').toLocaleLowerCase().includes(q);
    }).slice(0, 8) : [];
    return <ScrollView contentContainerStyle={styles.scrollContent}>
      <Header title="Prevodilac" icon="🌐" />
      <View style={styles.panel}>
        <View style={styles.buttonRow}>
          <Button title={translationDirection === 'en-sr' ? '✓ EN → SR' : 'EN → SR'} secondary={translationDirection !== 'en-sr'} onPress={() => setTranslationDirection('en-sr')} />
          <Button title={translationDirection === 'sr-en' ? '✓ SR → EN' : 'SR → EN'} secondary={translationDirection !== 'sr-en'} onPress={() => setTranslationDirection('sr-en')} />
        </View>
        <TextInput style={[styles.input, styles.multilineInput]} value={translationInput} onChangeText={setTranslationInput} multiline placeholder={translationDirection === 'en-sr' ? 'Unesi englesku reč...' : 'Unesi srpsku reč...'} placeholderTextColor="#94a3b8" />
        <Text style={styles.note}>Ovaj režim pretražuje lokalni rečnik. Ne prevodi automatski proizvoljne rečenice i ne zahteva internet.</Text>
        {matches.map((word, i) => <View key={word.id || i} style={styles.listItem}>
          <View style={{ flex: 1 }}><Text style={styles.listTitle}>{word.en}</Text><Text style={styles.listSubtitle}>{word.sr}</Text></View>
          <TouchableOpacity onPress={() => speakWord(word.en)}><Text style={styles.starText}>🔊</Text></TouchableOpacity>
        </View>)}
        {q && matches.length === 0 && <Text style={styles.muted}>Nema rezultata u trenutno učitanoj bazi.</Text>}
      </View>
    </ScrollView>;
  };

  const renderPronunciation = () => <ScrollView contentContainerStyle={styles.scrollContent}>
    <Header title="Izgovor i slušanje" icon="🎧" />
    <View style={styles.panel}>
      <Text style={styles.bodyText}>Izaberi reč iz rečnika i poslušaj izgovor na engleskom.</Text>
      {dictionary.slice(0, 30).map((word, i) => <View key={word.id || i} style={styles.listItem}>
        <View style={{ flex: 1 }}><Text style={styles.listTitle}>{word.en}</Text><Text style={styles.listSubtitle}>{word.phonetic_sr || word.ipa || word.sr}</Text></View>
        <TouchableOpacity onPress={() => speakWord(word.en)} style={styles.smallButton}><Text style={styles.smallButtonText}>🔊 Slušaj</Text></TouchableOpacity>
      </View>)}
      <Text style={styles.note}>Govorni izlaz koristi Expo Speech i dostupni glas na uređaju. Prepoznavanje korisnikovog izgovora nije uključeno u ovoj verziji.</Text>
    </View>
  </ScrollView>;

  const renderTravel = () => {
    const categories = ['Sve', ...new Set(TRAVEL_PHRASES.map(p => p.category))];
    const phrases = travelCategory === 'Sve' ? TRAVEL_PHRASES : TRAVEL_PHRASES.filter(p => p.category === travelCategory);
    return <ScrollView contentContainerStyle={styles.scrollContent}>
      <Header title="Engleski za putovanja" icon="✈️" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
        {categories.map(c => <TouchableOpacity key={c} onPress={() => setTravelCategory(c)} style={[styles.chip, travelCategory === c && styles.chipActive]}><Text style={[styles.chipText, travelCategory === c && styles.chipTextActive]}>{c}</Text></TouchableOpacity>)}
      </ScrollView>
      {phrases.map((p, i) => <View key={`${p.category}-${i}`} style={styles.panel}>
        <Text style={styles.eyebrow}>{p.category}</Text><Text style={styles.listTitle}>{p.en}</Text><Text style={styles.listSubtitle}>{p.sr}</Text>
        <Button title="🔊 Izgovori" onPress={() => speakWord(p.en)} />
      </View>)}
    </ScrollView>;
  };
  const renderMyWords = () => {
    const list = dictionary.filter(w => favoriteWords.includes(w.id));

    return (
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Header title="Moje reči" icon="⭐" />

        <Text style={styles.muted}>
          Sačuvane reči: {list.length} · Naučene reči: {learnedWords.length}
        </Text>

        {list.length > 0 ? (
          list.map((word, i) => (
            <View key={word.id || i}>
              <WordCard word={word} showExample={false} />
            </View>
          ))
        ) : (
          <View style={styles.panel}>
            <Text style={styles.bodyText}>
              Još nema sačuvanih reči. Otvori Rečnik ili Učenje i dodirni „Sačuvaj“.
            </Text>
          </View>
        )}
      </ScrollView>
    );
  };
  const renderStats = () => <ScrollView contentContainerStyle={styles.scrollContent}>
    <Header title="Statistika napretka" icon="📊" />
    <View style={styles.statsGrid}>
      <View style={styles.statCard}><Text style={styles.statNumber}>{dictionary.length}</Text><Text style={styles.statLabel}>Reči u bazi</Text></View>
      <View style={styles.statCard}><Text style={styles.statNumber}>{learnedWords.length}</Text><Text style={styles.statLabel}>Označeno naučeno</Text></View>
      <View style={styles.statCard}><Text style={styles.statNumber}>{favoriteWords.length}</Text><Text style={styles.statLabel}>Sačuvane reči</Text></View>
      <View style={styles.statCard}><Text style={styles.statNumber}>{studyMinutes}</Text><Text style={styles.statLabel}>Zabeleženi minuti</Text></View>
      <View style={styles.statCard}><Text style={styles.statNumber}>{quizScore}</Text><Text style={styles.statLabel}>Tačni odgovori u ovoj sesiji</Text></View>
      <View style={styles.statCard}><Text style={styles.statNumber}>{streakDays}</Text><Text style={styles.statLabel}>Dani u nizu (sačuvano)</Text></View>
    </View>
    <View style={styles.panel}><Text style={styles.panelTitle}>Dnevni cilj</Text><Text style={styles.bodyText}>{studyMinutes} od {dailyTarget} minuta</Text><View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${Math.min(100, studyMinutes / Math.max(dailyTarget, 1) * 100)}%` }]} /></View></View>
  </ScrollView>;

  const renderSettings = () => <ScrollView contentContainerStyle={styles.scrollContent}>
    <Header title="Podešavanja" icon="⚙️" />
    <View style={styles.panel}>
      <Text style={styles.panelTitle}>Dnevni cilj učenja</Text>
      <Text style={styles.bodyText}>Izaberi koliko minuta želiš da učiš svakog dana.</Text>
      <View style={styles.buttonRow}>{[5, 10, 15, 20, 30, 45, 60].map(n => <Button key={n} title={dailyTarget === n ? `✓ ${n} min` : `${n} min`} secondary={dailyTarget !== n} onPress={async () => { setDailyTarget(n); await AsyncStorage.setItem('@traveleng_daily_target', String(n)); }} />)}</View>
      <View style={styles.divider} />
      <Text style={styles.panelTitle}>Zvuk</Text>
      <Button title={soundEnabled ? '🔊 Zvuk uključen' : '🔇 Zvuk isključen'} secondary={!soundEnabled} onPress={async () => { const next = !soundEnabled; setSoundEnabled(next); await AsyncStorage.setItem('@traveleng_sound', String(next)); }} />
      <View style={styles.divider} />
      <Text style={styles.panelTitle}>Podaci aplikacije</Text>
      <Text style={styles.note}>Napredak i omiljene reči čuvaju se lokalno na uređaju. Ova verzija nema korisničke naloge niti sinhronizaciju između uređaja.</Text>
      <Button title="Obriši moj napredak" secondary onPress={() => Alert.alert('Obrisati napredak?', 'Ovo će obrisati naučene i omiljene reči i broj minuta.', [
        { text: 'Otkaži', style: 'cancel' },
        { text: 'Obriši', style: 'destructive', onPress: async () => {
          setLearnedWords([]); setFavoriteWords([]); setStudyMinutes(0); setQuizScore(0);
          await AsyncStorage.multiRemove(['@traveleng_learned', '@traveleng_favorites', '@traveleng_study_minutes']);
        }}
      ])} />
    </View>
  </ScrollView>;

  const renderWordDetail = () => {
    const word = dictionary[Math.max(0, wordIndex)];
    return <ScrollView contentContainerStyle={styles.scrollContent}><Header title="Detalji reči" icon="📖" /><WordCard word={word} /></ScrollView>;
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'HOME': return renderHome();
      case 'LEARN': return renderLearn();
      case 'DOLCH': return renderDictionary(true);
      case 'DICT': return renderDictionary(false);
      case 'QUIZ': return renderQuiz();
      case 'GRAMMAR': return renderGrammar();
      case 'TRANSLATE': return renderTranslator();
      case 'PRONUNCIATION': return renderPronunciation();
      case 'TRAVEL': return renderTravel();
      case 'MY_WORDS': return renderMyWords();
      case 'STATS': return renderStats();
      case 'SETTINGS': return renderSettings();
      case 'WORD_DETAIL': return renderWordDetail();
      default: return renderHome();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.navy} />
      {renderScreen()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scrollContent: { padding: 16, paddingBottom: 32 },
  banner: { backgroundColor: COLORS.navy, borderRadius: 14, padding: 20, marginBottom: 20 },
  bannerTitle: { color: COLORS.white, fontSize: IS_TABLET ? 30 : 24, fontWeight: '800', marginBottom: 8 },
  bannerSubtitle: { color: '#86efac', fontSize: 16, fontWeight: '600', marginBottom: 14 },
  badgeContainer: { backgroundColor: COLORS.green, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, alignSelf: 'flex-start' },
  badgeText: { color: '#a7f3d0', fontWeight: '700', fontSize: 14 },
  progressTrack: { height: 8, backgroundColor: '#d1d5db', borderRadius: 8, overflow: 'hidden', marginTop: 12 },
  progressFill: { height: '100%', backgroundColor: '#10b981', borderRadius: 8 },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: COLORS.text, marginBottom: 12, marginTop: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { backgroundColor: COLORS.white, width: '100%', borderRadius: 12, padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, elevation: 2 },
  cardTablet: { width: '48.5%' },
  cardIcon: { fontSize: 32, marginRight: 14 },
  cardTextContainer: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '800', color: COLORS.text, marginBottom: 4 },
  cardDesc: { fontSize: 13, color: COLORS.muted, lineHeight: 18 },
  screenHeader: { marginBottom: 12 },
  screenTitle: { fontSize: 25, fontWeight: '800', color: COLORS.text, marginTop: 4, marginBottom: 12 },
  backButton: { paddingVertical: 8, alignSelf: 'flex-start' },
  backButtonText: { color: COLORS.blue, fontSize: 15, fontWeight: '700' },
  panel: { backgroundColor: COLORS.white, borderRadius: 16, padding: 20, marginBottom: 14, borderWidth: 1, borderColor: COLORS.border, elevation: 2 },
  eyebrow: { color: COLORS.muted, fontSize: 12, fontWeight: '700', marginBottom: 8 },
  wordEn: { fontSize: 32, fontWeight: '800', color: COLORS.text, marginBottom: 6 },
  phonetic: { color: COLORS.muted, fontSize: 15, marginBottom: 4 },
  wordSr: { fontSize: 24, fontWeight: '700', color: COLORS.green, marginTop: 10, marginBottom: 14 },
  exampleBox: { backgroundColor: '#f8fafc', padding: 12, borderRadius: 10, marginBottom: 14 },
  exampleEn: { color: COLORS.text, fontSize: 16, fontWeight: '600', marginBottom: 5 },
  exampleSr: { color: '#475569', fontSize: 15, lineHeight: 22, marginBottom: 6 },
  buttonRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  button: { backgroundColor: COLORS.green, paddingHorizontal: 14, paddingVertical: 11, borderRadius: 9, alignItems: 'center', justifyContent: 'center', marginBottom: 7 },
  buttonText: { color: COLORS.white, fontWeight: '800', fontSize: 14 },
  buttonSecondary: { backgroundColor: COLORS.mint, borderWidth: 1, borderColor: '#cce9dd' },
  buttonSecondaryText: { color: COLORS.green },
  disabledButton: { opacity: 0.45 },
  input: { backgroundColor: COLORS.white, borderColor: '#cbd5e1', borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, color: COLORS.text, fontSize: 16, marginBottom: 12 },
  multilineInput: { minHeight: 100, textAlignVertical: 'top' },
  muted: { color: COLORS.muted, fontSize: 14, lineHeight: 21, marginBottom: 12 },
  note: { color: '#64748b', fontSize: 13, lineHeight: 19, backgroundColor: '#f8fafc', padding: 10, borderRadius: 8, marginBottom: 12 },
  bodyText: { color: '#334155', fontSize: 16, lineHeight: 24, marginBottom: 12 },
  listItem: { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, padding: 13, marginBottom: 9, flexDirection: 'row', alignItems: 'center', gap: 10 },
  listTitle: { color: COLORS.text, fontSize: 17, fontWeight: '800', marginBottom: 4 },
  listSubtitle: { color: COLORS.green, fontSize: 15, marginBottom: 3 },
  starButton: { padding: 8 },
  starText: { fontSize: 23, color: '#ca8a04' },
  smallButton: { backgroundColor: COLORS.mint, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  smallButtonText: { color: COLORS.green, fontWeight: '700' },
  panelTitle: { color: COLORS.text, fontSize: 21, fontWeight: '800', marginBottom: 12 },
  feedback: { fontSize: 16, fontWeight: '800', marginVertical: 10 },
  correct: { color: '#047857' },
  incorrect: { color: COLORS.red },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  statCard: { backgroundColor: COLORS.white, width: IS_TABLET ? '31.5%' : '48.5%', padding: 18, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, marginBottom: 10 },
  statNumber: { color: COLORS.green, fontSize: 26, fontWeight: '800', marginBottom: 5 },
  statLabel: { color: COLORS.muted, fontSize: 13, lineHeight: 18 },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 16 },
  chip: { paddingHorizontal: 14, paddingVertical: 10, backgroundColor: '#e2e8f0', borderRadius: 18, marginRight: 8 },
  chipActive: { backgroundColor: COLORS.green },
  chipText: { color: COLORS.text, fontWeight: '700' },
  chipTextActive: { color: COLORS.white },
});
