import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import SlipDetailScreen from './(tabs)/slips/[id]';

export default function StandaloneSlipDetail() {
  const { fromNotification } = useLocalSearchParams();

  const handleBackPress = () => {
    // if (fromNotification === 'true') {
    //   // If came from notification, go back to notifications
    //   router.replace('/notifications');
    // } else {
      // Otherwise, use normal back navigation
      router.back(); // this just works rest is crap i am just keeping it for reference.
    // }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Custom header with back button */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBackPress}
        >
          <Ionicons name="arrow-back" size={24} color="#042117" />
          
          
        </TouchableOpacity>
      </View>
      
      {/* Render the existing slip detail component */}
      <SlipDetailScreen />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
  },
});