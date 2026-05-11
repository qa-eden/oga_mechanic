import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  SparklesIcon,
  LockClosedIcon,
  BoltIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  StarIcon,
  RocketLaunchIcon,
  ClockIcon,
} from 'react-native-heroicons/outline';
import { CheckCircleIcon as CheckCircleIconSolid } from 'react-native-heroicons/solid';
import { icons } from '@/constants';
import { productsAPI } from '@/lib/api/products';
import { sellerRoutes } from '@/constants/routes';
import { useActiveRoleProfile } from '@/hooks/useUserProfile';
import LoadingOverlay from '@/components/LoadingOverlay';

const SUBSCRIPTION_AMOUNT = 15000;
const { width } = Dimensions.get('window');

const FREE_FEATURES = (isVehicleRental: boolean) => [
  { label: `2 ${isVehicleRental ? 'car' : 'product'} listings`, icon: null },
  { label: 'Basic analytics', icon: null },
  { label: 'Standard support', icon: null },
];

const PRO_FEATURES = (isVehicleRental: boolean) => [
  { label: `Unlimited ${isVehicleRental ? 'vehicle' : 'product'} listings`, icon: RocketLaunchIcon },
  { label: 'Priority placement in search', icon: BoltIcon },
  { label: 'Full sales analytics & insights', icon: ChartBarIcon },
  { label: 'Pro seller badge & verified tag', icon: ShieldCheckIcon },
  { label: 'Dedicated customer support', icon: StarIcon },
  { label: 'Early access to new features', icon: SparklesIcon },
];

const SellerSubscription = () => {
  const params = useLocalSearchParams();
  const usedFreeUploads = Number(params.usedFreeUploads ?? 2);
  const [isLoading, setIsLoading] = useState(false);
  const { data: roleProfile, isVehicleRental, isLoading: isProfileLoading } = useActiveRoleProfile();

  // Extract subscription data based on role
  const profile = roleProfile?.data?.merchant_profile || roleProfile?.data?.vehicle_rental_profile || roleProfile?.data?.mechanic_profile;
  // const isSubscribed = true;
  const isSubscribed = profile?.is_subscribed || false;
  // const expiresAt = 5;
  const expiresAt = profile?.subscription_expires_at;

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.96)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Calculate days remaining
  const getDaysRemaining = () => {
    if (!expiresAt) return null;
    
    // If it's already a number (e.g. 20)
    if (typeof expiresAt === 'number') return expiresAt;
    
    // If it's a date string
    const expiry = new Date(expiresAt);
    const now = new Date();
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const daysRemaining = getDaysRemaining();

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();

    // Pulse the CTA button subtly
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.015, duration: 1400, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1400, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 200 }).start();
  };

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      const payload = {
        requestType: 'inbound',
        data: {
          callback_url: 'https://ogamechanic.com/subscription/callback',
          plan: 'monthly',
        },
      };

      const response = await productsAPI.initiatePayment(payload, isVehicleRental);

      if (response?.data?.payment_url) {
        router.push({
          pathname: sellerRoutes.subscriptionPayment as any,
          params: {
            paymentUrl: response.data.payment_url,
            paymentReference: response.data.payment_reference || response.data.reference,
            amount: String(response.data.amount || SUBSCRIPTION_AMOUNT),
          },
        });
      } else {
        Alert.alert('Error', 'Could not initiate payment. Please try again.');
      }
    } catch (err: any) {
      Alert.alert(
        'Payment Error',
        err?.response?.data?.message || err?.message || 'Failed to initiate subscription payment. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isProfileLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }} edges={['top']}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#D30309" />
          <Text style={{ marginTop: 12, fontFamily: 'NunitoMedium', color: '#6B7280' }}>Loading subscription details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const freeRemaining = Math.max(0, 2 - usedFreeUploads);
  const usagePercent = (usedFreeUploads / 2) * 100;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA' }} edges={['top']}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={{
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
      }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            width: 40, height: 40,
            backgroundColor: '#F9FAFB',
            borderRadius: 20,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
          }}
        >
          <ArrowLeftIcon size={18} color="#1F2937" />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontFamily: 'NunitoExtraBold', color: '#111827', flex: 1 }}>
          {isSubscribed ? "My Subscription" : "Seller Plans"}
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Platform.OS === 'android' ? 80 : 50 }}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

          {/* ── Hero Banner ── */}
          <View style={{ marginHorizontal: 20, marginTop: 16, marginBottom: 20 }}>
            <LinearGradient
              colors={isSubscribed ? ['#111827', '#1F2937'] : ['#FFFFFF', '#F9FAFB']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                borderRadius: 28,
                padding: 24,
                borderWidth: 1,
                borderColor: isSubscribed ? '#374151' : '#F3F4F6',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: isSubscribed ? 0.3 : 0.05,
                shadowRadius: 20,
                elevation: 5,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{
                  width: 56, height: 56,
                  backgroundColor: isSubscribed ? 'rgba(211, 3, 9, 0.15)' : '#FFECED',
                  borderRadius: 18,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16,
                  borderWidth: 1,
                  borderColor: isSubscribed ? 'rgba(211, 3, 9, 0.3)' : 'transparent',
                }}>
                  <icons.activeProductTab width={28} height={28} color={isSubscribed ? "#D30309" : undefined} />
                </View>
                
                {isSubscribed && (
                  <View style={{ 
                    flexDirection: 'row', 
                    alignItems: 'center', 
                    backgroundColor: 'rgba(16, 185, 129, 0.1)', 
                    paddingHorizontal: 12, 
                    paddingVertical: 6, 
                    borderRadius: 100,
                    borderWidth: 1,
                    borderColor: 'rgba(16, 185, 129, 0.2)'
                  }}>
                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981', marginRight: 6 }} />
                    <Text style={{ fontSize: 11, fontFamily: 'NunitoBold', color: '#10B981', textTransform: 'uppercase' }}>Active Pro</Text>
                  </View>
                )}
              </View>

              <Text style={{
                fontSize: 24,
                fontFamily: 'NunitoExtraBold',
                color: isSubscribed ? '#FFFFFF' : '#111827',
                lineHeight: 32,
                marginBottom: 8,
              }}>
                {isSubscribed ? "Pro Seller Dashboard" : "Level Up Your Selling"}
              </Text>
              <Text style={{
                fontSize: 14,
                fontFamily: 'NunitoMedium',
                color: isSubscribed ? '#9CA3AF' : '#6B7280',
                lineHeight: 22,
                marginBottom: 20,
              }}>
                {isSubscribed 
                  ? "Enjoy unlimited access to all premium tools, priority search rankings, and exclusive seller analytics."
                  : "Upgrade to Pro to list unlimited products and access premium administrative tools."}
              </Text>

              {/* Usage bar or Subscription Status */}
              {!isSubscribed ? (
                <View style={{ backgroundColor: 'rgba(0,0,0,0.03)', padding: 18, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(0,0,0,0.02)' }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                    <Text style={{ fontSize: 12, fontFamily: 'NunitoBold', color: '#6B7280', letterSpacing: 0.5, textTransform: 'uppercase' }}>
                      Listing Capacity
                    </Text>
                    <Text style={{ fontSize: 12, fontFamily: 'NunitoExtraBold', color: usedFreeUploads >= 2 ? '#D30309' : '#10B981' }}>
                      {usedFreeUploads} / 2 Listings
                    </Text>
                  </View>
                  <View style={{ height: 8, backgroundColor: '#E5E7EB', borderRadius: 4, overflow: 'hidden' }}>
                    <LinearGradient
                      colors={usedFreeUploads >= 2 ? ['#EF4444', '#D30309'] : ['#10B981', '#059669']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={{ height: '100%', width: `${usagePercent}%` }}
                    />
                  </View>
                  {freeRemaining === 0 && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 14, backgroundColor: '#FFECED', padding: 10, borderRadius: 12 }}>
                      <LockClosedIcon size={16} color="#D30309" />
                      <Text style={{ marginLeft: 8, fontSize: 12, fontFamily: 'NunitoBold', color: '#D30309' }}>
                        Free limit reached — Upgrade for more
                      </Text>
                    </View>
                  )}
                </View>
              ) : (
                <View style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: 18, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                     <View>
                       <Text style={{ fontSize: 11, fontFamily: 'NunitoBold', color: '#9CA3AF', letterSpacing: 1, textTransform: 'uppercase' }}>
                         Current Plan
                       </Text>
                       <Text style={{ fontSize: 17, fontFamily: 'NunitoExtraBold', color: '#FFFFFF', marginTop: 4 }}>
                         Monthly Pro Membership
                       </Text>
                     </View>
                     <SparklesIcon size={24} color="#D30309" />
                  </View>
                  
                  {daysRemaining !== null && (
                    <View style={{ marginTop: 18, paddingTop: 18, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(245, 158, 11, 0.1)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 }}>
                          <ClockIcon size={16} color="#F59E0B" />
                          <Text style={{ marginLeft: 8, fontSize: 13, fontFamily: 'NunitoBold', color: '#F59E0B' }}>
                            {daysRemaining} Days Left
                          </Text>
                        </View>
                        <TouchableOpacity style={{ backgroundColor: '#D30309', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 }}>
                          <Text style={{ fontSize: 12, fontFamily: 'NunitoExtraBold', color: '#FFFFFF' }}>Renew Plan</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>
              )}
            </LinearGradient>
          </View>

          {/* ── Plan Comparison Row (Only for non-subscribed) ── */}
          {!isSubscribed && (
            <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
              <Text style={{ fontSize: 13, fontFamily: 'NunitoBold', color: '#111827', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 16, marginLeft: 4 }}>
                Available Plans
              </Text>

              <View style={{ flexDirection: 'row', gap: 14 }}>

                {/* Free Card */}
                <View style={{
                  flex: 1,
                  backgroundColor: '#FFFFFF',
                  borderRadius: 24,
                  padding: 20,
                  borderWidth: 1,
                  borderColor: '#E5E7EB',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.03,
                  shadowRadius: 10,
                  elevation: 2,
                }}>
                  <View style={{
                    backgroundColor: '#F3F4F6',
                    alignSelf: 'flex-start',
                    paddingHorizontal: 12,
                    paddingVertical: 5,
                    borderRadius: 10,
                    marginBottom: 14,
                  }}>
                    <Text style={{ fontSize: 10, fontFamily: 'NunitoExtraBold', color: '#6B7280', letterSpacing: 0.5 }}>
                      STARTER
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'baseline', marginBottom: 2 }}>
                    <Text style={{ fontSize: 26, fontFamily: 'NunitoExtraBold', color: '#111827' }}>₦0</Text>
                    <Text style={{ fontSize: 12, fontFamily: 'NunitoMedium', color: '#9CA3AF', marginLeft: 2 }}>/free</Text>
                  </View>
                  <Text style={{ fontSize: 11, fontFamily: 'NunitoMedium', color: '#9CA3AF', marginBottom: 18 }}>Basic features included</Text>
                  
                  <View style={{ gap: 12, marginBottom: 20 }}>
                    {FREE_FEATURES(isVehicleRental).map((f, i) => (
                      <View key={i} style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <CheckCircleIconSolid size={16} color="#10B981" />
                        <Text style={{ marginLeft: 8, fontSize: 12, fontFamily: 'NunitoSemiBold', color: '#4B5563', flex: 1 }} numberOfLines={1}>
                          {f.label}
                        </Text>
                      </View>
                    ))}
                  </View>

                  <View style={{
                    marginTop: 'auto',
                    backgroundColor: '#F9FAFB',
                    borderRadius: 14,
                    paddingVertical: 12,
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: '#F3F4F6',
                  }}>
                    <Text style={{ fontSize: 12, fontFamily: 'NunitoExtraBold', color: '#9CA3AF' }}>Current Plan</Text>
                  </View>
                </View>

                {/* Pro Card */}
                <LinearGradient
                  colors={['#D30309', '#990206']}
                  style={{
                    flex: 1,
                    borderRadius: 24,
                    padding: 20,
                    shadowColor: '#D30309',
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.25,
                    shadowRadius: 15,
                    elevation: 8,
                  }}
                >
                  <View style={{
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    alignSelf: 'flex-start',
                    paddingHorizontal: 12,
                    paddingVertical: 5,
                    borderRadius: 10,
                    marginBottom: 14,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                    <SparklesIcon size={12} color="#FFFFFF" />
                    <Text style={{ fontSize: 10, fontFamily: 'NunitoExtraBold', color: '#FFFFFF', marginLeft: 6, letterSpacing: 0.5 }}>
                      MOST POPULAR
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'baseline', marginBottom: 2 }}>
                    <Text style={{ fontSize: 26, fontFamily: 'NunitoExtraBold', color: '#FFFFFF' }}>₦{(SUBSCRIPTION_AMOUNT / 1000).toFixed(0)}k</Text>
                    <Text style={{ fontSize: 12, fontFamily: 'NunitoMedium', color: 'rgba(255,255,255,0.7)', marginLeft: 2 }}>/mo</Text>
                  </View>
                  <Text style={{ fontSize: 11, fontFamily: 'NunitoMedium', color: 'rgba(255,255,255,0.7)', marginBottom: 18 }}>Everything in Starter +</Text>
                  
                  <View style={{ gap: 12, marginBottom: 20 }}>
                    {PRO_FEATURES(isVehicleRental).slice(0, 3).map((f, i) => (
                      <View key={i} style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <CheckCircleIconSolid size={16} color="#FFFFFF" />
                        <Text style={{ marginLeft: 8, fontSize: 12, fontFamily: 'NunitoSemiBold', color: '#FFFFFF', flex: 1 }} numberOfLines={1}>
                          {f.label}
                        </Text>
                      </View>
                    ))}
                  </View>

                  <View style={{
                    marginTop: 'auto',
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    borderRadius: 14,
                    paddingVertical: 12,
                    alignItems: 'center',
                  }}>
                    <Text style={{ fontSize: 12, fontFamily: 'NunitoExtraBold', color: '#FFFFFF' }}>Go Pro</Text>
                  </View>
                </LinearGradient>
              </View>
            </View>
          )}

          {/* ── Full Pro Features ── */}
          <View style={{
            marginHorizontal: 20,
            backgroundColor: '#FFFFFF',
            borderRadius: 28,
            padding: 24,
            marginBottom: 24,
            borderWidth: 1,
            borderColor: '#F3F4F6',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.02,
            shadowRadius: 10,
            elevation: 2,
          }}>
            <Text style={{ fontSize: 13, fontFamily: 'NunitoExtraBold', color: '#D30309', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 20 }}>
              {isSubscribed ? "Active Pro Features" : "Full Pro Membership Perks"}
            </Text>
            {PRO_FEATURES(isVehicleRental).map((f, i) => {
              const Icon = f.icon;
              return (
                <View key={i} style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 14,
                  borderBottomWidth: i < PRO_FEATURES(isVehicleRental).length - 1 ? 1 : 0,
                  borderBottomColor: '#F9FAFB',
                }}>
                  <View style={{
                    width: 40, height: 40,
                    backgroundColor: '#FFECED',
                    borderRadius: 14,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 16,
                  }}>
                    {Icon && <Icon size={18} color="#D30309" />}
                  </View>
                  <Text style={{ fontSize: 15, fontFamily: 'NunitoSemiBold', color: '#1F2937', flex: 1 }}>
                    {f.label}
                  </Text>
                  <CheckCircleIconSolid size={20} color="#10B981" />
                </View>
              );
            })}
          </View>

          {/* ── CTA Container (Only for non-subscribed) ── */}
          {!isSubscribed && (
            <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
              <View style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 24,
                padding: 24,
                marginBottom: 16,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderWidth: 1,
                borderColor: '#E5E7EB',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.05,
                shadowRadius: 12,
                elevation: 3,
              }}>
                <View>
                  <Text style={{ fontSize: 12, fontFamily: 'NunitoBold', color: '#6B7280', letterSpacing: 0.5, textTransform: 'uppercase' }}>
                    Total Subscription
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: 4 }}>
                    <Text style={{ fontSize: 32, fontFamily: 'NunitoExtraBold', color: '#111827' }}>
                      ₦{SUBSCRIPTION_AMOUNT.toLocaleString()}
                    </Text>
                    <Text style={{ fontSize: 14, fontFamily: 'NunitoMedium', color: '#9CA3AF', marginLeft: 4 }}>/mo</Text>
                  </View>
                </View>
                <View style={{
                  backgroundColor: '#FFECED',
                  borderRadius: 14,
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderWidth: 1,
                  borderColor: '#FFE4E6',
                }}>
                  <Text style={{ fontSize: 10, fontFamily: 'NunitoExtraBold', color: '#D30309', textAlign: 'center', lineHeight: 14 }}>BILLED{'\n'}MONTHLY</Text>
                </View>
              </View>

              {/* CTA Button */}
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <TouchableOpacity
                  onPress={handleSubscribe}
                  onPressIn={handlePressIn}
                  onPressOut={handlePressOut}
                  disabled={isLoading}
                  activeOpacity={0.9}
                >
                  <LinearGradient
                    colors={['#D30309', '#990206']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{
                      borderRadius: 22,
                      paddingVertical: 20,
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'row',
                      shadowColor: '#D30309',
                      shadowOffset: { width: 0, height: 8 },
                      shadowOpacity: 0.3,
                      shadowRadius: 12,
                      elevation: 8,
                    }}
                  >
                    {isLoading ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <>
                        <SparklesIcon size={20} color="#FFFFFF" />
                        <Text style={{
                          marginLeft: 12,
                          fontSize: 18,
                          fontFamily: 'NunitoExtraBold',
                          color: '#FFFFFF',
                          letterSpacing: 0.5,
                        }}>
                          Upgrade to Pro Now
                        </Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>

              {/* Trust signals */}
              <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20, gap: 20 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <ShieldCheckIcon size={14} color="#9CA3AF" />
                  <Text style={{ marginLeft: 6, fontSize: 12, fontFamily: 'NunitoMedium', color: '#9CA3AF' }}>Secure Paystack</Text>
                </View>
                <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: '#D1D5DB' }} />
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <CheckCircleIcon size={14} color="#9CA3AF" />
                  <Text style={{ marginLeft: 6, fontSize: 12, fontFamily: 'NunitoMedium', color: '#9CA3AF' }}>Cancel Anytime</Text>
                </View>
              </View>
            </View>
          )}

        </Animated.View>
      </ScrollView>
      
      <LoadingOverlay 
        visible={isLoading} 
        title="Securing your checkout..." 
        subtitle="We're preparing your payment gateway. Please don't close the app."
      />
    </SafeAreaView>
  );
};

export default SellerSubscription;