import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScoreNote } from '../components/StaffEditor';

export type ScoreProject = {
  id: string;
  title: string;
  type: 'SCORE';
  notes: ScoreNote[];
  createdAt: string;
  updatedAt: string;
};

const STORAGE_KEY = '@skullnote_scores';

// Obtener todas las partituras
export const getScores = async (): Promise<ScoreProject[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error al obtener partituras:', error);
    return [];
  }
};

// Guardar una partitura nueva o actualizar una existente
export const saveScore = async (
  score: ScoreProject
): Promise<void> => {
  const scores = await getScores();

  const index = scores.findIndex(item => item.id === score.id);

  if (index >= 0) {
    scores[index] = score;
  } else {
    scores.push(score);
  }

  await AsyncStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(scores)
  );
};

// Eliminar una partitura
export const deleteScore = async (id: string): Promise<void> => {
  const scores = await getScores();

  const updatedScores = scores.filter(
    score => score.id !== id
  );

  await AsyncStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(updatedScores)
  );
};

// Obtener una partitura específica
export const getScoreById = async (
  id: string
): Promise<ScoreProject | undefined> => {
  const scores = await getScores();

  return scores.find(score => score.id === id);
};