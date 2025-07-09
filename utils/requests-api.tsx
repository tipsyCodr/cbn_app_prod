import * as SecureStore from 'expo-secure-store';
import { parseErrorMessage } from '@/utils/form-api';

const API_BASE_URL = 'https://cbnindia.in/api';

export async function fetchRequests() {
  try {
    const token = await SecureStore.getItemAsync('userToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/api/requests`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    // First get the raw response text
    const rawResponse = await response.text();
    
    let responseData;
    try {
      // Try to parse as JSON
      responseData = JSON.parse(rawResponse);
    } catch (e) {
      // If parsing fails, it might be HTML error
      const cleanError = parseErrorMessage(rawResponse);
      throw new Error(cleanError);
    }

    if (!response.ok) {
      const errorMessage = responseData.message || 
                           responseData.error || 
                           (typeof responseData === 'string' ? parseErrorMessage(responseData) : 'Failed to fetch requests');
      throw new Error(errorMessage);
    }

    return { success: true, data: responseData };
  } catch (error: any) {
    console.error('Fetch requests error:', error);
    const errorMessage = error.message ? parseErrorMessage(error.message) : 'An unexpected error occurred';
    return { success: false, message: errorMessage };
  }
}
