import { useFonts } from 'expo-font';

export const useCustomFonts = () => {
  const [fontsLoaded] = useFonts({
    'InterVariable': require('../assets/fonts/InterVariable.ttf'),
  });

  return fontsLoaded;
}; 