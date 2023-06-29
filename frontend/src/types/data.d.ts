import React, { ReactNode } from "react";
import { LengthType } from "react-spinners/helpers/props";

declare global {
    interface JwtData {
        exp: number;
        iat: number;
        sub: string;
    }

    interface SpinnerButtonParams {
        children?: ReactNode;
        id?: string;
        className?: string;
        type?: "button" | "submit" | "reset";
        onClick?: () => Promise<void>;
        spinnerColor?: string;
        spinnerSize?: LengthType;
        speedMultiplier?: number;
    }

    interface ErrorPageParams {
        error?: string;
        code?: number;
    }

    interface NavItem {
        name: string;
        path: string;
    }

    interface UseAuthType {
        auth: User | null;
        setAuth: React.Dispatch<React.SetStateAction<User | null>>;
    }
}

export {};
