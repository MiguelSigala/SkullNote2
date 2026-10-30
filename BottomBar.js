import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  Image,
  StyleSheet,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';

const INITIAL_ICONS = [
  { id: 'metronome', image: require('./assets/metronome.png') },
  { id: 'tuner', image: require('./assets/tuner.png') },
  { id: 'menu', image: require('./assets/menu.png') },
  { id: 'chords', image: require('./assets/chords.png') },
  { id: 'mic', image: require('./assets/mic.png') },
];

const CENTER_INDEX = 2;

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function BottomBar({ state, navigation }) {
  const activeScreen = state.routes[state.index].name;

  const activeIconId =
    activeScreen === 'Afinador'
      ? 'tuner'
      : activeScreen === 'Metronomo'
        ? 'metronome'
        : activeScreen === 'Grabadora'
          ? 'mic'
          : 'menu';

  const [icons, setIcons] = useState(() => {
    const updatedIcons = [...INITIAL_ICONS];
    const initialIndex = updatedIcons.findIndex(
      (item) => item.id === activeIconId
    );

    if (initialIndex !== -1) {
      const [selectedIcon] = updatedIcons.splice(initialIndex, 1);
      updatedIcons.splice(CENTER_INDEX, 0, selectedIcon);
    }

    return updatedIcons;
  });

  const scales = useRef(
    Object.fromEntries(
      INITIAL_ICONS.map((item) => [
        item.id,
        new Animated.Value(1),
      ])
    )
  ).current;

  const animating = useRef(false);

  useEffect(() => {
    const currentIndex = icons.findIndex(
      (item) => item.id === activeIconId
    );

    if (currentIndex !== -1 && currentIndex !== CENTER_INDEX) {
      const updatedIcons = [...icons];
      const [selectedIcon] = updatedIcons.splice(currentIndex, 1);
      updatedIcons.splice(CENTER_INDEX, 0, selectedIcon);

      LayoutAnimation.configureNext({
        duration: 300,
        update: {
          type: LayoutAnimation.Types.easeInEaseOut,
        },
        create: {
          type: LayoutAnimation.Types.easeInEaseOut,
          property: LayoutAnimation.Properties.opacity,
        },
        delete: {
          type: LayoutAnimation.Types.easeInEaseOut,
          property: LayoutAnimation.Properties.opacity,
        },
      });

      setIcons(updatedIcons);
    }

    INITIAL_ICONS.forEach((item) => {
      Animated.spring(scales[item.id], {
        toValue: item.id === activeIconId ? 1.15 : 1,
        friction: 7,
        tension: 100,
        useNativeDriver: true,
      }).start();
    });
  }, [activeIconId]);

  const selectIcon = (id) => {
    if (animating.current) return;

    const screenMap = {
      menu: 'Home',
      tuner: 'Afinador',
      metronome: 'Metronomo',
      mic: 'Grabadora',
    };

    const targetScreen = screenMap[id];

    if (targetScreen) {
      if (activeScreen !== targetScreen) {
        navigation.navigate(targetScreen);
      }
      return;
    }

    const currentIndex = icons.findIndex(
      (item) => item.id === id
    );

    if (currentIndex === -1 || currentIndex === CENTER_INDEX) {
      return;
    }

    animating.current = true;

    const updatedIcons = [...icons];
    const [selectedIcon] = updatedIcons.splice(currentIndex, 1);
    updatedIcons.splice(CENTER_INDEX, 0, selectedIcon);

    LayoutAnimation.configureNext(
      {
        duration: 300,
        update: {
          type: LayoutAnimation.Types.easeInEaseOut,
        },
        create: {
          type: LayoutAnimation.Types.easeInEaseOut,
          property: LayoutAnimation.Properties.opacity,
        },
        delete: {
          type: LayoutAnimation.Types.easeInEaseOut,
          property: LayoutAnimation.Properties.opacity,
        },
      },
      () => {
        animating.current = false;
      }
    );

    setIcons(updatedIcons);
  };

  return (
    <View style={styles.container}>
      <View style={styles.background} />

      <View style={styles.icons}>
        {icons.map((item, index) => {
          const selected = item.id === activeIconId;
          const central = index === CENTER_INDEX;

          return (
            <View
              key={item.id}
              style={[
                styles.iconPosition,
                { zIndex: central ? 2 : 1 },
              ]}
            >
              <Animated.View
                style={{
                  transform: [{ scale: scales[item.id] }],
                }}
              >
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => selectIcon(item.id)}
                  style={[
                    styles.iconButton,
                    selected && styles.selectedButton,
                  ]}
                >
                  <Image
                    source={item.image}
                    resizeMode="contain"
                    style={[
                      styles.iconImage,
                      selected && styles.selectedImage,
                    ]}
                  />
                </TouchableOpacity>
              </Animated.View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 75,
    zIndex: 20,
    elevation: 20,
  },

  background: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 38,
    backgroundColor: '#89a071',
  },

  icons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 8,
  },

  iconPosition: {
    width: 58,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#606c38',
    alignItems: 'center',
    justifyContent: 'center',
  },

  selectedButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#283618',
  },

  iconImage: {
    width: 22,
    height: 22,
    tintColor: '#fefae0',
  },

  selectedImage: {
    width: 28,
    height: 28,
  },
});