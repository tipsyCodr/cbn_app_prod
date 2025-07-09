import { Stack } from "expo-router";

export default function SlipsLayout() {
  return (
    <Stack screenOptions={{
      headerShown: false,
    }}>
      <Stack.Screen
        name="search"
        options={{
          headerShown: false,
        }}
      />

    </Stack>
  );
} 