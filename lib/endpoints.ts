import { ENV_CONFIG } from '../config/env';

// Base API URL
export const BASE_URL = ENV_CONFIG.API_URL;

// Auth endpoints (common for all roles)
export const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  REFRESH_TOKEN: '/auth/refresh',
  LOGOUT: '/auth/logout',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  VERIFY_OTP: '/auth/verify-otp',
  SWITCH_ROLE: '/auth/switch-role',
  ALL_ROLES: '/users/roles/list/',
} as const;

// User endpoints (regular users/customers)
export const USER_ENDPOINTS = {
  LOGIN: '/users/login/',
  LOGOUT: '/users/logout/',
  REGISTER: '/users/register/',
  REGISTER_STEP: (stepId: number) => `/users/register/step/${stepId}/`,
  REGISTER_VEHICLE: '/users/register/vehicle/',
  ROLES: '/users/roles/',
  PROFILE: '/users/profile/primary/',
  PRIMARY_PROFILE: '/users/profile/primary/',
  UPDATE_PROFILE: '/users/profile/primary/',
  CARS: '/user/cars',
  ADD_CAR: '/user/cars',
  UPDATE_CAR: (id: string) => `/user/cars/${id}`,
  DELETE_CAR: (id: string) => `/user/cars/${id}`,
  FIND_MECHANIC: '/user/mechanics/find',
  BOOK_MECHANIC: '/user/mechanics/book',
  ORDER_RIDE: '/user/rides/order',
  RENT_CAR: '/user/cars/rent',
  BUY_CAR: '/user/cars/buy',
  SHOP_ITEMS: '/user/shop/items',
  CART: '/user/cart',
  ORDERS: '/user/orders',
  PAYMENTS: '/user/payments',
} as const;

// Mechanic endpoints (service providers)
export const MECHANIC_ENDPOINTS = {
  PROFILE: '/mechanic/profile',
  UPDATE_PROFILE: '/mechanic/profile',
  SERVICES: '/mechanic/services',
  ADD_SERVICE: '/mechanic/services',
  UPDATE_SERVICE: (id: string) => `/mechanic/services/${id}`,
  DELETE_SERVICE: (id: string) => `/mechanic/services/${id}`,
  BOOKINGS: '/mechanic/bookings',
  ACCEPT_BOOKING: (id: string) => `/mechanic/bookings/${id}/accept`,
  REJECT_BOOKING: (id: string) => `/mechanic/bookings/${id}/reject`,
  COMPLETE_BOOKING: (id: string) => `/mechanic/bookings/${id}/complete`,
  EARNINGS: '/mechanic/earnings',
  WITHDRAW: '/mechanic/earnings/withdraw',
  AVAILABILITY: '/mechanic/availability',
  SET_AVAILABILITY: '/mechanic/availability',
  REVIEWS: '/mechanic/reviews',
  SCHEDULE: '/mechanic/schedule',
  VEHICLE_MAKES: '/mechanics/vehicle-makes/',
} as const;

// Driver endpoints (transportation providers)
export const DRIVER_ENDPOINTS = {
  PROFILE: '/driver/profile',
  UPDATE_PROFILE: '/driver/profile',
  VEHICLE: '/driver/vehicle',
  UPDATE_VEHICLE: '/driver/vehicle',
  RIDES: '/driver/rides',
  ACCEPT_RIDE: (id: string) => `/driver/rides/${id}/accept`,
  REJECT_RIDE: (id: string) => `/driver/rides/${id}/reject`,
  START_RIDE: (id: string) => `/driver/rides/${id}/start`,
  COMPLETE_RIDE: (id: string) => `/driver/rides/${id}/complete`,
  LOCATION: '/driver/location',
  UPDATE_LOCATION: '/driver/location',
  EARNINGS: '/driver/earnings',
  WITHDRAW: '/driver/earnings/withdraw',
  AVAILABILITY: '/driver/availability',
  SET_AVAILABILITY: '/driver/availability',
} as const;

// Merchant endpoints (shop owners)
export const MERCHANT_ENDPOINTS = {
  PROFILE: 'users/profile/merchant/',
  UPDATE_PROFILE: '/merchant/profile',
  SHOPS: '/merchant/shops',
  CREATE_SHOP: '/merchant/shops',
  UPDATE_SHOP: (id: string) => `/merchant/shops/${id}`,
  DELETE_SHOP: (id: string) => `/merchant/shops/${id}`,
  PRODUCTS: '/merchant/products',
  ADD_PRODUCT: '/merchant/products',
  UPDATE_PRODUCT: (id: string) => `/merchant/products/${id}`,
  DELETE_PRODUCT: (id: string) => `/merchant/products/${id}`,
  ORDERS: '/merchant/orders',
  UPDATE_ORDER_STATUS: (id: string) => `/merchant/orders/${id}/status`,
  INVENTORY: '/merchant/inventory',
  UPDATE_INVENTORY: (id: string) => `/merchant/inventory/${id}`,
  EARNINGS: '/merchant/earnings',
  WITHDRAW: '/merchant/earnings/withdraw',
  ANALYTICS: '/products/merchant/analytics/',
} as const;

// Common service endpoints (used by multiple roles)
export const SERVICE_ENDPOINTS = {
  MECHANICS_FIND: '/mechanics/find',
  MECHANICS_NEARBY: '/mechanics/nearby',
  MECHANICS_AVAILABLE: '/mechanics/available-mechanics/',
  MECHANIC_PROFILE: (id: string) => `/mechanics/${id}`,
  MECHANIC_DETAIL: (id: string) => `/mechanics/mechanics/${id}/`,
  MECHANIC_REVIEWS: (id: string) => `/mechanics/${id}/reviews`,
  RIDES_CREATE: '/rides',
  RIDES_NEARBY_DRIVERS: '/rides/nearby-drivers',
  RIDES_TRACK: (id: string) => `/rides/${id}/track`,
  RIDES_CANCEL: (id: string) => `/rides/${id}/cancel`,
  RIDES_COMPLETE: (id: string) => `/rides/${id}/complete`,
  PAYMENTS_CREATE: '/payments',
  PAYMENTS_VERIFY: (id: string) => `/payments/${id}/verify`,
  PAYMENTS_HISTORY: '/payments/history',
  SHOP_PRODUCTS: '/shop/products',
  SHOP_PRODUCT_DETAIL: (id: string) => `/shop/products/${id}`,
  SHOP_CATEGORIES: '/shop/categories',
  SHOP_SEARCH: '/shop/search',
  PRODUCTS_HOME: '/products/home/',
  PRODUCTS_LIST: '/products/products/',
  PRODUCTS_BY_MERCHANT: (merchantId: string) => `/products/products/${merchantId}/`,
  PRODUCTS_SEARCH: '/products/products/search/',
  PRODUCT_DETAIL: (id: string) => `/products/products/${id}/`,
  PRODUCTS_CATEGORIES: '/products/categories/',
  // Cart endpoints
  CART: '/products/cart/',
  ADD_TO_CART: '/products/cart/',
  GET_CART: '/products/cart/',
  UPDATE_CART_ITEM: '/products/cart/',
  REMOVE_FROM_CART: '/products/cart',
  CLEAR_CART: '/products/cart/clear/',
  // Favorites endpoints
  FAVORITE_PRODUCT: '/products/favorite-product/',
  // Checkout endpoints
  CHECKOUT: '/products/checkout/',
  SUPPORT_CONTACT: '/support/contact',
  SUPPORT_FAQ: '/support/faq',
  SUPPORT_TICKETS: '/support/tickets',
  SUPPORT_CREATE_TICKET: '/support/tickets',
} as const;
