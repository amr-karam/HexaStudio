export declare enum UserRole {
    SUPER_ADMIN = "SUPER_ADMIN",
    EMPLOYEE = "EMPLOYEE",
    CLIENT = "CLIENT"
}
export interface User {
    id: string;
    email: string;
    fullName: string;
    role: UserRole;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
}
//# sourceMappingURL=user.d.ts.map