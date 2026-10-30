import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';

export default function Grabadora() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

    

        {/* Recording panel */}
        <View style={styles.recordingPanel}>
          <View style={styles.recordingCircle}>
            <View style={styles.innerCircle}>
              <View style={styles.recordIcon} />
            </View>
          </View>

          <Text style={styles.recordingStatus}>Listo para grabar</Text>
          <Text style={styles.timer}>00:00</Text>

          <View style={styles.recordingControls}>
            <TouchableOpacity
              style={[styles.controlButton, styles.recordButton]}
              activeOpacity={0.8}
            >
              <View style={styles.recordButtonIcon} />
              <Text style={styles.controlText}>Grabar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.controlButton, styles.pauseButton]}
              activeOpacity={0.8}
            >
              <View style={styles.pauseIcon}>
                <View style={styles.pauseBar} />
                <View style={styles.pauseBar} />
              </View>
              <Text style={styles.controlText}>Pausar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.controlButton, styles.continueButton]}
              activeOpacity={0.8}
            >
              <View style={styles.playIcon} />
              <Text style={styles.controlText}>Continuar</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.saveButton}
            activeOpacity={0.8}
          >
            <Text style={styles.saveButtonText}>Guardar grabación</Text>
          </TouchableOpacity>
        </View>

        {/* Recordings list */}
        <View style={styles.listHeader}>
          <Text style={styles.sectionTitle}>Mis grabaciones</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>0</Text>
          </View>
        </View>

        <View style={styles.recordingsList}>
          <View style={styles.emptyIconContainer}>
            <View style={styles.emptyRecordIcon} />
          </View>

          <Text style={styles.emptyTitle}>No hay grabaciones</Text>
          <Text style={styles.emptyDescription}>
            Tus grabaciones guardadas aparecerán aquí.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fefae0',
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 50,
    paddingBottom: 120,
  },

  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#283618',
    textAlign: 'center',
    marginBottom: 7,
  },

  subtitle: {
    fontSize: 14,
    color: '#606c38',
    textAlign: 'center',
    marginBottom: 28,
  },

  recordingPanel: {
    backgroundColor: '#eadeab',
    borderRadius: 40,
    paddingHorizontal: 18,
    paddingTop: 28,
    paddingBottom: 22,
    alignItems: 'center',
    shadowColor: '#283618',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },

  recordingCircle: {
    width: 145,
    height: 145,
    borderRadius: 73,
    backgroundColor: '#89a071',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },

  innerCircle: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: '#283618',
    justifyContent: 'center',
    alignItems: 'center',
  },

  recordIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#fefae0',
  },

  recordingStatus: {
    fontSize: 16,
    fontWeight: '600',
    color: '#606c38',
    marginBottom: 8,
  },

  timer: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#283618',
    fontVariant: ['tabular-nums'],
    marginBottom: 25,
  },

  recordingControls: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginBottom: 18,
  },

  controlButton: {
    flex: 1,
    minHeight: 86,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 12,
  },

  recordButton: {
    backgroundColor: '#283618',
  },

  pauseButton: {
    backgroundColor: '#606c38',
  },

  continueButton: {
    backgroundColor: '#89a071',
  },

  recordButtonIcon: {
    width: 17,
    height: 17,
    borderRadius: 9,
    backgroundColor: '#fefae0',
    marginBottom: 9,
  },

  pauseIcon: {
    height: 19,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 7,
  },

  pauseBar: {
    width: 5,
    height: 18,
    borderRadius: 2,
    backgroundColor: '#fefae0',
  },

  playIcon: {
    width: 0,
    height: 0,
    borderTopWidth: 10,
    borderBottomWidth: 10,
    borderLeftWidth: 16,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: '#fefae0',
    marginBottom: 7,
  },

  controlText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fefae0',
    textAlign: 'center',
  },

  saveButton: {
    width: '100%',
    backgroundColor: '#fefae0',
    borderWidth: 1.5,
    borderColor: '#606c38',
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
  },

  saveButtonText: {
    color: '#283618',
    fontSize: 15,
    fontWeight: 'bold',
  },

  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 15,
    gap: 10,
  },

  sectionTitle: {
    fontSize: 21,
    fontWeight: 'bold',
    color: '#283618',
  },

  countBadge: {
    minWidth: 27,
    height: 27,
    borderRadius: 14,
    backgroundColor: '#89a071',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 7,
  },

  countText: {
    color: '#fefae0',
    fontSize: 13,
    fontWeight: 'bold',
  },

  recordingsList: {
    minHeight: 185,
    backgroundColor: '#eadeab',
    borderRadius: 22,
    padding: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },

  emptyIconContainer: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#89a071',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },

  emptyRecordIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#283618',
  },

  emptyTitle: {
    color: '#283618',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 7,
  },

  emptyDescription: {
    color: '#606c38',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
  },
});