import { View, Text, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { ReactNode } from "react";
import { Link } from "expo-router";

interface ReportData {
  tyfcbGiven?: number | null;
  referralsGiven?: number | null;
  visitors?: number | null;
  oneToOne?: number | null;
  referralsReceived?: number | null;
  revenueReceived?: number | null;
  // ceus?: number | null;
}

interface CardProps {
  title: string;
  reports?: {
    six_months?: ReportData;
    twelve_months?: ReportData;
    lifetime?: ReportData;
  };
}

const ReportCard = ({ title, reports }: CardProps) => {
  const [timeframe, setTimeframe] = useState<'six_months' | 'twelve_months' | 'lifetime'>('twelve_months');
  
  // Format numbers with comma separators
  const formatNumber = (num: number | null | undefined) => {
    if (num === undefined || num === null) return "0";
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  
  // Get the correct report data based on the selected timeframe
  const getReportData = () => {
    if (!reports) return {};
    
    switch(timeframe) {
      case 'six_months':
        return reports.six_months || {};
      case 'twelve_months':
        return reports.twelve_months || {};
      case 'lifetime':
        return reports.lifetime || {};
      default:
        return reports.twelve_months || {};
    }
  };
  
  const reportData = getReportData();
  
  return (
    <View className="py-6 my-3 border-2 border-orange " style={{ borderRadius: 10}} >
     <View className="flex-row justify-between w-full px-4">
      <Text className="text-lg font-bold text-center text-primary">{title}</Text>
      <View className="flex-row justify-center w-full">
        <TouchableOpacity 
          onPress={() => setTimeframe('six_months')}
          className={`px-2 ${timeframe === 'six_months' ? 'border-b-2 border-orange' : ''}`}
        >
          <Text className={`text-xs font-bold text-center ${timeframe === 'six_months' ? 'text-accented' : 'text-primary'}`}>
            6 MONTHS
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => setTimeframe('twelve_months')}
          className={`px-2 ${timeframe === 'twelve_months' ? 'border-b-2 border-orange' : ''}`}
        >
          <Text className={`text-xs font-bold text-center ${timeframe === 'twelve_months' ? 'text-accented' : 'text-primary'}`}>
            12 MONTHS
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => setTimeframe('lifetime')}
          className={`px-2 ${timeframe === 'lifetime' ? 'border-b-2 border-orange' : ''}`}
        >
          <Text className={`text-xs font-bold text-center ${timeframe === 'lifetime' ? 'text-accented' : 'text-primary'}`}>
            LIFETIME
          </Text>
        </TouchableOpacity>
      </View>
    </View>
     
    <View className="flex-col items-center justify-center gap-4 p-4 mx-6 mt-2 text-primary ">
        {/*One to One*/}
        <View className="flex-row justify-between w-full">
          <View className="flex-row items-center gap-2">
            <Text className="text-lg font-semibold text-primary">One to One:</Text>
          </View>
          <Text className="text-lg font-semibold text-accented">{formatNumber(reportData.oneToOne)}</Text>
        </View>

        {/*Referrals Given*/}
        <View className="flex-row justify-between w-full">
        <View className="flex-row items-center gap-2">
          <Text className="text-lg font-semibold text-primary">Referrals Given:</Text>
        </View>
        <Text className="text-lg font-semibold text-accented">{formatNumber(reportData.referralsGiven)}</Text>
      </View>

        {/*Referrals Received*/}
        <View className="flex-row justify-between w-full">
        <View className="flex-row items-center gap-2">
          <Text className="text-lg font-semibold text-primary">Referrals Received:</Text>
        </View>
        <Text className="text-lg font-semibold text-accented">{formatNumber(reportData.referralsReceived)}</Text>
      </View>

        {/*TYFCB  */}
        <View className="flex-row justify-between w-full">
            <View className="flex-row items-center gap-2">
              <Text className="text-lg font-semibold text-primary">TYFCB Given:</Text>
            </View>
            <Text className="text-lg font-semibold text-accented">₹{formatNumber(reportData.tyfcbGiven)}</Text>
          </View>

        {/*Revenue Received*/}
        <View className="flex-row justify-between w-full">
        <View className="flex-row items-center gap-2">
          <Text className="text-lg font-semibold text-primary">Revenue Received:</Text>
        </View>
        <Text className="text-lg font-semibold text-accented"> ₹ {formatNumber(reportData.revenueReceived)}</Text>
      </View>

        {/*Visitors*/}
        <View className="flex-row justify-between w-full">
          <View className="flex-row items-center gap-2">
            <Text className="text-lg font-semibold text-primary">Visitors:</Text>
          </View>
          <Text className="text-lg font-semibold text-accented">{formatNumber(reportData.visitors)}</Text>
        </View>




        {/*<View className="flex-row justify-between w-full">*/}
        {/*  <View className="flex-row items-center gap-2">*/}
        {/*    <Text className="text-lg font-semibold text-primary">CEUs:</Text>*/}
        {/*  </View>*/}
        {/*  <Text className="text-lg font-semibold text-accented">{formatNumber(reportData.ceus)}</Text>*/}
        {/*</View>*/}
      </View>
    </View>
  )
}

export default ReportCard