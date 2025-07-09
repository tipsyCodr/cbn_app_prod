import { View, Text, ScrollView, Image, ActivityIndicator, TouchableOpacity, StyleSheet, Linking, Dimensions } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getProfile } from '@/utils/form-api';
import { BASE_URL } from '@/utils/globals';

interface Member {
  id: number;
  name: string;
  company?: string;
  bio?: string;
  profile_photo?: string | null;
  email?: string;
  mobile?: string;
  designation?: string;
  occupation?: string;
  category?: string;
}

const UserDetails = () => {
  const { id } = useLocalSearchParams();
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMember = async () => {
      try {
        const result = await getProfile(id);
        console.log('result: ' + JSON.stringify(result));
        
        if (result.success && result.data) {
          // The response now directly contains the user data
          setMember(result.data);
        } else {
          setError(result.message || 'Failed to load member details');
        }
      } catch (error) {
        console.error('Error loading member:', error);
        setError('Failed to load member details');
      } finally {
        setLoading(false);
      }
    };

    loadMember();
  }, [id]);

  const handleCall = () => {
    if (member?.mobile) {
      Linking.openURL(`tel:${member.mobile}`);
    }
  };

  const handleEmail = () => {
    if (member?.email) {
      Linking.openURL(`mailto:${member.email}`);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#042117" />
      </View>
    );
  }

  if (error || !member) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error || 'Member not found'}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      {/* <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#042117" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Member Profile</Text>
        <View style={styles.placeholder} />
      </View> */}

      <ScrollView style={styles.scrollView}>
        {/* Cover and Profile Section */}
        <View style={styles.coverContainer}>
          <View style={styles.coverBg} />
          <View style={styles.profileImageContainer}>
            {member.profile_photo ? (
              <Image 
                source={{ 
                  uri: member.profile_photo.startsWith('http') 
                    ? member.profile_photo 
                    : `${BASE_URL}public/storage/${member.profile_photo}` 
                }}
                style={styles.profileImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.placeholderImage}>
                <Ionicons name="person" size={60} color="#999" />
              </View>
            )}
          </View>
        </View>

        {/* Name and Title */}
        <View style={styles.userInfoContainer}>
          <Text style={styles.userName}>{member.name}</Text>
          {member.designation && (
            <Text style={styles.userTitle}>{member.designation}</Text>
          )}
          {member.category && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{member.category}</Text>
            </View>
          )}
        </View>

        {/* Bio */}
        {member.bio && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.bioText}>{member.bio}</Text>
          </View>
        )}

        {/* Quick Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          {member.mobile && (
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleCall}
            >
              <View style={styles.actionIconContainer}>
                <Ionicons name="call" size={22} color="#fff" />
              </View>
              <Text style={styles.actionText}>Call</Text>
            </TouchableOpacity>
          )}
          
          {member.email && (
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleEmail}
            >
              <View style={[styles.actionIconContainer, { backgroundColor: '#4CAF50' }]}>
                <Ionicons name="mail" size={22} color="#fff" />
              </View>
              <Text style={styles.actionText}>Email</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Contact Information */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          
          {member.email && (
            <View style={styles.infoRow}>
              <Ionicons name="mail-outline" size={20} color="#042117" style={styles.infoIcon} />
              <Text style={styles.infoText}>{member.email}</Text>
            </View>
          )}
          
          {member.mobile && (
            <View style={styles.infoRow}>
              <Ionicons name="call-outline" size={20} color="#042117" style={styles.infoIcon} />
              <Text style={styles.infoText}>{member.mobile}</Text>
            </View>
          )}
        </View>

        {/* Business Information */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Business Information</Text>
          
          {member.company && (
            <View style={styles.infoRow}>
              <Ionicons name="business-outline" size={20} color="#042117" style={styles.infoIcon} />
              <Text style={styles.infoText}>{member.company}</Text>
            </View>
          )}
          
          {member.occupation && (
            <View style={styles.infoRow}>
              <Ionicons name="briefcase-outline" size={20} color="#042117" style={styles.infoIcon} />
              <Text style={styles.infoText}>{member.occupation}</Text>
            </View>
          )}
        </View>

        {/* Bottom space */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    color: '#042117',
    textAlign: 'center',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#042117',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  coverContainer: {
    position: 'relative',
    height: 180,
  },
  coverBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 140,
    backgroundColor: '#042117',
  },
  profileImageContainer: {
    position: 'absolute',
    bottom: 0,
    left: width / 2 - 60,
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#fff',
    backgroundColor: '#f5f5f5',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
  },
  userInfoContainer: {
    marginTop: 70,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#042117',
    marginBottom: 4,
    textAlign: 'center',
  },
  userTitle: {
    fontSize: 16,
    color: '#444D5D',
    marginBottom: 8,
    textAlign: 'center',
  },
  categoryBadge: {
    backgroundColor: '#042117',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    marginTop: 8,
  },
  categoryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  sectionContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#042117',
    marginBottom: 16,
  },
  bioText: {
    fontSize: 16,
    color: '#444D5D',
    lineHeight: 24,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  actionButton: {
    alignItems: 'center',
    marginHorizontal: 20,
  },
  actionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    color: '#444D5D',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoIcon: {
    marginRight: 12,
  },
  infoText: {
    fontSize: 16,
    color: '#444D5D',
    flex: 1,
  },
  bottomSpacing: {
    height: 40,
  },
});

export default UserDetails;