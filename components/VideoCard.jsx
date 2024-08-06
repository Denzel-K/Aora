import { useState } from "react";
import { ResizeMode, Video } from "expo-av";
import { View, Text, TouchableOpacity, Image, Alert } from "react-native";
import { icons } from "@/constants";

const VideoCard = ({ title, creator, avatar, thumbnail, video }) => {
  const [play, setPlay] = useState(false);
  const [videoStatus, setVideoStatus] = useState({});
  const [error, setError] = useState(null);

  const handleVideoError = (error) => {
    console.log('Video Error:', error);
    Alert.alert('Playback Error', 'Unable to play the video. Please try again later.');
    setError('Unable to play the video. Please try again later.');
  };

  return (
    <View className="flex flex-col items-center px-4 mb-14">
      <View className="flex flex-row gap-3 items-start">
        <View className="flex justify-center items-center flex-row flex-1">
          <View className="w-[46px] h-[46px] rounded-lg border border-secondary flex justify-center items-center p-0.5">
            <Image
              source={{ uri: avatar }}
              className="w-full h-full rounded-lg"
              resizeMode="cover"
            />
          </View>

          <View className="flex justify-center flex-1 ml-3 gap-y-1">
            <Text
              className="font-psemibold text-sm text-white"
              numberOfLines={1}
            >
              {title}
            </Text>
            <Text
              className="text-xs text-gray-100 font-pregular"
              numberOfLines={1}
            >
              @{creator}
            </Text>
          </View>
        </View>

        <View className="pt-2">
          <Image source={icons.menu} className="w-5 h-5" resizeMode="contain" />
        </View>
      </View>

      {play ? (
        <Video
          source={{
            uri: video
          }}
          className="w-full h-60 rounded-xl mt-3"
          resizeMode={ResizeMode.CONTAIN}
          useNativeControls
          shouldPlay
          onError={(error) => handleVideoError(error)}
          onPlaybackStatusUpdate={(status) => {
            setVideoStatus(status);
            if (status.didJustFinish) {
              setPlay(false);
            }
            console.log('Playback Status:', status);
          }}
        />
      ) : (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setPlay(true)}
          className="w-full h-60 rounded-xl mt-3 relative flex justify-center items-center"
        >
          <Image
            source={{ uri: thumbnail }}
            className="w-full h-full rounded-xl mt-3"
            resizeMode="cover"
          />

          <Image
            source={icons.play}
            className="w-12 h-12 absolute"
            resizeMode="contain"
          />
        </TouchableOpacity>
      )}

      {error && (
        <Text className="text-xs text-red-500 mt-2">
          {error}
        </Text>
      )}

      <Text className="text-xs text-gray-100 mt-2">
        {JSON.stringify(videoStatus)}
      </Text>
    </View>
  );
};

export default VideoCard;