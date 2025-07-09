import { Stack } from "expo-router";

export default function SlipsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown:true,
          title: 'ACTIVITY FEED',
          headerTitle: 'ACTIVITY FEED',
          headerTitleAlign: 'center',
          headerStyle: {
            backgroundColor: '#fff',
          },
          headerTintColor: '#444D5D',
          headerTitleStyle: {
            fontWeight: 'bold',
            color: '#444D5D',
          },
        }}
      />
        <Stack.Screen name="[id]" options={{
            title:"Activity Details"
        }} />
    </Stack>
  );
} 