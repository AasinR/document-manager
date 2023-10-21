import { GroupPermission, UserPermission } from "../utils/data";

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

    interface UserInfo {
        username: string | null;
        shownName: string | null;
    }

    interface GroupMember {
        username: string;
        shownName: string;
        permission: GroupPermission;
    }

    interface Group {
        id: string;
        name: string;
        groupMemberList: GroupMember[];
    }

    interface MetadataResponse {
        id: string;
        user: UserInfo;
        documentId: string;
        timestamp: string;
        relatedDocumentList: string[];
        title: string;
        authorList: string[];
        description: string | null;
        publicationDate: string | null;
        identifierList: { [key: string]: string };
        otherData: { [key: string]: string };
    }

    interface Metadata {
        id: string;
        username: string | null;
        documentId: string;
        timestamp: string;
        relatedDocumentList: string[];
        title: string;
        authorList: string[];
        description: string | null;
        publicationDate: string | null;
        identifierList: { [key: string]: string };
        otherData: { [key: string]: string };
    }

    interface Tag {
        id: string;
        name: string;
        ownerId: string | null;
    }

    interface GroupTagCollection {
        groupId: string;
        groupTagList: Tag[];
    }

    interface DocumentTagCollection {
        tagList: Tag[];
        privateTagList: Tag[];
        groupTagCollectionList: GroupTagCollection[];
    }

    interface DocumentResponse {
        id: string;
        fileId: string;
        metadata: Metadata;
        tagCollection: DocumentTagCollection;
    }

    interface CommentResponse {
        id: string;
        ownerId: string | null;
        documentId: string;
        user: UserInfo;
        content: string;
        timestamp: string;
    }
}
export {};
