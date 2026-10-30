import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { 
  StyleSheet, 
  Text,
  View, 
  TextInput, 
  TouchableOpacity, 
  Alert,
  Image 
} from 'react-native';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor ingresa correo y contraseña');
      return;
    }

    navigation.replace('Main');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SkullNote</Text>

      <Image 
        source={require('./assets/icon.png')} 
        style={styles.icon} 
        resizeMode="contain"
      />
      
      <Text style={styles.subtitle}>
        "La música empieza donde terminan las palabras" {"\n"}{"\n"}-Claude Debussy.
      </Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Correo electrónico"
          placeholderTextColor="#606c38"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          placeholderTextColor="#606c38"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Iniciar Sesión</Text>
        </TouchableOpacity>
      </View>

      <StatusBar style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fefae0',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  icon: {
    width: 180,
    height: 180, 
    marginBottom: 8,
    tintColor: '#606c38',
  },
  title: { 
    fontSize: 32, 
    color: '#283618', 
    fontWeight: 'bold',
    marginBottom: 8 
  },
  subtitle: { 
    fontSize: 15, 
    color: '#606c38', 
    fontStyle: 'italic',
    marginBottom: 32, 
    textAlign: 'center',
    width: '100%'  
  },
  inputContainer: { 
    width: '100%', 
    maxWidth: 400 
  },
  input: {
    backgroundColor: '#89a071',
    color: '#283618',
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#606c38',
    height: 50,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonText: { 
    color: '#fefae0',
    fontSize: 16, 
    fontWeight: 'bold' 
  },
});