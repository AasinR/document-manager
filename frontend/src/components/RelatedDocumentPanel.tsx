import axios, { AxiosResponse } from "axios";
import React, { useEffect, useState } from "react";
import { matchQuerySting } from "../utils/search";
import { removeStateListValue } from "../utils/util";
import SearchBar from "./SearchBar";
import DocumentCard from "./DocumentCard";
import LoadingPanel from "./LoadingPanel";
import SpinnerButton from "./SpinnerButton";
import deleteImage from "../assets/icons/delete.png";
import addImage from "../assets/icons/add-document.png";
import "./RelatedDocumentPanel.css";

function RelatedDocumentPanel({
    id,
    className,
    documentId,
    documentIdList,
    setDocumentIdList,
}: {
    id: string;
    className: string;
    documentId: string;
    documentIdList: string[];
    setDocumentIdList: (list: string[]) => void;
}) {
    const [listAll, setListAll] = useState<boolean>(false);
    const [relatedList, setRelatedList] = useState<DocumentResponse[] | null>(
        null
    );
    const [documentList, setDocumentList] = useState<DocumentResponse[] | null>(
        null
    );
    const [shownList, setShownList] = useState<DocumentResponse[] | null>(null);
    const [searchString, setSearchString] = useState<string>("");

    useEffect(() => {
        if (relatedList !== null) return;
        if (documentIdList.length === 0) {
            setRelatedList([]);
            setShownList([]);
            return;
        }
        const requestBody = {
            documentIdList: documentIdList,
        };
        axios
            .post(
                `${process.env.REACT_APP_API_URL}/documents/records`,
                requestBody
            )
            .then((response) => {
                setRelatedList(response.data);
                setShownList(response.data);
            })
            .catch((error) => {
                console.log(error.response.data);
            });
    }, [documentIdList, relatedList]);

    const filterDocumentList = (list: DocumentResponse[]) => {
        return list.filter(
            (currentDocument) =>
                currentDocument.id !== documentId &&
                !relatedList?.some(
                    (filterDocument) => currentDocument.id === filterDocument.id
                )
        );
    };

    const fetchDocumentList = () => {
        axios
            .get(`${process.env.REACT_APP_API_URL}/documents/all`)
            .then((response: AxiosResponse<DocumentResponse[]>) => {
                const updatedList = filterDocumentList(response.data);
                setDocumentList(updatedList);
                setShownList(updatedList);
            })
            .catch((error) => {
                console.log(error.response.data);
            });
    };

    const search = (list: DocumentResponse[], searchValue: string) => {
        const query = searchValue.toLowerCase();
        const result = list.filter((data) => matchQuerySting(data, query));
        setShownList(result);
    };

    const handleSelect = (value: boolean) => {
        if (listAll === value) return;
        setListAll(value);
        setShownList(null);
        if (value && documentList === null) {
            fetchDocumentList();
            return;
        }
        search(value ? documentList! : relatedList!, searchString);
    };

    const handleSearch = (searchValue: string) => {
        setSearchString(searchValue);
        if (
            (listAll && documentList === null) ||
            (!listAll && relatedList === null)
        ) {
            return;
        }
        const query = searchValue.toLowerCase();
        const queryList = listAll ? documentList! : relatedList!;
        search(queryList, query);
    };

    const handleDelete = async (index: number) => {
        if (shownList === null || listAll) return;
        const selected = shownList[index];
        const requestBody = {
            documentId: documentId,
            relatedDocumentId: selected.id,
        };
        await axios
            .put(
                `${process.env.REACT_APP_API_URL}/documents/related/remove`,
                requestBody
            )
            .then(() => {
                setDocumentIdList(
                    documentIdList.filter((value) => value !== selected.id)
                );
                if (documentList !== null) {
                    setDocumentList([...documentList, selected]);
                }
                setRelatedList(
                    relatedList!.filter((value) => value.id !== selected.id)
                );
                setShownList(removeStateListValue(index, shownList));
            })
            .catch((error) => {
                console.log(error.response.data);
            });
    };

    const handleAdd = async (index: number) => {
        if (shownList === null || !listAll) return;
        const selected = shownList[index];
        const requestBody = {
            documentId: documentId,
            relatedDocumentId: selected.id,
        };
        await axios
            .put(
                `${process.env.REACT_APP_API_URL}/documents/related/add`,
                requestBody
            )
            .then(() => {
                setDocumentIdList([...documentIdList, selected.id]);
                setRelatedList([...relatedList!, selected]);
                setDocumentList(
                    documentList!.filter((value) => value.id !== selected.id)
                );
                setShownList(removeStateListValue(index, shownList));
            })
            .catch((error) => {
                console.log(error.response.data);
            });
    };

    return (
        <div id={id} className={`related-panel ${className}`}>
            <div className="related-header">
                <SearchBar
                    id="related-search-bar"
                    onChange={(searchValue) => handleSearch(searchValue)}
                />
                <div className="related-select">
                    <button
                        className={!listAll ? "selected" : ""}
                        onClick={() => handleSelect(false)}
                    >
                        Related Documents
                    </button>
                    <button
                        className={listAll ? "selected" : ""}
                        onClick={() => handleSelect(true)}
                    >
                        Search Documents
                    </button>
                </div>
            </div>
            <div className="related-list">
                {shownList === null ? (
                    <LoadingPanel size={60} speedMultiplier={0.6} />
                ) : shownList.length === 0 ? (
                    <p>No Documents Found</p>
                ) : (
                    shownList?.map((data, index) => (
                        <div key={data.id} className="related-document">
                            <DocumentCard
                                className="related-document-data"
                                data={data}
                            />
                            <div className="related-document-console">
                                <div className="related-document-buttons">
                                    <SpinnerButton
                                        onClick={async () => {
                                            const handler = listAll
                                                ? handleAdd
                                                : handleDelete;
                                            await handler(index);
                                        }}
                                        spinnerColor="#808080"
                                        spinnerSize={15}
                                        speedMultiplier={0.6}
                                    >
                                        <img
                                            src={
                                                listAll ? addImage : deleteImage
                                            }
                                            alt={listAll ? "add" : "delete"}
                                            draggable={false}
                                        />
                                    </SpinnerButton>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

RelatedDocumentPanel.defaultProps = {
    id: "",
    className: "",
};

export default RelatedDocumentPanel;
