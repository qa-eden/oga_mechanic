import { useState, useEffect, useCallback } from 'react';
import { Image } from 'react-native';

type ImageSource = string | number | { uri: string } | null | undefined;

interface UseImageValidatorResult {
  validImage: ImageSource | null;
  isLoading: boolean;
  isValid: boolean;
  currentIndex: number;
}

/**
 * Custom hook to validate images from an array of sources.
 * Tries each image in order until finding a valid one.
 * If all images are invalid, returns null.
 * 
 * @param images - Array of image sources to validate (URLs, require(), or { uri: string })
 * @returns Object with validImage, isLoading, isValid, and currentIndex
 */
export const useImageValidator = (
  images: ImageSource | ImageSource[]
): UseImageValidatorResult => {
  const [validImage, setValidImage] = useState<ImageSource | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Normalize images to array
  const imageArray = Array.isArray(images) ? images : [images];

  const validateImage = useCallback(async (source: ImageSource): Promise<boolean> => {
    if (!source) return false;

    try {
      // Handle string URLs
      if (typeof source === 'string') {
        if (!source || source === 'sparePart' || source.trim() === '') {
          return false;
        }
        // Use Image.prefetch to validate remote URLs
        await Image.prefetch(source);
        return true;
      }

      // Handle { uri: string } objects
      if (typeof source === 'object' && source !== null && 'uri' in source) {
        const uri = source.uri;
        if (!uri || uri.trim() === '') {
          return false;
        }
        await Image.prefetch(uri);
        return true;
      }

      // Handle require() - local images (numbers in RN)
      if (typeof source === 'number') {
        return true; // Local images are always valid
      }

      return false;
    } catch (error) {
      return false;
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const findValidImage = async () => {
      setIsLoading(true);
      setIsValid(false);
      setValidImage(null);

      for (let i = 0; i < imageArray.length; i++) {
        const source = imageArray[i];
        
        if (!isMounted) return;

        const isImageValid = await validateImage(source);
        
        if (isImageValid && isMounted) {
          setValidImage(source);
          setIsValid(true);
          setCurrentIndex(i);
          setIsLoading(false);
          return;
        }
      }

      // No valid image found
      if (isMounted) {
        setValidImage(null);
        setIsValid(false);
        setCurrentIndex(-1);
        setIsLoading(false);
      }
    };

    findValidImage();

    return () => {
      isMounted = false;
    };
  }, [JSON.stringify(imageArray), validateImage]);

  return {
    validImage,
    isLoading,
    isValid,
    currentIndex,
  };
};

/**
 * Helper function to get image source in correct format for Image component
 */
export const getImageSource = (source: ImageSource): { uri: string } | number | null => {
  if (!source) return null;
  
  if (typeof source === 'string') {
    return { uri: source };
  }
  
  if (typeof source === 'number') {
    return source;
  }
  
  if (typeof source === 'object' && 'uri' in source) {
    return source;
  }
  
  return null;
};

export default useImageValidator;

