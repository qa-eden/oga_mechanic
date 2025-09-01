import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import SuccessModal from '@/components/SuccessModal';
import { router } from 'expo-router';
import { driverRoutes } from '@/constants/routes';

const DriverWithdrawalSuccess = () => {
  const [showSuccessModal, setShowSuccessModal] = useState(true);

  const handleModalClose = () => {
    router.push(driverRoutes?.earnings);
    setShowSuccessModal(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <StatusBar style="dark" />

      <SuccessModal
        visible={showSuccessModal} 
        onClose={handleModalClose}
        header="Withdrawal confirmed"
        text="Your withdrawal request has been confirmed and will be processed within 24 hours."
        buttonText="View Withdrawal History"
      />
    </SafeAreaView>
  );
};

export default DriverWithdrawalSuccess;
