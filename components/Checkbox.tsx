import React, { useState } from "react";
import { View } from "react-native";
import BouncyCheckbox from "react-native-bouncy-checkbox";

const Checkbox = () => {
  const [isChecked, setIsChecked] = useState(false);

  return (
    <View>
      <BouncyCheckbox
        size={21}
        fillColor="#D30309"
        text=""
        isChecked={isChecked}
        onPress={(checked) => setIsChecked(checked)}
        iconStyle={{ borderRadius: 4 }} // Slightly rounded corners
        innerIconStyle={{ borderRadius: 4 }} // Ensure inner part also has rounded corners
      />
    </View>
  );
};

export default Checkbox;
