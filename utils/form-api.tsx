import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = 'https://cbnindia.in/api';

// Helper function to parse HTML error messages
export const parseErrorMessage = (htmlString: string): string => {
  try {
    // If it's a JSON string, try to parse it
    const jsonData = JSON.parse(htmlString);
    return jsonData.message || jsonData.error || JSON.stringify(jsonData);
  } catch {
    // If it's HTML, strip tags and decode entities
    return htmlString
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&nbsp;/g, ' ')
      .trim();
  }
};

// Helper function to get auth token
const getAuthToken = async () => {
  try {
    const token = await SecureStore.getItemAsync('userToken');
    if (!token) {
      throw new Error('Authentication token not found');
    }
    
    // If the token is a JSON string (e.g., objects that were stringified)
    // try to parse it to get the actual token value
    try {
      const parsedToken = JSON.parse(token);
      // If parsed successfully, and it's a string or object with a token property, use that
      if (typeof parsedToken === 'string') {
        return parsedToken;
      } else if (parsedToken && parsedToken.token) {
        return parsedToken.token;
      }
    } catch (parseError) {
      // If parsing fails, it's likely already a string token, so just return it
    }
    
    return token;
  } catch (error) {
    console.error('Error getting token:', error);
    throw error;
  }
};

// Submit TYFCB form
export async function submitTYFCB(data: {
  thankYouTo: string | number;
  amount: string | number;
  businessType: 'New' | 'Repeat';
  referralType: 'Inside' | 'Outside' | 'Tier3+';
  comment?: string;
}) {
  try {
    const token = await getAuthToken();
    const response = await fetch(`${API_BASE_URL}/tyfcb-requests/store`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        to: data.thankYouTo,
        amount: typeof data.amount === 'string' ? parseFloat(data.amount) : data.amount,
        business_type: data.businessType.toLowerCase(),
        referral_type: data.referralType.toLowerCase(),
        comments: data.comment || '',
        active: 1
      })
    });
    

    const responseData = await response.json();
    
    if (!response.ok) {
      throw new Error(responseData.message || 'Failed to submit TYFCB');
    }
    
    return { success: true, data: responseData };
  } catch (error: any) {
    console.error('TYFCB submission error:', error);
    return { success: false, message: error.message };
  }
}

interface ReferralData {
  to: string;
  referral_type: 'inside' | 'outside';
  referral_status: 'told_them_you_would_call' | 'given_card';
  referral_contact_name: string;
  referral_contact_no?: string;
  referral_contact_email: string;
  mobile: string;
  address: string;
  comments: string;
  referral_hotness: string;
}

// Submit Referral form
export async function submitReferral(data: ReferralData) {
  try {
    const token = await getAuthToken();
    // Prepare data with the correct structure expected by the server
    const referralPayload = {
      to: data.to,
      referral_type: data.referral_type,
      referral_status: data.referral_status,
      referral_contact_name: data.referral_contact_name,
      referral_contact_email: data.referral_contact_email,
      referral_contact_no: data.referral_contact_no,
      // mobile: data.mobile || data.referral_contact_no, // Use mobile field instead of referral_contact_no
      address: data.address,
      comments: data.comments,
      referral_hotness: data.referral_hotness
    };
    
    const response = await fetch(`${API_BASE_URL}/referrals/store`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(referralPayload)
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
                         (typeof responseData === 'string' ? parseErrorMessage(responseData) : 'Failed to submit referral');
      throw new Error(errorMessage);
    }

    return { success: true, data: responseData };
  } catch (error: any) {
    console.error('Referral submission error:', error);
    const errorMessage = error.message ? parseErrorMessage(error.message) : 'An unexpected error occurred';
    return { success: false, message: errorMessage };
  }
}

// Submit One-to-One form
export async function submitOneToOne(data: {
  met_with: string;
  initiated_by: string;
  meeting_location: string;
  meeting_date: Date;
  topics: string;
}) {
  try {
    const token = await getAuthToken();
    const response = await fetch(`${API_BASE_URL}/oto-requests/store`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        met_with: data.met_with,
        initiated_by: data.initiated_by,
        meeting_location: data.meeting_location,
        meeting_date: data.meeting_date.toISOString().split('T')[0], // Format as YYYY-MM-DD
        topics: data.topics
      })
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
                         (typeof responseData === 'string' ? parseErrorMessage(responseData) : 'Failed to submit one-to-one meeting');
      throw new Error(errorMessage);
    }

    return { success: true, data: responseData };
  } catch (error: any) {
    console.error('One-to-one submission error:', error);
    const errorMessage = error.message ? parseErrorMessage(error.message) : 'An unexpected error occurred';
    return { success: false, message: errorMessage };
  }
}

// Get chapter members list
export async function getMembers() {
  try {
    const token = await getAuthToken();
    const response = await fetch(`${API_BASE_URL}/users/by-chapter`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });


    const rawResponse = await response.text();
    let responseData;
    try {
      responseData = JSON.parse(rawResponse);
      console.log('Parsed response:', responseData);
    } catch (e) {
      const cleanError = parseErrorMessage(rawResponse);
      throw new Error(cleanError);
    }

    if (!response.ok) {
      throw new Error(responseData.message || 'Failed to get members');
    }

    // Extract relevant member information from the users array
    const members = responseData.users
        .filter((user: any) => user && user.id) // Filter out users without IDs
        .map((user: any) => ({
          id: user.id,
          name: user.name || 'Unknown',
          email: user.email,
          designation: user.designation,
          occupation: user.occupation,
          company: user.company,
          mobile: user.mobile,
          category: user.category,
          profile_photo: user.profile_photo,
        specialty: user.specialty,
          location: user.location || '',
          address: user.address || '',
      }));
    
    return { 
      success: true, 
      data: members 
    };
  } catch (error: any) {
    console.error('Get members error:', error);
    const errorMessage = error.message ? parseErrorMessage(error.message) : 'An unexpected error occurred';
    return { 
      success: false, 
      message: errorMessage, 
      data: [] 
    };
  }
}

// Get categories for filtering members
export async function getCategories() {
  try {
    const token = await getAuthToken();
    const response = await fetch(`${API_BASE_URL}/categories`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const rawResponse = await response.text();
    // console.log('Raw Get Categories response:', rawResponse);
    let responseData;
    try {
      responseData = JSON.parse(rawResponse);
    } catch (e) {
      const cleanError = parseErrorMessage(rawResponse);
      throw new Error(cleanError);
    }

    if (!response.ok) {
      throw new Error(responseData.message || 'Failed to get categories');
    }

    return {
      success: true,
      data: responseData.categories || []
    };
  } catch (error: any) {
    console.error('Get categories error:', error);
    const errorMessage = error.message ? parseErrorMessage(error.message) : 'An unexpected error occurred';
    return {
      success: false,
      message: errorMessage,
      data: []
    };
  }
}

// Get worldwide members list
export async function getWorldwideMembers() {
    try {
        const token = await getAuthToken();
        const response = await fetch(`${API_BASE_URL}/worldwide-users`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        const rawResponse = await response.text();
        let responseData;
        try {
            responseData = JSON.parse(rawResponse);
        } catch (e) {
            const cleanError = parseErrorMessage(rawResponse);
            throw new Error(cleanError);
        }

        if (!response.ok) {
            throw new Error(responseData.message || 'Failed to get worldwide members');
        }

        // Extract relevant member information from the users array
      const members = responseData.users
          .filter((user: any) => user && user.id) // Filter out users without IDs
          .map((user: any) => ({
            id: user.id,
            name: user.name || 'Unknown',
            email: user.email,
            designation: user.designation,
            occupation: user.occupation,
            company: user.company,
            mobile: user.mobile,
            category: user.category,
            profile_photo: user.profile_photo,
            specialty: user.specialty,
            location: user.location || '',
            address: user.address || '',
          }));

      return {
            success: true,
            data: members
        };
    } catch (error: any) {
        console.error('Get worldwide members error:', error);
        const errorMessage = error.message ? parseErrorMessage(error.message) : 'An unexpected error occurred';
        return {
            success: false,
            message: errorMessage,
            data: []
        };
    }
}

// Get member list for dropdowns
export async function getProfile( id : any ) {
  try {
    const token = await getAuthToken();
    const response = await fetch(`${API_BASE_URL}/get-profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ id: id }),
    });

    const rawResponse = await response.text();
    let responseData;
    try {
      responseData = JSON.parse(rawResponse);
    } catch (e) {
      const cleanError = parseErrorMessage(rawResponse);
      throw new Error(cleanError);
    }

    if (!response.ok) {
      throw new Error(responseData.message || 'Failed to get profile');
    }

    // Handle the actual response format which has a single user object
    if (responseData.status === 'success' && responseData.user) {
      // Return the single user data
      const user = responseData.user;
      const userData = {
        id: user.id,
        name: user.name,
        email: user.email,
        designation: user.designation,
        occupation: user.occupation,
        company: user.company,
        mobile: user.mobile,
        category: user.category,
        bio: user.bio,
        profile_photo: user.profile_photo,
      };
      
      return { 
        success: true, 
        data: userData 
      };
    } 
    // Fallback for the old format with a users array
    else if (responseData.users && Array.isArray(responseData.users)) {
      // Extract relevant member information from the users array
      const members = responseData.users.map((user: any) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        designation: user.designation,
        occupation: user.occupation,
        company: user.company,
        mobile: user.mobile,
        category: user.category,
        profile_photo: user.profile_photo,
      }));
      
      return { 
        success: true, 
        data: members 
      };
    } else {
      console.log('No valid user data available in the response');
      return { 
        success: true, 
        data: null 
      };
    }
    
  } catch (error: any) {
    console.error('Get profile error:', error);
    const errorMessage = error.message ? parseErrorMessage(error.message) : 'An unexpected error occurred';
    return { 
      success: false, 
      message: errorMessage, 
      data: null 
    };
  }
} 