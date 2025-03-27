import { View } from "react-native";
import React, { useRef, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Navbar from "@/components/Navbar";
import AdsComponents from "@/components/AdsComponents";
import Swiper from "react-native-swiper";
import { Ads } from "@/constants";

const HomePage = () => {
  const swiperRef = useRef<Swiper>(null);

  return (
    <SafeAreaView className="bg-white flex-1 px-5 pt-2">
      <Navbar />

      <View className="h-60 pt-5">
        <Swiper
          ref={swiperRef}
          loop={true}
          autoplay={true}
          autoplayTimeout={30} // Increased timeout for slower swiping
          autoplayDirection={true}
          showsPagination={true}
          dot={
            <View className="w-[8px] h-[8px] mx-1 bg-primary-200 rounded-full" />
          }
          activeDot={
            <View className="w-[10px] h-[10px] mx-1 bg-primary-500 rounded-full" />
          }
          paginationStyle={{ bottom: 0 }}
          scrollEnabled={true}
          index={0}
          height={240}
          horizontal={true}
          loadMinimal={true}
          loadMinimalSize={1}
          removeClippedSubviews={false}
          renderPagination={(index, total) => (
            <View
              style={{
                position: 'absolute',
                bottom: 5,
                left: 0,
                right: 0,
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              {Ads.map((_, i) => (
                <View
                  key={i}
                  style={{
                    width: i === index ? 20 : 8,
                    height: 8,
                    borderRadius: 4,
                    marginHorizontal: 3,
                    // backgroundColor: i === index ? 'red' : '#CBD5E1',
                  }}
                  className={i === index ? 'bg-primary-500' : 'bg-primary-200'}
                />
              ))}
            </View>
          )}
        >
          {Ads.map((item, index) => (
            <View key={index} className="px-0">
              <AdsComponents
                image={item.image}
                title={item.title}
                description={item.description}
              />
            </View>
          ))}
        </Swiper>
      </View>
    </SafeAreaView>
  );
};

export default HomePage;