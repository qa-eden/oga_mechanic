import onboarding1 from "@/assets/images/auth/onboarding1.svg";
import onboarding2 from "@/assets/images/auth/onboarding2.svg";
import background1 from "@/assets/images/auth/background1.png";
import background2 from "@/assets/images/auth/background2.png";
import loginBackground from "@/assets/images/auth/loginBackground.png";

import logo from "@/assets/icons/logo.svg";
import eyeClosed from '@/assets/icons/EyeClosed.png';
import eyeOpen from '@/assets/icons/eyeOpen.png';
import tick1 from '@/assets/icons/tick1.svg';

export const images = {
  onboarding1,
  onboarding2,
  background1,
  background2,
  loginBackground,
};

export const icons = {
  logo,
  eyeClosed,
  eyeOpen,
  tick1,
};

export const onboarding = [
  {
    id: 1,
    title: " Your Ultimate Auto Hub",
    description:
      "Buy & sell cars, find expert mechanics, and book rides—all in one place.",
    image: images.onboarding1,
  },
  {
    id: 2,
    title: " Your Car, Your Control",
    description:
      "Stay connected, drive with ease, and manage everything on the go—all in one powerful app",
    image: images.onboarding2,
  },
];

export const data = {
  onboarding,
};