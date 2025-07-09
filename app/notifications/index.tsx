import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  clearNotification,
  Notification
} from '@/utils/api';
import { format, formatDistanceToNow } from 'date-fns';

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const result = await getNotifications();
      if (result.success && result.data) {
        setNotifications(result.data);
        setError(null);
      } else {
        setError(result.message || 'Failed to fetch notifications');
      }
    } catch (err: any) {
      console.error('Error fetching notifications:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, [])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNotifications();
  }, []);

  const handleNotificationPress = async (notification: Notification) => {
    try {
      // Mark notification as read
      if (!notification.read) {
        const result = await markNotificationAsRead(notification.id);
        if (result.success) {
          // Update local state to mark as read
          setNotifications(prev =>
            prev.map(n =>
              n.id === notification.id ? { ...n, read: true } : n
            )
          );
        }
      }

      // Navigate based on notification type
      if (notification.related_id) {
        switch (notification.type) {
          case 'referral':
            router.push({
              pathname: '/slip-detail', // Use a standalone route outside tabs
              params: {
                id: notification.related_id,
                type: 'referral',
                fromNotification: 'true' // Flag to indicate navigation source
              }
            });
            break;
          case 'thank_you':
            router.push({
              pathname: '/slip-detail',
              params: {
                id: notification.related_id,
                type: 'thank_you',
                fromNotification: 'true'
              }
            });
            break;
          case 'one_to_one':
            router.push({
              pathname: '/slip-detail',
              params: {
                id: notification.related_id,
                type: 'one_to_one',
                fromNotification: 'true'
              }
            });
            break;
          case 'ceu':
            // For CEU notifications, we might not have a specific page to navigate to
            // If it's a system notification or announcement, just stay on the notification screen
            break;
          default:
            // For other notification types, stay on the current screen
            break;
        }
      }
    } catch (err) {
      console.error('Error handling notification:', err);
    }
  };

  const handleClearNotification = async (id: number) => {
    try {
      const result = await clearNotification(id);
      if (result.success) {
        // Remove the notification from the list
        setNotifications(prev => prev.filter(n => n.id !== id));
      }
    } catch (err) {
      console.error('Error clearing notification:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const result = await markAllNotificationsAsRead();
      if (result.success) {
        // Update all notifications in the list to read
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      }
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'referral':
        return 'people-outline';
      case 'thank_you':
        return 'cash-outline';
      case 'one_to_one':
        return 'cafe-outline';
      case 'ceu':
        return 'school-outline';
      default:
        return 'notifications-outline';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'referral':
        return '#4CAF50';
      case 'thank_you':
        return '#FF9800';
      case 'one_to_one':
        return '#2196F3';
      case 'ceu':
        return '#9C27B0';
      default:
        return '#042117';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#042117" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity
          style={styles.markAllButton}
          onPress={handleMarkAllAsRead}
        >
          <Ionicons name="checkmark-done-outline" size={24} color="#042117" />
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#042117" />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={notifications.filter(n => n.type === 'referral'|| n.type ==='thank_you')}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.notificationItem,
                !item.read && styles.unreadItem
              ]}
              onPress={() => handleNotificationPress(item)}
            >
              <View style={[styles.iconContainer, { backgroundColor: getNotificationColor(item.type) }]}>
                <Ionicons
                  name={getNotificationIcon(item.type)}
                  size={24}
                  color="#FFFFFF"
                />
              </View>
              <View style={styles.contentContainer}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.message}>{item.message}</Text>
                <Text style={styles.timestamp}>
                  {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                </Text>
              </View>
              <View style={styles.actionButtons}>
                {!item.read && <View style={styles.unreadDot} />}
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={() => handleClearNotification(item.id)}
                >
                  <Ionicons name="close-outline" size={20} color="#666" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#042117"
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="notifications-off-outline" size={60} color="#ccc" />
              <Text style={styles.emptyText}>No notifications yet</Text>
            </View>
          }
        />
      )}
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#042117',
  },
  markAllButton: {
    padding: 8,
  },
  listContainer: {
    flexGrow: 1,
    paddingBottom: 16,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    alignItems: 'center',
  },
  unreadItem: {
    backgroundColor: 'rgba(4, 33, 23, 0.05)',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#042117',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: '#444',
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
    color: '#888',
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#042117',
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    color: '#d32f2f',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clearButton: {
    padding: 8,
  },
}); 
