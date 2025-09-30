import { View, Text, ScrollView, Image, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import BackArrowBtn from "@/components/BackArrowBtn";
import Rating from "@/components/Rating";
import CustomButton from "@/components/CustomButton";
import { routes } from "@/constants/routes";
import { useGetMechanicDetail } from "@/hooks/useMechanics";
import { getErrorMessage } from "@/utils/errorMessages";

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
  const mechanicId = params.mechanicId as string;


  // Fetch mechanic details from API
  const { 
    data: mechanicData, 
    isLoading, 
    error 
  } = useGetMechanicDetail(mechanicId);

  // Transform API data to component format
  const mechanic: MechanicProfile = (() => {
    if (!mechanicData?.data) {
      return {
        id: 0,
        name: "Loading...",
        rating: 0,
        reviewCount: 0,
        image: null,
        bio: "",
        specialty: [],
        yearsOfExperience: 0,
        locationCoverage: "",
        languages: [],
        availability: "",
        paymentMethods: [],
        isOnline: false,
      };
    }

    const apiMechanic = mechanicData.data;
    return {
      id: apiMechanic.id || 0,
      name: apiMechanic.user ? `${apiMechanic.user.first_name} ${apiMechanic.user.last_name}`.trim() : "Unknown Mechanic",
      rating: apiMechanic.rating || 0,
      reviewCount: 0,
      image: apiMechanic.selfie || null, // Use selfie URL from API
      bio: apiMechanic.bio || "",
      specialty: [], // Not provided in API
      yearsOfExperience: 0, // Not provided in API
      locationCoverage: apiMechanic.location || "",
      languages: [], // Not provided in API
      availability: "", // Not provided in API
      paymentMethods: [], // Not provided in API
      isOnline: apiMechanic.is_approved || false,
    };
  })();

  const handleOrderPress = () => {
    router.push({
      pathname: routes.orderMechanic,
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

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
        <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-100">
          <BackArrowBtn />
          <Text className="text-xl font-NunitoBold text-gray-900">
            Mechanics
          </Text>
          <View className="w-10" />
        </View>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#D30309" />
          <Text className="text-gray-600 text-lg mt-4">Loading mechanic details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
        <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-100">
          <BackArrowBtn />
          <Text className="text-xl font-NunitoBold text-gray-900">
            Mechanics
          </Text>
          <View className="w-10" />
        </View>
        <View className="flex-1 items-center justify-center px-4">
          <Text className="text-red-500 text-center text-lg mb-4">
            {getErrorMessage(error)}
          </Text>
          <Text className="text-gray-600 text-center">
            Failed to load mechanic details
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-100">
        <BackArrowBtn />
        <Text className="text-xl font-NunitoBold text-gray-900">
           Mechanics
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
                {mechanic.image ? (
                  <Image
                    source={{ uri: mechanic.image }}
                    style={{ width: 80, height: 80 }}
                    resizeMode="cover"
                  />
                ) : (
                  <View className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center">
                    <Text className="text-gray-500 text-2xl">👤</Text>
                  </View>
                )}
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
          {mechanic.bio && <InfoSection title="Bio" content={mechanic.bio} />}

          {/* Specialty */}
          {mechanic.specialty.length > 0 && <InfoSection title="Specialty" content={mechanic.specialty} />}

          {/* Years of Experience */}
          {mechanic.yearsOfExperience > 0 && (
            <InfoSection
              title="Years of experience"
              content={`${mechanic.yearsOfExperience} years`}
            />
          )}

          {/* Location Coverage */}
          {mechanic.locationCoverage && (
            <InfoSection
              title="Location coverage"
              content={mechanic.locationCoverage}
            />
          )}

          {/* Languages */}
          {mechanic.languages.length > 0 && <InfoSection title="Languages" content={mechanic.languages} />}

          {/* Availability */}
          {mechanic.availability && <InfoSection title="Availability" content={mechanic.availability} />}

          {/* Payment Methods */}
          {mechanic.paymentMethods.length > 0 && (
            <InfoSection
              title="Payment method"
              content={mechanic.paymentMethods}
            />
          )}
        </View>
      </ScrollView>

      {/* Bottom Order Button */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-5 pt-4 pb-8">
        <CustomButton
          title="Order Mechanic"
          onPress={handleOrderPress}
        //   className="bg-primary-500"
        //   textVariant="primary"
        />
      </View>
    </SafeAreaView>
  );
};

export default MechanicProfile;
