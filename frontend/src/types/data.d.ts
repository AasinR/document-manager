import React, { ReactNode } from "react";
import { LengthType } from "react-spinners/helpers/props";
import { CommentType, LabelType } from "../utils/data";

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

    interface AuthorOption {
        name: string;
        selected: boolean;
    }

    interface LabelOption {
        tag: Tag;
        selected: boolean;
    }

    interface GroupLabelOption {
        groupId: string;
        tagList: LabelOption[];
    }

    interface ActiveLabelType {
        type: LabelType;
        groupId?: string;
        groupName?: string;
    }

    interface YearFilterValue {
        exact?: number;
        from?: number | null;
        to?: number | null;
    }

    interface GroupTagIdValue {
        groupId: string;
        tagIdList: string[];
    }

    interface ActiveCommentType {
        type: CommentType;
        groupId?: string;
    }

    interface GroupSaveOption {
        groupId: string;
        name: string;
        saveId: string | null;
    }
}

export {};
