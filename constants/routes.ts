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
  userStep4: "/(auth)/(register)/user/step4", 

  // Success pages
  accountCreated: "/(auth)/accountCreatedSucessful",
  resetPasswordSuccess: "/(auth)/resetPasswordSucessful",

  // Main app routes
  home: "/(root)/(tabs)/(user)/home",
  userHome: "/(root)/(tabs)/(user)/home",
  driverHome: "/(root)/(tabs)/(driver)/home",
  mechanicHome: "/(root)/(tabs)/(mechanic)/home",
  riderHome: "/(root)/(tabs)/(rider)/home",
  cars: "/(root)/(tabs)/(user)/cars",
  services: "/(root)/(tabs)/(user)/services",
  profile: "/(root)/(tabs)/(user)/profile",
  shop: "/(root)/(tabs)/(user)/shop",


  //screens
  ProductDetail: "/(root)/(screens)/(user)/product-detail",
  cart: "/(root)/(screens)/(user)/cart",
  paymentResult: "/(root)/(screens)/(user)/payment-result",
  orderConfirmation: "/(root)/(screens)/(user)/order-confirmation",
  chatSeller: "/(root)/(screens)/(user)/chat-seller",
  carDetails: "/(root)/(screens)/(user)/car-detail",
  AllMechanic: "/(root)/(screens)/(mechanicScreens)/all-mechanic",
  mechanicProfile: "/(root)/(screens)/(mechanicScreens)/mechanic-profile",
  chatMechanic: "/(root)/(screens)/(mechanicScreens)/chat-mechanic",
  findMechanic: "/(root)/(screens)/(user)/(ordermechanic)/find-mechanic",
  orderMechanic: "/(root)/(screens)/(user)/(ordermechanic)/order-mechanic",
  merchantProfile: "/(root)/(screens)/(user)/merchant-profile",


  //calls
  videoCall: "/(root)/(screens)/(calls)/video-call",
  voiceCall: "/(root)/(screens)/(calls)/voice-call",

  // Order ride
  enterAddressForRide: "/(root)/(screens)/(orderRide)/enterAddressForRide",
  locationSelection: "/(root)/(screens)/(orderRide)/location-selection",
  chooseRide: "/(root)/(screens)/(orderRide)/choose-ride",
  rideTracking: "/(root)/(screens)/(orderRide)/ride-tracking",
  chatDriver: "/(root)/(screens)/(orderRide)/chat-driver",

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


// Mechanic routes
export const mechanicRoutes = {
  welcome: "/(auth)/(register)/mechanic/mechanic-welcome",
  step1: "/(auth)/(register)/mechanic/step1",
  step2: "/(auth)/(register)/mechanic/step2",
  step3: "/(auth)/(register)/mechanic/step3",
  step4: "/(auth)/(register)/mechanic/step4",
  accountCreated: "/(auth)/(register)/mechanic/accountCreated",
  // Mechanic tabs
  home: "/(root)/(tabs)/(mechanic)/home",
  earnings: "/(root)/(tabs)/(mechanic)/earnings",
  order: "/(root)/(tabs)/(mechanic)/order",
  profile: "/(root)/(tabs)/(mechanic)/profile",

  ConfirmWithdrawal: "/(root)/(screens)/(mechanic)/confirmWithdrawal",
  ConfirmOrder: "/(root)/(screens)/(mechanic)/confirmOrder",
  WithdrawalHistory: "/(root)/(screens)/(mechanic)/withdrawalHistory",
  EditProfile: "/(root)/(screens)/(mechanic)/editProfile",
} as const;

export type MechanicRouteKeys = keyof typeof mechanicRoutes;
export type MechanicRouteValues = (typeof mechanicRoutes)[MechanicRouteKeys];

// driver routes
export const driverRoutes = {
  chooseOptions: "/(auth)/(register)/driver/choose-options",
  welcomeDriver: "/(auth)/(register)/driver/welcome-driver",
  step1: "/(auth)/(register)/driver/step1",
  step2: "/(auth)/(register)/driver/step2",
  step4: "/(auth)/(register)/driver/step4",
  step5: "/(auth)/(register)/driver/step5",
  step6: "/(auth)/(register)/driver/step6",
  step7: "/(auth)/(register)/driver/step7",

  // driver tabs
  home: "/(root)/(tabs)/(driver)/home",
  earnings: "/(root)/(tabs)/(driver)/earnings",
  order: "/(root)/(tabs)/(driver)/order",
  profile: "/(root)/(tabs)/(driver)/profile",

  ConfirmWithdrawal: "/(root)/(screens)/(driver)/confirmWithdrawal",
  ConfirmOrder: "/(root)/(screens)/(driver)/confirmOrder",
  WithdrawalHistory: "/(root)/(screens)/(driver)/withdrawalHistory",
  EditProfile: "/(root)/(screens)/(driver)/editProfile",
  takebookings: "/(root)/(screens)/(driver)/takebookings",
} as const;

export type DriverRouteKeys = keyof typeof driverRoutes;
export type DriverRouteValues = (typeof driverRoutes)[DriverRouteKeys];

// rider routes
export const riderRoutes = {
  chooseOptions: "/(auth)/(register)/driver/choose-options",

  // rider tabs
  home: "/(root)/(tabs)/(rider)/home",
  earnings: "/(root)/(tabs)/(rider)/earnings",
  order: "/(root)/(tabs)/(rider)/order",
  profile: "/(root)/(tabs)/(rider)/profile",

  // rider screens
  ConfirmWithdrawal: "/(root)/(screens)/(rider)/confirmWithdrawal",
  ConfirmOrder: "/(root)/(screens)/(rider)/confirmOrder",
  WithdrawalHistory: "/(root)/(screens)/(rider)/withdrawalHistory",
  EditProfile: "/(root)/(screens)/(rider)/editProfile",
  takebookings: "/(root)/(screens)/(rider)/takebookings",
} as const;

export type RiderRouteKeys = keyof typeof riderRoutes;
export type RiderRouteValues = (typeof riderRoutes)[RiderRouteKeys];

// seller routes
export const sellerRoutes = {
  step1: "/(auth)/(register)/seller/step1",
  step2: "/(auth)/(register)/seller/step2",
  step3: "/(auth)/(register)/seller/step3",
  step4: "/(auth)/(register)/seller/step4",
  step5: "/(auth)/(register)/seller/step5",
  accountCreated: "/(auth)/(register)/seller/accountCreated",

  // seller tabs
  home: "/(root)/(tabs)/(sellers)/home",
  earnings: "/(root)/(tabs)/(sellers)/earnings",
  order: "/(root)/(tabs)/(sellers)/orders",
  products: "/(root)/(tabs)/(sellers)/product",
  profile: "/(root)/(tabs)/(sellers)/profile",

  // seller screens
  ConfirmWithdrawal: "/(root)/(screens)/(seller)/confirmWithdrawal",
  ConfirmOrder: "/(root)/(screens)/(seller)/confirmOrder",
  WithdrawalHistory: "/(root)/(screens)/(seller)/withdrawalHistory",
  EditProfile: "/(root)/(screens)/(seller)/editProfile",
  orderDetails: "/(root)/(screens)/(seller)/orderDetails",
  uploadProducts: "/(root)/(screens)/(seller)/(products)/(uploadProducts)/uploadProducts",
  editProduct: "/(root)/(screens)/(seller)/(products)/(editProduct)/editProduct",
  editSparePart: "/(root)/(screens)/(seller)/(products)/(editProduct)/editSparePart",
  editCarToRent: "/(root)/(screens)/(seller)/(products)/(editProduct)/editRentCar",
  editImage: "/(root)/(screens)/(seller)/(products)/(editProduct)/editImage",
  uploadCarImages: "/(root)/(screens)/(seller)/(products)/(uploadProducts)/uploadCarImages",
  uploadSpareParts: "/(root)/(screens)/(seller)/(products)/(uploadProducts)/upload-sparePart",
  uploadCarToRent: "/(root)/(screens)/(seller)/(products)/(uploadCarRent)/uploadCarToRent",
  successfulPage: "/(root)/(screens)/(seller)/(products)/SuccessfulPage",
  allSpareParts: "/(root)/(screens)/(seller)/allSpareParts",
  allCars: "/(root)/(screens)/(seller)/allCars",
  allRentedCars: "/(root)/(screens)/(seller)/allRentedCars",
  productDetails: "/(root)/(screens)/(seller)/productDetails",
  productDetailsDetailed: "/(root)/(screens)/(seller)/productDetailsDetailed",
  deleteSuccess: "/(root)/(screens)/(seller)/deleteSuccess",
} as const;

export type SellerRouteKeys = keyof typeof sellerRoutes;
export type SellerRouteValues = (typeof sellerRoutes)[SellerRouteKeys];