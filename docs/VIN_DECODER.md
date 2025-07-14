# VIN Decoder Integration

## Overview
The VIN (Vehicle Identification Number) decoder automatically populates vehicle details when a user enters their 17-character VIN in the registration form.

## Features
- **Automatic Population**: Fills in make, model, year, vehicle type, engine type, transmission, and body style
- **Real-time Validation**: Validates VIN format and length
- **User-friendly**: Shows loading states and helpful error messages
- **Free API**: Uses NHTSA's free VIN decoder API

## How It Works

### 1. VIN Input
- User enters their 17-character VIN
- VIN is automatically converted to uppercase and spaces are removed
- Basic validation checks for invalid characters (I, O, Q are not allowed in VINs)

### 2. API Call
- Makes request to NHTSA VIN Decoder API: `https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/{VIN}?format=json`
- Handles network errors and API response validation

### 3. Data Population
- Extracts relevant vehicle information from API response
- Automatically fills form fields with retrieved data
- Shows success/error messages to user

## Implementation

### Files Modified
- `app/(auth)/(register)/user/step2.tsx` - Main registration form
- `utils/vinDecoder.ts` - VIN decoding service
- `components/VINTestComponent.tsx` - Test component (optional)

### Key Functions

```typescript
// Decode VIN and return vehicle information
const vehicleInfo = await decodeVIN(vin);

// Handle VIN lookup in form
const handleVINLookup = async (vin: string, setFieldValue: any) => {
  // Implementation details...
};
```

## API Response Format
The NHTSA API returns vehicle data in this format:
```json
{
  "Results": [
    {
      "Variable": "Make",
      "Value": "TOYOTA",
      "ValueId": "474",
      "VariableId": 26
    },
    // ... more fields
  ]
}
```

## Error Handling
- Invalid VIN format
- Network connectivity issues
- API service unavailability
- No vehicle found for VIN

## Testing
Use the provided sample VINs for testing:
- Toyota Camry: `4T1B11HK5JU123456`
- Honda Civic: `1HGBH41JXMN109186`
- Ford F-150: `1FTEW1EG0JFA12345`

## Alternative APIs
If NHTSA API is unavailable, consider these alternatives:
- CarMD API (paid)
- VIN Decoder API (paid)
- CarQuery API (free, but limited)

## User Experience
1. User enters VIN
2. Automatic lookup triggers when VIN is 17 characters
3. Loading indicator shows during API call
4. Form fields populate with vehicle data
5. Success message confirms data retrieval
6. Manual lookup button available as backup

## Security Notes
- VIN data is not stored locally
- API calls are made directly from client
- No sensitive vehicle information is logged
- Error messages don't expose internal details 