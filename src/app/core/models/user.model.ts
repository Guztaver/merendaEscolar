
export interface User {
    id: string;
    email: string;
    password?: string;
    isActive?: boolean;
}

export interface AuthResponse {
    access_token: string;
    user?: User; // if backend returns user details
}
