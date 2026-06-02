import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useRobotConnection } from '../hooks/useRobotConnection';
import { useCommandHistory } from '../hooks/useCommandHistory';
import colors from '../config/colors';
import ActionsModal from '../components/ActionsModal';

const MOVE_INTERVAL_MS = 150;
const MAX_SPEED = 0.8;
const JOY_R = 82;
const JOY_THUMB_R = 28;
const JOY_MAX_DIST = JOY_R - JOY_THUMB_R;
const DPAD_BTN = 52;
const DPAD_GAP = 6;

const DPAD = [
  { key: 'fwd', label: '▲', vx: 0.5,  vy: 0, vyaw: 0    },
  { key: 'bck', label: '▼', vx: -0.5, vy: 0, vyaw: 0    },
  { key: 'lft', label: '◄', vx: 0,    vy: 0, vyaw: 0.5  },
  { key: 'rgt', label: '►', vx: 0,    vy: 0, vyaw: -0.5 },
];

function DpadButton({ action, disabled, onPressIn, onPressOut }) {
  return (
    <TouchableOpacity
      style={[styles.dpadBtn, disabled && styles.disabled]}
      onPressIn={() => onPressIn(action)}
      onPressOut={onPressOut}
      disabled={disabled}
      activeOpacity={0.65}
    >
      <Text style={styles.dpadLabel}>{action.label}</Text>
    </TouchableOpacity>
  );
}

function Joystick({ thumbAnim, panHandlers, label, valLine, tint, disabled }) {
  return (
    <View style={styles.joyCol}>
      <Text style={styles.joyTitle}>{label}</Text>
      <View
        style={[styles.joyBase, { borderColor: tint }, disabled && styles.disabled]}
        {...(!disabled ? panHandlers : {})}
      >
        <View style={[styles.joyLineH, { backgroundColor: tint + '44' }]} />
        <View style={[styles.joyLineV, { backgroundColor: tint + '44' }]} />
        <View style={[styles.joyRing, { borderColor: tint + '22' }]} />
        <Animated.View
          style={[
            styles.joyThumb,
            { backgroundColor: tint, borderColor: tint + 'AA' },
            { transform: thumbAnim.getTranslateTransform() },
          ]}
        />
      </View>
      <Text style={styles.joyVals}>{valLine}</Text>
    </View>
  );
}

export default function MovementControlScreen() {
  const { isConnected, connectionState } = useRobotConnection();
  const { sendMove, sendStop } = useCommandHistory();
  const [feedback, setFeedback] = useState(null);
  const [leftDisplay, setLeftDisplay] = useState({ vx: 0, vy: 0 });
  const [rightDisplay, setRightDisplay] = useState({ vyaw: 0 });
  const [actionsModalVisible, setActionsModalVisible] = useState(false);

  const feedbackTimerRef = useRef(null);
  const dpadIntervalRef   = useRef(null);
  const sharedIntervalRef = useRef(null);
  const activeJoys        = useRef(0);
  const leftVals          = useRef({ vx: 0, vy: 0 });
  const rightVals         = useRef({ vyaw: 0 });
  const leftThumb         = useRef(new Animated.ValueXY()).current;
  const rightThumb        = useRef(new Animated.ValueXY()).current;

  // Lock orientation to landscape on enter, restore on leave
  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    return () => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    };
  }, []);

  // Cleanup intervals if robot disconnects
  useEffect(() => {
    if (!isConnected) {
      clearInterval(dpadIntervalRef.current);
      dpadIntervalRef.current = null;
      clearInterval(sharedIntervalRef.current);
      sharedIntervalRef.current = null;
      activeJoys.current = 0;
      leftThumb.setValue({ x: 0, y: 0 });
      rightThumb.setValue({ x: 0, y: 0 });
      leftVals.current = { vx: 0, vy: 0 };
      rightVals.current = { vyaw: 0 };
      setLeftDisplay({ vx: 0, vy: 0 });
      setRightDisplay({ vyaw: 0 });
    }
  }, [isConnected, leftThumb, rightThumb]);

  useEffect(() => {
    return () => {
      clearInterval(dpadIntervalRef.current);
      clearInterval(sharedIntervalRef.current);
      clearTimeout(feedbackTimerRef.current);
    };
  }, []);

  const showFeedback = useCallback((type, message) => {
    setFeedback({ type, message });
    clearTimeout(feedbackTimerRef.current);
    feedbackTimerRef.current = setTimeout(() => setFeedback(null), 2500);
  }, []);

  // Shared joystick interval — sends one combined move from both sticks
  const startShared = () => {
    if (!sharedIntervalRef.current) {
      sharedIntervalRef.current = setInterval(() => {
        const { vx, vy } = leftVals.current;
        const { vyaw }   = rightVals.current;
        sendMove(vx, vy, vyaw).catch(() => {});
      }, MOVE_INTERVAL_MS);
    }
  };

  const onJoyStart = () => {
    activeJoys.current += 1;
    startShared();
  };

  const onJoyEnd = () => {
    activeJoys.current = Math.max(0, activeJoys.current - 1);
    if (activeJoys.current === 0) {
      clearInterval(sharedIntervalRef.current);
      sharedIntervalRef.current = null;
      sendStop().catch(() => {});
    }
  };

  // Left joystick: vx (y-axis) + vy (x-axis)
  const leftPan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => onJoyStart(),
      onPanResponderMove: (_, { dx, dy }) => {
        const dist  = Math.sqrt(dx * dx + dy * dy);
        const ratio = dist > JOY_MAX_DIST ? JOY_MAX_DIST / dist : 1;
        const cx = dx * ratio;
        const cy = dy * ratio;
        leftThumb.setValue({ x: cx, y: cy });
        const vals = {
          vx: parseFloat((-cy / JOY_MAX_DIST * MAX_SPEED).toFixed(2)),
          vy: parseFloat(( cx / JOY_MAX_DIST * MAX_SPEED).toFixed(2)),
        };
        leftVals.current = vals;
        setLeftDisplay(vals);
      },
      onPanResponderRelease:   () => { leftThumb.setValue({ x: 0, y: 0 }); leftVals.current = { vx: 0, vy: 0 }; setLeftDisplay({ vx: 0, vy: 0 }); onJoyEnd(); },
      onPanResponderTerminate: () => { leftThumb.setValue({ x: 0, y: 0 }); leftVals.current = { vx: 0, vy: 0 }; setLeftDisplay({ vx: 0, vy: 0 }); onJoyEnd(); },
    })
  ).current;

  // Right joystick: vyaw (x-axis) — rotation
  const rightPan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => onJoyStart(),
      onPanResponderMove: (_, { dx, dy }) => {
        const dist  = Math.sqrt(dx * dx + dy * dy);
        const ratio = dist > JOY_MAX_DIST ? JOY_MAX_DIST / dist : 1;
        const cx = dx * ratio;
        const cy = dy * ratio;
        rightThumb.setValue({ x: cx, y: cy });
        const vals = { vyaw: parseFloat((-cx / JOY_MAX_DIST * MAX_SPEED).toFixed(2)) };
        rightVals.current = vals;
        setRightDisplay(vals);
      },
      onPanResponderRelease:   () => { rightThumb.setValue({ x: 0, y: 0 }); rightVals.current = { vyaw: 0 }; setRightDisplay({ vyaw: 0 }); onJoyEnd(); },
      onPanResponderTerminate: () => { rightThumb.setValue({ x: 0, y: 0 }); rightVals.current = { vyaw: 0 }; setRightDisplay({ vyaw: 0 }); onJoyEnd(); },
    })
  ).current;

  // D-Pad: hold to move, release to stop
  const handleDpadIn = useCallback((action) => {
    if (!isConnected) return;
    sendMove(action.vx, action.vy, action.vyaw).catch(() => {});
    dpadIntervalRef.current = setInterval(() => {
      sendMove(action.vx, action.vy, action.vyaw).catch(() => {});
    }, MOVE_INTERVAL_MS);
  }, [isConnected, sendMove]);

  const handleDpadOut = useCallback(() => {
    clearInterval(dpadIntervalRef.current);
    dpadIntervalRef.current = null;
    if (isConnected) sendStop().catch(() => {});
  }, [isConnected, sendStop]);

  // Stop
  const handleStop = useCallback(async () => {
    try {
      await sendStop();
      showFeedback('success', 'Robot detenido');
    } catch {
      showFeedback('error', 'Error al detener');
    }
  }, [sendStop, showFeedback]);

  const connColor = isConnected ? '#50E38A' : '#FF6B6B';
  const connLabel = isConnected ? 'Conectado' : connectionState === 'error' ? 'Error' : 'Desconectado';
  const [fwd, bck, lft, rgt] = DPAD;

  return (
    <View style={styles.root}>
      {/* LEFT — joystick de movimiento (vx / vy) */}
      <Joystick
        thumbAnim={leftThumb}
        panHandlers={leftPan.panHandlers}
        label="Movimiento"
        valLine={`vx ${leftDisplay.vx.toFixed(2)}  vy ${leftDisplay.vy.toFixed(2)}`}
        tint="#1A73E8"
        disabled={!isConnected}
      />

      {/* CENTER — controles */}
      <ScrollView
        style={styles.centerScroll}
        contentContainerStyle={styles.center}
        showsVerticalScrollIndicator={false}
      >
        {/* Status */}
        <View style={styles.statusRow}>
          <View style={[styles.statusDot, { backgroundColor: connColor }]} />
          <Text style={[styles.statusLabel, { color: connColor }]}>{connLabel}</Text>
        </View>

        {/* Feedback */}
        {feedback ? (
          <View style={[styles.feedback, feedback.type === 'success' ? styles.feedOk : styles.feedErr]}>
            <Text style={[styles.feedText, feedback.type === 'success' ? styles.feedTextOk : styles.feedTextErr]}>
              {feedback.type === 'success' ? '✓' : '✗'} {feedback.message}
            </Text>
          </View>
        ) : null}

        {/* D-Pad */}
        <View style={styles.dpad}>
          <View style={styles.dpadRow}>
            <View style={styles.dpadEmpty} />
            <DpadButton action={fwd} disabled={!isConnected} onPressIn={handleDpadIn} onPressOut={handleDpadOut} />
            <View style={styles.dpadEmpty} />
          </View>
          <View style={styles.dpadRow}>
            <DpadButton action={lft} disabled={!isConnected} onPressIn={handleDpadIn} onPressOut={handleDpadOut} />
            <View style={styles.dpadEmpty} />
            <DpadButton action={rgt} disabled={!isConnected} onPressIn={handleDpadIn} onPressOut={handleDpadOut} />
          </View>
          <View style={styles.dpadRow}>
            <View style={styles.dpadEmpty} />
            <DpadButton action={bck} disabled={!isConnected} onPressIn={handleDpadIn} onPressOut={handleDpadOut} />
            <View style={styles.dpadEmpty} />
          </View>
        </View>

        {/* Stop */}
        <TouchableOpacity
          style={[styles.stopBtn, !isConnected && styles.disabled]}
          onPress={handleStop}
          disabled={!isConnected}
          activeOpacity={0.8}
        >
          <Text style={styles.stopText}>■  Detener</Text>
        </TouchableOpacity>

        {/* Acciones predefinidas del robot */}
        <TouchableOpacity
          style={[styles.actionsBtn, !isConnected && styles.disabled]}
          onPress={() => setActionsModalVisible(true)}
          disabled={!isConnected}
          activeOpacity={0.8}
        >
          <Text style={styles.actionsBtnText}>★  Acciones</Text>
        </TouchableOpacity>

        {!isConnected && (
          <Text style={styles.disconnectedHint}>Conectate para controlar el robot</Text>
        )}
      </ScrollView>

      {/* RIGHT — joystick de rotación (vyaw) */}
      <Joystick
        thumbAnim={rightThumb}
        panHandlers={rightPan.panHandlers}
        label="Rotación"
        valLine={`vyaw ${rightDisplay.vyaw.toFixed(2)}`}
        tint="#F5A623"
        disabled={!isConnected}
      />

      <ActionsModal
        visible={actionsModalVisible}
        onClose={() => setActionsModalVisible(false)}
        isConnected={isConnected}
        onFeedback={showFeedback}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#07111F',
    alignItems: 'flex-start',
    paddingHorizontal: 8,
    paddingTop: 4,
    paddingBottom: 10,
  },

  // Joystick column
  joyCol: {
    flex: 1,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  joyTitle: {
    color: '#A8B3C7',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  joyBase: {
    width: JOY_R * 2,
    height: JOY_R * 2,
    borderRadius: JOY_R,
    backgroundColor: '#101827',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  joyLineH: {
    position: 'absolute',
    width: '80%',
    height: 1,
  },
  joyLineV: {
    position: 'absolute',
    height: '80%',
    width: 1,
  },
  joyRing: {
    position: 'absolute',
    width: JOY_R * 2 * 0.55,
    height: JOY_R * 2 * 0.55,
    borderRadius: JOY_R * 0.55,
    borderWidth: 1,
  },
  joyThumb: {
    width: JOY_THUMB_R * 2,
    height: JOY_THUMB_R * 2,
    borderRadius: JOY_THUMB_R,
    borderWidth: 2,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  joyVals: {
    fontSize: 11,
    color: '#A8B3C7',
    fontWeight: '600',
  },

  // Center
  centerScroll: {
    flex: 0.9,
    alignSelf: 'stretch',
  },
  center: {
    alignItems: 'center',
    paddingTop: 0,
    paddingBottom: 6,
    gap: 5,
  },

  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '700',
  },

  feedback: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    width: '100%',
  },
  feedOk:  { backgroundColor: '#102F20', borderWidth: 1, borderColor: '#50E38A44' },
  feedErr: { backgroundColor: '#37161B', borderWidth: 1, borderColor: '#FF6B6B44' },
  feedText: { fontSize: 12, fontWeight: '700', textAlign: 'center' },
  feedTextOk:  { color: '#50E38A' },
  feedTextErr: { color: '#FF6B6B' },

  // D-Pad
  dpad: { gap: DPAD_GAP, alignItems: 'center' },
  dpadRow: { flexDirection: 'row', gap: DPAD_GAP },
  dpadBtn: {
    width: DPAD_BTN,
    height: DPAD_BTN,
    backgroundColor: '#101827',
    borderWidth: 2,
    borderColor: '#2D3A50',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dpadEmpty: { width: DPAD_BTN, height: DPAD_BTN },
  dpadLabel: { fontSize: 22, color: colors.white, lineHeight: 26 },

  // Stop
  stopBtn: {
    backgroundColor: '#C62828',
    borderRadius: 10,
    paddingVertical: 7,
    width: DPAD_BTN * 3 + DPAD_GAP * 2,
    alignItems: 'center',
  },
  stopText: { color: colors.white, fontSize: 13, fontWeight: '800' },

  actionsBtn: {
    backgroundColor: '#0D4A3A',
    borderRadius: 10,
    paddingVertical: 7,
    width: DPAD_BTN * 3 + DPAD_GAP * 2,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#50E38A44',
  },
  actionsBtnText: { color: '#50E38A', fontSize: 13, fontWeight: '800' },

  disconnectedHint: {
    color: '#FF6B6B',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 4,
  },

  disabled: { opacity: 0.35 },
});
