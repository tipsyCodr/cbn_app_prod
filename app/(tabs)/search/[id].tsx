import { View, Text, ScrollView, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getMembers } from '@/utils/form-api';

interface Member {
  id: number;
  name: string;
  company?: string;
  specialty?: string;
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
        const result = await getMembers();
        if (result.success && result.data) {
          const foundMember = result.data.find((m: Member) => m.id.toString() === id);
          if (foundMember) {
            setMember(foundMember);
          } else {
            setError('Member not found');
          }
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

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#042117" />
      </View>
    );
  }

  if (error || !member) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
        <Text style={{ color: '#042117', textAlign: 'center' }}>{error || 'Member not found'}</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>


      <ScrollView style={{ flex: 1 }}>
        {/* Profile Section */}
        <View style={{ alignItems: 'center', padding: 24, borderBottomWidth: 1, borderBottomColor: '#E0E0E0' }}>
          <View style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: '#E0E0E0', justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
            {member.profile_photo ? (
              <Image 
                source={{ uri: member.profile_photo }} 
                style={{ width: 120, height: 120, borderRadius: 60 }}
              />
            ) : (
              <Image 
                source={require('@/assets/icons/user-profile.png')} 
                style={{ width: 80, height: 80, borderRadius: 40 }} 
              />
            )}
          </View>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#042117', marginBottom: 8 }}>{member.name} ({member.id})</Text>
          {member.designation && (
            <Text style={{ fontSize: 16, color: '#444D5D', marginBottom: 4 }}>{member.designation}</Text>
          )}
          {member.category && (
            <Text style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>{member.category}</Text>
          )}
        </View>

        {/* Contact Information */}
        <View style={{ padding: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#444D5D', marginBottom: 16 }}>Contact Information</Text>
          
          {member.email && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Ionicons name="mail-outline" size={20} color="#042117" style={{ marginRight: 12 }} />
              <Text style={{ fontSize: 16, color: '#444D5D' }}>{member.email}</Text>
            </View>
          )}
          
          {member.mobile && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Ionicons name="call-outline" size={20} color="#042117" style={{ marginRight: 12 }} />
              <Text style={{ fontSize: 16, color: '#444D5D' }}>{member.mobile}</Text>
            </View>
          )}
        </View>

        {/* Business Information */}
        <View style={{ padding: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#444D5D', marginBottom: 16 }}>Business Information</Text>
          
          {member.company && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Ionicons name="business-outline" size={20} color="#042117" style={{ marginRight: 12 }} />
              <Text style={{ fontSize: 16, color: '#444D5D' }}>{member.company}</Text>
            </View>
          )}
          
          {member.specialty && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Ionicons name="briefcase-outline" size={20} color="#042117" style={{ marginRight: 12 }} />
              <Text style={{ fontSize: 16, color: '#444D5D' }}>{member.specialty}</Text>
            </View>
          )}
          
          {member.occupation && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Ionicons name="person-outline" size={20} color="#042117" style={{ marginRight: 12 }} />
              <Text style={{ fontSize: 16, color: '#444D5D' }}>{member.occupation}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default UserDetails; 