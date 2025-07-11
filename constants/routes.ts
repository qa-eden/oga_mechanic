export const routes = {
  // Auth routes
  welcome: "/(auth)/welcome",
  signUp: "/(auth)/(register)/sign_up",
  signIn: "/(auth)/(login)/sign_in",
  forgotPassword: "/(auth)/(login)/forgetPassword",
  resetPassword: "/(auth)/(login)/resetPassword",
  enterCode: "/(auth)/(login)/enterCode",

  // Registration user steps
  userStep1: "/(auth)/(register)/user/step1",
  userStep2: "/(auth)/(register)/user/step2",
  userStep3: "/(auth)/(register)/user/step3",

  // Registration merchant steps
  merchantStep1: "/(auth)/(register)/merchant/step1",
  merchantStep2: "/(auth)/(register)/merchant/step2",
  merchantStep3: "/(auth)/(register)/merchant/step3",

  // Registration mechanic steps
  mechanicStep1: "/(auth)/(register)/mechanic/step1",
  mechanicStep2: "/(auth)/(register)/mechanic/step2",
  mechanicStep3: "/(auth)/(register)/mechanic/step3",

  // Registration driver steps
  driverStep1: "/(auth)/(register)/driver/step1",
  driverStep2: "/(auth)/(register)/driver/step2",
  driverStep3: "/(auth)/(register)/driver/step3",

  // Success pages
  accountCreated: "/(auth)/accountCreatedSucessful",
  resetPasswordSuccess: "/(auth)/resetPasswordSucessful",

  // Main app routes
  home: "/(root)/(tabs)/home",
  cars: "/(root)/(tabs)/cars",
  services: "/(root)/(tabs)/services",
  profile: "/(root)/(tabs)/profile",
  shop: "/(root)/(tabs)/shop",


  //screens
  ProductDetail: "/(root)/(screens)/(user)/product-detail",
  cart: "/(root)/(screens)/(user)/cart",
  chatSeller: "/(root)/(screens)/(user)/chat-seller",
  carDetails: "/(root)/(screens)/(user)/car-detail",
 

  // Order ride
  enterAddressForRide: "/(root)/(screens)/(orderRide)/enterAddressForRide",

  // Rent a car
  rentACar: "/(root)/(screens)/(rentCar)/rent-a-car",
  carRentalDetail: "/(root)/(screens)/(rentCar)/car-rental-detail",

  //payment
  paymentConfirm: "/(root)/(screens)/(payments)/payment-confirm",
  cardPayment: "/(root)/(screens)/(payments)/card-payment",
  paymentOTP: "/(root)/(screens)/(payments)/payment-otp",
  bankTransfer: "/(root)/(screens)/(payments)/bank-transfer",
} as const;

export type RouteKeys = keyof typeof routes;
export type RouteValues = (typeof routes)[RouteKeys];
