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
} from 'react-native-heroicons/outline';
import { CheckCircleIcon as CheckCircleIconSolid } from 'react-native-heroicons/solid';
import { icons } from '@/constants';
import { productsAPI } from '@/lib/api/products';
import { sellerRoutes } from '@/constants/routes';

const SUBSCRIPTION_AMOUNT = 15000;
const { width } = Dimensions.get('window');

const FREE_FEATURES = [
  { label: '2 product listings', icon: null },
  { label: 'Basic analytics', icon: null },
  { label: 'Standard support', icon: null },
];

const PRO_FEATURES = [
  { label: 'Unlimited product listings', icon: RocketLaunchIcon },
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

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.96)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

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
          amount: SUBSCRIPTION_AMOUNT,
          currency: 'NGN',
          description: 'OGA Mechanic Seller Pro Subscription — Monthly',
          callback_url: 'https://ogamechanic.com/subscription/callback',
        },
      };

      const response = await productsAPI.initiatePayment(payload);

      if (response?.data?.payment_url && response?.data?.reference) {
        router.push({
          pathname: sellerRoutes.subscriptionPayment as any,
          params: {
            paymentUrl: response.data.payment_url,
            paymentReference: response.data.reference,
            amount: String(SUBSCRIPTION_AMOUNT),
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
          Seller Plans
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Platform.OS === 'android' ? 80 : 50 }}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

          {/* ── Hero Banner ── */}
          <View style={{
            marginHorizontal: 20,
            marginTop: 16,
            marginBottom: 20,
            borderRadius: 24,
            backgroundColor: '#FFFFFF',
            padding: 24,
            borderWidth: 1,
            borderColor: '#F3F4F6',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 15,
            elevation: 2,
          }}>
            <View style={{
              width: 48, height: 48,
              backgroundColor: '#FFECED',
              borderRadius: 14,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
            }}>
              <icons.activeProductTab width={24} height={24} />
            </View>

            <Text style={{
              fontSize: 22,
              fontFamily: 'NunitoExtraBold',
              color: '#111827',
              lineHeight: 28,
              marginBottom: 8,
            }}>
              Unlock Your Selling potential
            </Text>
            <Text style={{
              fontSize: 13,
              fontFamily: 'NunitoMedium',
              color: '#6B7280',
              lineHeight: 20,
            }}>
              Upgrade to Pro to list unlimited products and access advanced seller tools.
            </Text>

            {/* Usage bar */}
            <View style={{ marginTop: 20, backgroundColor: '#F9FAFB', padding: 16, borderRadius: 16 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={{ fontSize: 11, fontFamily: 'NunitoBold', color: '#9CA3AF', letterSpacing: 0.5, textTransform: 'uppercase' }}>
                  Free uploads used
                </Text>
                <Text style={{ fontSize: 11, fontFamily: 'NunitoExtraBold', color: usedFreeUploads >= 2 ? '#D30309' : '#10B981' }}>
                  {usedFreeUploads} / 2
                </Text>
              </View>
              <View style={{ height: 6, backgroundColor: '#E5E7EB', borderRadius: 3 }}>
                <View style={{
                  height: 6,
                  width: `${usagePercent}%`,
                  borderRadius: 3,
                  backgroundColor: usedFreeUploads >= 2 ? '#D30309' : '#10B981',
                }} />
              </View>
              {freeRemaining === 0 && (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
                  <LockClosedIcon size={14} color="#D30309" />
                  <Text style={{ marginLeft: 6, fontSize: 12, fontFamily: 'NunitoBold', color: '#D30309' }}>
                    Free limit reached — Upgrade to Pro
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* ── Plan Comparison Row ── */}
          <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
            <Text style={{ fontSize: 12, fontFamily: 'NunitoBold', color: '#6B7280', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 14 }}>
              Choose Your Plan
            </Text>

            <View style={{ flexDirection: 'row', gap: 12 }}>

              {/* Free Card */}
              <View style={{
                flex: 1,
                backgroundColor: '#FFFFFF',
                borderRadius: 20,
                padding: 18,
                borderWidth: 1.5,
                borderColor: '#E5E7EB',
              }}>
                <View style={{
                  backgroundColor: '#F3F4F6',
                  alignSelf: 'flex-start',
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 8,
                  marginBottom: 12,
                }}>
                  <Text style={{ fontSize: 10, fontFamily: 'NunitoExtraBold', color: '#6B7280', letterSpacing: 0.5 }}>
                    FREE
                  </Text>
                </View>
                <Text style={{ fontSize: 22, fontFamily: 'NunitoExtraBold', color: '#111827', marginBottom: 2 }}>₦0</Text>
                <Text style={{ fontSize: 10, fontFamily: 'NunitoMedium', color: '#9CA3AF', marginBottom: 16 }}>Starter package</Text>
                {FREE_FEATURES.map((f, i) => (
                  <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 }}>
                    <CheckCircleIconSolid size={15} color="#10B981" />
                    <Text style={{ marginLeft: 7, fontSize: 11, fontFamily: 'NunitoMedium', color: '#4B5563', flex: 1, lineHeight: 16 }}>
                      {f.label}
                    </Text>
                  </View>
                ))}
                <View style={{
                  marginTop: 8,
                  borderWidth: 1.5,
                  borderColor: '#E5E7EB',
                  borderRadius: 12,
                  paddingVertical: 10,
                  alignItems: 'center',
                }}>
                  <Text style={{ fontSize: 11, fontFamily: 'NunitoExtraBold', color: '#9CA3AF' }}>Current Plan</Text>
                </View>
              </View>

              {/* Pro Card */}
              <View style={{
                flex: 1,
                backgroundColor: '#FFFFFF',
                borderRadius: 20,
                padding: 18,
                borderWidth: 2,
                borderColor: '#D30309',
                overflow: 'hidden',
              }}>
                <View style={{
                  backgroundColor: '#D30309',
                  alignSelf: 'flex-start',
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 8,
                  marginBottom: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                  <SparklesIcon size={10} color="#FFFFFF" />
                  <Text style={{ fontSize: 10, fontFamily: 'NunitoExtraBold', color: '#FFFFFF', marginLeft: 4, letterSpacing: 0.5 }}>
                    PRO
                  </Text>
                </View>
                <Text style={{ fontSize: 22, fontFamily: 'NunitoExtraBold', color: '#111827', marginBottom: 2 }}>
                  ₦{(SUBSCRIPTION_AMOUNT / 1000).toFixed(0)}k
                </Text>
                <Text style={{ fontSize: 10, fontFamily: 'NunitoMedium', color: '#9CA3AF', marginBottom: 16 }}>per month</Text>
                {PRO_FEATURES.slice(0, 3).map((f, i) => (
                  <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 }}>
                    <CheckCircleIconSolid size={15} color="#D30309" />
                    <Text style={{ marginLeft: 7, fontSize: 11, fontFamily: 'NunitoMedium', color: '#111827', flex: 1, lineHeight: 16 }}>
                      {f.label}
                    </Text>
                  </View>
                ))}
                <Text style={{ fontSize: 11, fontFamily: 'NunitoBold', color: '#D30309', marginTop: 4 }}>
                  + More benefits
                </Text>
              </View>
            </View>
          </View>

          {/* ── Full Pro Features ── */}
          <View style={{
            marginHorizontal: 20,
            backgroundColor: '#FFFFFF',
            borderRadius: 24,
            padding: 22,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: '#F3F4F6',
          }}>
            <Text style={{ fontSize: 13, fontFamily: 'NunitoExtraBold', color: '#D30309', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 18 }}>
              Pro Plan Benefits
            </Text>
            {PRO_FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <View key={i} style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 12,
                  borderBottomWidth: i < PRO_FEATURES.length - 1 ? 1 : 0,
                  borderBottomColor: '#F9FAFB',
                }}>
                  <View style={{
                    width: 36, height: 36,
                    backgroundColor: '#FFECED',
                    borderRadius: 12,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 14,
                  }}>
                    {Icon && <Icon size={17} color="#D30309" />}
                  </View>
                  <Text style={{ fontSize: 14, fontFamily: 'NunitoSemiBold', color: '#1F2937', flex: 1 }}>
                    {f.label}
                  </Text>
                  <CheckCircleIconSolid size={18} color="#10B981" />
                </View>
              );
            })}
          </View>

          {/* ── CTA Container ── */}
          <View style={{ paddingHorizontal: 20, marginBottom: 12 }}>
            <View style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 20,
              padding: 20,
              marginBottom: 12,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderWidth: 1,
              borderColor: '#E5E7EB',
            }}>
              <View>
                <Text style={{ fontSize: 12, fontFamily: 'NunitoBold', color: '#6B7280', letterSpacing: 0.5, textTransform: 'uppercase' }}>
                  Pro Membership
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: 4 }}>
                  <Text style={{ fontSize: 28, fontFamily: 'NunitoExtraBold', color: '#111827' }}>
                    ₦{SUBSCRIPTION_AMOUNT.toLocaleString()}
                  </Text>
                  <Text style={{ fontSize: 13, fontFamily: 'NunitoMedium', color: '#9CA3AF', marginLeft: 4 }}>/mo</Text>
                </View>
              </View>
              <View style={{
                backgroundColor: '#FFECED',
                borderRadius: 12,
                paddingHorizontal: 12,
                paddingVertical: 6,
              }}>
                <Text style={{ fontSize: 10, fontFamily: 'NunitoExtraBold', color: '#D30309', textAlign: 'center' }}>BILLED{'\n'}MONTHLY</Text>
              </View>
            </View>

            {/* CTA Button */}
            <TouchableOpacity
              onPress={handleSubscribe}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              disabled={isLoading}
              activeOpacity={0.8}
              style={{
                backgroundColor: '#D30309',
                borderRadius: 20,
                paddingVertical: 18,
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row',
              }}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <SparklesIcon size={18} color="#FFFFFF" />
                  <Text style={{
                    marginLeft: 10,
                    fontSize: 16,
                    fontFamily: 'NunitoExtraBold',
                    color: '#FFFFFF',
                    letterSpacing: 0.3,
                  }}>
                    Upgrade to Pro Now
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {/* Trust signals */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 16, gap: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <ShieldCheckIcon size={13} color="#9CA3AF" />
                <Text style={{ marginLeft: 4, fontSize: 11, fontFamily: 'NunitoMedium', color: '#9CA3AF' }}>Secure via Paystack</Text>
              </View>
              <View style={{ width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#D1D5DB' }} />
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <CheckCircleIcon size={13} color="#9CA3AF" />
                <Text style={{ marginLeft: 4, fontSize: 11, fontFamily: 'NunitoMedium', color: '#9CA3AF' }}>Cancel anytime</Text>
              </View>
            </View>
          </View>

        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SellerSubscription;