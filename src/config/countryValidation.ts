/**
 * Centralized validation rules for onboarding organization details.
 * Add new countries here to expand support.
 */
export const countryConfigs: Record<string, any> = {
  IN: {
    name: 'India',
    states: [
      'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
      'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
      'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
      'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
      'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
      'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
      'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
      'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
    ],
    postalCode: {
      regex: /^\d{6}$/,
      message: 'Postal code must be exactly 6 digits for India.'
    },
    legal: {
      cin: {
        regex: /^[A-Z0-9]{21}$/,
        message: 'CIN must be a valid 21-character alphanumeric string.'
      },
      gst: {
        regex: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
        message: 'GSTIN must follow the official 15-character format.'
      },
      applicable: ['cin', 'gst']
    }
  },
  US: {
    name: 'United States',
    states: [
      'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California',
      'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia',
      'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
      'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland',
      'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri',
      'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey',
      'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
      'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina',
      'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
      'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
    ],
    postalCode: {
      regex: /^\d{5}(-\d{4})?$/,
      message: 'ZIP code must be 5 digits or 5+4 format (e.g., 12345 or 12345-6789).'
    },
    legal: {
      applicable: []
    }
  },
  UK: {
    name: 'United Kingdom',
    states: ['England', 'Scotland', 'Wales', 'Northern Ireland'],
    postalCode: {
      regex: /^[A-Z]{1,2}[0-9][A-Z0-9]? [0-9][A-Z]{2}$/i,
      message: 'Enter a valid UK postcode (e.g., SW1A 1AA).'
    },
    legal: {
      applicable: []
    }
  },
  CA: {
    name: 'Canada',
    states: [
      'Alberta', 'British Columbia', 'Manitoba', 'New Brunswick',
      'Newfoundland and Labrador', 'Nova Scotia', 'Ontario',
      'Prince Edward Island', 'Quebec', 'Saskatchewan',
      'Northwest Territories', 'Nunavut', 'Yukon'
    ],
    postalCode: {
      regex: /^[A-Z][0-9][A-Z] [0-9][A-Z][0-9]$/i,
      message: 'Enter a valid Canadian postal code (e.g., K1A 0B1).'
    },
    legal: {
      applicable: []
    }
  },
  AU: {
    name: 'Australia',
    states: [
      'New South Wales', 'Queensland', 'South Australia', 'Tasmania',
      'Victoria', 'Western Australia', 'Australian Capital Territory', 'Northern Territory'
    ],
    postalCode: {
      regex: /^\d{4}$/,
      message: 'Australian postal code must be exactly 4 digits.'
    },
    legal: {
      applicable: []
    }
  }
};
