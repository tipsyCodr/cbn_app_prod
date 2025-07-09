// app/index.tsx
import { useEffect } from 'react';
import { router } from 'expo-router';
import { View, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Index() {
useEffect(() => {
    const checkOnboarding = async () => {
      const completed = await AsyncStorage.getItem('onboarding_done');
      
      if (completed === 'true') {
        router.replace('/(tabs)');
      } else {
        router.replace('/(onboarding)');
      }
    };

    checkOnboarding();
  }, []);

  return (
    <View className="flex-1 items-center justify-center">
      <Text>Loading...</Text>
    </View>
  );
}
