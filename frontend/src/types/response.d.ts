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

    interface Metadata {
        id: string;
        username: string | null;
        documentId: string;
        timestamp: Date;
        relatedDocumentList: string[];
        title: string;
        authorList: string[];
        description: string | null;
        publicationDate: Date | null;
        identifierList: { [key: string]: string } | null; // TODO: covert to empty array in backend
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
}
export {};
