import { View, Text, TouchableOpacity } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

export default function Onboarding() {
  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      {/* <View className="flex-row items-center justify-between px-4 py-3">
        <View className="w-10" />
        <Text className="text-lg font-bold text-primary">WELCOME</Text>
        <View className="w-10" />
      </View> */}

      {/* Content */}
      <View className="justify-center flex-1 px-4">
        {/* Logo */}
        <View className="items-start justify-end py-8">
          <View className="justify-end w-40 h-40 rounded-full items-left ">
            <Text className="text-6xl font-black text-accented">CBN</Text>
          </View>
        </View>

        {/* Welcome Text */}
        <View className="mb-8">
          <Text className="mb-2 text-2xl font-bold text-accented">Welcome to CBN</Text>
          <Text className="text-base text-gray-600">
            Where Professionals & Business Owners Connect, Collaborate & Grow Together.
          </Text>
        </View>

        {/* Description */}
        {/* <Text className="mb-8 text-base text-gray-600">
          CBN empowers professionals and entrepreneurs to build trusted relationships, share referrals, and support each other's growth. Whether you're looking to expand your reach or help a fellow business, CBN is your go-to network.
        </Text> */}

        {/* Key Points */}
        {/* <View className="mb-8 space-y-6">
          <View className="flex-row items-start">
            <View className="items-center justify-center w-10 h-10 mr-3 rounded-full bg-primary/10">
              <Ionicons name="people" size={24} color="#042117" />
            </View>
            <View className="flex-1">
              <Text className="mb-1 text-lg font-semibold text-gray-800">Build Relationships</Text>
              <Text className="text-base text-gray-600">Connect with like-minded professionals</Text>
            </View>
          </View>

          <View className="flex-row items-start">
            <View className="items-center justify-center w-10 h-10 mr-3 rounded-full bg-primary/10">
              <Ionicons name="chatbubbles" size={24} color="#042117" />
            </View>
            <View className="flex-1">
              <Text className="mb-1 text-lg font-semibold text-gray-800">Share Referrals</Text>
              <Text className="text-base text-gray-600">Help others while growing your own business</Text>
            </View>
          </View>

          <View className="flex-row items-start">
            <View className="items-center justify-center w-10 h-10 mr-3 rounded-full bg-primary/10">
              <Ionicons name="trending-up" size={24} color="#042117" />
            </View>
            <View className="flex-1">
              <Text className="mb-1 text-lg font-semibold text-gray-800">Grow Together</Text>
              <Text className="text-base text-gray-600">Collaborate in a community-driven ecosystem</Text>
            </View>
          </View>
        </View> */}

        {/* Get Started Button */}
        <TouchableOpacity
          className="items-center w-full py-4 mb-4 rounded-lg bg-accented"
          onPress={() => router.push('/auth/login')}
        >
          <Text className="text-lg font-bold text-white ">Get Started</Text>
        </TouchableOpacity>

        {/* Login Link */}
        <View className="flex-row items-center justify-center">
          <Text className="text-gray-600">Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/auth/login')}>
            <Text className="font-medium text-primary">Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
} 