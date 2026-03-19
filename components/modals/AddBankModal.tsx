import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  FlatList,
  Keyboard,
  TouchableWithoutFeedback,
  Alert,
} from "react-native";
import { XMarkIcon, BanknotesIcon, ChevronDownIcon, CheckCircleIcon, ExclamationTriangleIcon } from "react-native-heroicons/outline";
import CustomButton from "../CustomButton";
import AndroidNavBarSpacer from "../AndroidNavBarSpacer";
import { useBanks, useVerifyBank, useAddBankAccount } from "@/hooks/useUserProfile";
import { Bank } from "@/lib/api/user";
import { showToast } from "@/utils/toastUtils";

interface AddBankModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const AddBankModal = ({ isVisible, onClose }: AddBankModalProps) => {
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [showBankSelector, setShowBankSelector] = useState(false);
  const [isDefault, setIsDefault] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { data: banksResponse, isLoading: isLoadingBanks } = useBanks(isVisible);
  const { mutate: verifyBank, isPending: isVerifying } = useVerifyBank();
  const addBankMutation = useAddBankAccount();

  const banks = banksResponse?.data || [];
  const filteredBanks = banks.filter((bank) =>
    bank.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (accountNumber.length === 10 && selectedBank) {
      verifyBank(
        {
          requestType: "inbound",
          data: {
            account_number: accountNumber,
            bank_code: selectedBank.code,
          },
        },
        {
          onSuccess: (res) => {
            if (res.status && res.data?.account_name) {
              setAccountName(res.data.account_name);
              setError(null);
            } else {
              setAccountName("");
              setError("Could not verify account name. Please check details.");
            }
          },
          onError: (err: any) => {
            setAccountName("");
            const errorData = err.response?.data;
            let message = "Verification failed";
            if (typeof errorData === 'object' && errorData !== null) {
              message = errorData.message || errorData.detail || Object.values(errorData)[0];
              if (Array.isArray(message)) message = message[0];
            }
            setError(message || "Verification failed");
          },
        }
      );
    } else {
      setAccountName("");
    }
  }, [accountNumber, selectedBank]);

  const handleAddBank = () => {
    setError(null);
    if (!selectedBank) {
      setError("Please select a bank");
      return;
    }
    if (accountNumber.length !== 10) {
      setError("Invalid account number");
      return;
    }
    
    // Optional check: we now allow adding even if not verified
    /*
    if (!accountName) {
      setError("Account name not verified. Please wait for verification or check details.");
      return;
    }
    */

    addBankMutation.mutate(
      {
        requestType: "inbound",
        data: {
          account_number: accountNumber,
          account_name: accountName,
          bank_code: selectedBank.code,
          is_default: isDefault,
        },
      },
      {
        onSuccess: () => {
          showToast.success("Bank account added successfully");
          resetForm();
          onClose();
        },
        onError: (err: any) => {
          const errorData = err.response?.data;
          console.log('❌ Add Bank Error:', JSON.stringify(errorData));
          
          let message: any = "Failed to add bank account";
          if (Array.isArray(errorData)) {
            message = errorData[0];
          } else if (typeof errorData === 'object' && errorData !== null) {
            message = errorData.message || errorData.detail || errorData.non_field_errors?.[0] || Object.values(errorData)[0];
            if (Array.isArray(message)) message = message[0];
            
            if (typeof message === 'object' && message !== null) {
              const values = Object.values(message);
              const firstValue = values[0];
              message = Array.isArray(firstValue) ? firstValue[0] : (typeof firstValue === 'string' ? firstValue : JSON.stringify(message));
            }
          } else if (typeof errorData === 'string') {
            message = errorData;
          }
          
          setError(typeof message === 'string' ? message : "An unexpected error occurred");
        },
      }
    );
  };

  const resetForm = () => {
    setAccountNumber("");
    setAccountName("");
    setSelectedBank(null);
    setSearchQuery("");
    setError(null);
  };

  const renderBankItem = ({ item }: { item: Bank }) => (
    <TouchableOpacity
      onPress={() => {
        setSelectedBank(item);
        setShowBankSelector(false);
        setSearchQuery("");
      }}
      className="py-4 border-b border-gray-50 flex-row items-center"
    >
      <View className="w-10 h-10 bg-gray-50 rounded-xl items-center justify-center mr-4">
        <BanknotesIcon size={20} color="#6B7280" />
      </View>
      <Text className="text-gray-900 font-NunitoSemiBold text-base flex-1">{item.name}</Text>
      {selectedBank?.id === item.id && (
        <CheckCircleIcon size={20} color="#D30309" />
      )}
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="pageSheet"
    >
      <View className="flex-1 bg-white">
        <View className="flex-row items-center justify-between px-6 py-5 border-b border-gray-100">
          <Text className="text-xl font-NunitoExtraBold text-gray-900">Add Bank Account</Text>
          <TouchableOpacity
            onPress={onClose}
            className="w-10 h-10 items-center justify-center rounded-full bg-gray-100"
          >
            <XMarkIcon size={20} color="#374151" />
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          {showBankSelector ? (
            <View className="flex-1 px-6 pt-4">
              <TextInput
                placeholder="Search bank..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                className="bg-gray-50 p-4 rounded-2xl font-NunitoMedium mb-4 border border-gray-100"
              />
              {isLoadingBanks ? (
                <View className="flex-1 items-center justify-center">
                  <ActivityIndicator color="#D30309" />
                </View>
              ) : (
                <FlatList
                  data={filteredBanks}
                  renderItem={renderBankItem}
                  keyExtractor={(item) => item.id.toString()}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                />
              )}
            </View>
          ) : (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <ScrollView 
                className="flex-1 px-6 pt-6"
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ flexGrow: 1 }}
              >
                {/* Error Banner */}
                {error && (
                  <View className="mb-6 bg-red-50 p-4 rounded-2xl border border-red-100 flex-row items-start">
                    <ExclamationTriangleIcon size={20} color="#DC2626" />
                    <View className="flex-1 ml-3">
                      <Text className="text-red-800 font-NunitoBold text-[15px] mb-0.5">Submission Error</Text>
                      <Text className="text-red-600 font-NunitoMedium text-[14px] leading-5">{error}</Text>
                    </View>
                    <TouchableOpacity onPress={() => setError(null)}>
                      <XMarkIcon size={20} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                )}

                <View className="mb-6">
                  <Text className="text-gray-700 font-NunitoBold mb-2 ml-1">Select Bank</Text>
                  <TouchableOpacity
                    onPress={() => {
                      Keyboard.dismiss();
                      setShowBankSelector(true);
                    }}
                    className="bg-gray-50 p-4 rounded-2xl flex-row items-center justify-between border border-gray-100"
                  >
                    <Text className={`font-NunitoMedium text-base ${selectedBank ? "text-gray-900" : "text-gray-400"}`}>
                      {selectedBank ? selectedBank.name : "Choose a bank"}
                    </Text>
                    <ChevronDownIcon size={20} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>

                <View className="mb-2">
                  <Text className="text-gray-700 font-NunitoBold mb-2 ml-1">Account Number</Text>
                  <View className="relative">
                    <TextInput
                      placeholder="0000000000"
                      value={accountNumber}
                      onChangeText={(val) => setAccountNumber(val.replace(/[^0-9]/g, ""))}
                      keyboardType="numeric"
                      maxLength={10}
                      className="bg-gray-50 p-4 rounded-2xl font-NunitoMedium text-base border border-gray-100 pr-12"
                    />
                    {isVerifying && (
                      <View className="absolute right-4 top-4">
                        <ActivityIndicator size="small" color="#D30309" />
                      </View>
                    )}
                  </View>
                </View>

                {accountName ? (
                  <View className="bg-green-50 p-4 rounded-2xl mb-6 border border-green-100 flex-row items-center">
                    <CheckCircleIcon size={18} color="#059669" />
                    <Text className="text-green-700 font-NunitoBold ml-2 flex-1">{accountName}</Text>
                  </View>
                ) 
                // : accountNumber.length === 10 && !isVerifying && selectedBank ? (
                //    <View className="bg-red-50 p-4 rounded-2xl mb-6 border border-red-100">
                //       <Text className="text-red-700 font-NunitoMedium text-sm">Could not verify account name. Please check details.</Text>
                //    </View>
                // )
                 : null}

                <TouchableOpacity
                  onPress={() => setIsDefault(!isDefault)}
                  className="flex-row items-center mb-8 ml-1 mt-2"
                >
                  <View className={`w-6 h-6 rounded-md border-2 mr-3 items-center justify-center ${isDefault ? "bg-primary-600 border-primary-600" : "border-gray-300"}`}>
                    {isDefault && <CheckCircleIcon size={16} color="white" />}
                  </View>
                  <Text className="text-gray-700 font-NunitoSemiBold">Set as default account</Text>
                </TouchableOpacity>

                <View className="mt-auto pb-10">
                  <CustomButton
                    title="Add Account"
                    onPress={handleAddBank}
                    loading={addBankMutation.isPending}
                    disabled={!selectedBank || accountNumber.length !== 10 || isVerifying}
                  />
                  <AndroidNavBarSpacer />
                </View>
              </ScrollView>
            </TouchableWithoutFeedback>
          )}
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

export default AddBankModal;
