/**
 * SimpleHome - Minimal test version
 */

import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';

export default function SimpleHome() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>EigoMaster</Text>
      </View>

      <ScrollView style={styles.scroll}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🎧 リスニング</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('/(tabs)/listening')}
          >
            <Text style={styles.buttonText}>開始</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>📚 英単語</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('/(tabs)/vocabulary')}
          >
            <Text style={styles.buttonText}>開始</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>✏️ ライティング</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('/(tabs)/writing')}
          >
            <Text style={styles.buttonText}>開始</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#2BBCB3',
  },
  scroll: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222',
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#2BBCB3',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
