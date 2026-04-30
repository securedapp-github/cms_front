import axios from 'axios';

export interface GeoValidationResult {
    valid: boolean;
    error?: string;
    normalized?: {
        line1: string;
        city: string;
        state: string;
        postal_code: string;
        country: string;
        formatted_address: string;
    };
}

/**
 * Frontend Geocoding Service to validate addresses.
 */
export const geocodingService = {
    validateAddress: async (addressObj: {
        line1: string;
        city: string;
        state: string;
        country: string;
        postal_code: string;
    }): Promise<GeoValidationResult> => {
        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        
        if (!apiKey) {
            console.warn('VITE_GOOGLE_MAPS_API_KEY not set. Skipping real-world address validation.');
            return { valid: true };
        }

        const { line1, city, state, country, postal_code } = addressObj;
        const addressString = `${line1}, ${city}, ${state} ${postal_code}, ${country}`;

        try {
            const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
                params: {
                    address: addressString,
                    key: apiKey
                }
            });

            if (response.data.status === 'ZERO_RESULTS') {
                return { valid: false, error: 'The address could not be found. Please check your street, city, or postal code.' };
            }

            if (response.data.status === 'REQUEST_DENIED') {
                return { 
                    valid: false, 
                    error: `Google Maps API Access Denied: ${response.data.error_message || 'Please check if the Geocoding API is enabled and Billing is active in your Google Cloud Console.'}` 
                };
            }

            if (response.data.status !== 'OK') {
                return { valid: false, error: `Geocoding API error: ${response.data.status}. Please check your API key and quota.` };
            }

            const result = response.data.results[0];
            const components = result.address_components;

            const findComponent = (types: string[]) => {
                const comp = components.find((c: any) => types.some(t => c.types.includes(t)));
                return comp ? { long: comp.long_name, short: comp.short_name } : null;
            };

            const apiCountry = findComponent(['country']);
            const apiState = findComponent(['administrative_area_level_1']);
            const apiPostalCode = findComponent(['postal_code']);

            // 1. Country Check
            if (apiCountry && apiCountry.short !== country) {
                return { 
                    valid: false, 
                    error: `This address belongs to ${apiCountry.long}, which does not match your selected country (${country}).` 
                };
            }

            // 2. State Check (Flexible comparison)
            if (apiState && state && 
                apiState.long.toLowerCase() !== state.toLowerCase() && 
                apiState.short.toLowerCase() !== state.toLowerCase()) {
                return { 
                    valid: false, 
                    error: `The address is in ${apiState.long}, but you selected ${state}.` 
                };
            }

            // 3. Postal Code Check
            if (apiPostalCode && postal_code && 
                apiPostalCode.long.replace(/\s/g, '') !== postal_code.replace(/\s/g, '')) {
                return { 
                    valid: false, 
                    error: `Postal code mismatch: The correct postal code for this location is ${apiPostalCode.long}.` 
                };
            }

            return {
                valid: true,
                normalized: {
                    line1: line1,
                    city: findComponent(['locality', 'sublocality', 'postal_town'])?.long || city,
                    state: apiState?.long || state,
                    postal_code: apiPostalCode?.long || postal_code,
                    country: country,
                    formatted_address: result.formatted_address
                }
            };

        } catch (err: any) {
            console.error('Geocoding error:', err);
            return { valid: false, error: 'Failed to connect to the address verification service.' };
        }
    }
};
