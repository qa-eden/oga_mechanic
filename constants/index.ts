import onboarding1 from "@/assets/images/auth/onboarding1.svg";
import onboarding2 from "@/assets/images/auth/onboarding2.svg";
import background1 from "@/assets/images/auth/background1.png";
import background2 from "@/assets/images/auth/background2.png";
import logo from "@/assets/icons/logo.png";

export const images = {
  onboarding1,
  onboarding2,
  background1,
  background2,
  logo,
};

// export const icons = {
//   arrowDown,
//   arrowUp,
//   backArrow,
//   chat,
//   checkmark,
//   close,
//   dollar,
//   email,
//   eyecross,
//   google,
//   home,
//   list,
//   lock,
//   map,
//   marker,
//   out,
//   person,
//   pin,
//   point,
//   profile,
//   search,
//   selectedMarker,
//   star,
//   target,
//   to,
// };

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

 // "packagerOpts": {
    //   "sourceExts": ["js", "jsx", "tsx", "ts", "svgx"],
    //   "transformer": "node_modules/react-native-svg-transformer/index.js"
    // },
