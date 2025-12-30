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
  stock?: number;
  love?: boolean;
  showLove?: boolean;
  onPress?: () => void;
  onLovePress?: () => void;
  isLoading?: boolean;
  containerStyle?: string;
  productId?: number | string;
  showAddToCart?: boolean;
  isFavorite?: boolean;
  onAddToCart?: () => Promise<void> | void;
  onRemoveFromCart?: () => Promise<void> | void;
  isInCart?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({
  Images,
  rating,
  name,
  address,
  reviewCount,
  price,
  stock = 0,
  love = false,
  showLove = false,
  onPress,
  onLovePress,
  isLoading = false,
  containerStyle,
  productId,
  showAddToCart = true,
  isFavorite = false,
  onAddToCart,
  onRemoveFromCart,
  isInCart = false,
}) => {
  const cartItem: Omit<CartItem, 'quantity'> = {
    id: productId?.toString() || '1',
    name: name || 'Product',
    price: price || 0,
    stock,
    image: 'sparePart', // Default image
    originalPrice: price ? price : 0,
    discount: 0,
  };

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
        onAddToCart={onAddToCart}
        onRemoveFromCart={onRemoveFromCart}
        isInCart={isInCart}
      />
      
      {showAddToCart && price && price > 0 && (
        <View className="mt-2">
          <AddToCartButton
            item={cartItem}
            size="small"
            variant="primary"
            className="w-full"
          />
        </View>
      )}
    </View>
  );
};

export default ProductCard; 