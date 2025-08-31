import React from 'react'
import { View, Text, ScrollView, TouchableOpacity, Modal, Image } from 'react-native'

// Import BankNameLogo directly from the correct path
let BankNameLogo: any[] = []
try {
  const dataModule = require('../constants/data')
  BankNameLogo = dataModule.BankNameLogo || []
} catch (error) {
  BankNameLogo = []
}

interface BankPickerProps {
  visible: boolean
  onClose: () => void
  onSelectBank: (bank: string) => void
  selectedBank?: string
  banks?: typeof BankNameLogo
  title?: string
}

const BankPicker: React.FC<BankPickerProps> = ({
  visible,
  onClose,
  onSelectBank,
  selectedBank = '',
  banks = [],
  title = "Select Bank"
}) => {
  // Fallback banks in case import fails
  const fallbackBanks = [
    { name: "Access Bank", slug: "access-bank", code: "044", ussd: "*901#", logo: "" },
    { name: "First Bank", slug: "first-bank", code: "011", ussd: "*894#", logo: "" },
    { name: "GT Bank", slug: "gt-bank", code: "058", ussd: "*737#", logo: "" },
    { name: "UBA", slug: "uba", code: "033", ussd: "*919#", logo: "" },
    { name: "Zenith Bank", slug: "zenith-bank", code: "057", ussd: "*966#", logo: "" },
    { name: "Stanbic IBTC", slug: "stanbic-ibtc", code: "221", ussd: "*909#", logo: "" },
    { name: "Fidelity Bank", slug: "fidelity-bank", code: "070", ussd: "*770#", logo: "" },
    { name: "Union Bank", slug: "union-bank", code: "032", ussd: "*826#", logo: "" },
    { name: "Wema Bank", slug: "wema-bank", code: "035", ussd: "*945#", logo: "" },
    { name: "Polaris Bank", slug: "polaris-bank", code: "076", ussd: "*833#", logo: "" },
    { name: "Keystone Bank", slug: "keystone-bank", code: "082", ussd: "*7111#", logo: "" },
    { name: "FCMB", slug: "fcmb", code: "214", ussd: "*329#", logo: "" },
    { name: "Ecobank", slug: "ecobank", code: "050", ussd: "*326#", logo: "" },
    { name: "Heritage Bank", slug: "heritage-bank", code: "030", ussd: "*322#", logo: "" },
    { name: "Unity Bank", slug: "unity-bank", code: "215", ussd: "*7799#", logo: "" },
    { name: "Jaiz Bank", slug: "jaiz-bank", code: "301", ussd: "*389*301#", logo: "" },
    { name: "Titan Trust Bank", slug: "titan-trust", code: "102", ussd: "*922#", logo: "" },
    { name: "Providus Bank", slug: "providus-bank", code: "101", ussd: "", logo: "" },
    { name: "Suntrust Bank", slug: "suntrust-bank", code: "100", ussd: "*5230#", logo: "" }
  ]

  // Use provided banks, then BankNameLogo, then fallback
  let bankList = banks
  if (bankList.length === 0) {
    bankList = BankNameLogo
  }
  
  // If still no banks, use fallback
  if (bankList.length === 0) {
    bankList = fallbackBanks
  }

  const handleBankSelect = (bankName: string) => {
    onSelectBank(bankName)
    onClose()
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/20 bg-opacity-50 justify-end">
        <View className="bg-white rounded-t-3xl max-h-[70vh] h-full pb-4">
          {/* Header */}
          <View className="flex-row items-center justify-between p-6 border-b border-gray-200">
            <Text className="text-xl font-semibold text-gray-900">{title}</Text>
            <TouchableOpacity onPress={onClose} className="p-2">
              <Text className="text-gray-500 text-3xl">✕</Text>
            </TouchableOpacity>
          </View>
          
          {/* Bank List */}
          <ScrollView className="flex-1">
            
            {bankList && bankList.length > 0 ? (
              bankList.map((bank, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleBankSelect(bank.name)}
                  className={`py-4 border-b border-gray-200 px-6 ${
                    selectedBank === bank.name ? 'bg-blue-50' : ''
                  }`}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1">
                      {/* Bank Logo */}
                      <View className="w-10 h-10 rounded-full bg-gray-100 mr-3 items-center justify-center overflow-hidden">
                        {bank.logo && bank.logo.startsWith('http') ? (
                          <Image 
                            source={{ uri: bank.logo }} 
                            className="w-8 h-8 rounded-full"
                            resizeMode="cover"
                          />
                        ) : bank.logo && bank.logo.startsWith('data:image') ? (
                          <Image 
                            source={{ uri: bank.logo }} 
                            className="w-8 h-8 rounded-full"
                            resizeMode="cover"
                          />
                        ) : (
                          <Text className="text-gray-500 text-xs font-medium">
                            {bank.name.charAt(0).toUpperCase()}
                          </Text>
                        )}
                      </View>
                      
                      {/* Bank Info */}
                      <View className="flex-1">
                        <Text className={`text-base font-medium ${
                          selectedBank === bank.name ? 'text-blue-600' : 'text-gray-900'
                        }`}>
                          {bank.name}
                        </Text>
                        {bank.code && (
                          <Text className="text-xs text-gray-500 mt-1">
                            Code: {bank.code}
                          </Text>
                        )}
                      </View>
                    </View>
                    
                    {/* Selection Indicator */}
                    {selectedBank === bank.name && (
                      <Text className="text-blue-600 text-lg ml-2">✓</Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View className="py-8 items-center">
                <Text className="text-gray-500 text-center">
                  No banks available
                </Text>
                <Text className="text-gray-400 text-sm text-center mt-2">
                  Debug: bankList.length = {bankList?.length || 0}
                </Text>
                <Text className="text-gray-400 text-sm text-center mt-1">
                  BankNameLogo length = {BankNameLogo?.length || 0}
                </Text>
                <Text className="text-gray-400 text-sm text-center mt-1">
                  Fallback length = {fallbackBanks?.length || 0}
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  )
}

export default BankPicker
