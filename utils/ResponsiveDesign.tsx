import { Dimensions, PixelRatio, Platform, StyleSheet } from "react-native";
import DeviceInfo from "react-native-device-info";

export const { width, height } = Dimensions.get("window");
export const isSmallScreen = width < 375 && !DeviceInfo.hasNotch();

const isAndroid = Platform.OS === "android";
const isIOS = Platform.OS === "ios";

type BaseT = "HEIGHT" | "WIDTH";

enum BaseEnum {
  HEIGHT = "HEIGHT",
  WIDTH = "WIDTH",
}

const screenHeight = 896;
const screenWidth = 424;

const baseHeightScale = height / screenHeight;
const baseWidthScale = width / screenWidth;

function scaleValue(size: number, based: BaseT) {
  const newSize =
    based === "HEIGHT" ? size * baseHeightScale : size * baseWidthScale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
}

function heightPixel(size: number) {
  return scaleValue(size, BaseEnum.HEIGHT);
}

function widthPixel(size: number) {
  return scaleValue(size, BaseEnum.WIDTH);
}

function fontScale(size: number) {
  return heightPixel(size);
}

function verticalScale(size: number) {
  return heightPixel(size);
}

function horizontalScale(size: number) {
  return widthPixel(size);
}

const globalStyles = StyleSheet.create({
  centerText: {
    textAlign: "center",
  },
  headerStyle: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  mbSm: {
    marginBottom: "3%",
  },
  mbMD: {
    marginBottom: "7%",
  },
  mbLg: {
    marginBottom: "15%",
  },
  mtSm: {
    marginTop: "3%",
  },
  mtMd: {
    marginTop: "10%",
  },
  mtLg: {
    marginTop: "40%",
  },
  phSm: {
    paddingHorizontal: "4%",
  },
  phMd: {
    paddingHorizontal: "15%",
  },
  phLg: {
    paddingHorizontal: "25%",
  },
  pvSm: {
    paddingVertical: "5%",
  },
  pvMd: {
    paddingVertical: "15%",
  },
  pvLg: {
    paddingVertical: "25%",
  },
  rowFlex: {
    alignItems: "center",
    flexDirection: "row",
  },
  screenContainer: {
    flex: 1,
    paddingVertical:
      Platform.OS === "ios" ? verticalScale(10) : verticalScale(20),
    paddingHorizontal: horizontalScale(16),
  },
  spaceBetween: {
    justifyContent: "space-between",
  },
});

export {
  fontScale,
  globalStyles,
  heightPixel,
  horizontalScale,
  isAndroid,
  isIOS,
  verticalScale,
  widthPixel,
};