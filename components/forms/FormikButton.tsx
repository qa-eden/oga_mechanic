
import type React from "react";
import { useFormikContext } from "formik";
import CustomButton from "@/components/CustomButton";

interface FormikButtonProps {
  title: string;
  onPress?: () => void;
  className?: string;
  disabled?: boolean;
  loadingText?: string;
  [key: string]: any;
}

const FormikButton: React.FC<FormikButtonProps> = ({
  title,
  onPress,
  className,
  disabled,
  loadingText = "Processing",
  ...props
}) => {
  const { handleSubmit, values, setFieldTouched, isSubmitting, errors, isValid, dirty } =
    useFormikContext<{
      [key: string]: any;
    }>();

  const handleButtonPress = () => {
    // Mark all fields as touched to trigger validation display
    Object.keys(values as object).forEach((fieldName) => {
      setFieldTouched(fieldName, true);
    });

    // Small delay to ensure touched state is set before validation
    setTimeout(() => {
      if (onPress) {
        onPress();
      } else {
        handleSubmit();
      }
    }, 50);
  };

  // Check if form has any errors
  const hasErrors = Object.keys(errors).length > 0;

  return (
    <CustomButton
      title={title}
      onPress={handleButtonPress}
      className={className}
      disabled={disabled !== undefined ? disabled : (!isValid || !dirty || isSubmitting)}
      loading={isSubmitting}
      loadingText="Processing"
      {...props}
    />
  );
};

export default FormikButton;
