import { icons } from "@/assets/constants/icons";
import {Link, router} from "expo-router";
import {Image, Pressable, Text, View} from "react-native";
import { svgs } from "@/assets/constants/svgs";
import { SvgXml } from "react-native-svg";
import {BASE_URL} from "@/utils/globals";


interface ProfileMiniCardProps {
    company: string;
    name: string;
    dueDate: string;
    post: string;
    profile_photo: string;
}
const ProfileMiniCard = ({ company, name, dueDate, post, profile_photo }: ProfileMiniCardProps) => {
    return(
      <Pressable className=""  onPress={() => router.push({
          pathname: '/pages/profile',
          params: {
              name: encodeURIComponent(name),
              company: encodeURIComponent(company),
              post: encodeURIComponent(post),
              profile_photo: encodeURIComponent(profile_photo)
          }
      })
      }>
        <View className="flex-row items-center justify-between ">  
          <View className="flex-row items-center gap-2">
              {/*<Image*/}
              {/*    source={*/}
              {/*        profile_photo*/}
              {/*            ? { uri: BASE_URL + "public/storage/" + profile_photo }*/}
              {/*            : icons.profile*/}
              {/*    }*/}
              {/*    className="rounded-full w-26 h-26"*/}
              {/*/>*/}

              {/*<Image*/}
              {/*  source=icons.profile*/}
              {/*  className="rounded-full w-26 h-26"*/}
              {/*/>*/}
              <Image
                  source={{uri: BASE_URL + "public/storage/" + profile_photo}}
                  className="rounded-full w-24 h-24"
                  onError={(error) => console.log('Image loading error:', error)}
                  defaultSource={icons.profile}
              />
              {/*<Text className="text-lg font-bold text-primary">{BASE_URL+ "public/storage/" +profile_photo}</Text>*/}
              <View className="ml-1">
              <Text className="text-lg font-black uppercase text-accented">{name}</Text>
              <Text className="text-sm font bold text-orange">{post}</Text>
              <Text className="text-sm text-gray-500">{company}</Text>
              <Text className="text-sm text-gray-500">Due Date: {dueDate}</Text>
            </View>
          </View>
          <View className="flex-row items-end">
              <Link
                  href={{
                      pathname: "/pages/profile",
                      params: {
                          name: encodeURIComponent(name),
                          company: encodeURIComponent(company),
                          // post: encodeURIComponent(post),
                          profile_photo: encodeURIComponent(profile_photo)
                      }
                  }}
              >
                  <Text className="text-6xl font-bold text-accented">
                      <SvgXml width='20' height='20' xml={svgs.right} />
                  </Text>
              </Link>

          </View>
        </View>
      </Pressable>
    );
  }

export default ProfileMiniCard;