import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    ScrollView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';
import {updateProfile, updateProfilePhoto} from "@/utils/api";
import { BASE_URL } from '@/utils/globals';

interface UpdateProfileFormProps {
    initialValues?: {
        name: string;
        email: string;
        category: string;
        company: string;
        mobile: string;
        bio: string;
        profile_photo?: string;
    };
    onSuccess?: () => void;  // Add this line

}

const UpdateProfileForm = ({ initialValues, onSuccess }: UpdateProfileFormProps) => {
    const [formData, setFormData] = useState({
        name: initialValues?.name || '',
        email: initialValues?.email || '',
        mobile: initialValues?.mobile || '',
        category: initialValues?.category || '',
        company: initialValues?.company || '',
        bio: initialValues?.bio || '',
        profile_photo: initialValues?.profile_photo || '',
    });

    const [loading, setLoading] = useState(false);
    const [imageLoading, setImageLoading] = useState(false);

    const pickImage = async () => {
        try {
            setImageLoading(true);

            // Request permissions-
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission needed', 'Please grant permission to access your photos');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                // mediaTypes: ImagePicker.MediaType.Images
                mediaTypes:['images'],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled) {
                setFormData(prev => ({
                    ...prev,
                    profile_photo: result.assets[0].uri
                }));
            }
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to pick image',
            });
        } finally {
            setImageLoading(false);
        }
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);

            // Validate form data
            if (!formData.name.trim() || !formData.email.trim() || !formData.mobile.trim()) {
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: 'Please fill in all required fields',
                });
                return;
            }

            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: 'Please enter a valid email address',
                });
                return;
            }

            // Handle profile photo upload separately if it's a new photo
            if (formData.profile_photo && formData.profile_photo.startsWith('file://')) {
                const photoResponse = await updateProfilePhoto(formData.profile_photo);
                if (!photoResponse.success) {
                    Toast.show({
                        type: 'error',
                        text1: 'Error',
                        text2: photoResponse.message || 'Failed to upload profile photo',
                    });
                }
            }

            // Create a copy of formData without the profile_photo for the main profile update
            const { profile_photo, ...profileData } = formData;
            
            // Only update profile data (photo is handled separately)
            const response = await updateProfile(profileData);

            if (response.success) {
                Toast.show({
                    type: 'success',
                    text1: 'Success',
                    text2: 'Profile updated successfully',
                });
                
                // Call the onSuccess callback if provided
                if (onSuccess) {
                    onSuccess();
                }
                
                router.back();
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: response.message || 'Failed to update profile',
                });
            }
        } catch (error: any) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error.message || 'Failed to update profile',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView className="flex-1 bg-white">
            <View className="p-4">
                {/* Profile Photo */}
                <View className="items-center mb-6">
                    <TouchableOpacity
                        onPress={pickImage}
                        className="relative"
                        disabled={imageLoading}
                    >
                        <View className="w-32 h-32 overflow-hidden bg-gray-200 rounded-full">
                            {imageLoading ? (
                                <View className="items-center justify-center flex-1">
                                    <ActivityIndicator color="#042117" />
                                </View>
                            ) : formData.profile_photo ? (
                                <Image
                                    source={{ 
                                        uri: formData.profile_photo.startsWith('file://') 
                                            ? formData.profile_photo 
                                            : `${BASE_URL}public/storage/${formData.profile_photo}` 
                                    }}
                                    className="w-full h-full"
                                />
                            ) : (
                                <View className="items-center justify-center flex-1">
                                    <Ionicons name="person" size={64} color="#999" />
                                </View>
                            )}
                        </View>
                        <View className="absolute bottom-0 right-0 p-2 rounded-full bg-accented">
                            <Ionicons name="camera" size={20} color="white" />
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Form Fields */}
                <View className="space-y-4">
                    {/* Name */}
                    <View>
                        <Text className="mb-1 text-sm font-medium text-gray-600">Name *</Text>
                        <TextInput
                            className="p-3 bg-white border border-gray-300 rounded-lg"
                            value={formData.name}
                            onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                            placeholder="Enter your name"
                        />
                    </View>

                    {/* Email */}
                    <View>
                        <Text className="mb-1 text-sm font-medium text-gray-600">Email *</Text>
                        <TextInput
                            className="p-3 bg-white border border-gray-300 rounded-lg"
                            value={formData.email}
                            onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
                            placeholder="Enter your email"
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>
                    {/* Category */}
                    <View>
                        <Text className="mb-1 text-sm font-medium text-gray-600">Category *</Text>
                        <TextInput
                            className="p-3 bg-white border border-gray-300 rounded-lg"
                            value={formData.category}
                            onChangeText={(text) => setFormData(prev => ({ ...prev, category: text }))}
                            placeholder="Add Category"
                            autoCapitalize="none"
                        />
                    </View>
                    {/* Company */}
                    <View>
                        <Text className="mb-1 text-sm font-medium text-gray-600">Company *</Text>
                        <TextInput
                            className="p-3 bg-white border border-gray-300 rounded-lg"
                            value={formData.company}
                            onChangeText={(text) => setFormData(prev => ({ ...prev, company: text }))}
                            placeholder="Add Company"
                            autoCapitalize="none"
                        />
                    </View>

                    {/* Mobile */}
                    <View>
                        <Text className="mb-1 text-sm font-medium text-gray-600">Mobile *</Text>
                        <TextInput
                            className="p-3 bg-white border border-gray-300 rounded-lg"
                            value={formData.mobile}
                            onChangeText={(text) => setFormData(prev => ({ ...prev, mobile: text }))}
                            placeholder="Enter your mobile number"
                            keyboardType="phone-pad"
                        />
                    </View>

                    {/* Bio */}
                    <View>
                        <Text className="mb-1 text-sm font-medium text-gray-600">Bio</Text>
                        <TextInput
                            className="p-3 bg-white border border-gray-300 rounded-lg"
                            value={formData.bio}
                            onChangeText={(text) => setFormData(prev => ({ ...prev, bio: text }))}
                            placeholder="Write something about yourself"
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                        />
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity
                        className="p-4 mt-6 rounded-lg bg-accented"
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-lg font-semibold text-center text-white">
                                Update Profile
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
            <Toast />
        </ScrollView>
    );
};

export default UpdateProfileForm;