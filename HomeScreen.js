
import React, { useState, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Animated,
  Image,
} from 'react-native';

export default function HomeScreen({ navigation }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;

  const toggleMenu = () => {
    const toValue = menuOpen ? 0 : 1;

    setMenuOpen(!menuOpen);

    Animated.spring(animation, {
      toValue,
      friction: 6,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handleLogout = () => {
    navigation.replace('Login');
  };

  const handleCreateOption = (tipo) => {
    toggleMenu();
    // Aquí puedes agregar la navegación o creación de proyectos.
  };

  const pianoStyle = {
    opacity: animation,
    transform: [
      { scale: animation },
      {
        translateY: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -110],
        }),
      },
    ],
  };

  const scoreStyle = {
    opacity: animation,
    transform: [
      { scale: animation },
      {
        translateX: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -65],
        }),
      },
      {
        translateY: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -72],
        }),
      },
    ],
  };

  const guitarStyle = {
    opacity: animation,
    transform: [
      { scale: animation },
      {
        translateX: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -105],
        }),
      },
    ],
  };

  const rotation = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.topSection}>
        <View style={styles.header}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.title}>Hola, Usuario</Text>

            <Text style={styles.subtitle}>
              {'\n'}"Un verdadero artista {'\n'}
              nunca termina de aprender"{'\n\n'}
              -Igor Stravinsky.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Text style={styles.logoutText}>Salir</Text>
          </TouchableOpacity>
        </View>

        <Image
          source={require('./assets/icon.png')}
          style={styles.headerAppLogo}
          resizeMode="contain"
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Proyectos Recientes
          </Text>
        </View>

        <View style={styles.projectCard}>
          <Text style={styles.projectTitle}>
            Partitura sin título 1
          </Text>
          <Text style={styles.projectType}>
            Guitarra (TAB)
          </Text>
        </View>

        <View style={styles.projectCard}>
          <Text style={styles.projectTitle}>
            Ejercicio de Escalas
          </Text>
          <Text style={styles.projectType}>
            Pentagrama (SCORE)
          </Text>
        </View>
      </ScrollView>

      {menuOpen && (
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={toggleMenu}
        />
      )}

      <Animated.View style={[styles.miniFab, pianoStyle]}>
        <TouchableOpacity
          style={styles.miniFabTouchable}
          onPress={() =>
            handleCreateOption('Piano (DOBLE PENTAGRAMA)')
          }
        >
          <Text style={styles.miniFabText}>Piano</Text>
        </TouchableOpacity>
      </Animated.View>

      <Animated.View style={[styles.miniFab, scoreStyle]}>
        <TouchableOpacity
          style={styles.miniFabTouchable}
          onPress={() =>
            handleCreateOption('Pentagrama (SCORE)')
          }
        >
          <Text style={styles.miniFabText}>Score</Text>
        </TouchableOpacity>
      </Animated.View>

      <Animated.View style={[styles.miniFab, guitarStyle]}>
        <TouchableOpacity
          style={styles.miniFabTouchable}
          onPress={() =>
            handleCreateOption('Guitarra (TAB)')
          }
        >
          <Text style={styles.miniFabText}>Guitarra</Text>
        </TouchableOpacity>
      </Animated.View>

      <TouchableOpacity
        style={styles.fabButton}
        onPress={toggleMenu}
        activeOpacity={0.8}
      >
        <Animated.Text
          style={[
            styles.fabButtonText,
            { transform: [{ rotate: rotation }] },
          ]}
        >
          +
        </Animated.Text>
      </TouchableOpacity>

      <StatusBar style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fefae0',
  },

  topSection: {
    backgroundColor: '#eadeab',
    paddingTop: 50,
    paddingBottom: 20,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    position: 'relative',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
  },

  headerTextContainer: {
    flex: 1,
    marginRight: 10,
  },

  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#283618',
  },

  subtitle: {
    fontSize: 14,
    color: '#606c38',
  },

  logoutButton: {
    backgroundColor: '#606c38',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },

  logoutText: {
    color: '#fefae0',
    fontWeight: 'bold',
    fontSize: 12,
  },

  headerAppLogo: {
    position: 'absolute',
    bottom: 10,
    right: 20,
    width: 90,
    height: 90,
    tintColor: '#606c38',
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 130,
  },

  sectionHeader: {
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#283618',
  },

  projectCard: {
    backgroundColor: '#89a071',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },

  projectTitle: {
    color: '#283618',
    fontSize: 16,
    fontWeight: 'bold',
  },

  projectType: {
    color: '#fefae0',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },

  fabButton: {
    position: 'absolute',
    bottom: 110,
    right: 20,
    backgroundColor: '#606c38',
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    zIndex: 10,
  },

  fabButtonText: {
    color: '#fefae0',
    fontSize: 30,
    lineHeight: 32,
    fontWeight: 'bold',
  },

  miniFab: {
    position: 'absolute',
    bottom: 108,
    right: 18,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#606c38',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    zIndex: 9,
  },

  miniFabTouchable: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },

  miniFabText: {
    color: '#fefae0',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
