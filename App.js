import React, { useMemo, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
  StatusBar,
  Alert,
} from 'react-native';
import * as Speech from 'expo-speech';
import appData from './data.json';

const COLORS = {
  navy: '#10243A',
  blue: '#2563EB',
  pale: '#EFF6FF',
  bg: '#F4F7FB',
  ink: '#172033',
  muted: '#64748B',
  white: '#FFFFFF',
  green: '#15803D',
  line: '#E2E8F0',
};

const words = Array.isArray(appData.dictionary)
  ? appData.dictionary
  : Array.isArray(appData.words)
  ? appData.words
  : [];

const numbers = Array.isArray(appData.numbers)
  ? appData.numbers
  : [];

const alphabet = Array.isArray(appData.alphabet)
  ? appData.alphabet
  : [];

const quizzes = Array.isArray(appData.quizzes)
  ? appData.quizzes
  : [];

function speak(text, language = 'en-US') {
  if (!text) return;

  Speech.stop();

  Speech.speak(String(text), {
    language,
    rate: 0.82,
    pitch: 1.0,
  });
}

function Button({
  title,
  onPress,
  secondary = false,
  compact = false,
  disabled = false,
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.button,
        secondary && styles.buttonSecondary,
        compact && styles.buttonCompact,
        disabled && styles.buttonDisabled,
      ]}
    >
      <Text
        style={[
          styles.buttonText,
          secondary && styles.buttonSecondaryText,
          disabled && styles.buttonDisabledText,
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

function Header({ title, subtitle, onBack }) {
  return (
    <View style={styles.header}>
      {onBack ? (
        <Pressable onPress={onBack} style={styles.back}>
          <Text style={styles.backText}>‹ Nazad</Text>
        </Pressable>
      ) : null}

      <Text style={styles.headerTitle}>{title}</Text>

      {subtitle ? (
        <Text style={styles.headerSubtitle}>{subtitle}</Text>
      ) : null}
    </View>
  );
}

function MenuCard({ icon, title, detail, onPress }) {
  return (
    <Pressable onPress={onPress} style={styles.menuCard}>
      <Text style={styles.menuIcon}>{icon}</Text>

      <View style={{ flex: 1 }}>
        <Text style={styles.menuTitle}>{title}</Text>
        <Text style={styles.menuDetail}>{detail}</Text>
      </View>

      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

export default function App() {
  const [screen, setScreen] = useState('home');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Све');
  const [favorites, setFavorites] = useState([]);
  const [onlyFavorites, setOnlyFavorites] = useState(false);

  const [quizIndex, setQuizIndex] = useState(0);
  const [selected, setSelected] = useState('');
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);

  const categories = useMemo(
    () => ['Све', ...new Set(words.map(w => w.category).filter(Boolean))],
    []
  );

  const filteredWords = useMemo(() => {
    return words.filter(item => {
      const en = String(
        item.en ?? item.word ?? item.engleski ?? ''
      );

      const sr = String(
        item.sr ?? item.translation ?? item.srpski ?? ''
      );

      const search = query.trim().toLocaleLowerCase();

      const matchesSearch =
        !search ||
        en.toLocaleLowerCase().includes(search) ||
        sr.toLocaleLowerCase().includes(search) ||
        String(item.category || '')
          .toLocaleLowerCase()
          .includes(search);

      const matchesCategory =
        category === 'Све' || item.category === category;

      const matchesFavorites =
        !onlyFavorites ||
        favorites.includes(String(item.id));

      return (
        matchesSearch &&
        matchesCategory &&
        matchesFavorites
      );
    });
  }, [query, category, onlyFavorites, favorites]);

  const go = name => {
    setQuery('');
    setCategory('Све');
    setOnlyFavorites(false);
    setScreen(name);
  };

  const toggleFavorite = id => {
    setFavorites(previous =>
      previous.includes(String(id))
        ? previous.filter(value => value !== String(id))
        : [...previous, String(id)]
    );
  };

  const currentQuiz = quizzes[quizIndex];

  const answerQuiz = option => {
    if (answered || !currentQuiz) return;

    setSelected(option);
    setAnswered(true);

    if (option === currentQuiz.correct) {
      setScore(previous => previous + 1);
    }
  };

  const nextQuiz = () => {
    if (quizIndex + 1 >= quizzes.length) {
      Alert.alert(
        'Квиз завршен',
        `Резултат: ${score} / ${quizzes.length}`,
        [
          {
            text: 'Понови',
            onPress: () => {
              setQuizIndex(0);
              setScore(0);
              setSelected('');
              setAnswered(false);
            },
          },
          {
            text: 'Почетна',
            onPress: () => go('home'),
          },
        ]
      );

      return;
    }

    setQuizIndex(index => index + 1);
    setSelected('');
    setAnswered(false);
  };

  const back = () => go('home');

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.navy}
      />

      {/* POČETNI EKRAN */}
      {screen === 'home' && (
        <ScrollView contentContainerStyle={styles.home}>
          <View style={styles.hero}>
            <Text style={styles.brand}>ENG • SR</Text>

            <Text style={styles.heroTitle}>
              Engleski bez muke
            </Text>

            <Text style={styles.heroSub}>
              Речник, изговор и вежбање — на једном месту.
            </Text>

            <View style={styles.stats}>
              <View>
                <Text style={styles.statNum}>
                  {words.length.toLocaleString('sr-RS')}
                </Text>
                <Text style={styles.statLabel}>
                  речничких записа
                </Text>
              </View>

              <View>
                <Text style={styles.statNum}>
                  {alphabet.length}
                </Text>
                <Text style={styles.statLabel}>слова</Text>
              </View>

              <View>
                <Text style={styles.statNum}>
                  {favorites.length}
                </Text>
                <Text style={styles.statLabel}>
                  омиљених
                </Text>
              </View>
            </View>
          </View>

          <Text style={styles.sectionTitle}>
            Изабери модул
          </Text>

          <MenuCard
            icon="📚"
            title="Речник"
            detail="Претрага, превод, примери и изговор"
            onPress={() => go('dictionary')}
          />

          <MenuCard
            icon="🔢"
            title="Бројеви"
            detail={`${numbers.length} бројева са аудио изговором`}
            onPress={() => go('numbers')}
          />

          <MenuCard
            icon="🔤"
            title="Слова и спеловање"
            detail="Енглеска абецеда и речи за памћење"
            onPress={() => go('spelling')}
          />

          <MenuCard
            icon="🧠"
            title="Квиз"
            detail={`${quizzes.length} питања за проверу знања`}
            onPress={() => {
              setQuizIndex(0);
              setScore(0);
              setSelected('');
              setAnswered(false);
              go('quiz');
            }}
          />

          <Text style={styles.footerNote}>
            Изговор се генерише преко системског говора уређаја.
            За најбољи резултат инсталирај енглески глас.
          </Text>
        </ScrollView>
      )}

      {/* REČNIK */}
      {screen === 'dictionary' && (
        <>
          <Header
            title="Речник"
            subtitle={`${filteredWords.length.toLocaleString('sr-RS')} од ${words.length.toLocaleString('sr-RS')} записа`}
            onBack={back}
          />

          <View style={styles.searchWrap}>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Претражи енглески, српски или тему…"
              placeholderTextColor="#94A3B8"
              style={styles.search}
            />

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chips}
            >
              {categories.slice(0, 30).map(item => (
                <Pressable
                  key={item}
                  onPress={() => setCategory(item)}
                  style={[
                    styles.chip,
                    category === item && styles.chipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      category === item && styles.chipTextActive,
                    ]}
                  >
                    {item}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            <Pressable
              onPress={() => setOnlyFavorites(value => !value)}
              style={[
                styles.favoriteFilter,
                onlyFavorites && styles.chipActive,
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  onlyFavorites && styles.chipTextActive,
                ]}
              >
                {onlyFavorites
                  ? '★ Приказани су омиљени'
                  : '☆ Прикажи само омиљене'}
              </Text>
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.list}>
            {filteredWords.map((item, index) => {
              const id = String(item.id ?? index);

              const en =
                item.en ?? item.word ?? item.engleski ?? '';

              const sr =
                item.sr ??
                item.translation ??
                item.srpski ??
                '';

              return (
                <View key={id} style={styles.wordCard}>
                  <View style={styles.wordTop}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.wordEnglish}>
                        {en}
                      </Text>

                      <Text style={styles.wordSerbian}>
                        {sr}
                      </Text>

                      {item.phonetic ? (
                        <Text style={styles.phonetic}>
                          Изговор: {item.phonetic}
                        </Text>
                      ) : null}
                    </View>

                    <Pressable
                      onPress={() => toggleFavorite(id)}
                      style={styles.star}
                    >
                      <Text style={styles.starText}>
                        {favorites.includes(id) ? '★' : '☆'}
                      </Text>
                    </Pressable>

                    <Button
                      title="🔊"
                      compact
                      onPress={() => speak(en)}
                    />
                  </View>

                  {item.category ? (
                    <Text style={styles.category}>
                      {item.category}
                    </Text>
                  ) : null}

                  {item.exampleEn ? (
                    <Pressable
                      onPress={() => speak(item.exampleEn)}
                    >
                      <Text style={styles.example}>
                        {item.exampleEn}
                      </Text>

                      <Text style={styles.exampleSr}>
                        {item.exampleSr || ''}
                      </Text>
                    </Pressable>
                  ) : null}
                </View>
              );
            })}

            {filteredWords.length === 0 ? (
              <Text style={styles.empty}>
                Нема резултата за ову претрагу.
              </Text>
            ) : null}
          </ScrollView>
        </>
      )}

      {/* BROJEVI */}
      {screen === 'numbers' && (
        <>
          <Header
            title="Бројеви"
            subtitle={`${numbers.length} ставки · додирни звучник за изговор`}
            onBack={back}
          />

          <ScrollView contentContainerStyle={styles.list}>
            {numbers.map(item => (
              <View
                key={item.number}
                style={styles.numberCard}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.numberValue}>
                    {item.number}
                  </Text>

                  <Text style={styles.wordEnglish}>
                    {item.word}
                  </Text>

                  <Text style={styles.wordSerbian}>
                    {item.translation || ''}
                  </Text>
                </View>

                <Button
                  title="🔊 Изговор"
                  onPress={() => speak(item.word)}
                />
              </View>
            ))}
          </ScrollView>
        </>
      )}

      {/* SLOVA I SPELOVANJE */}
      {screen === 'spelling' && (
        <>
          <Header
            title="Слова и спеловање"
            subtitle="Слушај назив слова и пример речи"
            onBack={back}
          />

          <ScrollView contentContainerStyle={styles.letters}>
            {alphabet.map(item => (
              <Pressable
                key={item.letter}
                style={styles.letterCard}
                onPress={() =>
                  speak(`${item.letter}. ${item.word || item.letter}`)
                }
              >
                <Text style={styles.letter}>
                  {item.letter}
                </Text>

                <View style={{ flex: 1 }}>
                  <Text style={styles.wordEnglish}>
                    {item.word}
                  </Text>

                  <Text style={styles.phonetic}>
                    {item.izgovor || item.phonetic || ''}
                  </Text>
                </View>

                <Text style={styles.sound}>🔊</Text>
              </Pressable>
            ))}
          </ScrollView>
        </>
      )}

      {/* KVIZ */}
      {screen === 'quiz' && (
        <>
          <Header
            title="Квиз знања"
            subtitle={
              quizzes.length
                ? `Питање ${quizIndex + 1} од ${quizzes.length} · бодови: ${score}`
                : 'Нема доступних питања'
            }
            onBack={back}
          />

          {currentQuiz ? (
            <ScrollView contentContainerStyle={styles.quizWrap}>
              <View style={styles.quizCard}>
                <Text style={styles.quizLabel}>
                  ПИТАЊЕ {quizIndex + 1}
                </Text>

                <Text style={styles.question}>
                  {currentQuiz.question}
                </Text>

                {(currentQuiz.options || []).map(option => {
                  const correct = option === currentQuiz.correct;
                  const chosen = option === selected;

                  return (
                    <Pressable
                      key={option}
                      disabled={answered}
                      onPress={() => answerQuiz(option)}
                      style={[
                        styles.option,
                        answered &&
                          correct &&
                          styles.optionCorrect,
                        answered &&
                          chosen &&
                          !correct &&
                          styles.optionWrong,
                      ]}
                    >
                      <Text style={styles.optionText}>
                        {option}
                      </Text>
                    </Pressable>
                  );
                })}

                {answered ? (
                  <Text
                    style={[
                      styles.feedback,
                      {
                        color:
                          selected === currentQuiz.correct
                            ? COLORS.green
                            : '#B91C1C',
                      },
                    ]}
                  >
                    {selected === currentQuiz.correct
                      ? 'Тачно! Одлично.'
                      : `Нетачно. Тачан одговор: ${currentQuiz.correct}`}
                  </Text>
                ) : null}

                <Button
                  title={
                    answered
                      ? quizIndex + 1 === quizzes.length
                        ? 'Заврши квиз'
                        : 'Следеће питање'
                      : 'Изабери одговор'
                  }
                  disabled={!answered}
                  onPress={nextQuiz}
                />
              </View>
            </ScrollView>
          ) : (
            <Text style={styles.empty}>
              Додај питања у data.json.
            </Text>
          )}
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  home: {
    padding: 18,
    paddingBottom: 32,
  },
  hero: {
    backgroundColor: COLORS.navy,
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
  },
  brand: {
    color: '#93C5FD',
    fontWeight: '800',
    letterSpacing: 2,
    fontSize: 12,
  },
  heroTitle: {
    fontSize: 29,
    fontWeight: '800',
    color: '#FFF',
    marginTop: 12,
  },
  heroSub: {
    color: '#D7E4F5',
    fontSize: 15,
    marginTop: 8,
    lineHeight: 22,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#38506A',
    marginTop: 22,
    paddingTop: 16,
  },
  statNum: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFF',
  },
  statLabel: {
    fontSize: 11,
    color: '#C7D5E6',
    marginTop: 3,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: COLORS.ink,
    marginBottom: 12,
  },
  menuCard: {
    backgroundColor: COLORS.white,
    borderRadius: 17,
    padding: 16,
    marginBottom: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  menuIcon: {
    fontSize: 27,
    width: 38,
    textAlign: 'center',
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.ink,
  },
  menuDetail: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 4,
    lineHeight: 18,
  },
  chevron: {
    fontSize: 27,
    color: '#94A3B8',
  },
  footerNote: {
    fontSize: 12,
    color: COLORS.muted,
    lineHeight: 18,
    marginTop: 14,
  },
  header: {
    backgroundColor: COLORS.navy,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 17,
  },
  back: {
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  backText: {
    color: '#BFDBFE',
    fontSize: 15,
    fontWeight: '700',
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '800',
  },
  headerSubtitle: {
    color: '#CBD5E1',
    fontSize: 12,
    marginTop: 5,
  },
  searchWrap: {
    padding: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
  },
  search: {
    backgroundColor: COLORS.bg,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.ink,
  },
  chips: {
    gap: 7,
    paddingVertical: 10,
  },
  chip: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.line,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginRight: 2,
  },
  chipActive: {
    backgroundColor: COLORS.blue,
    borderColor: COLORS.blue,
  },
  chipText: {
    fontSize: 12,
    color: COLORS.ink,
  },
  chipTextActive: {
    color: '#FFF',
    fontWeight: '700',
  },
  favoriteFilter: {
    alignSelf: 'flex-start',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.line,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  list: {
    padding: 12,
    paddingBottom: 30,
  },
  wordCard: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  wordTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  wordEnglish: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.ink,
  },
  wordSerbian: {
    fontSize: 15,
    color: COLORS.blue,
    marginTop: 3,
  },
  phonetic: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 4,
  },
  star: {
    paddingHorizontal: 4,
    paddingVertical: 8,
  },
  starText: {
    fontSize: 23,
    color: '#E5A000',
  },
  button: {
    backgroundColor: COLORS.blue,
    paddingHorizontal: 15,
    paddingVertical: 11,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  buttonCompact: {
    marginTop: 0,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  buttonDisabledText: {
    color: '#E2E8F0',
  },
  buttonSecondary: {
    backgroundColor: COLORS.pale,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '800',
  },
  buttonSecondaryText: {
    color: COLORS.blue,
  },
  category: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.pale,
    color: COLORS.blue,
    borderRadius: 6,
    overflow: 'hidden',
    paddingHorizontal: 7,
    paddingVertical: 4,
    fontSize: 10,
    marginTop: 10,
  },
  example: {
    fontSize: 13,
    color: '#334155',
    marginTop: 10,
    fontStyle: 'italic',
  },
  exampleSr: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 3,
  },
  empty: {
    padding: 24,
    textAlign: 'center',
    color: COLORS.muted,
  },
  numberCard: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 15,
    margin
