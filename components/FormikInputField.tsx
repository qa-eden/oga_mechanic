import React from "react";
import { Field } from "formik";
import InputField from "./InputField";
import { InputFieldProps } from "@/types/type";

interface FormikInputFieldProps extends Omit<InputFieldProps, 'onChangeText' | 'onBlur' | 'value'> {
  name: string;
}

const FormikInputField: React.FC<FormikInputFieldProps> = ({ name, ...props }) => {
  return (
    <Field name={name}>
      {({ field, meta }: any) => (
        <InputField
          {...props}
          {...field}
          name={name}
          error={meta.touched && meta.error ? meta.error : undefined}
          touched={meta.touched}
        />
      )}
    </Field>
  );
};

export default FormikInputField; 