import { View, Text, TouchableOpacity, TextInput, Image, Linking } from 'react-native'
import { Link, router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { icons } from '@/assets/constants/icons'
import { loginUser } from '@/utils/api'; // adjust path if needed
import { BASE_URL } from '@/utils/globals';
import { useState } from 'react'
import { Alert, ActivityIndicator } from 'react-native';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const result = await loginUser(email, password);
      setLoading(false);

      if (result.success) {
        // ✅ Mark onboarding as completed
        await AsyncStorage.setItem('onboarding_done', 'true');

        // Navigate immediately
        router.replace('/(tabs)');

        // Show toast after navigation
        Toast.show({
          type: 'success',
          text1: 'Login Successful',
          text2: 'Welcome back!',
          position: 'top',
          visibilityTime: 2000
        });
      } else {
        Alert.alert('Login Failed', result.message);
      }
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'An unexpected error occurred');
    }
  };

  return (
    <>
      <View className="flex-1 bg-white">
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3">
          <TouchableOpacity
            className="p-2"
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} className="text-primary" />
          </TouchableOpacity>
          {/* <Text className="text-2xl font-black text-primary">LOGIN</Text> */}
          <View className="w-10" />
        </View>

        {/* Content */}
        <View className="flex-1 px-4">
          {/* Logo */}
          <View className="items-start justify-end py-8">
            <View className="justify-end w-40 h-40 rounded-full items-left ">
              <Text className="text-6xl font-black text-accented">CBN</Text>
            </View>
          </View>

          {/* Welcome Text */}
          <View className="mb-8">
            <Text className="mb-2 text-4xl font-black text-accented">Login to Continue</Text>
            {/* <Text className="text-base text-gray-600">Sign in to continue your spiritual journey</Text> */}
          </View>

          {/* Login Form */}
          <View className="space-y-4">
            {/* Email Input */}
            <View className="space-y-2">
              {/* <Text className="font-medium text-gray-700 text-md">Email</Text> */}
              <View className="flex-row items-center px-4 py-3 my-2 border border-gray-200 rounded-lg">
                <Ionicons name="mail" size={20} color="#666" className="mr-2" />
                <TextInput
                  className="flex-1 text-base"
                  placeholder="Enter your email"
                  placeholderTextColor="#666"
                  keyboardType="email-address"
                  textContentType="username"
                  autoComplete="email"
                  importantForAutofill="yes"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail} />
              </View>
            </View>
            {/* <View className="py-4 " >

    </View> */}
            {/* Password Input */}
            <View className="space-y-2">
              {/* <Text className="text-sm font-medium text-gray-700">Password</Text> */}
              <View className="flex-row items-center text-black px-4 py-3 mt-2 border border-gray-200 rounded-lg">
                <Ionicons name="lock-closed" size={20} color="#666" className="mr-2" />
                <TextInput
                  className="flex-1 text-black"
                  placeholder="Enter your password"
                  placeholderTextColor="#666"
                  secureTextEntry={!showPassword}
                  textContentType="password"
                  autoComplete="password"
                  importantForAutofill="yes"
                  value={password}
                  onChangeText={setPassword} />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="#000" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Forgot Password link */}
            <TouchableOpacity
              className="items-end"
              onPress={() => Linking.openURL(`${BASE_URL}forgot-password`)}
            >
              <Text className="text-sm font-medium text-primary">
                Forgot Password?
              </Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              className="items-center w-full py-4 mt-6 rounded-lg bg-accented"
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-lg font-bold text-white">Login</Text>
              )}
            </TouchableOpacity>

            {/* Sign Up Link */}
            <View className="flex-row items-center justify-center mt-4">
              <Text className="text-gray-600">Don't have an account? </Text>
              <TouchableOpacity
                onPress={() => Linking.openURL(`${BASE_URL}membership`)}
              >
                <Text className="font-medium text-primary">Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
      <Toast />
    </>
  )
}