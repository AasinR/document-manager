import axios, { AxiosResponse } from "axios";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
    CommentPanel,
    LabelListPanel,
    RelatedDocumentPanel,
    SearchFilter,
    SpinnerButton,
} from "../components";
import { useAuth, useFetchGroupList } from "../hooks";
import { CommentType, DocumentInfoType, LabelType } from "../utils/data";
import LoadingPage from "./LoadingPage";
import ErrorPage from "./ErrorPage";
import "./DocumentPage.css";
import { changeStateListValue } from "../utils/util";

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
    const [groupOptionList, setGroupOptionList] = useState<GroupSaveOption[]>(
        []
    );
    const [shownGroupList, setShownGroupList] = useState<GroupSaveOption[]>([]);
    const [groupSearchValue, setGroupSearchValue] = useState<string>("");
    const [disableGroupButtons, setDisableGroupButtons] =
        useState<boolean>(false);

    useEffect(() => {
        if (!loading) return;
        (async () => {
            let documentValue: DocumentResponse | null = null;
            await axios
                .get(`${process.env.REACT_APP_API_URL}/documents/get/${id}`)
                .then((response: AxiosResponse<DocumentResponse>) => {
                    documentValue = response.data;
                    setDocumentData(documentValue);
                })
                .catch((error) => {
                    console.log(error.response.data);
                });
            if (documentValue) {
                const groups = (await fetchGroupList(auth!.username)) ?? [];
                const groupOptions: GroupSaveOption[] = groups.map((group) => {
                    const saveId =
                        documentValue!.tagCollection.groupTagCollectionList.find(
                            (value) => value.groupId === group.id
                        )?.saveId;
                    return {
                        groupId: group.id,
                        name: group.name,
                        saveId: saveId ?? null,
                    };
                });
                setGroupOptionList(groupOptions);
                setShownGroupList(groupOptions);
            }
            setLoading(false);
        })();
    }, [auth, fetchGroupList, id, loading]);

    const setGroupOptions = (
        oldOption: GroupSaveOption,
        saveId: string | null
    ) => {
        const newOption: GroupSaveOption = {
            groupId: oldOption.groupId,
            name: oldOption.name,
            saveId: saveId,
        };
        setGroupOptionList(
            changeStateListValue(groupOptionList, oldOption, newOption)
        );
        setShownGroupList(
            changeStateListValue(shownGroupList, oldOption, newOption)
        );
    };

    const handleSave = async (groupId?: string) => {
        const requestUrl = groupId ? `?groupId=${groupId}` : "";
        await axios
            .post(
                `${process.env.REACT_APP_API_URL}/saved/save/${id}${requestUrl}`
            )
            .then((response: AxiosResponse<SavedDocument>) => {
                if (documentData === null) return;
                const newState: DocumentResponse = JSON.parse(
                    JSON.stringify(documentData)
                );
                if (groupId) {
                    newState.tagCollection.groupTagCollectionList.push({
                        groupId: groupId,
                        saveId: response.data.id,
                        groupTagList: response.data.tagList,
                    });
                    const oldOption = groupOptionList.find(
                        (value) => value.groupId === groupId
                    )!;
                    setGroupOptions(oldOption, response.data.id);
                } else {
                    newState.tagCollection.privateTagCollection = {
                        saveId: response.data.id,
                        privateTagList: response.data.tagList,
                    };
                }
                setDocumentData(newState);
            })
            .catch((error) => {
                console.log(error.response.data);
            });
    };

    const handleDelete = async (saveId: string, isGroup: boolean) => {
        await axios
            .delete(`${process.env.REACT_APP_API_URL}/saved/delete/${saveId}`)
            .then(() => {
                if (documentData === null) return;
                const newState: DocumentResponse = JSON.parse(
                    JSON.stringify(documentData)
                );
                if (isGroup) {
                    newState.tagCollection.groupTagCollectionList =
                        newState.tagCollection.groupTagCollectionList.filter(
                            (value) => value.saveId !== saveId
                        );
                    const oldOption = groupOptionList.find(
                        (value) => value.saveId === saveId
                    )!;
                    setGroupOptions(oldOption, null);
                } else {
                    newState.tagCollection.privateTagCollection = null;
                }
                setDocumentData(newState);
            })
            .catch((error) => {
                console.log(error.response.data);
            });
    };

    const handleGroupSaveDelete = async (
        groupId: string,
        saveId: string | null
    ) => {
        setDisableGroupButtons(true);
        if (saveId) await handleDelete(saveId, true);
        else await handleSave(groupId);
        setDisableGroupButtons(false);
    };

    const handleGroupSearch = (value: string) => {
        setGroupSearchValue(value);
        const queryString = value.toLowerCase();
        const result = groupOptionList.filter((group) =>
            group.name.toLowerCase().includes(queryString)
        );
        setShownGroupList(result);
    };

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

    const handleSetTagList = (
        list: Tag[],
        type: LabelType,
        groupId: string
    ) => {
        if (documentData === null) return;
        const newState: DocumentResponse = JSON.parse(
            JSON.stringify(documentData)
        );
        switch (type) {
            case LabelType.PUBLIC:
                newState.tagCollection.tagList = list;
                break;
            case LabelType.PRIVATE:
                newState.tagCollection.privateTagCollection!.privateTagList =
                    list;
                break;
            case LabelType.GROUP:
                const group =
                    newState.tagCollection.groupTagCollectionList.find(
                        (value) => value.groupId === groupId
                    );
                if (group === undefined) return;
                group.groupTagList = list;
                break;
            default:
                return;
        }
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
                <div id="document-data-header">
                    <h1>{documentData.metadata.title}</h1>
                    <div id="document-save-buttons">
                        <SpinnerButton
                            className={
                                documentData.tagCollection
                                    .privateTagCollection === null
                                    ? ""
                                    : "saved"
                            }
                            onClick={
                                documentData.tagCollection
                                    .privateTagCollection === null
                                    ? handleSave
                                    : async () => {
                                          await handleDelete(
                                              documentData.tagCollection
                                                  .privateTagCollection!.saveId,
                                              false
                                          );
                                      }
                            }
                            spinnerColor={
                                documentData.tagCollection
                                    .privateTagCollection === null
                                    ? "#808080"
                                    : "#006f6f"
                            }
                            spinnerSize={10}
                            speedMultiplier={0.6}
                        >
                            {documentData.tagCollection.privateTagCollection ===
                            null
                                ? "Save"
                                : "Saved"}
                        </SpinnerButton>
                        <SearchFilter
                            id="document-save-group"
                            containerId="document-save-group-container"
                            title="Group Save"
                        >
                            <div id="document-save-group-header">
                                <input
                                    placeholder="Search..."
                                    value={groupSearchValue}
                                    onChange={(event) =>
                                        handleGroupSearch(event.target.value)
                                    }
                                />
                            </div>
                            <div id="document-save-group-list">
                                {shownGroupList.length === 0 ? (
                                    <p>No Groups Found</p>
                                ) : (
                                    shownGroupList.map((group) => (
                                        <button
                                            key={group.groupId}
                                            onClick={() =>
                                                handleGroupSaveDelete(
                                                    group.groupId,
                                                    group.saveId
                                                )
                                            }
                                            disabled={disableGroupButtons}
                                        >
                                            <p>{group.name}</p>
                                            <p>{group.saveId && "✓"}</p>
                                        </button>
                                    ))
                                )}
                            </div>
                        </SearchFilter>
                    </div>
                </div>
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
                        <LabelListPanel
                            title="Public Labels"
                            labelType={LabelType.PUBLIC}
                            tagList={documentData.tagCollection.tagList}
                            documentId={id!}
                            updateTagList={handleSetTagList}
                        />
                        {documentData.tagCollection.privateTagCollection && (
                            <LabelListPanel
                                title="Private Labels"
                                labelType={LabelType.PRIVATE}
                                tagList={
                                    documentData.tagCollection
                                        .privateTagCollection.privateTagList
                                }
                                documentId={id!}
                                saveId={
                                    documentData.tagCollection
                                        .privateTagCollection.saveId
                                }
                                updateTagList={handleSetTagList}
                            />
                        )}
                        {documentData.tagCollection.groupTagCollectionList.map(
                            (collection) => (
                                <LabelListPanel
                                    key={collection.groupId}
                                    title={
                                        groupList?.find(
                                            (group) =>
                                                group.id === collection.groupId
                                        )?.name!
                                    }
                                    labelType={LabelType.GROUP}
                                    groupId={collection.groupId}
                                    tagList={collection.groupTagList}
                                    documentId={id!}
                                    saveId={collection.saveId}
                                    updateTagList={handleSetTagList}
                                />
                            )
                        )}
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
