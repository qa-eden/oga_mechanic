import { View, Text, ScrollView, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import BackArrowBtn from "@/components/BackArrowBtn";
import Rating from "@/components/Rating";
import CustomButton from "@/components/CustomButton";
import { routes } from "@/constants/routes";
import { images } from "@/constants";

interface MechanicProfile {
  id: number;
  name: string;
  rating: number;
  reviewCount: number;
  image: any;
  bio: string;
  specialty: string[];
  yearsOfExperience: number;
  locationCoverage: string;
  languages: string[];
  availability: string;
  paymentMethods: string[];
  isVip?: boolean;
  isOnline?: boolean;
}

const MechanicProfile = () => {
  const params = useLocalSearchParams();

  // Get mechanic image based on ID
  const getMechanicImage = (id: number) => {
    switch (id) {
      case 1:
        return images.mechanic1;
      case 2:
        return images.mechanic3;
      case 3:
        return images.lookman;
      case 4:
        return images.otunba;
      case 5:
        return images.salisu;
      case 6:
        return images.mechanic1;
      default:
        return images.mechanic1;
    }
  };

  const mechanicId = Number.parseInt(params.mechanicId as string) || 1;

  // Mock mechanic data - in real app, this would come from API based on mechanicId
  const mechanic: MechanicProfile = {
    id: mechanicId,
    name: (params.mechanicName as string) || "Fatai Sule",
    rating: Number.parseFloat(params.mechanicRating as string) || 4.5,
    reviewCount: 30,
    image: getMechanicImage(mechanicId),
    bio: "I'm a certified auto mechanic with over 10 years of hands-on experience fixing cars of all kinds — from compact rides to heavy-duty SUVs. I specialize in engine repair, brake systems, and vehicle diagnostics. Whether it's a funny noise, a breakdown, or a routine checkup, I'm here to help. I also sell quality spare parts and can come to your location if needed.",
    specialty: ["Engine Repair", "Brake Systems", "Vehicle Diagnostics"],
    yearsOfExperience: 12,
    locationCoverage: "Lagos Mainland & Island",
    languages: ["English", "Hausa"],
    availability: "Online 24/7",
    paymentMethods: ["Cash", "Bank Transfer"],
    isOnline: true,
  };

  const handleChatPress = () => {
    router.push({
      pathname: routes.chatMechanic,
      params: {
        mechanicId: mechanic.id,
        mechanicName: mechanic.name,
        mechanicRating: mechanic.rating,
        mechanicImage: mechanic.image,
      },
    });
  };

  const InfoSection = ({
    title,
    content,
  }: {
    title: string;
    content: string | string[];
  }) => (
    <View className="mb-6">
      <Text className="text-lg font-NunitoBold text-gray-900 mb-2">
        {title}
      </Text>
      {Array.isArray(content) ? (
        <Text className="text-base font-NunitoMedium text-gray-600 leading-6">
          {content.join(" | ")}
        </Text>
      ) : (
        <Text className="text-base font-NunitoMedium text-gray-600 leading-6">
          {content}
        </Text>
      )}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-100">
        <BackArrowBtn />
        <Text className="text-xl font-NunitoBold text-gray-900">
          Chat mechanic
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Profile Header */}
        <View className="px-5 py-6 border-b border-gray-100">
          <View className="flex-row items-center">
            {/* Profile Image */}
            <View className="relative">
              <View className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                <mechanic.image width={80} height={80} />
              </View>
              {/* Online Status */}
              {mechanic.isOnline && (
                <View className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-3 border-white items-center justify-center">
                  <View className="w-2 h-2 bg-white rounded-full" />
                </View>
              )}
            </View>

            {/* Name and Rating */}
            <View className="flex-1 ml-4">
              <View className="flex-row items-center mb-2">
                <Text className="text-xl font-NunitoBold text-gray-900 flex-1">
                  {mechanic.name}
                </Text>
                {mechanic.isVip && (
                  <View className="bg-red-50 px-2 py-1 rounded-full">
                    <Text className="text-xs font-NunitoBold text-primary-500">
                      VIP
                    </Text>
                  </View>
                )}
              </View>

              <View className="flex-row items-center">
                <Rating rating={mechanic.rating} size={16} />
                <Text className="text-base font-NunitoMedium text-gray-700 ml-2">
                  {mechanic.rating.toFixed(1)} ({mechanic.reviewCount})
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Profile Details */}
        <View className="px-5 py-6">
          {/* Bio */}
          <InfoSection title="Bio" content={mechanic.bio} />

          {/* Specialty */}
          <InfoSection title="Specialty" content={mechanic.specialty} />

          {/* Years of Experience */}
          <InfoSection
            title="Years of experience"
            content={`${mechanic.yearsOfExperience} years`}
          />

          {/* Location Coverage */}
          <InfoSection
            title="Location coverage"
            content={mechanic.locationCoverage}
          />

          {/* Languages */}
          <InfoSection title="Languages" content={mechanic.languages} />

          {/* Availability */}
          <InfoSection title="Availability" content={mechanic.availability} />

          {/* Payment Methods */}
          <InfoSection
            title="Payment method"
            content={mechanic.paymentMethods}
          />
        </View>
      </ScrollView>

      {/* Bottom Chat Button */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-5 pt-4 pb-8">
        <CustomButton
          title="Chat"
          onPress={handleChatPress}
        //   className="bg-primary-500"
        //   textVariant="primary"
        />
      </View>
    </SafeAreaView>
  );
};

export default MechanicProfile;
