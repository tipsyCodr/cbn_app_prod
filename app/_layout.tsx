import { Stack, useRouter, useSegments, Slot } from "expo-router";
// import { useCustomFonts } from "@/utils/fonts";
import { SplashScreen } from "expo-router";
import { Inter_900Black, useFonts } from '@expo-google-fonts/inter';
import { useEffect, useState } from "react";
import "./globals.css";
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';
import { checkAuthStatus } from '@/utils/api';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_900Black,
  });
  const segments = useSegments();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [initialAuthCheckDone, setInitialAuthCheckDone] = useState(false);

  // Initial auth check on app startup
  useEffect(() => {
    const checkAuth = async () => {
      const { isAuthenticated } = await checkAuthStatus();
      setIsLoggedIn(isAuthenticated);
      setInitialAuthCheckDone(true);
    };
    checkAuth();
  }, []);
  
  // Handle font loading
  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
      setIsReady(true);
    }
  }, [fontsLoaded]);

  // Handle navigation based on auth state
  useEffect(() => {
    if (!isReady || !initialAuthCheckDone) return;

    const inAuthGroup = segments[0] === 'auth';
    const inOnboarding = segments[0] === '(onboarding)';
    const inTabs = segments[0] === '(tabs)';

    if (isLoggedIn) {
      // Logged in users should be in tabs
      if (inAuthGroup || inOnboarding) {
        router.replace('/(tabs)');
      }
    } else {
      // Not logged in users should be in onboarding/auth
      if (inTabs) {
        router.replace('/(onboarding)');
      }
    }
  }, [segments, isReady, isLoggedIn, initialAuthCheckDone]);

  // Update auth state when it changes
  useEffect(() => {
    const updateAuthState = async () => {
      if (isReady && initialAuthCheckDone) {
        const { isAuthenticated } = await checkAuthStatus();
        if (isAuthenticated !== isLoggedIn) {
          setIsLoggedIn(isAuthenticated);
        }
      }
    };

    // Check for auth changes when segments change
    updateAuthState();
  }, [segments]);

  if (!fontsLoaded || !isReady) {
    return null;
  }

  return (
    <>
      <Stack screenOptions={{ headerShadowVisible: false }}>
        <Stack.Screen name="(onboarding)/index" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="forms" options={{ headerShown: false }} />
        <Stack.Screen name="pages/profile" options={{ headerShown: false }} />
        <Stack.Screen name="member/[id]"
                      options={{
                        title:"Member Details"
                      }} />
        <Stack.Screen name="slip-detail" options={{ headerShown: false }} />
        <Stack.Screen name="pages/edit-profile" options={{ headerShown: false }} />
        <Stack.Screen name="notifications" options={{ headerShown: false }} />
        <Stack.Screen name="meetings/index" options={{ headerShown: false }} />
      </Stack>
      <Toast />
    </>
  );
}
