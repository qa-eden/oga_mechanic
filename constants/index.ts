import { ServicesProps } from "@/types/type";

//images
import onboarding1 from "@/assets/images/auth/onboarding1.svg";
import onboarding2 from "@/assets/images/auth/onboarding2.svg";
import background1 from "@/assets/images/auth/background1.png";
import background2 from "@/assets/images/auth/background2.png";
import loginBackground from "@/assets/images/auth/loginBackground.png";
import splashBackgroundCar from "@/assets/images/auth/splashBackgroundCar.svg";
import success from "@/assets/images/success.png";
import dummyProfile from "@/assets/images/propics.jpeg";
import adsbackground from "@/assets/images/adsbackground.png";
import mechanic1 from "@/assets/images/mechanic1.svg";
import car1 from "@/assets/images/car.svg";
import sparePart from "@/assets/images/sparePart.svg";

//icons
import bell from "@/assets/icons/bell.svg";
import logo from "@/assets/icons/logo.svg";
import splash from "@/assets/icons/logo2.svg";
import backBtn from "@/assets/icons/backBtn.svg";
import tick1 from "@/assets/icons/tick1.svg";
import explore from "@/assets/icons/explore.svg";
import eyeClosed from "@/assets/icons/EyeClosed.png";
import eyeOpen from "@/assets/icons/eyeOpen.png";
import filledStar from "@/assets/icons/filledStar.svg";
import unfillStar from "@/assets/icons/unfillStar.svg";
import love from "@/assets/icons/love.svg";
import calender from "@/assets/icons/calender.svg";
import search from "@/assets/icons/search.svg";
import courage from "@/assets/icons/courage.svg";
import pickUp from "@/assets/icons/pickUp.svg";
import time from "@/assets/icons/time.svg";
import rightArrow from "@/assets/icons/rightArrow.svg";

//profile icons
import location from "@/assets/icons/location.svg";
import redPhone from "@/assets/icons/redPhone.svg";
import UserCircle from "@/assets/icons/profile/UserCircle.svg";
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
import activeHome from "@/assets/icons/activeHome.svg";
import activeServices from "@/assets/icons/activeServices.svg";
import activeProfile from "@/assets/icons/activeProfile.svg";
import activeCar from "@/assets/icons/activeCar.svg";
import car from "@/assets/icons/car.svg";
import services from "@/assets/icons/services.svg";
import profile from "@/assets/icons/profile.svg";

//roles images
import user from "@/assets/icons/user.svg";
import merchant from "@/assets/icons/merchant.svg";
import mechanic from "@/assets/icons/mechanic.svg";
import driver from "@/assets/icons/driver.svg";


export const images = {
  onboarding1,
  onboarding2,
  background1,
  background2,
  loginBackground,
  splashBackgroundCar,
  dummyProfile,
  adsbackground,
};

export const icons = {
  logo,
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
  activeHome,
  activeServices,
  activeProfile,
  activeCar,
  car,
  services,
  profile,
  bell,
  explore,
  filledStar,
  unfillStar,
  love,
  search,
  calender,
  time,
  rightArrow,
  redPhone,
  location,
  UserCircle,
  enablePass,
  faceId
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
    image: images.onboarding2,
  },
];

export const Roles = [
  {
    id: 1,
    title: "Primary user",
    description: "I want to buy cars, order rides and consult mechanics",
    image: icons.user,
    border: "#7DA0FF",
    backgroundColor: "#D6E1FF",
  },
  {
    id: 2,
    title: "Marchant",
    description: "I want to buy cars, order rides and consult mechanics",
    image: icons.merchant,
    border: "#FFC38D",
    backgroundColor: "#FFEAD8",
  },
  {
    id: 3,
    title: "Mechanic",
    description: "",
    image: icons.mechanic,
    border: "#DBAF79",
    backgroundColor: "#ECE2D6",
  },
  {
    id: 4,
    title: "Driver",
    description: "",
    image: icons.driver,
    border: "#FF9292",
    backgroundColor: "#FFE9E9",
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

export const MechanicsList = [
  {
    id: 1,
    name: "Mechanic 1",
    rating: 1,
    address: "No 1, Mechanic Street, Lagos",
    price: 100,
    love: true,
    image: mechanic1,
    reviewCount: 20,
  },
  {
    id: 2,
    name: "Mechanic 2",
    rating: 2,
    address: "No 1, Mechanic Street, Lagos",
    price: 100,
    love: true,
    image: mechanic1,
    reviewCount: 20,
  },
  {
    id: 3,
    name: "Mechanic 3",
    rating: 4.5,
    address: "No 1, Mechanic Street, Lagos",
    price: 100,
    love: true,
    image: mechanic1,
    reviewCount: 20,
  },
  {
    id: 4,
    name: "Mechanic 4",
    rating: 4.5,
    address: "No 1, Mechanic Street, Lagos",
    price: 100,
    love: true,
    image: mechanic1,
    reviewCount: 20,
  },
  {
    id: 5,
    name: "Mechanic 5",
    rating: 4.5,
    address: "No 1, Mechanic Street, Lagos",
    price: 100,
    love: true,
    image: mechanic1,
    reviewCount: 20,
  },
];

export const CarsList = [
  {
    id: 1,
    name: "Toyota Camry 2019",
    rating: 4.5,
    address: "No 1, Mechanic Street, Lagos",
    price: 100,
    love: true,
    image: car1,
    reviewCount: 20,
  },
  {
    id: 2,
    name: "Toyota Camry 2019",
    rating: 4.5,
    address: "No 1, Mechanic Street, Lagos",
    price: 100,
    love: true,
    image: car1,
    reviewCount: 20,
  },
  {
    id: 3,
    name: "Toyota Camry 2019",
    rating: 4.5,
    address: "No 1, Mechanic Street, Lagos",
    price: 100,
    love: true,
    image: car1,
    reviewCount: 20,
  },
  {
    id: 4,
    name: "Toyota Camry 2019",
    rating: 4.5,
    address: "No 1, Mechanic Street, Lagos",
    price: 100,
    love: true,
    image: car1,
    reviewCount: 20,
  },
  {
    id: 5,
    name: "Toyota Camry 2019",
    rating: 4.5,
    address: "No 1, Mechanic Street, Lagos",
    price: 100,
    love: true,
    image: car1,
    reviewCount: 20,
  },
];

export const SpareParts = [
  {
    id: 1,
    name: "Toyota Camry 2019",
    rating: 4.5,
    address: "No 1, Mechanic Street, Lagos",
    price: 100000,
    love: true,
    image: sparePart,
    reviewCount: 20,
  },
  {
    id: 2,
    name: "Toyota Camry 2019",
    rating: 4.5,
    address: "No 1, Mechanic Street, Lagos",
    price: 3976600,
    love: true,
    image: sparePart,
    reviewCount: 20,
  },
  {
    id: 3,
    name: "Toyota Camry 2019",
    rating: 4.5,
    address: "No 1, Mechanic Street, Lagos",
    price: 3873820,
    love: true,
    image: sparePart,
    reviewCount: 20,
  },
  {
    id: 4,
    name: "Toyota Camry 2019",
    rating: 4.5,
    address: "No 1, Mechanic Street, Lagos",
    price: 100,
    love: true,
    image: sparePart,
    reviewCount: 20,
  },
  {
    id: 5,
    name: "Toyota Camry 2019",
    rating: 4.5,
    address: "No 1, Mechanic Street, Lagos",
    price: 100,
    love: true,
    image: sparePart,
    reviewCount: 20,
  },
];

export const Services: ServicesProps[] = [
  {
    id: 1,
    name: "Order a Ride",
    description: "Book a ride to your destination",
    image: orderRide,
    bgColor: "#F3F2FE",
    border: "#ACA6FF",
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
    id: 3,
    name: "Buy a Car",
    description: "Find your dream car",
    image: buycar,
    bgColor: "#F8FFD8",
    border: "#F6B80D",
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
    image: orderRide,
    bgColor: "#F3FFF1",
    border: "#189804",
  },
  {
    id: 6,
    name: "Chat a Specialist",
    description: "Get expert advice on your car",
    image: user,
    bgColor: "#F8FFD8",
    border: "#F6B80D",
  },
];

export const OrderRideOptions = [
  {
    id: 1,
    name: "Ride",
    image: orderRide,
  },
  {
    id: 2,
    name: "Courier",
    image: courage,
  },
  {
    id: 3,
    name: "Pick Up",
    image: pickUp,
  },
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
      route: "editProfile",
    },
    {
      id: 2,
      name: "Change Password",
      image: padlock,
      route: "notifications",
    },
    {
      id: 3,
      name: "Switch user",
      image: switch1,
      route: "editProfile",
    },
    {
      id: 4,
      name: "Subscription",
      image: sub,
      route: "notifications",
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
