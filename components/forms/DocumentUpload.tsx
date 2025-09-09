import React, { useState } from 'react'
import { View, Text, TouchableOpacity, Alert, Image } from 'react-native'
import { DocumentIcon, XMarkIcon } from 'react-native-heroicons/outline'

interface DocumentUploadProps {
  label?: string
  placeholder?: string
  maxFileSize?: string
  acceptedTypes?: string[]
  value?: any
  onChange?: (file: any) => void
  error?: string
  touched?: boolean
  required?: boolean
  disabled?: boolean
  containerClassName?: string
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({
  label = "Document",
  placeholder = "Upload document",
  maxFileSize = "15 MB",
  acceptedTypes = ["pdf", "jpg", "jpeg", "png"],
  value,
  onChange,
  error,
  touched,
  required = false,
  disabled = false,
  containerClassName = ""
}) => {
  const [isUploading, setIsUploading] = useState(false)

  const hasError = error && touched

  const handleUpload = () => {
    if (disabled) return

    Alert.alert(
      'Upload Document',
      'Choose how you want to upload your document',
      [
        {
          text: 'Camera',
          onPress: () => {
            // TODO: Implement camera capture
            console.log('Opening camera...')
            simulateUpload()
          }
        },
        {
          text: 'Gallery',
          onPress: () => {
            // TODO: Implement gallery picker
            console.log('Opening gallery...')
            simulateUpload()
          }
        },
        {
          text: 'Files',
          onPress: () => {
            // TODO: Implement file picker
            console.log('Opening file picker...')
            simulateUpload()
          }
        },
        { text: 'Cancel', style: 'cancel' }
      ]
    )
  }

  const simulateUpload = () => {
    setIsUploading(true)
    
    // Simulate upload process
    setTimeout(() => {
      const mockFile = {
        name: 'CAC_Document.pdf',
        size: '2.5 MB',
        type: 'application/pdf',
        uri: 'mock://document.pdf',
        uploadedAt: new Date().toISOString()
      }
      
      onChange?.(mockFile)
      setIsUploading(false)
      
      Alert.alert(
        'Upload Successful',
        'Your document has been uploaded successfully',
        [{ text: 'OK' }]
      )
    }, 2000)
  }

  const handleRemove = () => {
    Alert.alert(
      'Remove Document',
      'Are you sure you want to remove this document?',
      [
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            onChange?.(null)
          }
        },
        { text: 'Cancel', style: 'cancel' }
      ]
    )
  }

  return (
    <View className={`space-y-2 ${containerClassName}`}>
      {/* Label */}
      {label && (
        <Text className="text-sm font-NunitoMedium text-gray-700">
          {label}
          {required && <Text className="text-red-500 ml-1">*</Text>}
        </Text>
      )}

      {/* Upload Area */}
      <TouchableOpacity
        onPress={handleUpload}
        disabled={disabled || isUploading}
        className={`w-full p-2 bg-gray-100 rounded-xl border-2 border-dashed items-center justify-center ${
          hasError 
            ? "border-red-500 bg-red-50" 
            : "border-gray-300"
        } ${disabled ? "opacity-50" : ""}`}
        activeOpacity={0.7}
      >
        {value ? (
          // Document Preview
          <View className="w-full h-full p-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <View className="w-10 h-10 bg-blue-100 rounded-lg items-center justify-center mr-3">
                  <DocumentIcon size={20} color="#3B82F6" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-NunitoMedium text-gray-900" numberOfLines={1}>
                    {value.name}
                  </Text>
                  <Text className="text-xs text-gray-500">
                    {value.size} • {value.type}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={handleRemove}
                className="w-6 h-6 bg-red-100 rounded-full items-center justify-center"
                activeOpacity={0.7}
              >
                <XMarkIcon size={14} color="#EF4444" />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          // Upload Placeholder
          <View className="items-center">
            <View className="w-12 h-12 bg-gray-300 rounded-lg items-center justify-center mb-2">
              {isUploading ? (
                <View className="w-6 h-6 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <DocumentIcon size={24} color="#6B7280" />
              )}
            </View>
            <Text className="text-base font-NunitoMedium text-gray-700 mb-1">
              {isUploading ? 'Uploading...' : placeholder}
            </Text>
            <Text className="text-sm text-gray-500">
              Maximum file size {maxFileSize}
            </Text>
            <Text className="text-xs text-gray-400 mt-1">
              Accepted: {acceptedTypes.join(', ').toUpperCase()}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Error Message */}
      {hasError && (
        <Text className="text-red-500 text-sm font-NunitoMedium">
          {String(error)}
        </Text>
      )}

      {/* Helper Text */}
      <Text className="text-xs text-gray-500 font-NunitoMedium">
        Tap to upload from camera, gallery, or files
      </Text>
    </View>
  )
}

export default DocumentUpload
