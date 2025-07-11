import React from "react"
import { useFormikContext } from "formik"
import Checkbox from "@/components/Checkbox"

interface FormikCheckboxProps {
  name: string
  label: string
  textColor?: string
  labelStyle?: string
  [key: string]: any
}

const FormikCheckbox: React.FC<FormikCheckboxProps> = ({ 
  name,
  label,
  textColor,
  labelStyle,
  ...props 
}) => {
  const { values, setFieldValue } = useFormikContext<{
    [key: string]: any
  }>()

  return (
    <Checkbox
      label={label}
      isChecked={values[name] || false}
      onPress={(checked) => setFieldValue(name, checked)}
      textColor={textColor}
      labelStyle={labelStyle}
      {...props}
    />
  )
}

export default FormikCheckbox
