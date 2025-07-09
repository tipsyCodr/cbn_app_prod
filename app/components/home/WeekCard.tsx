import { Text, View } from "react-native";
import { Link } from "expo-router";
import { svgs } from "@/assets/constants/svgs";
import { SvgXml } from "react-native-svg";

interface CardProps {
  title: string;
  slips?: {
    tyfcbs?: number | null;
    referrals?: number | null;
    ceus?: number | null;
    oneToOnes?: number | null;
  };
}

const WeekCard = ({ title, slips }: CardProps) => {
  // Format numbers with comma separators
  const formatNumber = (num: number | null | undefined) => {
    if (num === undefined || num === null) return "0";
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
    <View className="py-6 my-3 border-2 border-orange" style={{ borderRadius: 10}} >
     <View className="flex-row justify-between w-full px-4">
      <Text className="text-lg font-bold text-center text-primary">{title}</Text>
      {/*<View className="flex-row justify-center w-full gap-4">*/}
      {/*  <Link href="/(tabs)/slips/print" className="text-xs font-bold text-center text-primary"> */}
      {/*    <SvgXml xml={svgs.print} width='24' height='24' />*/}
      {/*  </Link>*/}
      {/*  <Link href="/(tabs)/slips/export" className="text-xs font-bold text-center text-primary"> */}
      {/*    <SvgXml xml={svgs.view}  width='24' height='24'/>*/}
      {/*  </Link>*/}
      {/*</View>*/}
     </View>
     <View className="flex-col items-center justify-center gap-4 p-4 mx-6 mt-2 text-primary ">
        <View className="flex-row justify-between w-full">
          <View className="flex-row items-center gap-2">
            {/* <Image source={icons.} className="w-6 h-6" /> */}
            <Text className="text-lg font-semibold text-primary">TYFCBs:</Text>
          </View>
          <Link href="/forms/tyfcb">
            <Text className="text-lg font-semibold text-accented">{formatNumber(slips?.tyfcbs)} +</Text>
          </Link>
        </View>
        <View className="flex-row justify-between w-full">
          <View className="flex-row items-center gap-2">
            <Text className="text-lg font-semibold text-primary">Referrals:</Text>
          </View>
          <Link href="/forms/referral">
            <Text className="text-lg font-semibold text-accented">{formatNumber(slips?.referrals)} +</Text>
          </Link>
        </View>
        {/*<View className="flex-row justify-between w-full">*/}
        {/*  <View className="flex-row items-center gap-2">*/}
        {/*    <Text className="text-lg font-semibold text-primary">CEUs:</Text>*/}
        {/*  </View>*/}
        {/*  /!* <Link href="/(tabs)/slips/forms/ceu"> *!/*/}
        {/*    <Text className="text-lg font-semibold text-accented">{formatNumber(slips?.ceus)} +</Text>*/}
        {/*  /!* </Link> *!/*/}
        {/*</View>*/}
        <View className="flex-row justify-between w-full">
          <View className="flex-row items-center gap-2">
            <Text className="text-lg font-semibold text-primary">One to Ones:</Text>
          </View>
          <Link href="/forms/one-to-one">
            <Text className="text-lg font-semibold text-accented">{formatNumber(slips?.oneToOnes)} +</Text>
          </Link>
        </View>
      </View>
    </View>
  );
} 

export default WeekCard;
