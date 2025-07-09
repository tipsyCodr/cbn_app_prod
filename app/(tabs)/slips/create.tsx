import { View, Text } from "react-native";
import { Stack } from "expo-router";

export default function CreateSlipScreen() {
  return (
    <View className="flex-1 p-4">
      <Stack.Screen
        options={{
          title: "Create Slip",
          presentation: "modal",
          headerShown: true,
        }}
      />
      <Text className="text-xl font-bold">Create New Slip</Text>
    </View>
  );
} 