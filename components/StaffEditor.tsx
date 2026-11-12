
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Pressable,
} from 'react-native';

import Svg, {
  Line,
  Ellipse,
  Path,
  Text as SvgText,
  G,
} from 'react-native-svg';

export type NoteDuration =
  | 'whole'
  | 'half'
  | 'quarter'
  | 'eighth'
  | 'sixteenth';

export type ScoreNote = {
  id: string;
  position: number;
  pitch: number;
  duration: NoteDuration;
  isRest?: boolean;
  tuplet?: 3;
};

type ClefType = 'treble' | 'bass' | 'alto';

type StaffEditorProps = {
  initialNotes?: ScoreNote[];
  onNotesChange?: (notes: ScoreNote[]) => void;
};

const STAFF_TOP = 65;
const STAFF_BOTTOM = 113;
const LINE_SPACING = 12;
const STEP_HEIGHT = LINE_SPACING / 2;

const FIRST_NOTE_X = 100;
const NOTE_SPACING = 38;
const SLOTS_PER_MEASURE = 8;
const MEASURE_WIDTH = NOTE_SPACING * SLOTS_PER_MEASURE;
const STAFF_HEIGHT = 220;

const DURATIONS: {
  id: NoteDuration;
  symbol: string;
  label: string;
}[] = [
  { id: 'whole', symbol: '𝅝', label: 'Redonda' },
  { id: 'half', symbol: '𝅗𝅥', label: 'Blanca' },
  { id: 'quarter', symbol: '♩', label: 'Negra' },
  { id: 'eighth', symbol: '♪', label: 'Corchea' },
  { id: 'sixteenth', symbol: '𝅘𝅥𝅯', label: 'Semicorchea' },
];

const CLEFS: { id: ClefType; label: string; symbol: string }[] = [
  { id: 'treble', label: 'Sol', symbol: '𝄞' },
  { id: 'bass', label: 'Fa', symbol: '𝄢' },
  { id: 'alto', label: 'Do', symbol: '𝄡' },
];

const KEY_SIGNATURES = [
  { label: 'Do mayor / La menor', sharps: 0, flats: 0 },
  { label: 'Sol mayor / Mi menor', sharps: 1, flats: 0 },
  { label: 'Re mayor / Si menor', sharps: 2, flats: 0 },
  { label: 'La mayor / Fa# menor', sharps: 3, flats: 0 },
  { label: 'Mi mayor / Do# menor', sharps: 4, flats: 0 },
  { label: 'Si mayor / Sol# menor', sharps: 5, flats: 0 },
  { label: 'Fa# mayor / Re# menor', sharps: 6, flats: 0 },
  { label: 'Do# mayor / La# menor', sharps: 7, flats: 0 },
  { label: 'Fa mayor / Re menor', sharps: 0, flats: 1 },
  { label: 'Sib mayor / Sol menor', sharps: 0, flats: 2 },
  { label: 'Mib mayor / Do menor', sharps: 0, flats: 3 },
  { label: 'Lab mayor / Fa menor', sharps: 0, flats: 4 },
  { label: 'Reb mayor / Sib menor', sharps: 0, flats: 5 },
  { label: 'Solb mayor / Mib menor', sharps: 0, flats: 6 },
  { label: 'Dob mayor / Lab menor', sharps: 0, flats: 7 },
];

const TIME_SIGNATURES = [
  '2/4',
  '3/4',
  '4/4',
  '5/4',
  '6/8',
  '7/8',
  '9/8',
  '12/8',
];

const getPitchName = (
  pitch: number,
  clef: ClefType
): string => {
  const noteNames = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

  const baseIndex =
    clef === 'treble' ? 2 :
    clef === 'bass' ? 4 : 3;

  const absoluteIndex = baseIndex + pitch;
  const noteIndex = ((absoluteIndex % 7) + 7) % 7;
  const octave = 4 + Math.floor(absoluteIndex / 7);

  return `${noteNames[noteIndex]}${octave}`;
};

const getRestSymbol = (duration: NoteDuration): string => {
  switch (duration) {
    case 'whole':
      return '𝄻';
    case 'half':
      return '𝄼';
    case 'quarter':
      return '𝄽';
    case 'eighth':
      return '𝄾';
    case 'sixteenth':
      return '𝄿';
  }
};

export default function StaffEditor({
  initialNotes = [],
  onNotesChange,
}: StaffEditorProps): React.JSX.Element {
  const [notes, setNotes] = useState<ScoreNote[]>(initialNotes);
  const [selectedNote, setSelectedNote] = useState<string | null>(null);

  const [selectedDuration, setSelectedDuration] =
    useState<NoteDuration | null>('quarter');

  const [isRestMode, setIsRestMode] = useState(false);
  const [tripletMode, setTripletMode] = useState(false);

  const [clef, setClef] = useState<ClefType>('treble');
  const [keyIndex, setKeyIndex] = useState(0);
  const [timeIndex, setTimeIndex] = useState(2);

  const [measureCount, setMeasureCount] = useState(4);

  useEffect(() => {
    onNotesChange?.(notes);
  }, [notes, onNotesChange]);

  const updateNotes = (updatedNotes: ScoreNote[]): void => {
    setNotes(updatedNotes);
  };

  const getNoteX = (position: number): number => {
    return FIRST_NOTE_X + position * NOTE_SPACING;
  };

  const getNoteY = (pitch: number): number => {
    return STAFF_BOTTOM - pitch * STEP_HEIGHT;
  };

  const getMeasure = (position: number): number => {
    return Math.floor(position / SLOTS_PER_MEASURE);
  };

  const handleDurationPress = (duration: NoteDuration): void => {
    if (selectedDuration === duration) {
      setSelectedDuration(null);
      return;
    }

    setSelectedDuration(duration);

    if (selectedNote) {
      updateNotes(
        notes.map(note =>
          note.id === selectedNote
            ? { ...note, duration }
            : note
        )
      );
    }
  };

  const handleStaffPress = (event: any): void => {
    const { locationX, locationY } = event.nativeEvent;

    const nearestPosition = Math.max(
      0,
      Math.round((locationX - FIRST_NOTE_X) / NOTE_SPACING)
    );

    const nearestPitch = Math.round(
      (STAFF_BOTTOM - locationY) / STEP_HEIGHT
    );

    const existingNote = notes.find(note => {
      const noteX = getNoteX(note.position);
      const noteY = getNoteY(note.pitch);

      return (
        Math.abs(noteX - locationX) < NOTE_SPACING / 2 &&
        Math.abs(noteY - locationY) < STEP_HEIGHT * 1.5
      );
    });

    if (existingNote) {
      if (selectedDuration === null) {
        setSelectedNote(
          selectedNote === existingNote.id
            ? null
            : existingNote.id
        );
        return;
      }

      setSelectedNote(existingNote.id);

      updateNotes(
        notes.map(note =>
          note.id === existingNote.id
            ? {
                ...note,
                duration: selectedDuration,
                isRest: isRestMode,
                tuplet: tripletMode ? 3 : undefined,
              }
            : note
        )
      );

      return;
    }

    if (selectedDuration === null) {
      setSelectedNote(null);
      return;
    }

    const position = nearestPosition;
    const measure = getMeasure(position);

    if (measure >= measureCount) {
      setMeasureCount(measure + 2);
    }

    const newNote: ScoreNote = {
      id: `${Date.now()}-${Math.random()}`,
      position,
      pitch: nearestPitch,
      duration: selectedDuration,
      isRest: isRestMode,
      tuplet: tripletMode ? 3 : undefined,
    };

    updateNotes([...notes, newNote]);
    setSelectedNote(newNote.id);
  };

  const deleteSelectedNote = (): void => {
    if (!selectedNote) return;

    updateNotes(
      notes.filter(note => note.id !== selectedNote)
    );

    setSelectedNote(null);
  };

  const changeClef = (): void => {
    const currentIndex = CLEFS.findIndex(item => item.id === clef);
    const nextIndex = (currentIndex + 1) % CLEFS.length;
    setClef(CLEFS[nextIndex].id);
  };

  const getBeamGroups = (): ScoreNote[][] => {
    const beamedNotes = notes
      .filter(
        note =>
          !note.isRest &&
          (note.duration === 'eighth' ||
            note.duration === 'sixteenth')
      )
      .sort((a, b) => a.position - b.position);

    const groups: ScoreNote[][] = [];
    let currentGroup: ScoreNote[] = [];

    beamedNotes.forEach(note => {
      const previous = currentGroup[currentGroup.length - 1];

      const isAdjacent =
        previous &&
        note.position === previous.position + 1 &&
        getMeasure(note.position) === getMeasure(previous.position);

      if (isAdjacent) {
        currentGroup.push(note);
      } else {
        if (currentGroup.length >= 2) {
          groups.push(currentGroup);
        }

        currentGroup = [note];
      }
    });

    if (currentGroup.length >= 2) {
      groups.push(currentGroup);
    }

    return groups;
  };

  const renderLedgerLines = (
    x: number,
    y: number
  ): React.JSX.Element[] => {
    const lines: React.JSX.Element[] = [];

    if (y < STAFF_TOP) {
      for (
        let lineY = STAFF_TOP - LINE_SPACING;
        lineY >= y;
        lineY -= LINE_SPACING
      ) {
        lines.push(
          <Line
            key={`top-${x}-${lineY}`}
            x1={x - 13}
            y1={lineY}
            x2={x + 13}
            y2={lineY}
            stroke="#283618"
            strokeWidth={1.2}
          />
        );
      }
    }

    if (y > STAFF_BOTTOM) {
      for (
        let lineY = STAFF_BOTTOM + LINE_SPACING;
        lineY <= y;
        lineY += LINE_SPACING
      ) {
        lines.push(
          <Line
            key={`bottom-${x}-${lineY}`}
            x1={x - 13}
            y1={lineY}
            x2={x + 13}
            y2={lineY}
            stroke="#283618"
            strokeWidth={1.2}
          />
        );
      }
    }

    return lines;
  };

  const renderBeams = (): React.JSX.Element[] => {
    const groups = getBeamGroups();
    const elements: React.JSX.Element[] = [];

    groups.forEach((group, groupIndex) => {
      const first = group[0];
      const last = group[group.length - 1];

      const firstX = getNoteX(first.position) + 9;
      const lastX = getNoteX(last.position) + 9;

      const firstY = getNoteY(first.pitch) - 34;
      const lastY = getNoteY(last.pitch) - 34;

      const beamPath = `M ${firstX} ${firstY} L ${lastX} ${lastY + 3} L ${lastX} ${lastY + 9} L ${firstX} ${firstY + 6} Z`;

      elements.push(
        <Path
          key={`beam-${groupIndex}`}
          d={beamPath}
          fill="#283618"
        />
      );

      if (group.some(note => note.duration === 'sixteenth')) {
        const secondBeam = `M ${firstX} ${firstY + 11} L ${lastX} ${lastY + 14} L ${lastX} ${lastY + 19} L ${firstX} ${firstY + 16} Z`;

        elements.push(
          <Path
            key={`beam-second-${groupIndex}`}
            d={secondBeam}
            fill="#283618"
          />
        );
      }

      if (group.length === 3 && group.every(note => note.tuplet === 3)) {
        const middleX = (firstX + lastX) / 2;

        elements.push(
          <SvgText
            key={`triplet-${groupIndex}`}
            x={middleX}
            y={Math.min(firstY, lastY) - 10}
            textAnchor="middle"
            fontSize={13}
            fontWeight="bold"
            fill="#283618"
          >
            3
          </SvgText>
        );
      }
    });

    return elements;
  };

  const renderNote = (note: ScoreNote): React.JSX.Element => {
    const x = getNoteX(note.position);
    const y = getNoteY(note.pitch);
    const isSelected = selectedNote === note.id;

    const isWhole = note.duration === 'whole';
    const isHalf = note.duration === 'half';
    const isFilled = !isWhole && !isHalf;
    const hasStem = !isWhole && !note.isRest;

    const isGrouped = getBeamGroups().some(group =>
      group.some(groupNote => groupNote.id === note.id)
    );

    const stemX = x + 9;
    const stemTop = y - 34;

    if (note.isRest) {
      return (
        <G key={note.id}>
          {isSelected && (
            <Ellipse
              cx={x}
              cy={y}
              rx={17}
              ry={17}
              fill="#89a071"
              opacity={0.4}
            />
          )}

          <SvgText
            x={x}
            y={y + 8}
            fontSize={31}
            textAnchor="middle"
            fill="#283618"
          >
            {getRestSymbol(note.duration)}
          </SvgText>
        </G>
      );
    }

    return (
      <G key={note.id}>
        {isSelected && (
          <Ellipse
            cx={x}
            cy={y}
            rx={18}
            ry={15}
            fill="#89a071"
            opacity={0.4}
          />
        )}

        {renderLedgerLines(x, y)}

        <Ellipse
          cx={x}
          cy={y}
          rx={7}
          ry={4.5}
          fill={isFilled ? '#283618' : '#ffffff'}
          stroke="#283618"
          strokeWidth={1.8}
          rotation={-20}
        />

        {hasStem && (
          <Line
            x1={stemX}
            y1={y}
            x2={stemX}
            y2={stemTop}
            stroke="#283618"
            strokeWidth={1.8}
          />
        )}

        {!isGrouped &&
          (note.duration === 'eighth' ||
            note.duration === 'sixteenth') && (
            <Path
              d={`M ${stemX} ${stemTop}
                  Q ${stemX + 18} ${stemTop + 8}
                  ${stemX + 8} ${stemTop + 19}`}
              stroke="#283618"
              strokeWidth={2}
              fill="none"
            />
          )}

        {!isGrouped && note.duration === 'sixteenth' && (
          <Path
            d={`M ${stemX} ${stemTop + 9}
                Q ${stemX + 18} ${stemTop + 17}
                ${stemX + 8} ${stemTop + 28}`}
            stroke="#283618"
            strokeWidth={2}
            fill="none"
          />
        )}

        <SvgText
          x={x}
          y={y + 25}
          fontSize={8}
          textAnchor="middle"
          fill="#606c38"
        >
          {getPitchName(note.pitch, clef)}
        </SvgText>
      </G>
    );
  };

  const signature = KEY_SIGNATURES[keyIndex];
  const timeSignature = TIME_SIGNATURES[timeIndex];

  const staffWidth =
    Math.max(measureCount, 4) * MEASURE_WIDTH + FIRST_NOTE_X + 50;

  const signatureSymbols = [
    ...Array(signature.sharps).fill('♯'),
    ...Array(signature.flats).fill('♭'),
  ];

  return (
    <View style={styles.container}>
      <View style={styles.settingsPanel}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.settingsContent}
        >
          <TouchableOpacity style={styles.settingButton} onPress={changeClef}>
            <Text style={styles.settingLabel}>Clave</Text>
            <Text style={styles.settingValue}>
              {CLEFS.find(item => item.id === clef)?.symbol}{' '}
              {CLEFS.find(item => item.id === clef)?.label}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingButton}
            onPress={() =>
              setKeyIndex((keyIndex + 1) % KEY_SIGNATURES.length)
            }
          >
            <Text style={styles.settingLabel}>Armadura</Text>
            <Text style={styles.settingValue}>
              {signatureSymbols.length
                ? signatureSymbols.join(' ')
                : 'Do mayor'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingButton}
            onPress={() =>
              setTimeIndex((timeIndex + 1) % TIME_SIGNATURES.length)
            }
          >
            <Text style={styles.settingLabel}>Compás</Text>
            <Text style={styles.settingValue}>
              {timeSignature}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <View style={styles.toolbar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.toolbarContent}
        >
          {DURATIONS.map(duration => {
            const active = selectedDuration === duration.id;

            return (
              <TouchableOpacity
                key={duration.id}
                style={[
                  styles.durationButton,
                  active && styles.activeDuration,
                ]}
                onPress={() => handleDurationPress(duration.id)}
              >
                <Text
                  style={[
                    styles.durationSymbol,
                    active && styles.activeText,
                  ]}
                >
                  {duration.symbol}
                </Text>

                <Text
                  style={[
                    styles.durationLabel,
                    active && styles.activeText,
                  ]}
                >
                  {duration.label}
                </Text>
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity
            style={[
              styles.modeButton,
              isRestMode && styles.activeDuration,
            ]}
            onPress={() => setIsRestMode(!isRestMode)}
          >
            <Text
              style={[
                styles.modeText,
                isRestMode && styles.activeText,
              ]}
            >
              {isRestMode ? 'Silencios' : 'Notas'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.modeButton,
              tripletMode && styles.activeDuration,
            ]}
            onPress={() => setTripletMode(!tripletMode)}
          >
            <Text
              style={[
                styles.modeText,
                tripletMode && styles.activeText,
              ]}
            >
              Tresillo
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <View style={styles.editToolbar}>
        <Text style={styles.selectedText}>
          {selectedNote
            ? 'Nota seleccionada'
            : selectedDuration === null
              ? 'Modo selección'
              : 'Toca el pentagrama para colocar una figura'}
        </Text>

        <TouchableOpacity
          style={[
            styles.deleteButton,
            !selectedNote && styles.disabledButton,
          ]}
          disabled={!selectedNote}
          onPress={deleteSelectedNote}
        >
          <Text style={styles.deleteText}>Eliminar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        nestedScrollEnabled
        showsHorizontalScrollIndicator
        style={styles.staffScroll}
        contentContainerStyle={styles.staffScrollContent}
      >
        <Pressable
          style={{
            width: staffWidth,
            height: STAFF_HEIGHT,
          }}
          onPress={handleStaffPress}
        >
          <Svg width={staffWidth} height={STAFF_HEIGHT}>
            {[0, 1, 2, 3, 4].map(index => {
              const y = STAFF_TOP + index * LINE_SPACING;

              return (
                <Line
                  key={`staff-${index}`}
                  x1={10}
                  y1={y}
                  x2={staffWidth - 10}
                  y2={y}
                  stroke="#283618"
                  strokeWidth={1.2}
                />
              );
            })}

            <SvgText
              x={18}
              y={STAFF_BOTTOM - 2}
              fontSize={clef === 'treble' ? 55 : 43}
              fill="#283618"
            >
              {CLEFS.find(item => item.id === clef)?.symbol}
            </SvgText>

            {signatureSymbols.map((symbol, index) => (
              <SvgText
                key={`signature-${index}`}
                x={65 + index * 13}
                y={STAFF_TOP + 28}
                fontSize={20}
                fill="#283618"
              >
                {symbol}
              </SvgText>
            ))}

            <SvgText
              x={FIRST_NOTE_X - 18}
              y={STAFF_TOP + 20}
              fontSize={17}
              fontWeight="bold"
              fill="#283618"
            >
              {timeSignature.split('/')[0]}
            </SvgText>

            <SvgText
              x={FIRST_NOTE_X - 18}
              y={STAFF_TOP + 40}
              fontSize={17}
              fontWeight="bold"
              fill="#283618"
            >
              {timeSignature.split('/')[1]}
            </SvgText>

            {Array.from(
              { length: measureCount + 1 },
              (_, index) => {
                const x = FIRST_NOTE_X + index * MEASURE_WIDTH - 18;

                return (
                  <Line
                    key={`bar-${index}`}
                    x1={x}
                    y1={STAFF_TOP}
                    x2={x}
                    y2={STAFF_BOTTOM}
                    stroke="#283618"
                    strokeWidth={1.2}
                  />
                );
              }
            )}

            {renderBeams()}

            {notes.map(renderNote)}
          </Svg>
        </Pressable>
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Figuras: {notes.length}
        </Text>

        <Text style={styles.footerText}>
          Compases: {measureCount}
        </Text>

        <Text style={styles.footerText}>
          {CLEFS.find(item => item.id === clef)?.label}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fefae0',
  },

  settingsPanel: {
    backgroundColor: '#eadeab',
    paddingVertical: 7,
  },

  settingsContent: {
    paddingHorizontal: 10,
    gap: 8,
  },

  settingButton: {
    minWidth: 105,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 7,
    backgroundColor: '#fefae0',
  },

  settingLabel: {
    color: '#606c38',
    fontSize: 9,
    fontWeight: '600',
  },

  settingValue: {
    color: '#283618',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 3,
  },

  toolbar: {
    backgroundColor: '#eadeab',
    paddingVertical: 8,
  },

  toolbarContent: {
    paddingHorizontal: 10,
    gap: 8,
    alignItems: 'center',
  },

  durationButton: {
    width: 72,
    height: 62,
    backgroundColor: '#fefae0',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  activeDuration: {
    backgroundColor: '#606c38',
  },

  durationSymbol: {
    fontSize: 26,
    color: '#283618',
  },

  durationLabel: {
    fontSize: 9,
    color: '#283618',
    fontWeight: '600',
  },

  activeText: {
    color: '#fefae0',
  },

  modeButton: {
    minWidth: 75,
    height: 48,
    paddingHorizontal: 12,
    backgroundColor: '#fefae0',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  modeText: {
    fontSize: 11,
    color: '#283618',
    fontWeight: 'bold',
  },

  editToolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 9,
  },

  selectedText: {
    color: '#606c38',
    fontSize: 11,
  },

  deleteButton: {
    backgroundColor: '#bc6c25',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 6,
  },

  disabledButton: {
    opacity: 0.35,
  },

  deleteText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
  },

  staffScroll: {
    flex: 1,
    minHeight: 180,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eadeab',
  },

  staffScrollContent: {
    paddingVertical: 20,
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#eadeab',
  },

  footerText: {
    fontSize: 11,
    color: '#606c38',
    fontWeight: '600',
  },
});
