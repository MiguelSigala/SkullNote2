import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';

const scales: string[] = [
  'Escala mayor',
  'Escala menor natural',
  'Escala menor armónica',
  'Escala menor melódica',
  'Escala pentatónica mayor',
  'Escala pentatónica menor',
  'Escala cromática',
  'Escala de blues',
  'Escala de tonos enteros',
  'Escala disminuida',
  'Escala frigia',
  'Escala dórica',
  'Escala lidia',
  'Escala mixolidia',
  'Escala locria',
];

export default function Bibloteca(): React.JSX.Element {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Biblioteca de acordes</Text>

      <View style={styles.grid}>
        {scales.map((scale: string, index: number) => (
          <View key={index} style={styles.card}>
            <Text style={styles.cardText}>{scale}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fefae0',
  },

  content: {
    paddingHorizontal: 22,
    paddingTop: 50,
    paddingBottom: 120,
  },

  title: {
    color: '#283618',
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 24,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },

  card: {
    width: '48%',
    minHeight: 100,
    backgroundColor: '#eadeab',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#89a071',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    shadowColor: '#283618',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },

  cardText: {
    color: '#283618',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
});