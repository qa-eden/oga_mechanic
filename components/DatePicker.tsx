import React, { useState } from 'react'
import { View, Text, TouchableOpacity, Modal, FlatList } from 'react-native'
import { XMarkIcon } from 'react-native-heroicons/outline'

interface DatePickerProps {
  visible: boolean
  onClose: () => void
  onDateSelect: (date: string) => void
  selectedDate?: string
  title?: string
  minYear?: number
  maxYear?: number
}

const DatePicker: React.FC<DatePickerProps> = ({
  visible,
  onClose,
  onDateSelect,
  selectedDate = '',
  title = 'Select Date',
  minYear = 1940,
  maxYear = 2024
}) => {
  const [tempDate, setTempDate] = useState(selectedDate)

  const handleConfirm = () => {
    onDateSelect(tempDate)
    onClose()
  }

  const handleDaySelect = (day: number) => {
    const parts = tempDate.split('/')
    const month = parts[1] || '01'
    const year = parts[2] || '1990'
    setTempDate(`${day.toString().padStart(2, '0')}/${month}/${year}`)
  }

  const handleMonthSelect = (monthIndex: number) => {
    const parts = tempDate.split('/')
    const day = parts[0] || '01'
    const year = parts[2] || '1990'
    setTempDate(`${day}/${(monthIndex + 1).toString().padStart(2, '0')}/${year}`)
  }

  const handleYearSelect = (year: number) => {
    const parts = tempDate.split('/')
    const day = parts[0] || '01'
    const month = parts[1] || '01'
    setTempDate(`${day}/${month}/${year}`)
  }

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => maxYear - i)

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/20 justify-end">
        <View className="bg-white rounded-t-3xl max-h-[70%]">
          {/* Header */}
          <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
            <Text className="text-lg font-semibold text-gray-900">
              {title}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <XMarkIcon size={24} color="gray" />
            </TouchableOpacity>
          </View>

          {/* Date Selection */}
          <View className="p-4">
            <Text className="text-base text-gray-700 mb-4 text-center">
              Select your date
            </Text>
            
            {/* Date Selection Lists */}
            <View className="flex-row space-x-4">
              {/* Day Selection */}
              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-700 mb-2 text-center">Day</Text>
                <View className="h-48 border border-gray-200 rounded-lg">
                  <FlatList
                    data={Array.from({length: 31}, (_, i) => i + 1)}
                    keyExtractor={(item) => item.toString()}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        onPress={() => handleDaySelect(item)}
                        className={`p-3 border-b border-gray-100 ${
                          tempDate.split('/')[0] === item.toString().padStart(2, '0') ? 'bg-red-50' : ''
                        }`}
                      >
                        <Text className={`text-center ${tempDate.split('/')[0] === item.toString().padStart(2, '0') ? 'text-red-500 font-semibold' : 'text-gray-700'}`}>
                          {item.toString().padStart(2, '0')}
                        </Text>
                      </TouchableOpacity>
                    )}
                    showsVerticalScrollIndicator={false}
                  />
                </View>
              </View>

              {/* Month Selection */}
              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-700 mb-2 text-center">Month</Text>
                <View className="h-48 border border-gray-200 rounded-lg">
                  <FlatList
                    data={months}
                    keyExtractor={(item) => item}
                    renderItem={({ item, index }) => (
                      <TouchableOpacity
                        onPress={() => handleMonthSelect(index)}
                        className={`p-3 border-b border-gray-100 ${
                          tempDate.split('/')[1] === (index + 1).toString().padStart(2, '0') ? 'bg-red-50' : ''
                        }`}
                      >
                        <Text className={`text-center text-sm ${tempDate.split('/')[1] === (index + 1).toString().padStart(2, '0') ? 'text-red-500 font-semibold' : 'text-gray-700'}`}>
                          {item}
                        </Text>
                      </TouchableOpacity>
                    )}
                    showsVerticalScrollIndicator={false}
                  />
                </View>
              </View>

              {/* Year Selection */}
              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-700 mb-2 text-center">Year</Text>
                <View className="h-48 border border-gray-200 rounded-lg">
                  <FlatList
                    data={years}
                    keyExtractor={(item) => item.toString()}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        onPress={() => handleYearSelect(item)}
                        className={`p-3 border-b border-gray-100 ${
                          tempDate.split('/')[2] === item.toString() ? 'bg-red-50' : ''
                        }`}
                      >
                        <Text className={`text-center ${tempDate.split('/')[2] === item.toString() ? 'text-red-500 font-semibold' : 'text-gray-700'}`}>
                          {item}
                        </Text>
                      </TouchableOpacity>
                    )}
                    showsVerticalScrollIndicator={false}
                  />
                </View>
              </View>
            </View>

            {/* Confirm Button */}
            <TouchableOpacity
              onPress={handleConfirm}
              className="bg-primary-500 px-6 py-4 rounded-xl my-6"
            >
              <Text className="text-white font-medium text-center">Confirm Date</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

export default DatePicker
