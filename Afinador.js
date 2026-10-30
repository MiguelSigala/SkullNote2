import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  useAudioStream,
  requestRecordingPermissionsAsync,
} from 'expo-audio';

const LATIN_NOTES = [
  'Do', 'Do#', 'Re', 'Re#', 'Mi', 'Fa',
  'Fa#', 'Sol', 'Sol#', 'La', 'La#', 'Si',
];

const AMERICAN_NOTES = [
  'C', 'C#', 'D', 'D#', 'E', 'F',
  'F#', 'G', 'G#', 'A', 'A#', 'B',
];

function detectFrequency(samples, sampleRate) {
  const sampleCount = samples.length;

  if (sampleCount < 1024) return 0;

  let energy = 0;

  for (let index = 0; index < sampleCount; index++) {
    energy += samples[index] * samples[index];
  }

  const rms = Math.sqrt(energy / sampleCount);
  if (rms < 0.015) return 0;

  const minLag = Math.floor(sampleRate / 1000);
  const maxLag = Math.min(
    Math.floor(sampleRate / 65),
    Math.floor(sampleCount / 2)
  );

  let bestLag = 0;
  let bestCorrelation = -1;

  for (let lag = minLag; lag <= maxLag; lag++) {
    let sum = 0;
    let energyA = 0;
    let energyB = 0;

    for (let index = 0; index < sampleCount - lag; index++) {
      const sampleA = samples[index];
      const sampleB = samples[index + lag];

      sum += sampleA * sampleB;
      energyA += sampleA * sampleA;
      energyB += sampleB * sampleB;
    }

    const correlation =
      sum / (Math.sqrt(energyA * energyB) + 1e-10);

    if (correlation > bestCorrelation) {
      bestCorrelation = correlation;
      bestLag = lag;
    }
  }

  if (bestLag === 0 || bestCorrelation < 0.65) {
    return 0;
  }

  return sampleRate / bestLag;
}

export default function Afinador() {
  const [active, setActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState('--');
  const [frequency, setFrequency] = useState(0);
  const [cents, setCents] = useState(0);
  const [message, setMessage] = useState('');
  const [noteFormat, setNoteFormat] = useState('latin');

  const activeRef = useRef(false);
  const processingRef = useRef(false);

  const processAudio = useCallback((buffer) => {
    if (!activeRef.current || processingRef.current) return;

    processingRef.current = true;

    try {
      const samples = new Float32Array(buffer.data);
      const sampleRate = buffer.sampleRate || 44100;
      const detectedFrequency = detectFrequency(samples, sampleRate);

      if (detectedFrequency > 0) {
        const midi = Math.round(
          69 + 12 * Math.log2(detectedFrequency / 440)
        );

        const noteIndex = ((midi % 12) + 12) % 12;
        const octave = Math.floor(midi / 12) - 1;
        const targetFrequency =
          440 * Math.pow(2, (midi - 69) / 12);
        const deviation =
          1200 * Math.log2(detectedFrequency / targetFrequency);

        const noteNames =
          noteFormat === 'american'
            ? AMERICAN_NOTES
            : LATIN_NOTES;

        setNote(`${noteNames[noteIndex]}${octave}`);
        setFrequency(detectedFrequency);
        setCents(deviation);

        if (Math.abs(deviation) <= 5) {
          setMessage('Afinado');
        } else if (deviation < 0) {
          setMessage('Demasiado grave');
        } else {
          setMessage('Demasiado agudo');
        }
      } else {
        setMessage('Escuchando instrumento...');
      }
    } catch (error) {
      console.log('Error analyzing audio:', error);
    } finally {
      processingRef.current = false;
    }
  }, [noteFormat]);

  const { stream } = useAudioStream({
    sampleRate: 44100,
    channels: 1,
    encoding: 'float32',
    onBuffer: processAudio,
  });

  const startTuner = async () => {
    if (activeRef.current || loading) return;

    setLoading(true);
    setMessage('Solicitando permiso...');

    try {
      const permission = await requestRecordingPermissionsAsync();

      if (!permission.granted) {
        setMessage('Se necesita permiso del micrófono');
        return;
      }

      setNote('--');
      setFrequency(0);
      setCents(0);

      activeRef.current = true;
      await stream.start();

      setActive(true);
      setMessage('Escuchando instrumento...');
    } catch (error) {
      activeRef.current = false;
      setActive(false);
      setMessage('No se pudo iniciar el micrófono');
      console.log('Error starting tuner:', error);
    } finally {
      setLoading(false);
    }
  };

  const stopTuner = async () => {
    activeRef.current = false;
    setActive(false);

    try {
      await stream.stop();
    } catch (error) {
      console.log('Error stopping tuner:', error);
    }

    setMessage('Afinador detenido');
  };

  useEffect(() => {
    return () => {
      activeRef.current = false;

      try {
        stream.stop();
      } catch (error) {}
    };
  }, [stream]);

  const position = Math.max(-1, Math.min(1, cents / 50));

  const selectFormat = (format) => {
    setNoteFormat(format);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.formatSelector}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => selectFormat('american')}
          style={[
            styles.formatButton,
            noteFormat === 'american' && styles.selectedFormatButton,
          ]}
        >
          <Text
            style={[
              styles.formatButtonText,
              noteFormat === 'american' && styles.selectedFormatText,
            ]}
          >
            Cifrado americano
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => selectFormat('latin')}
          style={[
            styles.formatButton,
            noteFormat === 'latin' && styles.selectedFormatButton,
          ]}
        >
          <Text
            style={[
              styles.formatButtonText,
              noteFormat === 'latin' && styles.selectedFormatText,
            ]}
          >
            Cifrado latino
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.panel}>
        <Text style={styles.label}>NOTA DETECTADA</Text>

        <Text style={styles.note}>{note}</Text>

        <Text style={styles.frequency}>
          {frequency > 0
            ? `${frequency.toFixed(1)} Hz`
            : '-- Hz'}
        </Text>

        <Text
          style={[
            styles.status,
            frequency > 0 && Math.abs(cents) <= 5
              ? styles.tunedStatus
              : styles.outOfTuneStatus,
          ]}
        >
          {message}
        </Text>
      </View>

      <View style={styles.scale}>
        <View style={styles.centerLine} />

        <View
          style={[
            styles.needle,
            {
              left: `${50 + position * 50}%`,
              backgroundColor:
                frequency > 0 && Math.abs(cents) <= 5
                  ? '#2d8a45'
                  : '#bc6c25',
            },
          ]}
        />
      </View>

      <View style={styles.marks}>
        <Text style={styles.mark}>-50</Text>
        <Text style={styles.mark}>-25</Text>
        <Text style={styles.mark}>0</Text>
        <Text style={styles.mark}>+25</Text>
        <Text style={styles.mark}>+50</Text>
      </View>

      <Text style={styles.cents}>
        {frequency > 0
          ? `${cents > 0 ? '+' : ''}${cents.toFixed(1)} cents`
          : 'Esperando señal de audio'}
      </Text>

      <Text style={styles.help}>
        Grave ←        Afinado        → Agudo
      </Text>

      <TouchableOpacity
        style={[styles.button, active && styles.stopButton]}
        onPress={active ? stopTuner : startTuner}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fefae0" />
        ) : (
          <Text style={styles.buttonText}>
            {active ? 'Detener afinador' : 'Iniciar afinador'}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fefae0',
    paddingHorizontal: 24,
    paddingTop: 75,
    paddingBottom: 95,
    alignItems: 'center',
  },
  formatSelector: {
    width: '100%',
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  formatButton: {
    flex: 1,
    minHeight: 44,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#606c38',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fefae0',
  },
  selectedFormatButton: {
    backgroundColor: '#283618',
    borderColor: '#283618',
  },
  formatButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#283618',
    textAlign: 'center',
  },
  selectedFormatText: {
    color: '#fefae0',
  },
  panel: {
    width: '100%',
    marginTop: 42,
    paddingTop: 22,
    paddingBottom: 24,
    alignItems: 'center',
    backgroundColor: '#eadeab',
    borderRadius: 30,
  },
  label: {
    fontSize: 12,
    letterSpacing: 2,
    color: '#606c38',
    fontWeight: 'bold',
  },
  note: {
    fontSize: 76,
    fontWeight: 'bold',
    color: '#283618',
    marginTop: 10,
  },
  frequency: {
    fontSize: 18,
    color: '#606c38',
  },
  status: {
    marginTop: 18,
    fontSize: 17,
    fontWeight: 'bold',
  },
  tunedStatus: {
    color: '#2d8a45',
  },
  outOfTuneStatus: {
    color: '#bc6c25',
  },
  scale: {
    width: '100%',
    height: 70,
    marginTop: 20,
    justifyContent: 'center',
    position: 'relative',
  },
  centerLine: {
    position: 'absolute',
    left: '50%',
    height: 60,
    width: 3,
    backgroundColor: '#283618',
    borderRadius: 2,
  },
  needle: {
    position: 'absolute',
    top: 5,
    width: 5,
    height: 60,
    borderRadius: 3,
    marginLeft: -2.5,
  },
  marks: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  mark: {
    color: '#606c38',
    fontSize: 12,
  },
  cents: {
    color: '#283618',
    fontSize: 21,
    fontWeight: 'bold',
    marginTop: 18,
  },
  help: {
    color: '#606c38',
    fontSize: 13,
    marginTop: 10,
  },
  button: {
    width: '100%',
    backgroundColor: '#606c38',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  stopButton: {
    backgroundColor: '#bc4749',
  },
  buttonText: {
    color: '#fefae0',
    fontSize: 16,
    fontWeight: 'bold',
  },
});