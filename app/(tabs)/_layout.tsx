import { View, Text, TouchableOpacity } from 'react-native'
import React, { useState, useCallback } from 'react'
import { Link, router, Tabs, usePathname } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { icons } from '@/assets/constants/icons'
import { Image } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { getNotifications, getUnreadNotificationsCount, getSafeToken } from '@/utils/api'



const TabIcon = ({
  focused,
  color,
  size,
  icon,
  title,
}: {
  focused: boolean;
  color: string;
  size: number;
  icon: any;
  title: string;
}) => {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', paddingTop: 8 }}>
      <Image
        source={icon}
        style={{
          width: 26,
          height: 24,
          resizeMode: 'contain',
          tintColor: focused ? '#ffffff' : '#efefefef',
        }}
      />
      {/* <Text
        style={{
          fontSize: 12,
          fontWeight: 'bold',
          color: 'white',
          marginTop: 4,
          textAlign: 'center',
        }}
      >
        {title}
      </Text> */}
      <View
        style={{
          width: 24,
          height: 2,
          backgroundColor: focused ? 'white' : 'transparent',
          marginTop: 10,
          top: 12,
          borderRadius: 10,
        }}
      />
    </View>
  );
};

export default function TabsLayout() {
  const [unreadCount, setUnreadCount] = useState(0);
  const pathname = usePathname();

  const fetchNotificationCount = async () => {
    const token = await getSafeToken();

    // Skip if not authenticated
    if (!token) {
      console.log('User not logged in — skipping notification count');
      return;
    }

    try {
      const result = await getUnreadNotificationsCount();

      if (result.success && result.data) {
        // Set unread count from the API response
        setUnreadCount(result.data.count);
      }
    } catch (err) {
      console.error('Error fetching notification count:', err);
    }
  };

  // Fetch data when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchNotificationCount();
    }, [])
  );

  return (
    <Tabs screenOptions={{
      headerShadowVisible: false,
      tabBarActiveTintColor: '#ffffff',
      tabBarInactiveTintColor: '#efefefef',
      tabBarShowLabel: true,
      tabBarStyle: {
        backgroundColor: '#042117',
        height: 100,
        marginHorizontal: 10,
        marginBottom: 20,
        borderRadius: 20,
        elevation: 5,
      },
      tabBarItemStyle: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
      },
      headerStyle: {
        backgroundColor: '#fff',
      },
      headerTintColor: '#444D5D',
      headerTitleStyle: {
        fontWeight: 'bold',
        color: '#444D5D',
      },
    }}>
      <Tabs.Screen name="index" options={{ 
        headerLeft: () => (
          <TouchableOpacity className='p-4 bg-white rounded-lg' onPress={() => {  
                            router.push('/notifications');
                          }}>
            <Ionicons name="notifications" size={24} className='text-accented' />
            {unreadCount > 0 && (
              <View style={{
                position: 'absolute',
                top: 5,
                right: 5,
                minWidth: 18,
                height: 18,
                borderRadius: 9,
                backgroundColor: '#E53935',
                justifyContent: 'center',
                alignItems: 'center',
                paddingHorizontal: 3,
              }}>
                <Text style={{
                  color: 'white',
                  fontSize: 10,
                  fontWeight: 'bold',
                }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Text>
              </View>
            )}          
          </TouchableOpacity>
        ),
        // headerRight: () => (
        //   <TouchableOpacity className='p-4 bg-white rounded-lg' onPress={() => {/* Add your right button action here */}}>
        //     <Link href="/pages/profile">
        //       <Ionicons name="menu" size={24} className='text-accented' />
        //     </Link>
        //   </TouchableOpacity>
        // ),
        title: 'Home',
        tabBarIcon: ({ focused, color, size }) => (
          <TabIcon focused={focused} icon={icons.home} color={color} size={size} title="Home" />
        ),
        headerShown: true,
        headerTitle: 'HOME',
        headerTitleAlign: 'center',
      }} />
      <Tabs.Screen name="slips" options={{
        title: 'Slips',
        tabBarIcon: ({ focused, color, size }) => (
          <TabIcon focused={focused} icon={icons.slips} color={color} size={size} title="Slips" />
        ),
        headerShown: false // Hide the header here since we'll show it in the stack
      }} />
      <Tabs.Screen name="visitors" options={{
        title: 'Visitors',
        tabBarIcon: ({ focused, color, size }) => (
          <TabIcon focused={focused} icon={icons.visitors} color={color} size={size} title="Visitors" />
        ),
        headerShown: true,
        headerTitle: 'VISITORS',
        headerTitleAlign: 'center',
      }} />
      <Tabs.Screen name="search" options={{
        title: 'Search',
        tabBarIcon: ({ focused, color, size }) => (
          <TabIcon focused={focused} icon={icons.search} color={color} size={size} title="Search" />
        ),
        headerShown: false,
        headerTitle: 'SEARCH',
        headerTitleAlign: 'center',
      }} />
    </Tabs>
  )
}