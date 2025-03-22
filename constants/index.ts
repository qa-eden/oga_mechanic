import onboarding1 from "@/assets/images/auth/onboarding1.svg";
import onboarding2 from "@/assets/images/auth/onboarding2.svg";
import background1 from "@/assets/images/auth/background1.png";
import background2 from "@/assets/images/auth/background2.png";
import loginBackground from "@/assets/images/auth/loginBackground.png";
import splashBackgroundCar from "@/assets/images/auth/splashBackgroundCar.svg";

import logo from "@/assets/icons/logo.svg";
import splash from "@/assets/icons/logo2.svg";
import eyeClosed from "@/assets/icons/EyeClosed.png";
import eyeOpen from "@/assets/icons/eyeOpen.png";
import tick1 from "@/assets/icons/tick1.svg";
import backBtn from "@/assets/icons/backBtn.svg";
import success from "@/assets/images/success.png";

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

export const data = {
  onboarding,
};
