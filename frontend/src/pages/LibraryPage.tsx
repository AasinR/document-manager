import axios, { AxiosResponse } from "axios";
import React, {
    ChangeEvent,
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth, useFetchGroupList } from "../hooks";
import { LoadingPanel, SearchBar, SpinnerButton } from "../components";
import { matchQuerySting } from "../utils/search";
import {
    removeStateListValue,
    updateStateListListValue,
    validateMetadata,
} from "../utils/util";
import LoadingPage from "./LoadingPage";
import deleteImage from "../assets/icons/delete.png";
import settingImage from "../assets/icons/setting.png";
import "./LibraryPage.css";

function LibraryPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { auth } = useAuth();
    const { groupList, setGroupList, fetchGroupList } = useFetchGroupList();

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const [loading, setLoading] = useState<boolean>(true);
    const [activeId, setActiveId] = useState<string>("");
    const [searchValue, setSearchValue] = useState<string>("");
    const [documentList, setDocumentList] = useState<
        SavedDocumentData[] | null
    >(null);
    const [shownList, setShownList] = useState<SavedDocumentData[] | null>(
        null
    );
    const [editing, setEditing] = useState<boolean>(false);
    const [titleValue, setTitleValue] = useState<string>("");
    const [authorList, setAuthorList] = useState<string[]>([]);
    const [descriptionValue, setDescriptionValue] = useState<string>("");
    const [dateValue, setDateValue] = useState<string>("");
    const [otherData, setOtherData] = useState<[string, string][]>([]);
    const [identifierList, setIdentifierList] = useState<[string, string][]>(
        []
    );
    const [fileInput, setFileInput] = useState<File | null>(null);
    const [fileName, setFileName] = useState<string>("");
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [groupEditing, setGroupEditing] = useState<boolean>(false);
    const [groupEditValue, setGroupEditValue] = useState<string>("");
    const [groupErrorMessage, setGroupErrorMessage] = useState<string>("");

    const fetchDocumentList = useCallback(async (selectedId: string) => {
        const urlParam = selectedId ? `?groupId=${selectedId}` : "";
        let saveList: SavedDocument[] = [];
        await axios
            .get(`${process.env.REACT_APP_API_URL}/saved/all${urlParam}`)
            .then((response: AxiosResponse<SavedDocument[]>) => {
                saveList = response.data;
            })
            .catch((error) => {
                console.log(error.response.data);
            });
        const requestBody: { documentIdList: string[] } = {
            documentIdList: saveList.map((value) => value.documentId),
        };
        let savedDocumentList: SavedDocumentData[] = [];
        await axios
            .post(
                `${process.env.REACT_APP_API_URL}/documents/records`,
                requestBody
            )
            .then((response: AxiosResponse<DocumentResponse[]>) => {
                savedDocumentList = response.data.map((data) => ({
                    id: saveList.find((value) => value.documentId === data.id)!
                        .id,
                    document: data,
                }));
                setDocumentList(savedDocumentList);
                setShownList(savedDocumentList);
            })
            .catch((error) => {
                console.log(error.response.data);
            });
        return savedDocumentList;
    }, []);

    useEffect(() => {
        if (!loading) return;
        (async () => {
            await fetchGroupList(auth!.username);
            let currentId = activeId;
            const paramId = searchParams.get("g");
            if (paramId) {
                currentId = paramId;
                setActiveId(paramId);
            }
            await fetchDocumentList(currentId);
            setLoading(false);
        })();
    }, [
        activeId,
        auth,
        fetchDocumentList,
        fetchGroupList,
        loading,
        searchParams,
    ]);

    const search = useCallback(
        (value: string, list?: SavedDocumentData[]) => {
            if (documentList === null) return;
            const searchList = list ? list : documentList;
            const searchString = value.toLowerCase();
            const result = searchList.filter((data) =>
                matchQuerySting(data.document, searchString)
            );
            setShownList(result);
        },
        [documentList]
    );

    const handleSelectActive = (value: string) => {
        if (activeId === value) return;
        setShownList(null);
        setActiveId(value);
        (async () => {
            const list = await fetchDocumentList(value);
            search(searchValue, list);
        })();
        navigate(`${location.pathname}${value ? `?g=${value}` : ""}`);
    };

    const handleSearch = (value: string) => {
        setSearchValue(value);
        search(value);
    };

    const handleOpen = (value: SavedDocumentData) => {
        navigate(`/document/${value.document.id}`);
    };

    const handleDelete = async (index: number) => {
        if (documentList === null || shownList === null) return;
        const save = shownList[index];
        await axios
            .delete(`${process.env.REACT_APP_API_URL}/saved/delete/${save.id}`)
            .then(() => {
                setDocumentList(
                    documentList.filter((value) => value.id !== save.id)
                );
                setShownList(removeStateListValue(index, shownList));
            })
            .catch((error) => {
                console.log(error.response.data);
            });
    };

    const handleUpdateAuthor = (index: number, value: string) => {
        const newArray = [...authorList];
        newArray[index] = value;
        setAuthorList(newArray);
    };

    const handleFileInputButton = () => {
        if (fileInputRef.current === null) return;
        fileInputRef.current.click();
    };

    const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (!titleValue) setTitleValue(file.name.slice(0, -4));
            setFileName(file.name);
            setFileInput(file);
        }
    };

    const handleAddReset = () => {
        if (fileInput) {
            setFileInput(null);
            setFileName("");
        }
        if (titleValue) setTitleValue("");
        if (authorList.length > 0) setAuthorList([]);
        if (descriptionValue) setDescriptionValue("");
        if (dateValue) setDateValue("");
        if (otherData.length > 0) setOtherData([]);
        if (identifierList.length > 0) setIdentifierList([]);
    };

    const handleSaveNew = async () => {
        if (documentList === null || shownList === null) return;
        if (fileInput === null) {
            setErrorMessage("File is missing!");
            return;
        }
        const metadata = validateMetadata(
            titleValue,
            authorList,
            descriptionValue,
            dateValue,
            otherData,
            identifierList
        );
        if (typeof metadata === "string") {
            setErrorMessage(metadata);
            return;
        }
        const urlParam = activeId ? `?groupId=${activeId}` : "";
        const metadataBlob = new Blob([JSON.stringify(metadata)], {
            type: "application/json",
        });
        const formData = new FormData();
        formData.append("file", fileInput);
        formData.append("metadata", metadataBlob);
        let documentId = "";
        let saveId = "";
        await axios
            .post(
                `${process.env.REACT_APP_API_URL}/saved/add${urlParam}`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            )
            .then((response: AxiosResponse<SavedDocument>) => {
                documentId = response.data.documentId;
                saveId = response.data.id;
            })
            .catch((error) => {
                console.log(error.response.data);
                const apiError: ApiError | undefined = error.response?.data;
                const message: string =
                    apiError?.statusCode && apiError.statusCode < 500
                        ? "Document with given file is already saved in the library!"
                        : "Oops! Something went wrong on the server. Please try again later.";
                setErrorMessage(message);
            });
        if (!documentId) return;
        await axios
            .get(`${process.env.REACT_APP_API_URL}/documents/get/${documentId}`)
            .then((response: AxiosResponse<DocumentResponse>) => {
                const newState = [
                    ...documentList,
                    {
                        id: saveId,
                        document: response.data,
                    },
                ];
                setDocumentList(newState);
                search(searchValue, newState);
            })
            .catch(() => {
                setErrorMessage("Failed to fetch saved document!");
            });
        setEditing(false);
        handleAddReset();
    };

    const handleGroupSettings = (groupId: string) => {
        navigate(`/group/${groupId}`);
    };

    const handleGroupEdit = (value: boolean) => {
        setGroupEditing(value);
        setGroupEditValue("");
        setGroupErrorMessage("");
    };

    const handleGroupAdd = async () => {
        if (groupList === null) return;
        const groupName = groupEditValue.trim();
        if (!groupName) {
            setGroupErrorMessage("Group name cannot be empty!");
            return;
        }
        const requestBody = {
            groupName: groupName,
        };
        await axios
            .post(`${process.env.REACT_APP_API_URL}/groups/add`, requestBody)
            .then((response: AxiosResponse<Group>) => {
                setGroupList([...groupList, response.data]);
                handleGroupEdit(false);
            })
            .catch((error) => {
                console.log(error.response.data);
                setGroupErrorMessage(
                    "Failed to add group. Given name is already taken!"
                );
            });
    };

    const getSelectedTitle = () => {
        if (!activeId) return "Personal Library";
        const group = groupList?.find((value) => value.id === activeId);
        if (group) {
            return `Group: ${group.name}`;
        }
        return "";
    };

    return loading ? (
        <LoadingPage />
    ) : (
        <div id="lib-page" className="page">
            <div id="lib-mid">
                <div id="lib-nav">
                    <h1>Libraries</h1>
                    <button
                        className={!activeId ? "selected" : ""}
                        onClick={() => handleSelectActive("")}
                    >
                        Personal Library
                    </button>
                    <h2>Group</h2>
                    {groupList?.map((group) => (
                        <div key={group.id} className="lib-nav-group">
                            <button
                                className={
                                    activeId === group.id ? "selected" : ""
                                }
                                onClick={() => handleSelectActive(group.id)}
                            >
                                {group.name}
                            </button>
                            <button
                                className={`lib-nav-group-settings ${
                                    activeId === group.id ? "selected" : ""
                                }`}
                                onClick={() => handleGroupSettings(group.id)}
                            >
                                <img src={settingImage} alt="settings" />
                            </button>
                        </div>
                    ))}
                    <div id="lib-nav-group-add">
                        {groupEditing ? (
                            <>
                                <input
                                    placeholder="Group name"
                                    value={groupEditValue}
                                    onChange={(event) =>
                                        setGroupEditValue(event.target.value)
                                    }
                                />
                                <div id="lib-nav-group-add-buttons">
                                    <button
                                        onClick={() => handleGroupEdit(false)}
                                    >
                                        Cancel
                                    </button>
                                    <SpinnerButton
                                        onClick={handleGroupAdd}
                                        spinnerColor="#808080"
                                        spinnerSize={12}
                                        speedMultiplier={0.6}
                                    >
                                        Add
                                    </SpinnerButton>
                                </div>
                                {groupErrorMessage && (
                                    <p>Error: {groupErrorMessage}</p>
                                )}
                            </>
                        ) : (
                            <button onClick={() => handleGroupEdit(true)}>
                                Add Group +
                            </button>
                        )}
                    </div>
                </div>
                <div id="lib-container">
                    <div id="lib-header">
                        <h2>{getSelectedTitle()}</h2>
                        <div id="lib-header-container">
                            <SearchBar onChange={handleSearch} />
                            <button
                                className={`lib-header-button ${
                                    editing ? "selected" : ""
                                }`}
                                onClick={() => setEditing(!editing)}
                            >
                                Add new +
                            </button>
                        </div>
                    </div>
                    {editing ? (
                        <div id="lib-add">
                            <div id="lib-add-container">
                                <div className="lib-add-data">
                                    <p>File Upload</p>
                                    <input
                                        id="lib-file-input"
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileSelect}
                                        accept=".pdf"
                                    />
                                    <div className="lib-add-data-list">
                                        <input
                                            placeholder="Select a file"
                                            value={fileName}
                                            disabled={true}
                                        />
                                        <button
                                            className="lib-add-button"
                                            onClick={handleFileInputButton}
                                        >
                                            Select File
                                        </button>
                                    </div>
                                </div>
                                <div className="lib-add-data">
                                    <p>Title</p>
                                    <input
                                        placeholder="Title"
                                        value={titleValue}
                                        onChange={(event) =>
                                            setTitleValue(event.target.value)
                                        }
                                    />
                                </div>
                                <div className="lib-add-data">
                                    <p>Author</p>
                                    {authorList.map((value, index) => (
                                        <div
                                            key={index}
                                            className="lib-add-data-list"
                                        >
                                            <input
                                                placeholder="Author"
                                                value={value}
                                                onChange={(event) =>
                                                    handleUpdateAuthor(
                                                        index,
                                                        event.target.value
                                                    )
                                                }
                                            />
                                            <button
                                                className="lib-add-button"
                                                onClick={() =>
                                                    setAuthorList(
                                                        removeStateListValue(
                                                            index,
                                                            authorList
                                                        )
                                                    )
                                                }
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        className="lib-add-button"
                                        onClick={() =>
                                            setAuthorList([...authorList, ""])
                                        }
                                    >
                                        Add New +
                                    </button>
                                </div>
                                <div className="lib-add-data">
                                    <p>Description</p>
                                    <textarea
                                        placeholder="Description"
                                        value={descriptionValue}
                                        onChange={(event) =>
                                            setDescriptionValue(
                                                event.target.value
                                            )
                                        }
                                    />
                                </div>
                                <div className="lib-add-data">
                                    <p>Publication Date</p>
                                    <input
                                        type="date"
                                        value={dateValue}
                                        onChange={(event) =>
                                            setDateValue(event.target.value)
                                        }
                                    />
                                </div>
                                <div className="lib-add-data">
                                    <p>Other Data</p>
                                    {otherData.map(([key, value], index) => (
                                        <div
                                            key={index}
                                            className="lib-add-data-list"
                                        >
                                            <input
                                                type="text"
                                                placeholder="Key"
                                                value={key}
                                                onChange={(event) =>
                                                    setOtherData(
                                                        updateStateListListValue(
                                                            index,
                                                            0,
                                                            event.target.value,
                                                            otherData
                                                        )
                                                    )
                                                }
                                            />
                                            <input
                                                type="text"
                                                placeholder="Value"
                                                value={value}
                                                onChange={(event) =>
                                                    setOtherData(
                                                        updateStateListListValue(
                                                            index,
                                                            1,
                                                            event.target.value,
                                                            otherData
                                                        )
                                                    )
                                                }
                                            />
                                            <button
                                                className="lib-add-button"
                                                onClick={() =>
                                                    setOtherData(
                                                        removeStateListValue(
                                                            index,
                                                            otherData
                                                        )
                                                    )
                                                }
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        className="lib-add-button"
                                        onClick={() =>
                                            setOtherData([
                                                ...otherData,
                                                ["", ""],
                                            ])
                                        }
                                    >
                                        Add New +
                                    </button>
                                </div>
                                <div className="lib-add-data">
                                    <p>Identifiers</p>
                                    {identifierList.map(
                                        ([key, value], index) => (
                                            <div
                                                key={index}
                                                className="lib-add-data-list"
                                            >
                                                <input
                                                    type="text"
                                                    placeholder="Key"
                                                    value={key}
                                                    onChange={(event) =>
                                                        setIdentifierList(
                                                            updateStateListListValue(
                                                                index,
                                                                0,
                                                                event.target
                                                                    .value,
                                                                identifierList
                                                            )
                                                        )
                                                    }
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Value"
                                                    value={value}
                                                    onChange={(event) =>
                                                        setIdentifierList(
                                                            updateStateListListValue(
                                                                index,
                                                                1,
                                                                event.target
                                                                    .value,
                                                                identifierList
                                                            )
                                                        )
                                                    }
                                                />
                                                <button
                                                    className="lib-add-button"
                                                    onClick={() =>
                                                        setIdentifierList(
                                                            removeStateListValue(
                                                                index,
                                                                identifierList
                                                            )
                                                        )
                                                    }
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        )
                                    )}
                                    <button
                                        className="lib-add-button"
                                        onClick={() =>
                                            setIdentifierList([
                                                ...identifierList,
                                                ["", ""],
                                            ])
                                        }
                                    >
                                        Add New +
                                    </button>
                                </div>
                            </div>
                            {errorMessage && (
                                <p id="lib-add-error">Error: {errorMessage}</p>
                            )}
                            <div id="lib-add-buttons">
                                <button
                                    className="lib-add-button"
                                    onClick={() => setEditing(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="lib-add-button"
                                    onClick={handleAddReset}
                                >
                                    Reset
                                </button>
                                <SpinnerButton
                                    className="lib-add-button"
                                    onClick={handleSaveNew}
                                    spinnerColor="#808080"
                                    spinnerSize={20}
                                    speedMultiplier={0.6}
                                >
                                    Save New
                                </SpinnerButton>
                            </div>
                        </div>
                    ) : (
                        <div id="lib-list">
                            {shownList === null ? (
                                <LoadingPanel size={80} speedMultiplier={0.6} />
                            ) : shownList.length === 0 ? (
                                <p>No Documents Found</p>
                            ) : (
                                shownList.map((data, index) => (
                                    <div key={data.id} className="lib-document">
                                        <div
                                            className="lib-document-header"
                                            onClick={() => handleOpen(data)}
                                        >
                                            <p>
                                                {data.document.metadata.title}
                                            </p>
                                            <p>
                                                {data.document.metadata.authorList.join(
                                                    ", "
                                                )}
                                            </p>
                                        </div>
                                        <div>
                                            <SpinnerButton
                                                className="lib-document-button"
                                                onClick={async () => {
                                                    await handleDelete(index);
                                                }}
                                                spinnerColor="#808080"
                                                spinnerSize={10}
                                                speedMultiplier={0.6}
                                            >
                                                <img
                                                    src={deleteImage}
                                                    alt="remove"
                                                    draggable={false}
                                                />
                                            </SpinnerButton>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default LibraryPage;
