import { success, failure, ErrorCodes } from '@/data/types';
import type { Result } from '@/data/types';

export interface ProductDTO {
    _id: string;
    name: string;
    price: number;
    category: string;
    description: string;
    image: string;
}

const API_URL = 'http://localhost:3000/api';

export const productService = {
    list: async (): Promise<Result<ProductDTO[]>> => {
        try {
            const response = await fetch(`${API_URL}/products`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return success(data);
        } catch (error: any) {
            return failure(error.message, ErrorCodes.NETWORK_ERROR);
        }
    },

    seed: async (): Promise<Result<any>> => {
        try {
            const response = await fetch(`${API_URL}/products/seed`, { method: 'POST' });
            const data = await response.json();
            return success(data);
        } catch (error: any) {
            return failure(error.message, ErrorCodes.NETWORK_ERROR);
        }
    }
};
