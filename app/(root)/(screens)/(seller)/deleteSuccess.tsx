import React, { useState } from 'react'
import { router, useLocalSearchParams } from 'expo-router'
import SuccessModal from '@/components/SuccessModal'

const DeleteSuccess = () => {
  const [showSuccessModal, setShowSuccessModal] = useState(true);
  const { itemType } = useLocalSearchParams<{
    itemType: 'car' | 'sparePart' | 'rentedCar';
  }>();

  const getItemTypeText = () => {
    switch (itemType) {
      case 'car':
        return 'car'
      case 'sparePart':
        return 'spare part'
      case 'rentedCar':
        return 'rented car'
      default:
        return 'item'
    }
  }

  const handleModalClose = () => {
    setShowSuccessModal(false);
    
    // Navigate back to the appropriate list page
    if (itemType === 'sparePart') {
      router.push('/(root)/(screens)/(seller)/allSpareParts' as any);
    } else if (itemType === 'car') {
      router.push('/(root)/(screens)/(seller)/allCars' as any);
    } else if (itemType === 'rentedCar') {
      router.push('/(root)/(screens)/(seller)/allRentedCars' as any);
    } else {
      router.back();
    }
  };

  return (
    <SuccessModal
      visible={showSuccessModal}
      onClose={handleModalClose}
      header="Successful"
      text={`You have successfully deleted this ${getItemTypeText()}`}
      buttonText="Done"
    />
  )
}

export default DeleteSuccess
