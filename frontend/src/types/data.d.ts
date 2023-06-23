import { ReactNode } from "react";
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
        onClick?: () => Promise<void>;
        spinnerColor?: string;
        spinnerSize?: LengthType;
        speedMultiplier?: number;
    }

    interface ErrorPageParams {
        error?: string;
        code?: number;
    }
}

export {};
