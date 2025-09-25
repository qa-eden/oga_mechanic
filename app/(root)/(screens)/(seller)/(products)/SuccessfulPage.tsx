import SuccessModal from '@/components/SuccessModal';
import { sellerRoutes } from '@/constants/routes';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react'
import { View } from 'react-native'

const SuccessfulPage = () => {
  const [showSuccessModal, setShowSuccessModal] = useState(true);
  const { title, message, route } = useLocalSearchParams<{
    title: string;
    message: string;
    route: string;
  }>();

  const handleModalClose = () => {
    setShowSuccessModal(false);
    // Always navigate to the products page when "View Products" button is clicked
    router.push(sellerRoutes.products as any);
  };

  return (
    <View>
      <SuccessModal
        visible={showSuccessModal}
        onClose={handleModalClose}
        header={title || "Upload Successful!"}
        text={message || "Your item has been uploaded successfully and is now available in your product catalog."}
        buttonText="View Products"
        route={sellerRoutes.products}
      />
    </View>
  )
}

export default SuccessfulPage