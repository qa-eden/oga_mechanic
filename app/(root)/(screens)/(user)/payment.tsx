"use client";

import { View, Text, TouchableOpacity, ActivityIndicator, Alert, BackHandler } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { icons } from "@/constants";
import { WebView } from "react-native-webview";
import { useState, useEffect, useRef, useCallback } from "react";
import BackArrowBtn from "@/components/BackArrowBtn";
import { routes } from "@/constants/routes";
import { usePaymentPolling } from "@/hooks/usePayment";
import LoadingSpinner from "@/components/LoadingSpinner";

// Payment timeout in milliseconds (5 minutes)
const PAYMENT_TIMEOUT_MS = 300000;

const Payment = () => {
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const webViewRef = useRef<WebView>(null);
  const hasNavigatedRef = useRef(false);

  const paymentUrl = params.paymentUrl as string;
  const orderId = params.orderId as string;
  const totalAmount = params.totalAmount as string;
  const paymentReference = params.paymentReference as string;

  // Payment polling hook for verification
  const {
    isPolling,
    startPolling,
    stopPolling,
    verifyPayment,
  } = usePaymentPolling({
    reference: paymentReference,
    orderId: orderId,
    timeoutMs: PAYMENT_TIMEOUT_MS,
    pollIntervalMs: 5000,
    onSuccess: (result) => {
      if (!hasNavigatedRef.current) {
        hasNavigatedRef.current = true;
        navigateToResult('success', result.data?.gateway_response || 'Payment successful!');
      }
    },
    onFailed: (result) => {
      if (!hasNavigatedRef.current) {
        hasNavigatedRef.current = true;
        navigateToResult('failed', result.data?.gateway_response || 'Payment failed. Please try again.');
      }
    },
    onTimeout: () => {
      if (!hasNavigatedRef.current) {
        hasNavigatedRef.current = true;
        navigateToResult('pending', 'Payment verification timed out. Please check your order status.');
      }
    },
    onError: (error) => {
      console.error('Payment verification error:', error);
    },
  });

  // Navigate to result screen with status
  const navigateToResult = useCallback((status: 'success' | 'failed' | 'pending', message: string) => {
    stopPolling();
    router.replace({
      pathname: "/(root)/(screens)/(user)/payment-result",
      params: {
        status,
        orderId,
        totalAmount,
        paymentReference,
        message,
      }
    });
  }, [orderId, totalAmount, paymentReference, stopPolling]);

  // Handle back button press - confirm before leaving payment
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      Alert.alert(
        'Cancel Payment?',
        'Are you sure you want to cancel this payment? Your order may not be processed.',
        [
          { text: 'No, Continue Payment', style: 'cancel' },
          {
            text: 'Yes, Cancel',
            style: 'destructive',
            onPress: () => {
              stopPolling();
              router.back();
            }
          },
        ]
      );
      return true;
    });

    return () => backHandler.remove();
  }, [stopPolling]);

  const handleWebViewLoad = () => {
    setLoading(false);
  };

  const handleWebViewError = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    console.error('WebView error:', nativeEvent);
    setError('Failed to load payment page. Please try again.');
    setLoading(false);
  };

  // Verify payment once and navigate
  const verifyPaymentAndNavigate = useCallback(async () => {
    try {
      const result = await verifyPayment();
      // Result is handled by the polling hook callbacks
    } catch (error) {
      // If verification fails, still navigate but let user know to check status
      if (!hasNavigatedRef.current) {
        hasNavigatedRef.current = true;
        navigateToResult('pending', 'Payment status unclear. Please check your orders.');
      }
    }
  }, [verifyPayment, navigateToResult]);

  // Handle navigation state changes in WebView
  const handleNavigationStateChange = useCallback((navState: any) => {
    const { url, title } = navState;

    if (!url || hasNavigatedRef.current) return;

    const urlLower = url.toLowerCase();
    const titleLower = (title || '').toLowerCase();
    
    if (urlLower.includes('about:blank')) return;

    console.log('🛒 WebView navigation:', { url, title });

    // Check if it's our deep link callback
    if (urlLower.startsWith('ogamechanic://')) {
      console.log('Deep link callback detected:', url);

      // Parse the URL to get status
      let urlParams: URL;
      try {
        urlParams = new URL(url);
      } catch (e) {
        // Fallback for non-standard URL parsing if needed
        const query = url.split('?')[1] || '';
        const searchParams = new URLSearchParams(query);
        const status = searchParams.get('status');
        if (status === 'success' || status === 'successful') {
          setIsVerifying(true);
          verifyPaymentAndNavigate();
        }
        return;
      }

      const status = urlParams.searchParams.get('status');
      const reference = urlParams.searchParams.get('reference');

      if (status === 'success' || status === 'successful') {
        setIsVerifying(true);
        verifyPaymentAndNavigate();
      } else if (status === 'failed' || status === 'cancelled') {
        hasNavigatedRef.current = true;
        navigateToResult('failed', 'Payment was not completed. Please try again.');
      } else {
        // Unknown status, verify to be safe
        setIsVerifying(true);
        verifyPaymentAndNavigate();
      }
      return;
    }

    // Detect Paystack-specific callback URLs and page titles
    // Paystack shows "Transaction Successful" or "Transaction Failed" in the title
    const successPatterns = [
      '/payment/success',
      '/callback/success',
      '/verify/success',
      'status=success',
      'trxref=',
      'reference=',
      '/transaction/verify',
      'paystack.com/close', // Paystack close button URL
      'ogamechanic://', // Our deep link scheme
    ];

    const successTitlePatterns = [
      'transaction successful',
      'payment successful',
      'transaction approved',
      'approved',
    ];

    const failurePatterns = [
      '/payment/failed',
      '/payment/error',
      '/callback/failed',
      'status=failed',
      'status=cancelled',
      'cancelled=true',
    ];

    const failureTitlePatterns = [
      'transaction failed',
      'payment failed',
      'transaction declined',
      'declined',
      'transaction cancelled',
    ];

    const callbackPatterns = ['/callback', '/verify', '/payment-callback'];

    // Check URL patterns
    const isSuccessUrl = successPatterns.some(pattern => urlLower.includes(pattern.toLowerCase()));
    const isFailureUrl = failurePatterns.some(pattern => urlLower.includes(pattern.toLowerCase()));
    const isCallbackUrl = callbackPatterns.some(pattern => urlLower.includes(pattern.toLowerCase()));

    // Check title patterns (Paystack updates the page title on success/failure)
    const isSuccessTitle = successTitlePatterns.some(pattern => titleLower.includes(pattern));
    const isFailureTitle = failureTitlePatterns.some(pattern => titleLower.includes(pattern));

    if (isSuccessUrl || isSuccessTitle) {
      console.log('Payment success detected, verifying...');
      // Payment appears successful, but verify with server
      setIsVerifying(true);
      verifyPaymentAndNavigate();
    } else if (isFailureUrl || isFailureTitle) {
      console.log('Payment failure detected');
      hasNavigatedRef.current = true;
      navigateToResult('failed', 'Payment was not completed. Please try again.');
    } else if (isCallbackUrl && !isPolling) {
      console.log('Callback URL detected, starting polling...');
      // Generic callback - start polling to verify
      setIsVerifying(true);
      startPolling();
    }
  }, [navigateToResult, startPolling, isPolling, verifyPaymentAndNavigate]);


  // Handle cancel payment
  const handleCancelPayment = useCallback(() => {
    // If we're already verifying, don't show the cancel dialog as the outcome is already decided or being calculated
    if (isVerifying || isPolling) {
      return;
    }

    Alert.alert(
      'Cancel Payment?',
      'Are you sure you want to cancel this payment?',
      [
        { text: 'No, Continue', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => {
            stopPolling();
            router.back();
          }
        },
      ]
    );
  }, [stopPolling, isVerifying, isPolling]);

  if (!paymentUrl) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
        <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-100">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center"
          >
            <icons.backBtn />
          </TouchableOpacity>
          <Text className="text-xl font-NunitoBold text-gray-900">Payment</Text>
          <View className="w-10" />
        </View>
        <View className="flex-1 items-center justify-center px-5">
          <Text className="text-red-500 text-center text-lg mb-4">
            Payment URL not found
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-primary-500 px-6 py-3 rounded-lg"
          >
            <Text className="text-white font-NunitoBold">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Verifying payment overlay
  if (isVerifying || isPolling) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
        <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-100">
          <View className="w-10" />
          <Text className="text-xl font-NunitoExtraBold text-gray-900">Payment Status</Text>
          <View className="w-10" />
        </View>
        <LoadingSpinner 
            message="Verifying your payment..."
            subMessage="Please wait while we confirm your transaction with the payment provider. This may take a few moments."
            size="large"
        />
        <View className="absolute bottom-16 left-6 right-6 p-4 bg-primary-50 rounded-2xl border border-primary-100">
            <Text className="text-primary-800 text-center font-NunitoBold text-xs">
              ⚠️ Please do not close this screen or press back while we complete your order.
            </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-100">
        <TouchableOpacity onPress={handleCancelPayment}>
          <icons.backBtn />
        </TouchableOpacity>
        <Text className="text-xl font-NunitoExtraBold text-gray-900">Secure Payment</Text>
        <View className="w-10" />
      </View>

      {/* Loading State */}
      {loading && !error && (
        <LoadingSpinner 
            variant="overlay"
            message="Preparing Payment..."
            subMessage="Connecting to our secure payment gateway. Your transaction is encrypted."
            size="medium"
        />
      )}

      {/* Error State */}
      {error && (
        <View className="flex-1 items-center justify-center px-5">
          <Text className="text-red-500 text-center text-lg mb-4">{error}</Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-primary-500 px-6 py-3 rounded-lg"
          >
            <Text className="text-white font-NunitoBold">Go Back</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* WebView */}
      {!error && (
        <WebView
          ref={webViewRef}
          source={{ uri: paymentUrl }}
          onLoad={handleWebViewLoad}
          onError={handleWebViewError}
          onNavigationStateChange={handleNavigationStateChange}
          onMessage={(event) => {
            // Handle postMessage from Paystack
            try {
              const data = JSON.parse(event.nativeEvent.data);
              console.log('🛒 WebView message received:', data);

              if (data.event === 'successful' || data.status === 'success') {
                console.log('🛒 Success detected via message');
                if (!hasNavigatedRef.current) {
                  setIsVerifying(true);
                  verifyPaymentAndNavigate();
                }
              } else if (data.event === 'failed' || data.status === 'failed') {
                console.log('🛒 Failure detected via message');
                if (!hasNavigatedRef.current) {
                  hasNavigatedRef.current = true;
                  navigateToResult('failed', 'Payment was not completed. Please try again.');
                }
              } else if (data.event === 'cancelled' || data.event === 'closed') {
                console.log('🛒 Cancelled/Closed detected via message');
                if (!hasNavigatedRef.current && !isVerifying && !isPolling) {
                  // User closed the payment window
                  stopPolling();
                  router.back();
                }
              }
            } catch (e) {
              console.log('🛒 Non-JSON WebView message:', event.nativeEvent.data);
            }
          }}
          // Inject JavaScript to listen for Paystack close/success events and monitor DOM for success text
          injectedJavaScript={`
            (function() {
              console.log('🛒 Paystack helper script injected');
              
              // Helper to send messages to RN
              function sendToRN(data) {
                if (window.ReactNativeWebView) {
                  window.ReactNativeWebView.postMessage(JSON.stringify(data));
                }
              }

              // 1. Listen for standard Paystack/Browser message events
              window.addEventListener('message', function(e) {
                if (e.data) {
                   // Forward relevant Paystack events
                   if (e.data.event === 'successful' || e.data.event === 'cancelled' || e.data.event === 'closed') {
                     sendToRN(e.data);
                   }
                }
              });

              // 2. Click Interceptor for Modal Close/Cancel buttons
              document.addEventListener('click', function(e) {
                var target = e.target;
                if (!target) return;
                
                var text = (target.innerText || '').toLowerCase();
                var isCloseButton = text === 'close' || text === 'cancel payment' || target.id === 'close-button';
                
                if (isCloseButton) {
                  console.log('🛒 Close/Cancel button clicked:', text);
                  sendToRN({event: 'closed'});
                }
              }, true);

              // 3. MutationObserver for Terminal States (Success/Hard Failure)
              // We use a debounce to avoid firing on every tiny DOM change
              var timeout;
              var observer = new MutationObserver(function(mutations) {
                if (timeout) clearTimeout(timeout);
                timeout = setTimeout(function() {
                  var bodyText = document.body.innerText;
                  if (!bodyText) return;
                  
                  // Only trigger on very definitive success/failure pages
                  // Success is usually safer to detect than failure
                  if (bodyText.includes('Payment Successful') || bodyText.includes('Transaction Successful')) {
                    sendToRN({event: 'successful'});
                  } else if (bodyText.includes('Transaction Failed') && bodyText.includes('Reference:')) {
                    // Only trigger failure if we see a formal failure page with a reference
                    sendToRN({event: 'failed'});
                  }
                }, 500);
              });

              observer.observe(document.body, { childList: true, subtree: true });

              // 4. Override Paystack close function as a last resort
              if (window.PaystackPop) {
                var originalClose = window.PaystackPop.close;
                window.PaystackPop.close = function() {
                  sendToRN({event: 'closed'});
                  if (originalClose) originalClose.apply(this, arguments);
                };
              }

              return true;
            })();
          `}
          style={{ flex: 1, opacity: loading ? 0 : 1 }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={false}
          scalesPageToFit={true}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          // Security settings
          incognito={false}
          cacheEnabled={false}
          thirdPartyCookiesEnabled={true}
          sharedCookiesEnabled={true}
          // Allow our deep link scheme
          originWhitelist={['https://*', 'http://*', 'ogamechanic://*']}
          // Intercept deep link navigation
          onShouldStartLoadWithRequest={(request) => {
            const { url } = request;
            console.log('WebView request:', url);

            // Handle our deep link scheme
            if (url.startsWith('ogamechanic://')) {
              console.log('Intercepted deep link:', url);

              try {
                // Parse query params from the URL
                const queryString = url.split('?')[1] || '';
                const params = new URLSearchParams(queryString);
                const status = params.get('status');

                if (!hasNavigatedRef.current) {
                  if (status === 'success' || status === 'successful') {
                    setIsVerifying(true);
                    verifyPaymentAndNavigate();
                  } else if (status === 'failed' || status === 'cancelled') {
                    hasNavigatedRef.current = true;
                    navigateToResult('failed', 'Payment was not completed. Please try again.');
                  } else {
                    // Unknown status or no status, verify to be safe
                    setIsVerifying(true);
                    verifyPaymentAndNavigate();
                  }
                }
              } catch (e) {
                console.error('Error parsing deep link:', e);
                if (!hasNavigatedRef.current) {
                  setIsVerifying(true);
                  verifyPaymentAndNavigate();
                }
              }

              // Don't let WebView navigate to the deep link
              return false;
            }

            // Allow all other URLs
            return true;
          }}
        />
      )}
    </SafeAreaView>
  );
};

export default Payment;
