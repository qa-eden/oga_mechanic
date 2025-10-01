import SuccessModal from '@/components/SuccessModal'
import { sellerRoutes } from '@/constants/routes';
import React, { useState } from 'react'
import { View } from 'react-native'
import { router } from 'expo-router';

const accountCreated = () => {
    const [showSuccessModal, setShowSuccessModal] = useState(true);

    const handleModalClose = () => {
        setShowSuccessModal(false);
        router.push(sellerRoutes.home as any);
    };

  return (
    <View>
        <SuccessModal
            visible={showSuccessModal}
            onClose={handleModalClose}
            header="Account Created Successfully!"
            text="Your account has been created successfully and you can now proceed to your dashboard to start selling."
            buttonText="Go to Dashboard"
        />
    </View>
  )
}

export default accountCreated 