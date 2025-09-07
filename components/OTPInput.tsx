import { OTPInputProps } from "@/types/type";
import React from "react";
import { View, StyleSheet } from "react-native";
import { OtpInput } from "react-native-otp-entry";

const OTPInput = ({ numberOfDigits, onComplete, countdown }: OTPInputProps) => {
  return (
    <View style={styles.container}>
      <OtpInput
        numberOfDigits={numberOfDigits || 6}
        focusColor="#FFBFC2"
        autoFocus={false}
        hideStick={true}
        placeholder=""
        blurOnFilled={true}

        type="numeric"
        secureTextEntry={false}
        focusStickBlinkingDuration={500}
        // onFocus={() => console.log("Focused")}
        // onBlur={() => console.log("Blurred")}
        // onTextChange={(text) => console.log(text)}
        onFilled={(text) => onComplete?.(text)}
        textInputProps={{
          accessibilityLabel: "One-Time Password",
        }}
        theme={{
          containerStyle: styles.container,
          pinCodeContainerStyle: styles.pinCodeContainer,
          pinCodeTextStyle: styles.pinCodeText,
          focusStickStyle: styles.focusStick,
          focusedPinCodeContainerStyle: styles.activePinCodeContainer,
          placeholderTextStyle: styles.placeholderText,
          filledPinCodeContainerStyle: styles.filledPinCodeContainer,

        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
  },
  pinCodeContainer: {
    width: 50,
    height: 50,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
  },
  pinCodeText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  focusStick: {
    backgroundColor: "#FFBFC2",
  },
  activePinCodeContainer: {
    borderColor: "#FFBFC2",
  },
  placeholderText: {
    color: "#ccc",
  },
  filledPinCodeContainer: {
    borderColor: "red",
  },
});

export default OTPInput;
