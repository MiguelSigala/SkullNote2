import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Vibration,
  StatusBar,
  Keyboard,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import { useAudioPlayer, setAudioModeAsync } from 'expo-audio';

const MIN_BPM = 1;
const MAX_BPM = 999;

const TIME_SIGNATURES = [
  { label: '2/4', beats: 2 },
  { label: '2/2', beats: 2 },
  { label: '3/4', beats: 3 },
  { label: '4/4', beats: 4 },
  { label: '6/8', beats: 2 },
  { label: '9/8', beats: 3 },
  { label: '12/8', beats: 4 },
  { label: '5/4', beats: 5 },
  { label: '7/4', beats: 7 },
  { label: '7/8', beats: 7 },
];

const getDefaultAccents = (beats) =>
  Array.from({ length: beats }, (_, index) =>
    index === 0 ? 2 : 0
  );

export default function Metronomo() {
  const { width, height } = useWindowDimensions();

  const tickPlayer = useAudioPlayer(require('./assets/tick.wav'));
  const accentPlayer = useAudioPlayer(require('./assets/accent.wav'));

    tickPlayer.volume = 5.0;
    accentPlayer.volume = 5.0;

  const [bpm, setBpm] = useState(120);
  const [bpmInput, setBpmInput] = useState('120');
  const [active, setActive] = useState(false);
  const [beat, setBeat] = useState(0);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [signature, setSignature] = useState('4/4');
  const [accentLevels, setAccentLevels] = useState(
    getDefaultAccents(4)
  );
  const [openMenu, setOpenMenu] = useState(null);

  const beatRef = useRef(0);
  const activeRef = useRef(false);

  const selectedSignature =
    TIME_SIGNATURES.find((item) => item.label === signature) ||
    TIME_SIGNATURES[3];

  const beatCount = selectedSignature.beats;

  const circleSize = Math.max(
    210,
    Math.min(width - 48, height * 0.43, 350)
  );

  const center = circleSize / 2;
  const radius = circleSize * 0.355;
  const beatSize = Math.max(
    29,
    Math.min(43, circleSize * 0.125)
  );

  const tempoName =
    bpm < 60 ? 'Largo' :
    bpm < 76 ? 'Adagio' :
    bpm < 108 ? 'Andante' :
    bpm < 120 ? 'Moderato' :
    bpm < 156 ? 'Allegro' :
    bpm < 176 ? 'Vivace' : 'Presto';

  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      interruptionMode: 'mixWithOthers',
    }).catch(() => {});
  }, []);

  const playBeatSound = (accent) => {
    const player = accent > 0 ? accentPlayer : tickPlayer;

    player.seekTo(0)
      .then(() => {
        player.play();
      })
      .catch(() => {});
  };

  const playNextBeat = () => {
    const nextBeat = (beatRef.current % beatCount) + 1;

    beatRef.current = nextBeat;
    setBeat(nextBeat);

    const accent = accentLevels[nextBeat - 1] ?? 0;

    playBeatSound(accent);

    if (vibrationEnabled) {
      Vibration.vibrate(
        accent === 2 ? 100 : accent === 1 ? 65 : 30
      );
    }
  };

  const changeBpm = (value) => {
    const nextBpm = Math.max(
      MIN_BPM,
      Math.min(MAX_BPM, Math.round(value))
    );

    setBpm(nextBpm);
    setBpmInput(String(nextBpm));
  };

  const commitBpm = () => {
    const parsed = Number.parseInt(bpmInput, 10);

    if (Number.isFinite(parsed) && bpmInput.trim() !== '') {
      changeBpm(parsed);
    } else {
      setBpmInput(String(bpm));
    }

    Keyboard.dismiss();
  };

  const stopMetronome = () => {
    activeRef.current = false;
    setActive(false);
    beatRef.current = 0;
    setBeat(0);
    Vibration.cancel();
  };

  const changeSignature = (item) => {
    stopMetronome();
    setSignature(item.label);
    setAccentLevels(getDefaultAccents(item.beats));
    setOpenMenu(null);
  };

  const toggleAccent = (index) => {
    setAccentLevels((previous) =>
      previous.map((level, i) =>
        i === index ? (level + 1) % 3 : level
      )
    );
  };

  const toggleMetronome = () => {
    Keyboard.dismiss();

    if (activeRef.current) {
      stopMetronome();
    } else {
      beatRef.current = 0;
      setBeat(0);
      activeRef.current = true;
      setActive(true);
    }
  };

  useEffect(() => {
    if (!active) return;

    playNextBeat();

    const interval = setInterval(() => {
      if (activeRef.current) {
        playNextBeat();
      }
    }, 60000 / bpm);

    return () => clearInterval(interval);
  }, [active, bpm, beatCount, accentLevels, vibrationEnabled]);

  useEffect(() => {
    return () => {
      activeRef.current = false;
      Vibration.cancel();
    };
  }, []);

  const accentColor = (level) => {
    if (level === 2) return '#bc6c25';
    if (level === 1) return '#606c38';
    return '#fefae0';
  };

  const openTempoMenu = () => {
    setBpmInput(String(bpm));
    setOpenMenu('tempo');
  };

  const closeMenu = () => {
    Keyboard.dismiss();
    setOpenMenu(null);
  };

  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor="#eadeab"
        barStyle="dark-content"
      />

      <View style={styles.screen}>
        <View style={styles.settingsRow}>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => setOpenMenu('signature')}
          >
            <Text style={styles.menuLabel}>COMPÁS</Text>
            <Text style={styles.menuValue}>{signature}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => {
              const nextEnabled = !vibrationEnabled;
              setVibrationEnabled(nextEnabled);

              if (!nextEnabled) {
                Vibration.cancel();
              }
            }}
          >
            <Text style={styles.menuLabel}>VIBRACIÓN</Text>
            <Text style={styles.menuValue}>
              {vibrationEnabled ? 'ON' : 'OFF'}
            </Text>
          </TouchableOpacity>
        </View>

        <View
          style={[
            styles.circle,
            {
              width: circleSize,
              height: circleSize,
              borderRadius: circleSize / 2,
            },
          ]}
        >
          <View
            style={[
              styles.innerCircle,
              {
                width: radius * 2 + beatSize,
                height: radius * 2 + beatSize,
                borderRadius: (radius * 2 + beatSize) / 2,
              },
            ]}
          />

          {Array.from({ length: beatCount }, (_, index) => {
            const angle = -90 + index * (360 / beatCount);
            const radians = (angle * Math.PI) / 180;

            const x = center + Math.cos(radians) * radius;
            const y = center + Math.sin(radians) * radius;

            const level = accentLevels[index] ?? 0;
            const isActive = active && beat === index + 1;

            return (
              <TouchableOpacity
                key={`${signature}-beat-${index}`}
                activeOpacity={0.8}
                onPress={() => toggleAccent(index)}
                style={[
                  styles.beat,
                  {
                    width: beatSize,
                    height: beatSize,
                    borderRadius: beatSize / 2,
                    left: x - beatSize / 2,
                    top: y - beatSize / 2,
                    backgroundColor: accentColor(level),
                  },
                  level === 0 && styles.weakBeat,
                  isActive && styles.activeBeat,
                ]}
              >
                <Text
                  style={[
                    styles.beatNumber,
                    level > 0 && styles.lightText,
                    isActive && styles.activeBeatText,
                  ]}
                >
                  {index + 1}
                </Text>
              </TouchableOpacity>
            );
          })}

          <View style={styles.centerContent}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={openTempoMenu}
            >
              <Text style={styles.bpmNumber}>{bpm}</Text>
            </TouchableOpacity>

            <Text style={styles.bpmLabel}>BPM</Text>

            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.playButton,
                active && styles.stopButton,
              ]}
              onPress={toggleMetronome}
            >
              <Text style={styles.playIcon}>
                {active ? '■' : '▶'}
              </Text>
            </TouchableOpacity>

            <Text style={styles.tempoName}>{tempoName}</Text>
          </View>
        </View>

        <View style={styles.bottomControls}>
          <TouchableOpacity
            style={styles.adjustButton}
            onPress={() => changeBpm(bpm - 5)}
          >
            <Text style={styles.adjustText}>−5</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.adjustButton}
            onPress={() => changeBpm(bpm - 1)}
          >
            <Text style={styles.adjustText}>−</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.startButton,
              active && styles.stopButton,
            ]}
            onPress={toggleMetronome}
          >
            <Text style={styles.startText}>
              {active ? 'DETENER' : 'INICIAR'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.adjustButton}
            onPress={() => changeBpm(bpm + 1)}
          >
            <Text style={styles.adjustText}>+</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.adjustButton}
            onPress={() => changeBpm(bpm + 5)}
          >
            <Text style={styles.adjustText}>+5</Text>
          </TouchableOpacity>
        </View>

        <Modal
          visible={openMenu !== null}
          transparent
          animationType="fade"
          onRequestClose={closeMenu}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={closeMenu}
          >
            <Pressable
              style={styles.modalCard}
              onPress={() => {}}
            >
              {openMenu === 'tempo' && (
                <>
                  <Text style={styles.modalTitle}>TEMPO</Text>

                  <TextInput
                    style={styles.tempoInput}
                    value={bpmInput}
                    onChangeText={(value) =>
                      setBpmInput(value.replace(/[^0-9]/g, ''))
                    }
                    keyboardType="number-pad"
                    maxLength={3}
                    selectTextOnFocus
                    returnKeyType="done"
                    autoFocus
                    onSubmitEditing={() => {
                      commitBpm();
                      setOpenMenu(null);
                    }}
                  />

                  <View style={styles.modalAdjustRow}>
                    {[
                      { label: '−10', amount: -10 },
                      { label: '−1', amount: -1 },
                      { label: '+1', amount: 1 },
                      { label: '+10', amount: 10 },
                    ].map((item) => (
                      <TouchableOpacity
                        key={item.label}
                        style={styles.modalAdjust}
                        onPress={() =>
                          changeBpm(bpm + item.amount)
                        }
                      >
                        <Text style={styles.modalAdjustText}>
                          {item.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <TouchableOpacity
                    style={styles.confirmButton}
                    onPress={() => {
                      commitBpm();
                      setOpenMenu(null);
                    }}
                  >
                    <Text style={styles.confirmText}>LISTO</Text>
                  </TouchableOpacity>
                </>
              )}

              {openMenu === 'signature' && (
                <>
                  <Text style={styles.modalTitle}>COMPÁS</Text>

                  <View style={styles.signatureGrid}>
                    {TIME_SIGNATURES.map((item) => (
                      <TouchableOpacity
                        key={item.label}
                        style={[
                          styles.signatureButton,
                          signature === item.label &&
                            styles.selectedSignature,
                        ]}
                        onPress={() => changeSignature(item)}
                      >
                        <Text
                          style={[
                            styles.signatureText,
                            signature === item.label &&
                              styles.selectedSignatureText,
                          ]}
                        >
                          {item.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}
            </Pressable>
          </Pressable>
        </Modal>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eadeab',
  },

  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 12,
    paddingTop: 120,
    paddingBottom: 12,
  },

  settingsRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginBottom: 70,
  },

  menuButton: {
    flex: 1,
    maxWidth: 125,
    minHeight: 43,
    paddingVertical: 5,
    paddingHorizontal: 4,
    borderRadius: 12,
    backgroundColor: '#f4edcf',
    borderWidth: 1,
    borderColor: '#89a071',
    alignItems: 'center',
    justifyContent: 'center',
  },

  menuLabel: {
    color: '#606c38',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
  },

  menuValue: {
    color: '#283618',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 3,
  },

  circle: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eadeab',
    borderWidth: 2,
    borderColor: '#606c38',
    overflow: 'hidden',
    alignSelf: 'center',
  },

  innerCircle: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: '#89a071',
  },

  beat: {
    position: 'absolute',
    zIndex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#bc6c25',
  },

  weakBeat: {
    borderColor: '#89a071',
  },

  activeBeat: {
    borderColor: '#283618',
    borderWidth: 3,
    transform: [{ scale: 1.15 }],
  },

  beatNumber: {
    color: '#343434',
    fontSize: 14,
    fontWeight: 'bold',
  },

  lightText: {
    color: '#fefae0',
  },

  activeBeatText: {
    fontSize: 16,
  },

  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },

  bpmNumber: {
    color: '#283618',
    fontSize: 43,
    fontWeight: '300',
    fontVariant: ['tabular-nums'],
  },

  bpmLabel: {
    color: '#606c38',
    fontSize: 10,
    letterSpacing: 3,
    marginTop: -3,
  },

  playButton: {
    width: 55,
    height: 55,
    borderRadius: 24,
    marginTop: 12,
    backgroundColor: '#606c38',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#89a071',
  },

  stopButton: {
    backgroundColor: '#bc6c25',
    borderColor: '#e5a05f',
  },

  playIcon: {
    color: '#fefae0',
    fontSize: 15,
  },

  tempoName: {
    color: '#606c38',
    fontSize: 10,
    marginTop: 8,
  },

  bottomControls: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 24,
  },

  adjustButton: {
    flex: 1,
    height: 43,
    maxWidth: 55,
    minWidth: 0,
    borderRadius: 12,
    backgroundColor: '#f4edcf',
    borderWidth: 1,
    borderColor: '#89a071',
    alignItems: 'center',
    justifyContent: 'center',
  },

  adjustText: {
    color: '#283618',
    fontSize: 16,
    fontWeight: 'bold',
  },

  startButton: {
    flex: 2,
    minWidth: 85,
    maxWidth: 125,
    height: 43,
    borderRadius: 12,
    backgroundColor: '#606c38',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },

  startText: {
    color: '#fefae0',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },

  modalCard: {
    width: '100%',
    maxWidth: 330,
    backgroundColor: '#eadeab',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#89a071',
    padding: 20,
    alignItems: 'center',
  },

  modalTitle: {
    color: '#283618',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 18,
  },

  tempoInput: {
    width: 150,
    height: 65,
    textAlign: 'center',
    color: '#283618',
    fontSize: 45,
    fontWeight: 'bold',
    backgroundColor: '#f4edcf',
    borderRadius: 12,
    padding: 0,
  },

  modalAdjustRow: {
    flexDirection: 'row',
    gap: 7,
    marginTop: 18,
  },

  modalAdjust: {
    flex: 1,
    minWidth: 48,
    height: 39,
    borderRadius: 9,
    backgroundColor: '#f4edcf',
    alignItems: 'center',
    justifyContent: 'center',
  },

  modalAdjustText: {
    color: '#283618',
    fontSize: 12,
    fontWeight: 'bold',
  },

  confirmButton: {
    width: '100%',
    height: 42,
    borderRadius: 10,
    backgroundColor: '#606c38',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },

  confirmText: {
    color: '#fefae0',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },

  signatureGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },

  signatureButton: {
    width: 72,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#f4edcf',
    alignItems: 'center',
    justifyContent: 'center',
  },

  selectedSignature: {
    backgroundColor: '#606c38',
  },

  signatureText: {
    color: '#283618',
    fontSize: 13,
    fontWeight: 'bold',
  },

  selectedSignatureText: {
    color: '#ffffff',
  },
});