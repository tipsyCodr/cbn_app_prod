import { icons } from "@/assets/constants/icons";
import React, { useState, useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, Animated, Image, Dimensions } from "react-native";

interface FABProps {
  onTYFCBPress?: () => void;
  onOneToOnePress?: () => void;
  onReferralPress?: () => void;
  onCEUPress?: () => void;
}

const FAB: React.FC<FABProps> = ({ 
  onTYFCBPress, 
  onOneToOnePress,
  onReferralPress,
  onCEUPress,
}) => {
  const [isFABVisible, setIsFABVisible] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;
  const subButton1Animation = useRef(new Animated.Value(0)).current;
  const subButton2Animation = useRef(new Animated.Value(0)).current;
  const subButton3Animation = useRef(new Animated.Value(0)).current;
  const subButton4Animation = useRef(new Animated.Value(0)).current;
  const overlayAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(animation, {
        toValue: isFABVisible ? 1 : 0,
        useNativeDriver: true,
        speed: 20,
        bounciness: 0,
      }),
      Animated.spring(subButton1Animation, {
        toValue: isFABVisible ? 1 : 0,
        useNativeDriver: true,
        speed: 20,
        bounciness: 0,
        delay: 50,
      }),
      Animated.spring(subButton2Animation, {
        toValue: isFABVisible ? 1 : 0,
        useNativeDriver: true,
        speed: 20,
        bounciness: 0,
        delay: 100,
      }),
      Animated.spring(subButton3Animation, {
        toValue: isFABVisible ? 1 : 0,
        useNativeDriver: true,
        speed: 20,
        bounciness: 0,
        delay: 150,
      }),
      Animated.spring(subButton4Animation, {
        toValue: isFABVisible ? 1 : 0,
        useNativeDriver: true,
        speed: 20,
        bounciness: 0,
        delay: 200,
      }),
      Animated.timing(overlayAnimation, {
        toValue: isFABVisible ? 1 : 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isFABVisible]);

  const handleFABPress = () => {
    setIsFABVisible(!isFABVisible);
  };

  const handleSubButtonPress = (action?: () => void) => {
    setIsFABVisible(false);
    action?.();
  };

  const handleOverlayPress = () => {
    setIsFABVisible(false);
  };

  const rotateInterpolate = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  return (
    <>
      {/* Overlay */}
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          opacity: overlayAnimation,
          zIndex: 40,
        }}
        pointerEvents={isFABVisible ? 'auto' : 'none'}
      >
        <TouchableOpacity
          style={{ flex: 1 }}
          onPressIn={handleOverlayPress}
          activeOpacity={1}
        />
      </Animated.View>

      <View className="absolute bottom-4 left-1/2 -ml-[32px] z-50">
        {/* Sub Buttons */}
        <Animated.View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            opacity: subButton1Animation,
            transform: [
              {
                translateX: subButton1Animation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -120],
                }),
              },
              {
                translateY: subButton1Animation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0],
                }),
              },
            ],
          }}
        >
          <TouchableOpacity
            className="items-center justify-center w-24 h-24 pb-4 rounded-full bg-accented"
            onPressIn={() => handleSubButtonPress(onTYFCBPress)}
          >
            <Text className="text-xl text-white">+</Text>
            <Image source={icons.tyfcb} className="object-contain h-8" style={{objectFit: 'contain'}}  />
            <Text className="text-white text-SM">TYFCB</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            opacity: subButton2Animation,
            transform: [
              {
                translateX: subButton2Animation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 130],
                }),
              },
              {
                translateY: subButton2Animation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0],
                }),
              },
            ],
          }}
        >
          <TouchableOpacity
            className="items-center justify-center w-24 h-24 pb-4 rounded-full bg-accented"
            onPressIn={() => handleSubButtonPress(onOneToOnePress)}
          >
            <Text className="text-xl text-white">+</Text>
            <Image source={icons.oneToOne} className="object-contain h-6" style={{objectFit: 'contain'}}  />
            <Text className="text-xs text-white">One-to-One</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            opacity: subButton3Animation,
            transform: [
              {
                translateX: subButton3Animation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -15],
                }),
              },
              {
                translateY: subButton3Animation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -95],
                }),
              },
            ],
          }}
        >
          <TouchableOpacity
            className="items-center justify-center w-24 h-24 pb-4 rounded-full bg-accented"
            onPressIn={() => handleSubButtonPress(onReferralPress)}
          >
            <Text className="text-xl text-white">+</Text>
            <Image source={icons.referral} className="object-contain h-8" style={{objectFit: 'contain'}}  />
            <Text className="text-sm text-white">Referral</Text>
          </TouchableOpacity>
        </Animated.View>

        {/*<Animated.View*/}
        {/*  style={{*/}
        {/*    position: 'absolute',*/}
        {/*    bottom: 0,*/}
        {/*    right: 0,*/}
        {/*    opacity: subButton4Animation,*/}
        {/*    transform: [*/}
        {/*      {*/}
        {/*        translateX: subButton4Animation.interpolate({*/}
        {/*          inputRange: [0, 1],*/}
        {/*          outputRange: [0, 90],*/}
        {/*        }),*/}
        {/*      },*/}
        {/*      {*/}
        {/*        translateY: subButton4Animation.interpolate({*/}
        {/*          inputRange: [0, 1],*/}
        {/*          outputRange: [0, -95],*/}
        {/*        }),*/}
        {/*      },*/}
        {/*    ],*/}
        {/*  }}*/}
        {/*>*/}
        {/*  <TouchableOpacity*/}
        {/*    className="items-center justify-center w-24 h-24 pb-4 rounded-full bg-accented"*/}
        {/*    onPressIn={() => handleSubButtonPress(onCEUPress)}*/}
        {/*  >*/}
        {/*    <Text className="text-xl text-white">+</Text>*/}
        {/*    <Image source={icons.ceu} className="object-contain h-8" style={{objectFit: 'contain'}}  />*/}
        {/*    <Text className="text-sm text-white">CEU</Text>*/}
        {/*  </TouchableOpacity>*/}
        {/*</Animated.View>*/}

        {/* Main FAB */}
        <Animated.View
          style={{
            transform: [{ rotate: rotateInterpolate }],
          }}
        >
          <TouchableOpacity
            className="items-center justify-center w-16 h-16 pt-1 rounded-full bg-accented"
            onPressIn={handleFABPress}
          >
            <Text className="text-4xl font-light text-white">+</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </>
  );
};

export default FAB;