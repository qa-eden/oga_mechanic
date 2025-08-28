"use client"

import { useState, useMemo } from "react"
import { useFormikContext } from "formik"
import InputField from "@/components/InputField"
import InputFieldPassword from "@/components/InputFieldPassword"
import type { InputFieldProps } from "@/types/type"

interface FormikInputProps extends InputFieldProps {
  name: string
  type?: string
  secureTextEntry?: boolean
  containerStyle1?: string
}

function FormikInput<T = any>({ name, type, secureTextEntry, ...props }: FormikInputProps) {
  const { values, handleChange, handleBlur, errors, touched, setFieldTouched } = useFormikContext<{
    [key: string]: any
  }>()

  const isPassword = type === "password" || secureTextEntry
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)

  // Enhanced blur handler to ensure proper state management
  const handleFieldBlur = () => {
    handleBlur(name)
  }

  // Enhanced change handler to mark field as touched when user starts typing
  const handleFieldChange = (text: string) => {
    // Mark field as touched when user starts typing
    if (!touched[name]) {
      setFieldTouched(name, true, false)
    }
    handleChange(name)(text)
  }

  // Memoize keyboard type to prevent changes during re-renders
  const keyboardType = useMemo(() => {
    if (type === "email") {
      return "email-address"
    }
    if (type === "phone" || type === "tel") {
      return "phone-pad"
    }
    if (type === "number" || type === "numeric") {
      return "numeric"
    }
    return props.keyboardType || "default"
  }, [type, props.keyboardType])

  // Memoize autoCapitalize to prevent keyboard changes
  const autoCapitalize = useMemo(() => {
    if (type === "email") {
      return "none"
    }
    return props.autoCapitalize || "sentences"
  }, [type, props.autoCapitalize])

  // Memoize autoCorrect to prevent keyboard changes
  const autoCorrect = useMemo(() => {
    if (type === "email" || type === "password") {
      return false
    }
    return props.autoCorrect !== undefined ? props.autoCorrect : true
  }, [type, props.autoCorrect])

  if (isPassword) {
    return (
      <InputFieldPassword
        value={values[name] || ""}
        onChangeText={handleFieldChange}
        onBlur={handleFieldBlur}
        error={typeof errors[name] === "string" && touched[name] ? errors[name] : undefined}
        touched={typeof touched[name] === "boolean" ? touched[name] : undefined}
        secureTextEntry={!isPasswordVisible}
        isPasswordVisible={isPasswordVisible}
        setIsPasswordVisible={setIsPasswordVisible}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        {...props}
      />
    )
  }

  return (
    <InputField
      value={values[name] || ""}
      onChangeText={handleFieldChange}
      onBlur={handleFieldBlur}
      error={typeof errors[name] === "string" && touched[name] ? errors[name] : undefined}
      touched={typeof touched[name] === "boolean" ? touched[name] : undefined}
      leftIcon={props.icon}
      keyboardType={keyboardType}
      autoCapitalize={autoCapitalize}
      autoCorrect={autoCorrect}
      containerStyle1={props.containerStyle1}
      {...props}
    />
  )
}

export default FormikInput
