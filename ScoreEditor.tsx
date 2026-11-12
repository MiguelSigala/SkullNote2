
import React, {
  useState,
  useEffect,
  useCallback,
} from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';

import {
  useNavigation,
  useRoute,
} from '@react-navigation/native';

import type { RouteProp } from '@react-navigation/native';

import * as ScreenOrientation from 'expo-screen-orientation';

import StaffEditor, {
  ScoreNote,
} from './components/StaffEditor';

import {
  saveScore,
  getScoreById,
  ScoreProject,
} from './services/ScoreStorage';

type ScoreEditorRoute = RouteProp<
  {
    ScoreEditor: { scoreId?: string } | undefined;
  },
  'ScoreEditor'
>;

export default function ScoreEditor(): React.JSX.Element {
  const navigation = useNavigation();
  const route = useRoute<ScoreEditorRoute>();

  const initialScoreId = route.params?.scoreId;

  const [scoreId, setScoreId] = useState<string>(
    initialScoreId ?? Date.now().toString()
  );

  const [title, setTitle] = useState('Partitura sin título');
  const [notes, setNotes] = useState<ScoreNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [createdAt, setCreatedAt] = useState(
    new Date().toISOString()
  );

  useEffect(() => {
    const lockOrientation = async (): Promise<void> => {
      try {
        await ScreenOrientation.lockAsync(
          ScreenOrientation.OrientationLock.LANDSCAPE
        );
      } catch (error) {
        console.error('Error al cambiar orientación:', error);
      }
    };

    lockOrientation();

    return () => {
      ScreenOrientation.unlockAsync().catch(() => {});
    };
  }, []);

  useEffect(() => {
    const loadScore = async (): Promise<void> => {
      try {
        if (initialScoreId) {
          const score = await getScoreById(initialScoreId);

          if (score) {
            setScoreId(score.id);
            setTitle(score.title);
            setNotes(score.notes);
            setCreatedAt(score.createdAt);
            setSaved(true);
          }
        }
      } catch (error) {
        Alert.alert(
          'Error',
          'No se pudo cargar la partitura.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadScore();
  }, [initialScoreId]);

  const handleNotesChange = useCallback(
    (updatedNotes: ScoreNote[]): void => {
      setNotes(updatedNotes);
      setSaved(false);
    },
    []
  );

  const handleSave = async (): Promise<void> => {
    if (!title.trim()) {
      Alert.alert(
        'Nombre requerido',
        'Escribe un nombre para la partitura.'
      );
      return;
    }

    try {
      setSaving(true);

      const now = new Date().toISOString();

      const score: ScoreProject = {
        id: scoreId,
        title: title.trim(),
        type: 'SCORE',
        notes,
        createdAt,
        updatedAt: now,
      };

      await saveScore(score);

      setSaved(true);

      Alert.alert(
        'Partitura guardada',
        'Tu proyecto se guardó correctamente.'
      );
    } catch (error) {
      Alert.alert(
        'Error',
        'No se pudo guardar la partitura.'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color="#606c38"
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>

        <View style={styles.titleContainer}>
          <TextInput
            style={styles.titleInput}
            value={title}
            onChangeText={value => {
              setTitle(value);
              setSaved(false);
            }}
            placeholder="Nombre de la partitura"
            placeholderTextColor="#606c38"
          />

          <Text style={styles.statusText}>
            {saved ? 'Guardado' : 'Sin guardar'}
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.saveButton,
            saving && styles.disabledButton,
          ]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveText}>
            {saving ? 'Guardando...' : 'Guardar'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.editorContainer}
        contentContainerStyle={styles.editorContent}
        nestedScrollEnabled
        showsVerticalScrollIndicator
        >
        <StaffEditor
            initialNotes={notes}
            onNotesChange={handleNotesChange}
        />
        </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fefae0',
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fefae0',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eadeab',
    paddingTop: 8,
    paddingBottom: 8,
    paddingHorizontal: 12,
    gap: 10,
  },

  backButton: {
    width: 35,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  backText: {
    fontSize: 35,
    color: '#283618',
  },

  titleContainer: {
    flex: 1,
  },

  titleInput: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#283618',
    padding: 0,
  },

  statusText: {
    fontSize: 10,
    color: '#606c38',
    marginTop: 3,
  },

  saveButton: {
    backgroundColor: '#606c38',
    paddingHorizontal: 15,
    paddingVertical: 9,
    borderRadius: 7,
  },

  saveText: {
    color: '#fefae0',
    fontWeight: 'bold',
    fontSize: 12,
  },

  disabledButton: {
    opacity: 0.5,
  },

  editorContainer: {
  flex: 1,
},

editorContent: {
  flexGrow: 1,
  minHeight: '100%',
},
});
