import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { XMarkIcon, StarIcon } from 'react-native-heroicons/solid';
import { StarIcon as StarIconOutline, SparklesIcon } from 'react-native-heroicons/outline';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import CustomButton from '@/components/CustomButton';
import TextArea from '@/components/forms/TextArea';

interface MechanicReviewModalProps {
  visible: boolean;
  onClose: () => void;
  mechanicId: string;
  mechanicName?: string;
  onSubmit: (rating: number, comment: string) => Promise<void>;
  isLoading?: boolean;
}

const REVIEW_SUGGESTIONS = [
  "Friendly and professional",
  "Quick and efficient",
  "Highly recommended",
  "Fair pricing",
  "Arrived exactly on time",
  "Excellent diagnostic skills",
  "Cleaned up after work",
  "Honest and reliable"
];

const MechanicReviewModal: React.FC<MechanicReviewModalProps> = ({
  visible,
  onClose,
  mechanicId,
  mechanicName,
  onSubmit,
  isLoading = false,
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Rating Required', 'Please select a rating before submitting.');
      return;
    }

    if (!comment.trim()) {
      Alert.alert('Comment Required', 'Please provide a comment for your review.');
      return;
    }

    try {
      await onSubmit(rating, comment.trim());
      // Reset form on success
      setRating(0);
      setComment('');
      onClose();
    } catch (error) {
      // Error handling is done in parent component
    }
  };

  const handleApplySuggestion = (suggestion: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const trimmedComment = comment.trim();
    if (trimmedComment === '') {
      setComment(suggestion);
    } else {
      // Don't duplicate if already exists
      if (!trimmedComment.toLowerCase().includes(suggestion.toLowerCase())) {
        setComment(`${trimmedComment}, ${suggestion.toLowerCase()}`);
      }
    }
  };

  const handleClose = () => {
    setRating(0);
    setComment('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <TouchableOpacity
        className="flex-1 bg-black/50 justify-end "
        activeOpacity={1}
        onPress={handleClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          <View className="bg-white rounded-t-[40px] min-h-[75%] pb-10">
            {/* Header */}
            <View className="flex-row items-center justify-between p-7 border-b border-gray-100">
              <View>
                <Text className="text-2xl font-NunitoBold text-gray-900">
                  Review Mechanic
                </Text>
                <Text className="text-xs font-NunitoMedium text-gray-500 uppercase tracking-widest mt-0.5">Share your feedback</Text>
              </View>
              <TouchableOpacity
                onPress={handleClose}
                className="bg-gray-100 p-2 rounded-full"
              >
                <XMarkIcon size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView 
              className="px-6" 
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingVertical: 24 }}
            >
              {mechanicName && (
                <View className="mb-8">
                  <Text className="text-lg font-NunitoSemiBold text-gray-800 leading-6">
                    How was your experience with{"\n"}
                    <Text className="text-primary-600 font-NunitoBold">{mechanicName}?</Text>
                  </Text>
                </View>
              )}

              {/* Star Rating Selection */}
              <View className="mb-10 bg-gray-50/50 p-6 rounded-[32px] border border-gray-100">
                <Text className="text-xs font-NunitoBold text-gray-400 uppercase tracking-widest mb-4 text-center">
                  Select Rating
                </Text>
                <View className="flex-row items-center justify-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                      key={star}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        setRating(star);
                      }}
                      activeOpacity={0.7}
                      className="p-1"
                    >
                      {star <= rating ? (
                        <StarIcon size={44} color="#FBBF24" />
                      ) : (
                        <StarIconOutline size={44} color="#D1D5DB" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
                {rating > 0 && (
                  <Text className="text-center text-base font-NunitoBold text-primary-600 mt-4">
                    {rating === 1 && 'Needs Improvement 😕'}
                    {rating === 2 && 'Fair Experience 😐'}
                    {rating === 3 && 'Good Service 🙂'}
                    {rating === 4 && 'Very Good! 😊'}
                    {rating === 5 && 'Excellent Work! 🤩'}
                  </Text>
                )}
              </View>

              {/* Comment TextArea */}
              <View className="mb-4">
                <TextArea
                  label="Detailed Feedback"
                  placeholder="Tell us what you liked about the service..."
                  value={comment}
                  onChangeText={setComment}
                  rows={5}
                />
              </View>

              {/* Smart Suggestions */}
              <View className="mb-10">
                <View className="flex-row items-center mb-4">
                  <SparklesIcon size={16} color="#D30309" strokeWidth={2.5} />
                  <Text className="text-[11px] font-NunitoBold text-gray-400 uppercase tracking-widest ml-1.5">Quick Review Tags</Text>
                </View>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  className="flex-row"
                  contentContainerStyle={{ paddingRight: 20 }}
                >
                  {REVIEW_SUGGESTIONS.map((suggestion, index) => (
                    <TouchableOpacity 
                      key={index}
                      onPress={() => handleApplySuggestion(suggestion)}
                      className="mr-2"
                    >
                      <LinearGradient
                        colors={['#F9FAFB', '#EDF0F3']}
                        style={{
                          paddingHorizontal: 14,
                          paddingVertical: 8,
                          borderRadius: 20,
                          borderWidth: 1,
                          borderColor: '#E5E7EB',
                        }}
                      >
                        <Text className="text-xs font-NunitoSemiBold text-primary-600">{suggestion}</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Submit Button */}
              <View className="mt-4">
                <CustomButton
                  title="Submit Review"
                  onPress={handleSubmit}
                  bgVariant="primary"
                  className="rounded-2xl h-14 bg-gray-900"
                  disabled={isLoading || rating === 0 || !comment.trim()}
                  loading={isLoading}
                />
              </View>
            </ScrollView>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

export default MechanicReviewModal;
