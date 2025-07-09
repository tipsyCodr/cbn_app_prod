import React, {useEffect, useState} from 'react';
import { View, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import UpdateProfileForm from './UpdateProfileForm';
import {getProfile} from "@/utils/api";
import Toast from "react-native-toast-message";

const EditProfile = () => {
    interface ProfileData {
        name: string;
        email: string;
        mobile: string;
        bio: string;
        category: string;
        company: string;
        profile_photo?: string;
    }

    const [initialValues, setInitialValues] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProfileData();
    }, []);

    const loadProfileData = async () => {
        try {
            setLoading(true);
            const response = await getProfile();
            
            if (response.success && response.data) {
                setInitialValues(response.data);
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: response.message || 'Failed to load profile data',
                });
            }
        } catch (error: any) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error.message || 'Failed to load profile data',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-white">
            <View className="flex-row items-center justify-between px-4 py-3">
                <TouchableOpacity
                    className="p-2"
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={24} color="#042117" />
                </TouchableOpacity>
                <Text className="text-lg font-bold">Edit Profile</Text>
                <View className="w-10" />
            </View>

            {loading ? (
                <View className="items-center justify-center flex-1">
                    <ActivityIndicator size="large" color="#042117" />
                </View>
            ) : initialValues ? (
                <UpdateProfileForm 
                    initialValues={initialValues} 
                    onSuccess={loadProfileData} 
                />
            ) : null}
        </View>
    );
};
export default EditProfile;