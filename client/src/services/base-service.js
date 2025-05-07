import axios from "axios";
import { getSession } from "next-auth/react";

// const API_URL = process.env.API_URL || 'http://localhost:5000';

const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api-gateway-7icg.onrender.com' 
  : 'http://localhost:5000';

export async function fetchWithAuth(endpoint, options = {}){
    const session = await getSession();

    if(!session) throw new Error('Not authenticated');

    try{
        const response = await axios({
            url : `${API_URL}${endpoint}`,
            method : options.method || 'GET',
            headers : {
                Authorization : `Bearer ${session.idToken}`,
                ...options.headers
            },
            data : options.body,
            params : options.params    
        })

        return response.data;

    }catch(error){
        if (error.response) {
            // Server responded with error status
            throw new Error(error.response.data.message || 'API request failed');
        } else if (error.request) {
            // Request was made but no response
            throw new Error('Network error - could not reach the server');
        } else {
            // Something else happened
            throw new Error('An unexpected error occurred');
        }
        // throw new Error('Api request failed', error);
    }
}