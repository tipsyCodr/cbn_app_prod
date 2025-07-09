import { View, Text, ActivityIndicator, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { svgs } from '@/assets/constants/svgs'
import { SvgXml } from 'react-native-svg'
import { Link, router } from 'expo-router'
import { getNextMeeting, Meeting } from '@/utils/api'
import { format } from 'date-fns'
import { Ionicons } from '@expo/vector-icons'

interface NextMeetingProps {
  meeting?: {
    date?: string | null;
    tyfcb?: string | number | null;
    visitors?: string | number | null;
    speakers?: string | number | null;
    tyfcbThisMonth?: any;
  };
  refreshTrigger?: number; // Add this
}

const NextMeetingCard = ({ meeting: initialMeeting, refreshTrigger ,tyfcbThisMonth }: NextMeetingProps = {}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meeting, setMeeting] = useState<Meeting | null>(null);

  useEffect(() => {
    const fetchMeeting = async () => {
      setLoading(true);
      try {
        const response = await getNextMeeting();
        if (response.success && response.data) {
          setMeeting(response.data);
          console.log(response.data);
          setError(null);
        } else {
          setError(response.message || 'Failed to fetch next meeting');
        }
      } catch (err) {
        console.error('Error fetching next meeting:', err);
        setError('An error occurred while fetching the next meeting');
      } finally {
        setLoading(false);
      }
    };

    fetchMeeting();
  }, [refreshTrigger]);

  // Format function to handle null/undefined values
  const formatValue = (value: any, defaultValue: string) => {
    if (value === null || value === undefined) return defaultValue;
    return value.toString();
  };

  // Format date string to a more readable format
  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return "Not scheduled";
    try {
      const date = new Date(dateString);
      return format(date, "EEEE, yyyy-MM-dd");
    } catch (e) {
      return dateString;
    }
  };

  // If we have API data, use it. Otherwise fall back to the passed props
  const displayMeeting = meeting || initialMeeting;

  return (
    <View className="pt-6 mt-6 border-2 border-orange" style={{ borderRadius: 10}} >
      <View className="flex-row items-center justify-center px-4">
        <Text className="text-lg font-black text-center text-accented">NEXT MEETING</Text>
        
      </View>
      
      {loading ? (
        <View className="items-center p-4">
          <ActivityIndicator size="small" color="#F7941D" />
        </View>
      ) : error ? (
        <Text className="p-2 font-bold text-center text-red-500 text-md">
          {error}
        </Text>
      ) : (
        <>
          <Text className="font-black text-center text-md text-accented">
            {meeting?.name && <Text className="font-bold text-primary">{meeting.name}</Text>}
          </Text>
          <Text className="mt-1 font-black text-center text-md text-accented">
            {formatDate(meeting?.date) || formatValue(initialMeeting?.date, "Wednesday, 2024-01-01")}
          </Text>
          {/* {meeting?.start_time && meeting?.end_time && (
            <Text className="mt-1 text-sm text-center text-primary">
              {meeting.start_time.substring(0, 5)} - {meeting.end_time.substring(0, 5)}
            </Text>
          )} */}
          <View className="flex-col items-center justify-center gap-4 p-4 mx-6 mt-2 ">
            <View className="flex-row justify-between w-full">
              <Text className="text-lg font-semibold text-primary">TYFCB:</Text>
              <Text className="text-lg font-semibold text-primary">
                ₹ {formatValue(tyfcbThisMonth ?? meeting?.tyfcbThisMonth ?? initialMeeting?.tyfcbThisMonth, "₹5.39m")}
                {/*{formatValue(meeting?.tyfcb || initialMeeting?.tyfcb, "₹5.39m")}*/}
              </Text>

            </View>
            <View className="flex-row justify-between w-full">
              <Text className="text-lg font-semibold text-primary">VISITORS:</Text>
              <Text className="text-lg font-semibold text-primary">
                {formatValue(meeting?.visitors || initialMeeting?.visitors, "2")}
              </Text>
            </View>
            <View className="flex-row justify-between w-full">
              <Text className="text-lg font-semibold text-primary">SPEAKERS:</Text>
              <Text className="text-lg font-semibold text-primary">
                {formatValue(meeting?.speakers || initialMeeting?.speakers, "0")}
              </Text>
            </View>
          </View>
          <TouchableOpacity  style={{ borderRadius: 10}} 
            onPress={() => router.push('/meetings')}
            className="w-[95%] p-2 m-2 rounded-md bg-accented">
            <Text className="text-lg font-bold text-center text-white">View All </Text>
            
          </TouchableOpacity>
        </>
      )}
    </View>
  )
}

export default NextMeetingCard