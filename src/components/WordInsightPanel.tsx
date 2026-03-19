/**
 * Word Insight Panel Component
 * Displays etymology, mnemonics, and word families
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  LayoutAnimation,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  getMnemonics,
  getEtymology,
  getWordFamily,
  type Mnemonic,
  type Etymology,
  type WordFamily,
} from '@/src/lib/advanced-learning-features';

interface WordInsightPanelProps {
  word: string;
  meaning: string;
  exampleSentence?: string;
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F5FBFC',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#00BCD4',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#E0F2F1',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#00695C',
    marginLeft: 8,
  },
  expandIcon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionContent: {
    paddingTop: 12,
    paddingBottom: 8,
  },
  mnemonicCard: {
    backgroundColor: '#FFF9E6',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#FFA000',
  },
  mnemonicTechnique: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF6F00',
    marginBottom: 4,
  },
  mnemonicDescription: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    marginBottom: 8,
  },
  mnemonicExample: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
    paddingLeft: 8,
    borderLeftWidth: 2,
    borderLeftColor: '#FFA000',
  },
  etymologyCard: {
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50',
  },
  etymologyLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 4,
  },
  etymologyText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 6,
  },
  relatedWords: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  relatedWordChip: {
    backgroundColor: '#C8E6C9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 4,
  },
  relatedWordText: {
    fontSize: 12,
    color: '#1B5E20',
    fontWeight: '600',
  },
  wordFamilyCard: {
    backgroundColor: '#F3E5F5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#7B1FA2',
  },
  wordFamilyHeader: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6A1B9A',
    marginBottom: 8,
  },
  wordFormRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: '#FCE4EC',
    borderRadius: 6,
    marginBottom: 6,
  },
  wordFormWord: {
    fontSize: 14,
    fontWeight: '700',
    color: '#AD1457',
    flex: 1,
  },
  wordFormPos: {
    fontSize: 11,
    color: '#C2185B',
    fontWeight: '600',
    marginHorizontal: 8,
  },
  wordFormMeaning: {
    fontSize: 12,
    color: '#666',
    flex: 1,
    textAlign: 'right',
  },
  emptyMessage: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 12,
  },
  effectivenessBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
    backgroundColor: '#FFECB3',
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  effectivenessText: {
    fontSize: 11,
    color: '#F57F17',
    fontWeight: '600',
    marginLeft: 4,
  },
});

const MnemonicSection: React.FC<{ word: string }> = ({ word }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const mnemonics = getMnemonics(word);

  if (mnemonics.length === 0) {
    return null;
  }

  return (
    <View>
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={() => {
          if (Platform.OS !== 'web') {
            LayoutAnimation.easeInEaseOut();
          }
          setIsExpanded(!isExpanded);
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <MaterialCommunityIcons name="lightbulb-outline" size={20} color="#FF6F00" />
          <Text style={styles.sectionTitle}>記憶法</Text>
        </View>
        <View style={styles.expandIcon}>
          <MaterialCommunityIcons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={24}
            color="#00695C"
          />
        </View>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.sectionContent}>
          {mnemonics.map((mnemonic, idx) => (
            <View key={idx} style={styles.mnemonicCard}>
              <Text style={styles.mnemonicTechnique}>
                {getTechniqueName(mnemonic.technique)}
              </Text>
              <Text style={styles.mnemonicDescription}>{mnemonic.description}</Text>
              <Text style={styles.mnemonicExample}>例: {mnemonic.example}</Text>
              <View style={styles.effectivenessBadge}>
                <MaterialCommunityIcons name="star" size={14} color="#FBC02D" />
                <Text style={styles.effectivenessText}>
                  効果度: {mnemonic.effectiveness}/5
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const EtymologySection: React.FC<{ word: string }> = ({ word }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const etymology = getEtymology(word);

  if (!etymology) {
    return null;
  }

  return (
    <View>
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={() => {
          if (Platform.OS !== 'web') {
            LayoutAnimation.easeInEaseOut();
          }
          setIsExpanded(!isExpanded);
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <MaterialCommunityIcons name="history" size={20} color="#4CAF50" />
          <Text style={styles.sectionTitle}>語源</Text>
        </View>
        <View style={styles.expandIcon}>
          <MaterialCommunityIcons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={24}
            color="#00695C"
          />
        </View>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.sectionContent}>
          <View style={styles.etymologyCard}>
            <Text style={styles.etymologyLabel}>由来</Text>
            <Text style={styles.etymologyText}>{etymology.origin}</Text>

            <Text style={styles.etymologyLabel}>意味</Text>
            <Text style={styles.etymologyText}>{etymology.rootMeaning}</Text>

            {etymology.historicalContext && (
              <>
                <Text style={styles.etymologyLabel}>歴史的背景</Text>
                <Text style={styles.etymologyText}>{etymology.historicalContext}</Text>
              </>
            )}

            {etymology.relatedWords.length > 0 && (
              <>
                <Text style={styles.etymologyLabel}>関連単語</Text>
                <View style={styles.relatedWords}>
                  {etymology.relatedWords.map((relWord, idx) => (
                    <View key={idx} style={styles.relatedWordChip}>
                      <Text style={styles.relatedWordText}>{relWord}</Text>
                    </View>
                  ))}
                </View>
              </>
            )}
          </View>
        </View>
      )}
    </View>
  );
};

const WordFamilySection: React.FC<{ word: string }> = ({ word }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const family = getWordFamily(word);

  if (!family) {
    return null;
  }

  return (
    <View>
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={() => {
          if (Platform.OS !== 'web') {
            LayoutAnimation.easeInEaseOut();
          }
          setIsExpanded(!isExpanded);
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <MaterialCommunityIcons name="family-tree" size={20} color="#7B1FA2" />
          <Text style={styles.sectionTitle}>単語族</Text>
        </View>
        <View style={styles.expandIcon}>
          <MaterialCommunityIcons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={24}
            color="#00695C"
          />
        </View>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.sectionContent}>
          <View style={styles.wordFamilyCard}>
            <Text style={styles.wordFamilyHeader}>語根: {family.root}</Text>
            {family.forms.map((form, idx) => (
              <View key={idx} style={styles.wordFormRow}>
                <Text style={styles.wordFormWord}>{form.word}</Text>
                <Text style={styles.wordFormPos}>{form.partOfSpeech}</Text>
                <Text style={styles.wordFormMeaning}>{form.meaning}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

function getTechniqueName(technique: string): string {
  const names: Record<string, string> = {
    rhyme: 'ライム',
    association: '連想',
    story: 'ストーリー',
    visual: 'ビジュアル',
    acronym: 'アクロニム',
  };
  return names[technique] || technique;
}

export const WordInsightPanel: React.FC<WordInsightPanelProps> = ({
  word,
  meaning,
  exampleSentence,
}) => {
  const mnemonics = getMnemonics(word);
  const etymology = getEtymology(word);
  const family = getWordFamily(word);

  // Don't show panel if there's no content
  if (!mnemonics.length && !etymology && !family) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <MnemonicSection word={word} />
        <EtymologySection word={word} />
        <WordFamilySection word={word} />
      </ScrollView>
    </View>
  );
};

export default WordInsightPanel;
