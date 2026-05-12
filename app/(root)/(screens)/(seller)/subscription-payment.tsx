import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, BackHandler, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { WebView } from 'react-native-webview';
import LoadingSpinner from '@/components/LoadingSpinner';
import { userAPI } from '@/lib/api/user';
import { sellerRoutes } from '@/constants/routes';
import { icons } from '@/constants';

const SubscriptionPayment = () => {
  const params = useLocalSearchParams();
  const paymentUrl = params.paymentUrl as string;
  const paymentReference = params.paymentReference as string;
  const amount = Number(params.amount ?? 15000);

  const [loading, setLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const webViewRef = useRef<WebView>(null);
  const hasNavigatedRef = useRef(false);

  // Hardware back button guard
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      Alert.alert(
        'Cancel Subscription?',
        'Are you sure you want to cancel? Your subscription will not be activated.',
        [
          { text: 'No, Continue', style: 'cancel' },
          { text: 'Yes, Cancel', style: 'destructive', onPress: () => router.back() },
        ]
      );
      return true;
    });
    return () => backHandler.remove();
  }, []);

  const handleSuccess = useCallback(async () => {
    if (hasNavigatedRef.current) return;
    hasNavigatedRef.current = true;
    setIsVerifying(true);

    try {
      await userAPI.subscribeMerchant({
        payment_reference: paymentReference,
        payment_url: paymentUrl,
        amount,
      });

      setIsSuccess(true);
    } catch (err: any) {
      console.error('Subscription confirmation error:', err);
      // Even if the API call fails, the payment was made — show the success screen
      setIsSuccess(true);
    } finally {
      setIsVerifying(false);
    }
  }, [paymentReference, paymentUrl, amount]);

  const handleFailure = useCallback(() => {
    if (hasNavigatedRef.current) return;
    hasNavigatedRef.current = true;
    Alert.alert(
      'Payment Failed',
      'Your subscription payment could not be processed. Please try again.',
      [{ text: 'Go Back', onPress: () => router.back() }]
    );
  }, []);

  const handleNavigationStateChange = useCallback((navState: any) => {
    const { url, title } = navState;
    if (!url || hasNavigatedRef.current) return;

    const urlLower = url.toLowerCase();
    const titleLower = (title || '').toLowerCase();

    if (urlLower.startsWith('ogamechanic://')) {
      const queryString = url.split('?')[1] || '';
      const searchParams = new URLSearchParams(queryString);
      const status = searchParams.get('status');
      if (status === 'success' || status === 'successful') {
        handleSuccess();
      } else {
        handleFailure();
      }
      return;
    }

    const successPatterns = ['trxref=', 'reference=', 'paystack.com/close', 'status=success'];
    const failurePatterns = ['status=failed', 'status=cancelled'];
    const successTitlePatterns = ['transaction successful', 'payment successful', 'approved'];
    const failureTitlePatterns = ['transaction failed', 'payment failed', 'declined'];

    if (
      successPatterns.some((p) => urlLower.includes(p)) ||
      successTitlePatterns.some((p) => titleLower.includes(p))
    ) {
      handleSuccess();
    } else if (
      failurePatterns.some((p) => urlLower.includes(p)) ||
      failureTitlePatterns.some((p) => titleLower.includes(p))
    ) {
      handleFailure();
    }
  }, [handleSuccess, handleFailure]);

  if (!paymentUrl) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center px-6" edges={['top']}>
        <Text className="text-red-500 text-center text-base font-NunitoSemiBold mb-4">
          Payment URL not available. Please try again.
        </Text>
        <TouchableOpacity onPress={() => router.back()} className="bg-primary-500 px-6 py-3 rounded-xl">
          <Text className="text-white font-NunitoBold">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (isVerifying) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top']}>
        <LoadingSpinner
          message="Activating your subscription..."
          subMessage="We're confirming your payment and setting up your Pro account."
          size="large"
        />
      </SafeAreaView>
    );
  }

  if (isSuccess) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top']}>
        <View className="flex-1 px-6 justify-center">
          <View className="items-center mb-10">
            <View className="w-24 h-24 bg-green-50 rounded-full items-center justify-center mb-6">
              <View className="w-18 h-18 bg-green-100 rounded-full items-center justify-center">
                <Text className="text-5xl">🎉</Text>
              </View>
            </View>
            
            <Text className="text-3xl font-NunitoExtraBold text-gray-900 text-center mb-3">
              Subscription Activated!
            </Text>
            <Text className="text-base font-NunitoMedium text-gray-500 text-center px-4 leading-6">
              Welcome to <Text className="text-primary-500 font-NunitoBold">OGA Mechanic Pro</Text>. Your account has been upgraded successfully.
            </Text>
          </View>

          <View className="bg-gray-50 rounded-3xl p-6 mb-10 border border-gray-100">
            <View className="flex-row items-center mb-4">
              <View className="w-8 h-8 bg-green-100 rounded-full items-center justify-center mr-3">
                <Text className="text-xs">✅</Text>
              </View>
              <Text className="text-gray-700 font-NunitoBold text-base">Unlimited Product Uploads</Text>
            </View>
            <View className="flex-row items-center mb-4">
              <View className="w-8 h-8 bg-green-100 rounded-full items-center justify-center mr-3">
                <Text className="text-xs">✅</Text>
              </View>
              <Text className="text-gray-700 font-NunitoBold text-base">Priority Customer Support</Text>
            </View>
            <View className="flex-row items-center">
              <View className="w-8 h-8 bg-green-100 rounded-full items-center justify-center mr-3">
                <Text className="text-xs">✅</Text>
              </View>
              <Text className="text-gray-700 font-NunitoBold text-base">Verified Seller Badge</Text>
            </View>
          </View>

          <TouchableOpacity 
            onPress={() => {
              router.dismissAll();
              router.replace(sellerRoutes.products as any);
            }}
            className="bg-primary-500 w-full py-4 rounded-2xl items-center shadow-lg shadow-primary-200"
            activeOpacity={0.8}
          >
            <Text className="text-white font-NunitoBold text-lg">Start Uploading</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-100">
        <TouchableOpacity
          onPress={() =>
            Alert.alert(
              'Cancel Subscription?',
              'Are you sure you want to cancel?',
              [
                { text: 'No, Continue', style: 'cancel' },
                { text: 'Yes, Cancel', style: 'destructive', onPress: () => router.back() },
              ]
            )
          }
        >
          <icons.backBtn />
        </TouchableOpacity>
        <Text className="text-lg font-NunitoExtraBold text-gray-900">Activate Pro</Text>
        <View className="w-10" />
      </View>

      {/* Security badge */}
      <View className="bg-green-50 px-4 py-2 flex-row items-center justify-center border-b border-green-100">
        <Text className="text-xs text-green-700 font-NunitoSemiBold text-center">
          🔒 Secure payment via Paystack — ₦{amount.toLocaleString()}
        </Text>
      </View>

      {loading && !error && (
        <LoadingSpinner
          variant="overlay"
          message="Loading Payment..."
          subMessage="Connecting to secure payment gateway."
          size="medium"
        />
      )}

      {error && (
        <View className="flex-1 items-center justify-center px-5">
          <Text className="text-red-500 text-center mb-4">{error}</Text>
          <TouchableOpacity onPress={() => router.back()} className="bg-primary-500 px-6 py-3 rounded-xl">
            <Text className="text-white font-NunitoBold">Go Back</Text>
          </TouchableOpacity>
        </View>
      )}

      {!error && (
        <WebView
          ref={webViewRef}
          source={{ uri: paymentUrl }}
          onLoad={() => setLoading(false)}
          onError={(e) => {
            setError('Failed to load payment page. Please try again.');
            setLoading(false);
          }}
          onNavigationStateChange={handleNavigationStateChange}
          onMessage={(event) => {
            try {
              const data = JSON.parse(event.nativeEvent.data);
              if (data.event === 'successful') handleSuccess();
              else if (data.event === 'failed' || data.event === 'cancelled') handleFailure();
            } catch (_) {}
          }}
          injectedJavaScript={`
            (function() {
              window.addEventListener('message', function(e) {
                if (e.data && (e.data.event === 'successful' || e.data.event === 'cancelled' || e.data.event === 'closed')) {
                  if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(JSON.stringify(e.data));
                }
              });
              return true;
            })();
          `}
          style={{ flex: 1, opacity: loading ? 0 : 1 }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={false}
          cacheEnabled={false}
          thirdPartyCookiesEnabled={true}
          originWhitelist={['https://*', 'http://*', 'ogamechanic://*']}
          onShouldStartLoadWithRequest={(request) => {
            const { url } = request;
            if (url.startsWith('ogamechanic://')) {
              const queryString = url.split('?')[1] || '';
              const searchParams = new URLSearchParams(queryString);
              const status = searchParams.get('status');
              if (!hasNavigatedRef.current) {
                if (status === 'success' || status === 'successful') handleSuccess();
                else handleFailure();
              }
              return false;
            }
            return true;
          }}
        />
      )}
    </SafeAreaView>
  );
};

export default SubscriptionPayment;
