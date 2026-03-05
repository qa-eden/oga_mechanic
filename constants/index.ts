import { ServicesProps } from "@/types/type";

//images
import onboarding1 from "@/assets/images/auth/onboarding1.svg";
import welcomeImg1 from "@/assets/images/auth/welcomeImg1.svg";
import welcomeImg2 from "@/assets/images/auth/welcomeImg2.svg";
import welcomeImg3 from "@/assets/images/auth/welcomeImg3.svg";
import welcomeImg4 from "@/assets/images/auth/welcomeImg4.svg";
import splashBackgroundCar from "@/assets/images/auth/splashBackgroundCar1.svg";
import success from "@/assets/images/success.svg";
import dummyProfile from "@/assets/images/propics.jpeg";
import adsbackground from "@/assets/images/adsbackground.png";
import carFront from "@/assets/images/frontCarPlaceholder.jpg";
import carBack from "@/assets/images/carBack.png";
import carRight from "@/assets/images/carRight.png";
import carLeft from "@/assets/images/carLeft.png";

import brabus from "@/assets/images/brabus.svg";

//mechanics
import mechanic1 from "@/assets/images/dummy/mechanic2.svg";

//icons
import logo from "@/assets/icons/logo.svg";
import logoBlack from "@/assets/icons/logo_black.svg";
import logoBox from "@/assets/icons/box_logo.png";
import splash from "@/assets/icons/logo2.svg";
import backBtn from "@/assets/icons/backBtn.svg";
import tick1 from "@/assets/icons/tick1.svg";
import eyeClosed from "@/assets/icons/EyeClosed.png";
import eyeOpen from "@/assets/icons/eyeOpen.png";
import filledStar from "@/assets/icons/filledStar.svg";
import unfillStar from "@/assets/icons/unfillStar.svg";
import courage from "@/assets/icons/courage.svg";
import empty from "@/assets/icons/empty.svg";
import bankIcon from "@/assets/icons/bank.svg";
import mechanic2 from "@/assets/icons/mechanic2.svg";
import rent from "@/assets/icons/rent.svg";

//profile icons
import redPhone from "@/assets/icons/redPhone.svg";
import UserCircle from "@/assets/icons/profile/UserCircle.svg";
import addBank from "@/assets/icons/profile/addBank.svg";
import savingWallet from "@/assets/icons/profile/savingWallet.svg";
import padlock from "@/assets/icons/profile/padlock.svg";
import switch1 from "@/assets/icons/profile/switch.svg";
import sub from "@/assets/icons/profile/sub.svg";
import faceId from "@/assets/icons/profile/faceId.svg";
import enablePass from "@/assets/icons/profile/enablePass.svg";
import phone1 from "@/assets/icons/profile/phone1.svg";
import x from "@/assets/icons/profile/x.svg";
import linkedIn from "@/assets/icons/profile/linkedIn.svg";
import email from "@/assets/icons/profile/email.svg";

//services icons
import orderRide from "@/assets/icons/orderRide.svg";
import sparePartIcon from "@/assets/icons/sparePart.svg";
import buycar from "@/assets/icons/buycar.svg";
import carTow from "@/assets/icons/carTow.svg";

//tabs icons
import home from "@/assets/icons/home.svg";
import earnings from "@/assets/icons/earnings.svg";
import order from "@/assets/icons/order.svg";
import activeEarnings from "@/assets/icons/activeEarnings.svg";
import activeOrder from "@/assets/icons/activeOrder.svg";
import activeHome from "@/assets/icons/activeHome.svg";
import activeServices from "@/assets/icons/activeServices.svg";
import activeProfile from "@/assets/icons/activeProfile.svg";
import activeCar from "@/assets/icons/activeCar.svg";
import car from "@/assets/icons/car.svg";
import services from "@/assets/icons/services.svg";
import profile from "@/assets/icons/profile.svg";
import shopTab from "@/assets/icons/shopTab.svg";
import productTab from "@/assets/icons/productTab.svg";
import activeProductTab from "@/assets/icons/activeProductTab.svg";
import orderIcon2 from "@/assets/icons/orderIcon2.svg";
import activeOrderIcon2 from "@/assets/icons/activeOrderIcon2.svg";

//driver icons
import trip from "@/assets/icons/trip.svg";
import round from "@/assets/icons/round.svg";

//roles images
import user from "@/assets/icons/user.svg";
import merchant from "@/assets/icons/merchant.png";
import mechanic from "@/assets/icons/mechanic.png";
import driver from "@/assets/icons/driver.svg";
import { driverRoutes, mechanicRoutes, routes, sellerRoutes, riderRoutes } from "./routes";

export const images = {
  onboarding1,
  welcomeImg1,
  welcomeImg2,
  welcomeImg3,
  welcomeImg4,
  splashBackgroundCar,
  dummyProfile,
  adsbackground,
  brabus,
  mechanic1,

  carFront,
  carBack,
  carRight,
  carLeft,
};

export const icons = {
  logo,
  logoBlack,
  logoBox,
  eyeClosed,
  eyeOpen,
  tick1,
  splash,
  success,
  backBtn,
  user,
  merchant,
  mechanic,
  driver,
  home,
  earnings,
  activeEarnings,
  activeHome,
  order,
  activeOrder,
  activeServices,
  activeProfile,
  activeCar,
  car,
  services,
  profile,
  filledStar,
  unfillStar,
  redPhone,
  UserCircle,
  enablePass,
  faceId,
  shopTab,
  bankIcon,
  productTab,
  activeProductTab,
  empty,
  trip,
  round,
  orderIcon2,
  activeOrderIcon2,
};

export const onboarding = [
  {
    id: 1,
    title: "Your Ultimate Auto Hub",
    description:
      "Buy & sell cars, find expert mechanics, and book rides—all in one place.",
    image: images.onboarding1,
  },
  {
    id: 2,
    title: "Your Car, Your Control",
    description:
      "Stay connected, drive with ease, and manage everything on the go—all in one powerful app",
    image: images.onboarding1,
  },
];

export const Roles = [
  {
    id: 7,
    title: "Primary User",
    description: "I am a customer",
    image: icons.user,
    border: "#7DA0FF",
    backgroundColor: "#D6E1FF",
    route: routes?.userStep1,
  },
  {
    id: 3,
    title: "Seller",
    description: "I want to sell",
    image: icons.merchant,
    border: "#FFC38D",
    backgroundColor: "#FFEAD8",
    route: sellerRoutes?.step1,
  },
  {
    id: 5,
    title: "Mechanic",
    description: "I am a mechanic",
    image: icons.mechanic,
    border: "#DBAF79",
    backgroundColor: "#ECE2D6",
    route: mechanicRoutes?.step1,
  },
  {
    id: 6,
    title: "Driver",
    description: "I am a driver",
    image: icons.driver,
    border: "#FF9292",
    backgroundColor: "#FFE9E9",
    route: driverRoutes?.chooseOptions,
  },
];

export const Ads = [
  {
    id: 1,
    title: "Smooth Rides",
    description: "Expert Maintenance, Instant Booking",
    image: images.adsbackground,
  },
  {
    id: 2,
    title: "Your Car, Our Passion",
    description: "Repair, Upgrade, Drive with Confidence",
    image: images.adsbackground,
  },
  {
    id: 3,
    title: "Automotive Solutions",
    description: "From Diagnostics to Delivery",
    image: images.adsbackground,
  },
];

export const myCars = [
  {
    id: 101,
    name: "Escalade",
    year: 2024,
    vin: "267189391",
    status: "Active",
    image: brabus,
    color: "#1F2937",
  },
  {
    id: 102,
    name: "Toyota Corolla",
    year: 2023,
    vin: "345189391",
    status: "Active",
    image: brabus,
    color: "#1E40AF",
  },
  {
    id: 103,
    name: "Hyundai Elatra",
    year: 2010,
    vin: "059943452",
    status: "Inactive",
    image: brabus,
    color: "#DC2626",
  },
  {
    id: 104,
    name: "Brabus G63",
    year: 2022,
    vin: "229974531",
    status: "Active",
    image: brabus,
    color: "#374151",
  },
];

export const Services: ServicesProps[] = [
  {
    id: 6,
    name: "Find a Mechanic",
    description: "Get a mechanic to fix your car",
    image: mechanic2,
    bgColor: "#F3F2FE",
    border: "#ACA6FF",
  },
  {
    id: 1,
    name: "Order a Ride",
    description: "Book a ride to your destination",
    image: orderRide,
    bgColor: "#F3F2FE",
    border: "#ACA6FF",
  },

  {
    id: 3,
    name: "Buy a Car",
    description: "Find your dream car",
    image: buycar,
    bgColor: "#F8FFD8",
    border: "#F6B80D",
  },
  {
    id: 2,
    name: "Buy spare parts",
    description: "Find the right spare parts",
    image: sparePartIcon,
    bgColor: "#FFF8F5",
    border: " #5A4F49",
  },
  {
    id: 4,
    name: "Tow your car",
    description: "Get your car towed",
    image: carTow,
    bgColor: "#F3FFF1",
    border: "#189804",
  },
  {
    id: 5,
    name: "Rent a car",
    description: "Rent a car for a day or more",
    image: rent,
    bgColor: "#F3FFF1",
    border: "#189804",
  },
  {
    id: 8,
    name: "My Mechanic Orders",
    description: "View all your repair requests",
    image: mechanic2,
    bgColor: "#FEF2F2",
    border: "#FCA5A5",
  },
  {
    id: 7,
    name: "Chat a Specialist",
    description: "Get expert advice on your car",
    image: mechanic2,
    bgColor: "#F8FFD8",
    border: "#F6B80D",
  },

];

export const OrderRideOptions = [
  {
    id: 1,
    name: "Ride",
    image: orderRide,
    time: "5 min",
    price: "$15.00",
  },
  {
    id: 2,
    name: "Courier",
    image: courage,
    time: "10 min",
    price: "$10.00",
  },
  // {
  //   id: 3,
  //   name: "Pick Up",
  //   image: pickUp,
  // },
];

export const userInfo = {
  id: 1,
  name: "Okorie Emmanuel",
  location: "Lagos, Nigeria",
  phone: "07084844214",
};

export const ProfileSettings = {
  name: "Profile settings",
  options: [
    {
      id: 1,
      name: "My Profile",
      image: UserCircle,
      route: routes.editProfile,
    },
    {
      id: 10,
      name: "My Cars",
      image: car,
      route: routes.cars,
    },
    {
      id: 2,
      name: "Change Password",
      image: padlock,
      route: routes.changePassword,
    },
    {
      id: 3,
      name: "Switch Role",
      image: switch1,
      route: "Switch Role",
    },
    {
      id: 4,
      name: "Subscription",
      image: sub,
      route: routes.notifications,
    },
  ],
};

export const MechanicProfileSettings = {
  name: "Profile settings",
  options: [
    {
      id: 1,
      name: "My Profile",
      image: UserCircle,
      route: mechanicRoutes.EditProfile,
    },
    {
      id: 2,
      name: "Add Bank Details",
      image: addBank,
      route: "notifications",
    },
    {
      id: 3,
      name: "Savings wallet",
      image: savingWallet,
      route: "notifications",
    },
    {
      id: 4,
      name: "Change Password",
      image: padlock,
      route: routes.changePassword,
    },
    {
      id: 5,
      name: "Switch Role",
      image: switch1,
      route: "Switch Role",
    },
  ],
};

export const DriverProfileSettings = {
  name: "Profile settings",
  options: [
    {
      id: 1,
      name: "My Profile",
      image: UserCircle,
      route: driverRoutes.profileDetails,
    },
    {
      id: 2,
      name: "My Trips",
      image: trip,
      route: "notifications",
    },
    {
      id: 3,
      name: "Wallet",
      image: savingWallet,
      route: routes.notifications,
    },
    {
      id: 4,
      name: "Change Password",
      image: padlock,
      route: routes.changePassword,
    },
    {
      id: 5,
      name: "Switch Role",
      image: switch1,
      route: "Switch Role",
    },
  ],
};




export const SellerProfileSettings = {
  name: "Profile settings",
  options: [
    {
      id: 1,
      name: "My Profile",
      image: UserCircle,
      route: sellerRoutes.EditProfile,
    },
    {
      id: 2,
      name: "Add Bank Details",
      image: addBank,
      route: "notifications",
    },
    {
      id: 3,
      name: "Savings wallet",
      image: savingWallet,
      route: "notifications",
    },
    {
      id: 4,
      name: "Change Password",
      image: padlock,
      route: routes.changePassword,
    },
    {
      id: 5,
      name: "Switch Role",
      image: switch1,
      route: "Switch Role",
    },
  ],
};

export const RiderProfileSettings = {
  name: "Profile settings",
  options: [
    {
      id: 1,
      name: "My Profile",
      image: UserCircle,
      route: riderRoutes.EditProfile,
    },
    {
      id: 2,
      name: "Vehicle Information",
      image: car,
      route: "vehicleInfo",
    },
    {
      id: 3,
      name: "Add Bank Details",
      image: bankIcon,
      route: "bankDetails",
    },
    {
      id: 4,
      name: "Change Password",
      image: padlock,
      route: routes.changePassword,
    },
    {
      id: 5,
      name: "Switch Role",
      image: switch1,
      route: "Switch Role",
    },
  ],
};

export const ProfileSopprt = {
  name: "SuPPORT",
  options: [
    {
      id: 1,
      name: "+234 70564733811",
      image: phone1,
      route: "editProfile",
    },
    {
      id: 2,
      name: "+234 70564733811",
      image: phone1,
      route: "notifications",
    },
    {
      id: 3,
      name: "@ogamechanic",
      image: x,
      route: "editProfile",
    },
    {
      id: 4,
      name: "Oga mechanic",
      image: linkedIn,
      route: "notifications",
    },
    {
      id: 5,
      name: "help@ogamechanic.com",
      image: email,
      route: "notifications",
    },
  ],
};

export const data = {
  onboarding,
};
