import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { productsAPI } from '@/lib/api/products';

interface UseProductImagesProps {
  productId: string;
  merchantId?: string;
}

export const useProductImages = ({ productId, merchantId }: UseProductImagesProps) => {
  const queryClient = useQueryClient();

  // Query to fetch product data
  const {
    data: productData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      
      const authToken = await AsyncStorage.getItem('auth_token');
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/products/products/${productId}/`,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'X-Api-Key': process.env.EXPO_PUBLIC_API_KEY || '',
          },
        }
      );

      const responseData = await response.json();
      
      if (!response.ok || responseData.status === false) {
        throw new Error(responseData.message || `HTTP ${response.status}`);
      }

      const finalData = responseData.data || responseData;
      return finalData;
    },
    enabled: !!productId,
    staleTime: 2 * 60 * 1000, // 2 minutes - data is fresh for 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: false, // Don't refetch on mount if data exists
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnReconnect: true // Only refetch when connection is restored
  });

  // Query to fetch products list
  const {
    data: productsData,
    isLoading: isLoadingProducts,
    error: productsError,
    refetch: refetchProducts,
  } = useQuery({
    queryKey: ['products', merchantId, 'all'], // Use 'all' to distinguish from filtered views
    queryFn: async () => {
      const response = await productsAPI.getProducts(
        undefined, // categoryId
        undefined, // minPrice
        undefined, // maxPrice
        undefined, // offset
        undefined, // limit
        merchantId  // merchantId
      );
      return response.data.results || [];
    },
    enabled: !!merchantId, // Only fetch when we have merchantId
    staleTime: 2 * 60 * 1000, // 2 minutes - data is fresh for 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: false, // Don't refetch on mount if data exists
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnReconnect: true // Only refetch when connection is restored
  });

  // Mutation to upload image
  const uploadImage = useMutation({
    mutationFn: async (imageUri: string) => {
      
      const authToken = await AsyncStorage.getItem('auth_token');
      const formData = new FormData();
      
      formData.append('images', {
        uri: imageUri,
        type: 'image/jpeg',
        name: `car_image_${Date.now()}.jpg`,
      } as any);

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/products/products/${productId}/images/upload/`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'X-Api-Key': process.env.EXPO_PUBLIC_API_KEY || '',
          },
          body: formData,
        }
      );

      const result = await response.json();
      
      if (!response.ok || result.status === false) {
        throw new Error(result.message || 'Upload failed');
      }

      return result;
    },
    onSuccess: async (data, variables, context) => {
      try {
        
        // Remove from cache and refetch product
        queryClient.removeQueries({ queryKey: ['product', productId] });
        
        // Force immediate refetch for product
        await queryClient.refetchQueries({ 
          queryKey: ['product', productId],
          type: 'active'
        });
        
        // Invalidate ALL product-related queries for this merchant
        queryClient.removeQueries({ queryKey: ['products', merchantId] }); // Main products
        queryClient.removeQueries({ queryKey: ['products', merchantId, 'all'] }); // All products
        queryClient.removeQueries({ queryKey: ['products', merchantId, 'cars'] }); // Cars only
        queryClient.removeQueries({ queryKey: ['products', merchantId, 'spareParts'] }); // Spare parts only
        
        await Promise.all([
          queryClient.refetchQueries({ queryKey: ['products', merchantId], type: 'active' }),
          queryClient.refetchQueries({ queryKey: ['products', merchantId, 'all'], type: 'active' }),
        ]);
        
      } catch (error) {
      }
    },
    onError: (error: Error) => {
      Alert.alert('Upload Failed', `Failed to upload image: ${error.message}`);
    },
  });

  // Mutation to delete image
  const deleteImage = useMutation({
    mutationFn: async (imageId: number) => {
      
      const authToken = await AsyncStorage.getItem('auth_token');
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/products/products/${productId}/images/?image_id=${imageId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'X-Api-Key': process.env.EXPO_PUBLIC_API_KEY || '',
          },
        }
      );

      const result = await response.json();
      
      if (!response.ok || result.status === false) {
        throw new Error(result.message || 'Delete failed');
      }

      return result;
    },
    onSuccess: async (data, variables, context) => {
      try {
        
        // Remove from cache and refetch product
        queryClient.removeQueries({ queryKey: ['product', productId] });
        
        // Force immediate refetch for product
        await queryClient.refetchQueries({ 
          queryKey: ['product', productId],
          type: 'active'
        });
        
        // Invalidate ALL product-related queries for this merchant
        queryClient.removeQueries({ queryKey: ['products', merchantId] }); // Main products
        queryClient.removeQueries({ queryKey: ['products', merchantId, 'all'] }); // All products
        queryClient.removeQueries({ queryKey: ['products', merchantId, 'cars'] }); // Cars only
        queryClient.removeQueries({ queryKey: ['products', merchantId, 'spareParts'] }); // Spare parts only
        
        await Promise.all([
          queryClient.refetchQueries({ queryKey: ['products', merchantId], type: 'active' }),
          queryClient.refetchQueries({ queryKey: ['products', merchantId, 'all'], type: 'active' }),
        ]);
        
        Alert.alert('Success', 'Image deleted successfully');
      } catch (error) {
        Alert.alert('Success', 'Image deleted successfully (refresh manually)');
      }
    },
    onError: (error: Error) => {
      Alert.alert('Error', 'Failed to delete image. Please try again.');
    },
  });

  // Mutation to replace image
  const replaceImage = useMutation({
    mutationFn: async ({
      imageId,
      imageIndex,
      newImageUri,
    }: {
      imageId: number;
      imageIndex: number;
      newImageUri: string;
    }) => {
      
      const authToken = await AsyncStorage.getItem('auth_token');
      const formData = new FormData();
      
      formData.append('image', {
        uri: newImageUri,
        type: 'image/jpeg',
        name: `replacement_image_${Date.now()}.jpg`,
      } as any);
      
      formData.append(
        'updates',
        JSON.stringify([
          {
            image_id: imageId,
            ordering: imageIndex,
          },
        ])
      );

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/products/products/${productId}/images/`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'X-Api-Key': process.env.EXPO_PUBLIC_API_KEY || '',
          },
          body: formData,
        }
      );

      const result = await response.json();
      
      if (!response.ok || result.status === false) {
        throw new Error(result.message || 'Replace failed');
      }

      return result;
    },
    onSuccess: async (data, variables, context) => {
      try {
        
        // Remove from cache and refetch product
        queryClient.removeQueries({ queryKey: ['product', productId] });
        
        // Force immediate refetch for product
        await queryClient.refetchQueries({ 
          queryKey: ['product', productId],
          type: 'active'
        });
        
        // Invalidate ALL product-related queries for this merchant
        queryClient.removeQueries({ queryKey: ['products', merchantId] }); // Main products
        queryClient.removeQueries({ queryKey: ['products', merchantId, 'all'] }); // All products
        queryClient.removeQueries({ queryKey: ['products', merchantId, 'cars'] }); // Cars only
        queryClient.removeQueries({ queryKey: ['products', merchantId, 'spareParts'] }); // Spare parts only
        
        await Promise.all([
          queryClient.refetchQueries({ queryKey: ['products', merchantId], type: 'active' }),
          queryClient.refetchQueries({ queryKey: ['products', merchantId, 'all'], type: 'active' }),
        ]);
        
        Alert.alert('Success', 'Image replaced successfully');
      } catch (error) {
        Alert.alert('Success', 'Image replaced successfully (refresh manually)');
      }
    },
    onError: (error: Error) => {
      Alert.alert('Replace Error', 'Failed to replace image. Please try again.');
    },
  });

  return {
    // Product query data
    productData,
    isLoading,
    error,
    refetch,
    
    // Products list query data
    productsData,
    isLoadingProducts,
    productsError,
    refetchProducts,
    
    // Mutations
    uploadImage: uploadImage.mutateAsync,
    deleteImage: deleteImage.mutateAsync,
    replaceImage: replaceImage.mutateAsync,
    
    // Mutation states
    isUploadingImage: uploadImage.isPending,
    isDeletingImage: deleteImage.isPending,
    isReplacingImage: replaceImage.isPending,
  };
};

