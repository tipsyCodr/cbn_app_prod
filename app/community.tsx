import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { SvgXml } from 'react-native-svg';
import { icons } from "@/assets/constants/icons";
import UniversalImage from "../components/UniversalImage";
import { svgs } from "@/assets/constants/svgs";
import { useState } from "react";

interface PostProps {
  username: string;
  content: string;
  likes: number;
  comments: number;
  timeAgo: string;
  avatar: any;
}

const Post = ({ username, content, likes, comments, timeAgo, avatar }: PostProps) => (
  <View className="p-4 mb-4 bg-white shadow-sm rounded-xl">
    <View className="flex-row items-center mb-3">
      <Image source={avatar} className="w-10 h-10 rounded-full" />
      <View className="ml-3">
        <Text className="text-base font-bold">{username}</Text>
        <Text className="text-xs text-gray-500">{timeAgo}</Text>
      </View>
    </View>
    <Text className="mb-3 text-base">{content}</Text>
    <View className="flex-row items-center justify-between pt-3 border-t border-gray-100">
      <TouchableOpacity className="flex-row items-center">
        <SvgXml xml={svgs.like} width={20} height={20} color="#042117" />
        <Text className="ml-1 text-gray-600">{likes}</Text>
      </TouchableOpacity>
      <TouchableOpacity className="flex-row items-center">
        <SvgXml xml={svgs.comment} width={20} height={20} color="#042117" />
        <Text className="ml-1 text-gray-600">{comments}</Text>
      </TouchableOpacity>
      <TouchableOpacity className="flex-row items-center">
        <SvgXml xml={svgs.share} width={20} height={20} color="#042117" />
        <Text className="ml-1 text-gray-600">Share</Text>
      </TouchableOpacity>
    </View>
  </View>
);

export default function CommunityScreen() {
  const [posts] = useState([
    {
      id: 1,
      username: "John Doe",
      content: "Just attended an amazing CBN networking event! Met so many inspiring entrepreneurs.",
      likes: 24,
      comments: 8,
      timeAgo: "2h ago",
      avatar: require("@/assets/icons/user-profile.png")
    },
    {
      id: 2,
      username: "Sarah Smith",
      content: "Looking for business partners in the tech industry. Anyone interested in collaboration?",
      likes: 15,
      comments: 12,
      timeAgo: "4h ago",
      avatar: require("@/assets/icons/user-profile.png")
    },
    {
      id: 3,
      username: "Mike Johnson",
      content: "Sharing some insights from our latest business meeting. The market is looking promising!",
      likes: 32,
      comments: 5,
      timeAgo: "6h ago",
      avatar: require("@/assets/icons/user-profile.png")
    }
  ]);

  return (
    <View className="flex-1 bg-gray-50">
      {/* <View className="p-4 bg-accented">
        <Text className="text-2xl font-bold text-center text-white">Community</Text>
      </View> */}
      
      <ScrollView className="flex-1 p-4">
        <View className="flex-row justify-between mb-4">
          <TouchableOpacity className="flex-1 p-3 mr-2 bg-white shadow-sm rounded-xl">
            <Text className="font-bold text-center text-primary">Create Post</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-1 p-3 ml-2 bg-white shadow-sm rounded-xl">
            <Text className="font-bold text-center text-primary">Events</Text>
          </TouchableOpacity>
        </View>

        {posts.map(post => (
          <Post
            key={post.id}
            username={post.username}
            content={post.content}
            likes={post.likes}
            comments={post.comments}
            timeAgo={post.timeAgo}
            avatar={post.avatar}
          />
        ))}
      </ScrollView>
    </View>
  );
}