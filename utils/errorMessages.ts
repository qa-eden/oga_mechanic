// User-friendly error messages
export const getErrorMessage = (error: any, context: string = 'general'): string => {
  // Network/Connection errors
  if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
    return 'No internet connection. Check your WiFi or mobile data.';
  }
  
  if (error.code === 'TIMEOUT' || error.message?.includes('timeout')) {
    return 'Request took too long. Please try again.';
  }
  
  // HTTP Status codes
  if (error.response?.status) {
    switch (error.response.status) {
      case 400:
        return 'Invalid request. Please check your input.';
      case 401:
        return 'Please login again.';
      case 403:
        return 'You don\'t have permission to do this.';
      case 404:
        return 'Item not found.';
      case 408:
        return 'Request timeout. Please try again.';
      case 429:
        return 'Too many requests. Please wait a moment.';
      case 500:
        return 'Server error. Please try again later.';
      case 502:
        return 'Server is down. Please try again later.';
      case 503:
        return 'Service unavailable. Please try again later.';
      default:
        return 'Something went wrong. Please try again.';
    }
  }
  
  // API-specific error messages
  if (error.response?.data?.message) {
    const apiMessage = error.response.data.message.toLowerCase();
    
    // Login/Register errors
    if (apiMessage.includes('invalid credentials') || apiMessage.includes('wrong password')) {
      return 'Wrong email or password.';
    }
    if (apiMessage.includes('user not found')) {
      return 'Account not found. Please register first.';
    }
    if (apiMessage.includes('email already exists')) {
      return 'Email already registered. Try logging in.';
    }
    if (apiMessage.includes('phone already exists')) {
      return 'Phone number already registered.';
    }
    if (apiMessage.includes('invalid email')) {
      return 'Please enter a valid email address.';
    }
    if (apiMessage.includes('password too short')) {
      return 'Password must be at least 6 characters.';
    }
    
    // Product/Cart errors
    if (apiMessage.includes('product not found')) {
      return 'Product not available.';
    }
    if (apiMessage.includes('out of stock')) {
      return 'This item is out of stock.';
    }
    if (apiMessage.includes('cart is empty')) {
      return 'Your cart is empty.';
    }
    if (apiMessage.includes('insufficient stock')) {
      return 'Not enough items in stock.';
    }
    
    // Generic API messages
    if (apiMessage.includes('success')) {
      return 'Operation completed successfully.';
    }
    if (apiMessage.includes('failed')) {
      return 'Operation failed. Please try again.';
    }
  }
  
  // Context-specific messages
  switch (context) {
    case 'login':
      return 'Login failed. Check your email and password.';
    case 'register':
      return 'Registration failed. Please check your details.';
    case 'products':
      return 'Failed to load products. Please try again.';
    case 'categories':
      return 'Failed to load categories. Please try again.';
    case 'cart':
      return 'Cart operation failed. Please try again.';
    case 'profile':
      return 'Failed to update profile. Please try again.';
    case 'payment':
      return 'Payment failed. Please try again.';
    case 'network':
      return 'No internet connection. Check your network.';
    default:
      return 'Something went wrong. Please try again.';
  }
};

// Success messages
export const getSuccessMessage = (context: string): string => {
  switch (context) {
    case 'login':
      return 'Login successful!';
    case 'register':
      return 'Account created successfully!';
    case 'profile':
      return 'Profile updated successfully!';
    case 'cart_add':
      return 'Item added to cart!';
    case 'cart_remove':
      return 'Item removed from cart!';
    case 'cart_update':
      return 'Cart updated!';
    case 'cart_clear':
      return 'Cart cleared!';
    case 'order':
      return 'Order placed successfully!';
    case 'payment':
      return 'Payment successful!';
    default:
      return 'Operation completed successfully!';
  }
};

// Loading messages
export const getLoadingMessage = (context: string): string => {
  switch (context) {
    case 'login':
      return 'Logging in...';
    case 'register':
      return 'Creating account...';
    case 'products':
      return 'Loading products...';
    case 'categories':
      return 'Loading categories...';
    case 'cart':
      return 'Updating cart...';
    case 'profile':
      return 'Updating profile...';
    case 'payment':
      return 'Processing payment...';
    default:
      return 'Loading...';
  }
};
