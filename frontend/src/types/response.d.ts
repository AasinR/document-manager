import { UserPermission } from "../utils/data";

declare global {
    interface ApiError {
        message: string;
        path: string;
        statusCode: number;
        timestamp: string;
    }

    interface User {
        username: string;
        shownName: string;
        email: string | null;
        permission: UserPermission;
    }
}
export {};
