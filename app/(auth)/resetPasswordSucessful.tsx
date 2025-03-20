import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { Toast } from 'toastify-react-native'

const ResetPasswordSucessful = () => {
    const handleSign =() => {
        Toast.error('hello')
    }
  return (
    <View>
      <Text>ResetPasswordSucessful</Text>

      <TouchableOpacity onPress={handleSign}>
        <Text>Sign In</Text>
      </TouchableOpacity>
    </View>
  )
}

export default ResetPasswordSucessful