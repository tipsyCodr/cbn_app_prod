import { View, Text, Linking } from 'react-native'
import React from 'react'
import { SvgXml } from 'react-native-svg'
import { Link } from 'expo-router';

interface BigButtonsProps {
    url: any;
    svg: string;
    title: string;
}

const BigButtons = ({url, svg, title}: BigButtonsProps  ) => {
  return (
    <Link href={url}>
        <View className="flex-col items-center">
          <View className="px-10 py-6 rounded-lg bg-accented">
            <SvgXml width="30"height="40" xml={svg}  />
          </View>
          <Text className="text-lg text-center font-[600] text-accented">{title}</Text>
        </View>
    </Link>    
  )
}

export default BigButtons