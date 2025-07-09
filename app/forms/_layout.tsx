import { Stack } from "expo-router";

import { useEffect } from "react";


export default function RootLayout() {

  return <Stack screenOptions={{ headerShadowVisible: false }} >
    <Stack.Screen name="tyfcb" options={{ headerShown: true, headerTitle: 'TYFCB', headerTitleAlign: 'center' }} />
    <Stack.Screen name="referral" options={{ headerShown: true, headerTitle: 'Referral', headerTitleAlign: 'center' }} />
    <Stack.Screen name="one-to-one" options={{ headerShown: false, headerTitle: 'One to One', headerTitleAlign: 'center' }} />
  </Stack>
}
