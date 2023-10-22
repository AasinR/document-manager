import axios from "axios";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { CommentPanel, RelatedDocumentPanel } from "../components";
import { useAuth, useFetchGroupList } from "../hooks";
import { CommentType, DocumentInfoType } from "../utils/data";
import LoadingPage from "./LoadingPage";
import ErrorPage from "./ErrorPage";
import "./DocumentPage.css";

function DocumentPage() {
    const { id } = useParams();
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const { auth } = useAuth();

    const { groupList, fetchGroupList } = useFetchGroupList();

    const [loading, setLoading] = useState<boolean>(true);
    const [documentData, setDocumentData] = useState<DocumentResponse | null>(
        null
    );

    const [infoType, setInfoType] = useState<DocumentInfoType>(
        DocumentInfoType.NONE
    );
    const [commentType, setCommentType] = useState<ActiveCommentType>({
        type: CommentType.PUBLIC,
    });

    useEffect(() => {
        if (!loading) return;
        (async () => {
            let isValid = false;
            await axios
                .get(`${process.env.REACT_APP_API_URL}/documents/get/${id}`)
                .then((response) => {
                    isValid = true;
                    setDocumentData(response.data);
                })
                .catch((error) => {
                    console.log(error.response.data);
                });
            if (isValid) {
                await fetchGroupList(auth!.username);
            }
            setLoading(false);
        })();
    }, [auth, fetchGroupList, id, loading]);

    const handleEditMetadata = () => {
        navigate(`${pathname}/metadata`);
    };

    const handleOpenComments = () => {
        if (infoType === DocumentInfoType.COMMENT) {
            setInfoType(DocumentInfoType.NONE);
            return;
        }
        setInfoType(DocumentInfoType.COMMENT);
    };

    const handleOpenRelated = () => {
        if (infoType === DocumentInfoType.RELATED) {
            setInfoType(DocumentInfoType.NONE);
            return;
        }
        setInfoType(DocumentInfoType.RELATED);
    };

    const handleSetRelatedList = (list: string[]) => {
        if (documentData === null) return;
        const newState: DocumentResponse = JSON.parse(
            JSON.stringify(documentData)
        );
        newState.metadata.relatedDocumentList = list;
        setDocumentData(newState);
    };

    const renderIdentifierList = () => {
        const identifierList = Object.entries(
            documentData!.metadata.identifierList
        );
        if (identifierList.length === 0) return <p>Not Specified</p>;
        return identifierList.map(([key, value]) => (
            <div key={key} className="document-data-option-key-value">
                <p>{key}:</p>
                <p>{value}</p>
            </div>
        ));
    };

    const renderLabelList = (list?: Tag[] | null) => {
        if (list == null || list.length === 0) return <p>No Labels Found</p>;
        return (
            <div className="document-tag-option-list">
                {list.map((tag) => (
                    <p key={tag.id}>{tag.name}</p>
                ))}
            </div>
        );
    };

    const renderGroupLabelList = (collections?: GroupTagCollection[]) => {
        if (collections == null || collections.length === 0) {
            return <p>No Labels Found</p>;
        }
        return collections.map((group) => (
            <div key={group.groupId} className="document-tag-option">
                <p>
                    {
                        groupList?.find((value) => value.id === group.groupId)
                            ?.name
                    }
                </p>
                {renderLabelList(group.groupTagList)}
            </div>
        ));
    };

    const getTimestampString = () => {
        const date = new Date(documentData!.metadata.timestamp);
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        const timestamp = `${date.toLocaleDateString()} ${hours}:${minutes}`;
        const user = documentData?.metadata.username;
        if (user) return `Last edited at ${timestamp} by @${user}`;
        return `Created at ${timestamp}`;
    };

    const renderInfoType = () => {
        switch (infoType) {
            case DocumentInfoType.COMMENT:
                return (
                    <CommentPanel
                        documentId={id!}
                        groupList={groupList ?? []}
                        commentType={commentType}
                        setCommentType={setCommentType}
                    />
                );
            case DocumentInfoType.RELATED:
                return (
                    <RelatedDocumentPanel
                        documentId={id!}
                        documentIdList={
                            documentData!.metadata.relatedDocumentList
                        }
                        setDocumentIdList={handleSetRelatedList}
                    />
                );
            default:
                break;
        }
        return null;
    };

    return loading ? (
        <LoadingPage />
    ) : documentData === null ? (
        <ErrorPage error={`Document with ID "${id}" does not exist!`} />
    ) : (
        <div id="document-page" className="page">
            <div id="document-main-container">
                <h1>{documentData.metadata.title}</h1>
                <div id="document-data-container">
                    <div id="document-metadata-panel">
                        <div id="document-metadata-container">
                            <div className="document-data-option">
                                <p>Author:</p>
                                <p>
                                    {documentData &&
                                    documentData.metadata.authorList.length !==
                                        0
                                        ? documentData.metadata.authorList.join(
                                              ", "
                                          )
                                        : "Not Specified"}
                                </p>
                            </div>
                            <div className="document-data-option">
                                <p>Description:</p>
                                <p>{documentData.metadata.description}</p>
                            </div>
                            <div className="document-data-option">
                                <p>Publication Date:</p>
                                <p>
                                    {documentData.metadata.publicationDate
                                        ? new Date(
                                              documentData.metadata.publicationDate
                                          ).toLocaleDateString()
                                        : "Not Specified"}
                                </p>
                            </div>
                            {Object.entries(
                                documentData.metadata.otherData
                            ).map(([key, value]) => (
                                <div key={key} className="document-data-option">
                                    <p>{key}:</p>
                                    <p>{value}</p>
                                </div>
                            ))}
                            <div className="document-data-option">
                                <p>Identifiers:</p>
                                {renderIdentifierList()}
                            </div>
                        </div>
                        <div>
                            <button
                                id="document-metadata-button"
                                onClick={handleEditMetadata}
                            >
                                Edit Metadata
                            </button>
                            <p id="document-modify-date">
                                {getTimestampString()}
                            </p>
                        </div>
                    </div>
                    <div id="document-tag-container">
                        <div className="document-tag-option">
                            <p>Public Labels</p>
                            {renderLabelList(
                                documentData.tagCollection.tagList
                            )}
                        </div>
                        <div className="document-tag-option">
                            <p>Private Labels</p>
                            {renderLabelList(
                                documentData.tagCollection.privateTagList
                            )}
                        </div>
                        <div className="document-tag-option">
                            <p>Group Labels</p>
                            {renderGroupLabelList(
                                documentData.tagCollection
                                    .groupTagCollectionList
                            )}
                        </div>
                    </div>
                </div>
                <div id="document-other-select">
                    <button
                        className={
                            infoType === DocumentInfoType.COMMENT
                                ? "selected"
                                : ""
                        }
                        onClick={handleOpenComments}
                    >
                        Comments
                    </button>
                    <button
                        className={
                            infoType === DocumentInfoType.RELATED
                                ? "selected"
                                : ""
                        }
                        onClick={handleOpenRelated}
                    >
                        Related Documents
                    </button>
                </div>
                {infoType !== DocumentInfoType.NONE ? (
                    <div id="document-other-container">{renderInfoType()}</div>
                ) : null}
            </div>
        </div>
    );
}

export default DocumentPage;
