interface VehicleInfo {
  make: string;
  model: string;
  modelYear: string;
  vehicleType: string;
  engineType: string;
  transmission: string;
  bodyStyle: string;
  fuelType: string;
  trim: string;
  series: string;
  color?: string;
  imageUrl?: string;
  exteriorColor?: string;
  interiorColor?: string;
}

interface NHTSAResponse {
  Results: Array<{
    Variable: string;
    Value: string;
    ValueId: string;
    VariableId: number;
  }>;
}

// Sample VINs for testing (real VINs from popular vehicles)
export const SAMPLE_VINS = {
  TOYOTA_CAMRY: "4T1B11HK5JU123456", // 2018 Toyota Camry
  HONDA_CIVIC: "1HGBH41JXMN109186", // 2021 Honda Civic
  FORD_F150: "1FTEW1EG0JFA12345",   // 2018 Ford F-150
  BMW_3SERIES: "WBA8E9G50JNU12345", // 2018 BMW 3 Series
  MERCEDES_C: "WDDWF4FB0FR123456",  // 2015 Mercedes-Benz C-Class
};

export const decodeVIN = async (vin: string): Promise<VehicleInfo | null> => {
  try {
    // Clean VIN - remove spaces and convert to uppercase
    const cleanVIN = vin.replace(/\s/g, '').toUpperCase();
    
    // Validate VIN length (should be 17 characters)
    if (cleanVIN.length !== 17) {
      throw new Error('VIN must be 17 characters long');
    }

    // Basic VIN validation (check for common patterns)
    if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(cleanVIN)) {
      throw new Error('VIN contains invalid characters. VINs cannot contain I, O, or Q.');
    }

    // NHTSA VIN Decoder API endpoint
    const url = `https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${cleanVIN}?format=json`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Failed to fetch vehicle information');
    }

    const data: NHTSAResponse = await response.json();
    
    if (!data.Results || data.Results.length === 0) {
      throw new Error('No vehicle information found for this VIN');
    }

    // Extract relevant information from the response
    const vehicleInfo: VehicleInfo = {
      make: '',
      model: '',
      modelYear: '',
      vehicleType: '',
      engineType: '',
      transmission: '',
      bodyStyle: '',
      fuelType: '',
      trim: '',
      series: ''
    };

    data.Results.forEach((item) => {
      switch (item.Variable) {
        case 'Make':
          vehicleInfo.make = item.Value || '';
          break;
        case 'Model':
          vehicleInfo.model = item.Value || '';
          break;
        case 'Model Year':
          vehicleInfo.modelYear = item.Value || '';
          break;
        case 'Vehicle Type':
          vehicleInfo.vehicleType = item.Value || '';
          break;
        case 'Engine Model':
        case 'Engine Configuration':
          vehicleInfo.engineType = item.Value || '';
          break;
        case 'Transmission Style':
        case 'Transmission':
          vehicleInfo.transmission = item.Value || '';
          break;
        case 'Body Class':
        case 'Body Style':
          vehicleInfo.bodyStyle = item.Value || '';
          break;
        case 'Fuel Type - Primary':
        case 'Fuel Type':
          vehicleInfo.fuelType = item.Value || '';
          break;
        case 'Trim':
          vehicleInfo.trim = item.Value || '';
          break;
        case 'Series':
          vehicleInfo.series = item.Value || '';
          break;
      }
    });

    // Combine make and model
    if (vehicleInfo.make && vehicleInfo.model) {
      vehicleInfo.model = `${vehicleInfo.make} ${vehicleInfo.model}`;
    }

    // Check if we got any meaningful data
    if (!vehicleInfo.make && !vehicleInfo.model) {
      throw new Error('Unable to decode vehicle information. Please verify the VIN is correct.');
    }

    return vehicleInfo;
  } catch (error) {
    console.error('VIN Decode Error:', error);
    throw error;
  }
};

// Fetch vehicle image using CarQuery API
export const fetchVehicleImage = async (make: string, model: string, year: string): Promise<string | null> => {
  try {
    // Try multiple image sources
    const imageSources = [
      // CarQuery API
      `https://www.carqueryapi.com/images/${make.toLowerCase()}/${model.toLowerCase()}/${year}.jpg`,
      // Alternative format
      `https://www.carqueryapi.com/images/${make.toLowerCase()}_${model.toLowerCase()}_${year}.jpg`,
      // Edmunds API (requires API key in production)
      // `https://api.edmunds.com/api/vehicle/v2/${make}/${model}/${year}/photos?fmt=json&api_key=YOUR_API_KEY`,
    ];

    for (const imageUrl of imageSources) {
      try {
        const response = await fetch(imageUrl, { method: 'HEAD' });
        if (response.ok) {
          return imageUrl;
        }
      } catch (error) {
        continue; // Try next source
      }
    }

    // Fallback to a generic car image based on make
    return getGenericCarImage(make);
  } catch (error) {
    console.error('Vehicle Image Fetch Error:', error);
    return getGenericCarImage(make);
  }
};

// Get generic car image based on make
const getGenericCarImage = (make: string): string => {
  const makeLower = make.toLowerCase();
  
  // Map common makes to generic images
  const makeImages: { [key: string]: string } = {
    'toyota': 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=300&fit=crop',
    'honda': 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=300&fit=crop',
    'ford': 'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?w=400&h=300&fit=crop',
    'bmw': 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&h=300&fit=crop',
    'mercedes': 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=400&h=300&fit=crop',
    'audi': 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400&h=300&fit=crop',
    'volkswagen': 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=300&fit=crop',
    'nissan': 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=300&fit=crop',
    'chevrolet': 'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?w=400&h=300&fit=crop',
    'hyundai': 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=300&fit=crop',
  };

  // Find matching make
  for (const [key, imageUrl] of Object.entries(makeImages)) {
    if (makeLower.includes(key)) {
      return imageUrl;
    }
  }

  // Default generic car image
  return 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=300&fit=crop';
};

// Enhanced VIN decoder with image and color support
export const decodeVINWithImage = async (vin: string): Promise<VehicleInfo | null> => {
  try {
    // First get basic vehicle info
    const vehicleInfo = await decodeVIN(vin);
    
    if (!vehicleInfo) {
      return null;
    }

    // Try to fetch vehicle image
    try {
      const imageUrl = await fetchVehicleImage(
        vehicleInfo.make, 
        vehicleInfo.model.replace(vehicleInfo.make, '').trim(), 
        vehicleInfo.modelYear
      );
      
      if (imageUrl) {
        vehicleInfo.imageUrl = imageUrl;
      }
    } catch (error) {
      console.error('Image fetch failed:', error);
    }

    // Try to get color information from additional sources
    try {
      const colorInfo = await fetchVehicleColor(vin);
      if (colorInfo) {
        vehicleInfo.exteriorColor = colorInfo.exterior;
        vehicleInfo.interiorColor = colorInfo.interior;
        vehicleInfo.color = colorInfo.exterior || colorInfo.interior;
      }
    } catch (error) {
      console.error('Color fetch failed:', error);
    }

    return vehicleInfo;
  } catch (error) {
    console.error('Enhanced VIN Decode Error:', error);
    throw error;
  }
};

// Fetch vehicle color information
const fetchVehicleColor = async (vin: string): Promise<{ exterior?: string; interior?: string } | null> => {
  try {
    // This would typically use a paid API like CarMD or Edmunds
    // For now, we'll return null as most free APIs don't provide color data
    return null;
  } catch (error) {
    console.error('Color fetch error:', error);
    return null;
  }
};

// Alternative: CarQuery API (backup option)
export const decodeVINWithCarQuery = async (vin: string): Promise<VehicleInfo | null> => {
  try {
    const cleanVIN = vin.replace(/\s/g, '').toUpperCase();
    
    // CarQuery API endpoint
    const url = `https://www.carqueryapi.com/api/0.3/?callback=?&cmd=getTrims&make=${encodeURIComponent(cleanVIN.substring(0, 3))}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Failed to fetch vehicle information');
    }

    // Note: CarQuery API returns JSONP, so we'd need to parse it differently
    // This is a simplified version - you might want to use a different approach
    
    return null;
  } catch (error) {
    console.error('CarQuery VIN Decode Error:', error);
    throw error;
  }
}; 