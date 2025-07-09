import React, { useState, useEffect } from 'react'
import { View, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, Modal, ScrollView, StyleSheet, ActivityIndicator, Alert } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import Toast from 'react-native-toast-message'
import { addVisitorData, storeVisitor } from '@/utils/api'


interface VisitorData {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    company?: string;
    businessCategory?: string;
}

const Visitor = () => {
    const [name, setName] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [phone, setPhone] = useState<string | undefined>(undefined);
    const [address, setAddress] = useState<string>('');
    const [company, setCompany] = useState<string>('');
    const [businessCategory, setBusinessCategory] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const handleValidation = () => {
        let errors: { [key: string]: string } = {};

        if (!name) errors.name = "Name is required!";
        if (!phone) errors.phone = "Phone is required!";
        if (!company) errors.company = "Company is required!";
        if (!businessCategory) errors.businessCategory = "Business Category is required!";
        setErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = () => {
        if (!handleValidation()) return // if validation fails then stop

        if (name && phone && company && businessCategory) { //checking if all are filled.
            setIsSubmitting(true);
            const payload: addVisitorData = {
                name,
                email,
                phone,
                address,
                company,
                businessCategory,
            };

            storeVisitor(payload)
                .then((res) => {
                    setIsSubmitting(false);
                    // ✅ Check if response contains an actual success flag
                    if (res.success) {
                        Toast.show({ type: 'success', text1: 'Submitted!' });
                    } else {
                        // Show error toast or alert
                        Alert.alert('Submission failed', res.message || 'Unknown error');
                    }
                })
                .catch((err) => {
                    console.error(err);
                    Alert.alert('Submission failed', 'Network or server error');
                    setIsSubmitting(false);
                });
        } else {
            Alert.alert('Missing required fields');
        }
    }
    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView style={styles.container}>
                <Text style={styles.formTitle}>Visitor Form</Text>
                <Text>Please Fill out this form to become a visitor in our next meeting.</Text>
                <View style={styles.input}>
                    <Text style={styles.header}>Name<Text style={styles.wildcard}>*</Text></Text>
                    <TextInput value={name} onChangeText={setName} placeholder="Enter Your Name" style={styles.textInput} />
                    {errors.name ? <Text style={styles.errorText} >{errors.name}</Text> : null}
                </View>
                <View style={styles.input}>
                    <Text style={styles.header}>Email</Text>
                    <TextInput keyboardType='email-address' onChangeText={setEmail} value={email} placeholder="Enter Your Email" style={styles.textInput} />

                </View>
                <View style={styles.input}>
                    <Text style={styles.header}>Phone<Text style={styles.wildcard}>*</Text> </Text>
                    <TextInput keyboardType='phone-pad' onChangeText={setPhone} value={phone} placeholder="Enter Your Phone" style={styles.textInput} />
                    {errors.phone ? <Text style={styles.errorText} >{errors.phone}</Text> : null}

                </View>
                <View style={styles.input}>
                    <Text style={styles.header}>Address</Text>
                    <TextInput value={address} onChangeText={setAddress} placeholder="Enter Your Address" style={styles.textInput} />
                </View>
                <View style={styles.input}>
                    <Text style={styles.header}>Company<Text style={styles.wildcard}>*</Text> </Text>
                    <TextInput value={company} onChangeText={setCompany} placeholder="Enter Your Company" style={styles.textInput} />
                    {errors.company ? <Text style={styles.errorText} >{errors.company}</Text> : null}

                </View>
                <View style={styles.input}>
                    <Text style={styles.header}>Business Category<Text style={styles.wildcard}>*</Text> </Text>
                    <TextInput value={businessCategory} onChangeText={setBusinessCategory} placeholder="Enter Business Category" style={styles.textInput} />
                    {errors.businessCategory ? <Text style={styles.errorText} >{errors.businessCategory}</Text> : null}
                </View>
                <View style={styles.input} >
                    <TouchableOpacity disabled={isSubmitting} onPress={handleSubmit} style={styles.formButton} >
                        <Text style={styles.buttonText}>{isSubmitting ? 'Submitting...' : 'Submit'}</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );

};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
    },
    input: {
        margin: 5,
    },
    formTitle: {
        fontWeight: 'bold',
        fontSize: 48,
        color: 'darkgreen',
        paddingTop: 20,
    },
    header: {
        fontSize: 20,
        color: 'black',
        fontWeight: 'bold',
        paddingVertical: 5
    },
    textInput: {
        backgroundColor: 'white',
        borderWidth: 1,
        paddingHorizontal: 8,
        borderRadius: 2,
        borderColor: 'black',
        color: 'black'
    },
    formButton: {
        padding: 10,
        color: 'white',
        backgroundColor: 'darkgreen',
        borderRadius: 5,
        marginVertical: 10,
    },
    buttonText: {
        textAlign: 'center',
        color: 'white',
        fontWeight: 'bold',
        fontSize: 18,
    },
    errorText: {
        color: 'red',
        paddingVertical: 8,
    },
    wildcard: {
        color: 'red',
        fontSize: 16,
    },
});
export default Visitor;