import React from 'react';
import { View, Image } from 'react-native';
import Card1 from './Card1';
import AddToCartButton from '../AddToCartButton';
import { CartItem } from '@/contexts/CartContext';

interface ProductCardProps {
  Images: any;
  rating?: number;
  name?: string;
  address?: string;
  reviewCount?: number;
  price?: number;
  love?: boolean;
  showLove?: boolean;
  onPress?: () => void;
  onLovePress?: () => void;
  isLoading?: boolean;
  containerStyle?: string;
  productId?: number | string;
  isFavorite?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({
  Images,
  rating,
  name,
  address,
  reviewCount,
  price,
  love = false,
  showLove = false,
  onPress,
  onLovePress,
  isLoading = false,
  containerStyle,
  productId,
  isFavorite = false,
}) => {
  return (
    <View className="w-full">
      <Card1
        Images={Images}
        rating={rating}
        name={name}
        address={address}
        reviewCount={reviewCount}
        price={price}
        love={love}
        showLove={showLove}
        onPress={onPress}
        onLovePress={onLovePress}
        isLoading={isLoading}
        containerStyle={containerStyle}
        productId={productId}
        isFavorite={isFavorite}
      />
    </View>
  );
};

export default ProductCard; 