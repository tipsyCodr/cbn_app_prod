import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native'
import React from 'react'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { icons } from '@/assets/constants/icons'
import { logoutUser } from '@/utils/api'
import Toast from 'react-native-toast-message'
import { useLocalSearchParams } from 'expo-router';
import {BASE_URL} from "@/utils/globals";

type MenuItem = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  route: string;
  isLogout?: boolean;
}

const Profile = () => {
  const params = useLocalSearchParams();
  const { name, company, post, profile_photo } = params;
const decodedName = decodeURIComponent(name as string);
const decodedCompany = decodeURIComponent(company as string);
const decodedPost = decodeURIComponent(post as string);
const decodedProfilePhoto = decodeURIComponent(profile_photo as string);

  const menuItems: MenuItem[] = [
    { icon: 'person', title: 'Personal Information', route: '/pages/edit-profile' },
    // { icon: 'settings', title: 'Settings', route: '/settings' },
    // { icon: 'notifications', title: 'Notifications', route: '/notifications' },
    // { icon: 'lock-closed', title: 'Privacy', route: '/privacy' },
    // { icon: 'help-circle', title: 'Help & Support', route: '/help' },
    // { icon: 'information-circle', title: 'About', route: '/about' },
  ];

  const handleMenuItemPress = async (item: MenuItem) => {
    if (item.isLogout) {
      try {
        const result = await logoutUser();
        if (result.success) {
          setTimeout(() => {
            router.replace('/(onboarding)');
          }, 100);
          
          Toast.show({
            type: 'success',
            text1: 'Logged Out',
            text2: 'You have been successfully logged out',
            position: 'top',
            visibilityTime: 2000
          });
        } else {
          Toast.show({
            type: 'error',
            text1: 'Logout Failed',
            text2: result.message || 'There was an error logging out',
            position: 'top',
            visibilityTime: 2000,
          });
        }
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: 'Logout Failed',
          text2: 'There was an error logging out',
          position: 'top',
          visibilityTime: 2000,
        });
      }
    } else {
      router.push(item.route as any);
    }
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3">
        <TouchableOpacity
          className="p-2"
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} className="text-primary" />
        </TouchableOpacity>
        <Text className="text-lg font-bold">PROFILE</Text>
        <View className="w-10" />
      </View>

      <View className="w-full px-2">
        <Image
            source={{uri: BASE_URL + "public/storage/" + profile_photo}}
            className="w-full"
            style={{ height: 304 }} // 64 * 4 = 256 (h-64 equivalent)
        />
      </View>

      {/* Profile Info */}
      <View className="py-6">
        <View className="flex-row items-center px-4">
          <View className="mr-4">
            {/*<Image source={icons.profile} className="rounded-full w-26 h-26" />*/}
          </View>
          <View className="flex-1">
            <Text className="text-3xl font-black text-primary">{name}</Text>
            <Text className="pt-2 md text-orange">{post}</Text>
            <Text className="md text-primary ">{company}</Text>
          </View>
        </View>
      </View>

      {/* Menu Items */}
      <ScrollView className="flex-1 px-4 py-4">
        <View className="space-y-4">
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm"
              onPress={() => handleMenuItemPress(item)}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View className="p-2 mr-3 rounded-lg bg-accented/10">
                    <Ionicons name={item.icon} size={24} color="#042117" />
                  </View>
                  <Text className="text-lg text-primary">{item.title}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#042117" />
              </View>
            </TouchableOpacity>
          ))}
          
          {/* Logout Button */}
          <TouchableOpacity
            className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm"
            onPress={() => handleMenuItemPress({ icon: 'log-out', title: 'Logout', route: '', isLogout: true })}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="p-2 mr-3 rounded-lg bg-accented/10">
                  <Ionicons name="log-out" size={24} color="#042117" />
                </View>
                <Text className="text-lg text-primary">Logout</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#042117" />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <Toast />
    </View>
  );
};

export default Profile;