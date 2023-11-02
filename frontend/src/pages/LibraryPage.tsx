import axios, { AxiosResponse } from "axios";
import React, { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth, useFetchGroupList } from "../hooks";
import { LoadingPanel, SearchBar, SpinnerButton } from "../components";
import { matchQuerySting } from "../utils/search";
import { removeStateListValue } from "../utils/util";
import LoadingPage from "./LoadingPage";
import deleteImage from "../assets/icons/delete.png";
import "./LibraryPage.css";

function LibraryPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { auth } = useAuth();
    const { groupList, fetchGroupList } = useFetchGroupList();

    const [loading, setLoading] = useState<boolean>(true);
    const [activeId, setActiveId] = useState<string>("");
    const [searchValue, setSearchValue] = useState<string>("");
    const [documentList, setDocumentList] = useState<
        SavedDocumentData[] | null
    >(null);
    const [shownList, setShownList] = useState<SavedDocumentData[] | null>(
        null
    );

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
            const searchString = value.trim();
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
                        <button
                            key={group.id}
                            className={activeId === group.id ? "selected" : ""}
                            onClick={() => handleSelectActive(group.id)}
                        >
                            {group.name}
                        </button>
                    ))}
                </div>
                <div id="lib-container">
                    <div id="lib-header">
                        <h2>{getSelectedTitle()}</h2>
                        <div id="lib-header-container">
                            <SearchBar onChange={handleSearch} />
                            <button className="lib-header-button">
                                Add new +
                            </button>
                        </div>
                    </div>
                    <div id="lib-contents">
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
                                        <p>{data.document.metadata.title}</p>
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
                </div>
            </div>
        </div>
    );
}

export default LibraryPage;
