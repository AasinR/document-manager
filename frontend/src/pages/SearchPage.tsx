import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
    DocumentCard,
    LoadingPanel,
    SearchBar,
    SearchFilter,
} from "../components";
import { useAuth } from "../hooks";
import arrowImage from "../assets/icons/downward-arrow.png";
import "./SearchPage.css";

function SearchPage() {
    const { auth } = useAuth();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [documentList, setDocumentList] = useState<DocumentResponse[]>([]);
    const [shownDocumentList, setShownDocumentList] = useState<
        DocumentResponse[]
    >([]);

    const [groupSelect, setGroupSelect] = useState<boolean>(false);
    const [groupList, setGroupList] = useState<Group[] | null>(null);
    const [selectedGroupId, setSelectedGroupId] = useState<string>("");

    const [authorSearchValue, setAuthorSearchValue] = useState<string>("");
    const [authorList, setAuthorList] = useState<
        { name: string; selected: boolean }[] | null
    >(null);
    const [shownAuthorList, setShownAuthorList] = useState<
        { name: string; selected: boolean }[]
    >([]);

    const search = useCallback(
        (searchValue: string) => {
            const searchWord = searchValue.toLowerCase();
            const result = documentList.filter((value: DocumentResponse) => {
                return (
                    value.metadata.title.toLowerCase().includes(searchWord) ||
                    value.metadata.authorList.some((author) =>
                        author.toLowerCase().includes(searchWord)
                    )
                );
            });
            setShownDocumentList(result);
        },
        [documentList]
    );

    const handleSearch = (searchValue: string) => {
        search(searchValue);
        navigate(`/search?query=${searchValue}`);
    };

    const handleOpenResult = (data: DocumentResponse) => {
        console.log(`clicked on result: ${data.id}`);
    };

    const handleLabelFilterSelect = () => {
        // TODO: reset tag select
        setGroupSelect(false);
    };

    const fetchGroupList = () => {
        setGroupSelect(!groupSelect);
        if (groupList !== null) return;
        axios
            .get(
                `${process.env.REACT_APP_API_URL}/groups/all/${auth!.username}`
            )
            .then((response) => {
                setGroupList(response.data);
            })
            .catch((error) => {
                console.log(error);
            });
    };

    const updateSelectedGroupId = (id: string) => {
        if (id === selectedGroupId) setSelectedGroupId("");
        else setSelectedGroupId(id);
    };

    const fetchAuthorList = () => {
        setAuthorSearchValue("");
        if (authorList !== null) return;
        const authors = documentList.flatMap(
            (data) => data.metadata.authorList
        );
        const uniqueAuthors = Array.from(new Set(authors)).sort();
        const authorObjList = uniqueAuthors.map((author) => ({
            name: author,
            selected: false,
        }));
        setAuthorList(authorObjList);
        setShownAuthorList(authorObjList);
    };

    const updateAuthorList = (authorObj: {
        name: string;
        selected: boolean;
    }) => {
        const updatedAuthor = {
            name: authorObj.name,
            selected: !authorObj.selected,
        };
        const newState = authorList!.map((obj) =>
            obj === authorObj ? updatedAuthor : obj
        );
        const newSearchState = shownAuthorList.map((obj) =>
            obj === authorObj ? updatedAuthor : obj
        );
        setAuthorList(newState);
        setShownAuthorList(newSearchState);
    };

    // author filter search
    useEffect(() => {
        const searchQuery = authorSearchValue.toLowerCase();
        const result = authorList?.filter((value) =>
            value.name.toLowerCase().includes(searchQuery)
        ) ?? [];
        setShownAuthorList(result);
    }, [authorList, authorSearchValue]);

    // get document
    useEffect(() => {
        axios
            .get(`${process.env.REACT_APP_API_URL}/documents/all`)
            .then((response) => {
                setDocumentList(response.data);
                setShownDocumentList(response.data);
            })
            .catch((error) => {
                console.log(error);
            });
    }, []);

    // set search value
    useEffect(() => {
        if (documentList.length === 0) return;
        search(searchParams.get("query") ?? "");
    }, [search, searchParams, documentList]);

    return (
        <div id="search-page" className="page">
            <div id="search-page-mid">
                <SearchBar
                    id="search-page-search-bar"
                    defaultValue={searchParams.get("query") ?? ""}
                    onSearch={handleSearch}
                />
                <div id="search-page-filer-container">
                    {/*TODO: tag filter*/}
                    <SearchFilter
                        containerId="search-page-tag-filter-container"
                        title="Label"
                        onClick={handleLabelFilterSelect}
                    >
                        <div className="search-page-filter-header">
                            <input
                                type="text"
                                placeholder="Search..."
                                spellCheck={false}
                            />
                            <div className="search-page-filter-header-options">
                                <button>Public</button>
                                <button>Private</button>
                                <button
                                    id="search-page-group-button"
                                    className={groupSelect ? "selected" : ""}
                                    onClick={fetchGroupList}
                                >
                                    <p>Group</p>
                                    <img src={arrowImage} alt="v" />
                                </button>
                            </div>
                            {groupSelect ? (
                                <>
                                    <div
                                        id="search-page-group-select-overlay"
                                        onClick={() => setGroupSelect(false)}
                                    ></div>
                                    <div id="search-page-group-select">
                                        {groupSelect ? (
                                            <div className="search-page-filter-option-container">
                                                {groupList === null ? (
                                                    <LoadingPanel size={30} speedMultiplier={0.6} />
                                                ) : (
                                                    <>
                                                        {groupList.length === 0 ? <p className="search-page-filter-not-found">No Groups Found</p> : null}
                                                        {groupList.map((group) => (
                                                            <button
                                                                key={group.id}
                                                                className={group.id === selectedGroupId ? "selected" : ""}
                                                                onClick={() => updateSelectedGroupId(group.id)}
                                                            >
                                                                <p>{group.name}</p>
                                                                {group.id === selectedGroupId && <p>✓</p>}
                                                            </button>
                                                        ))}
                                                    </>
                                                )}
                                            </div>
                                        ) : null}
                                    </div>
                                </>
                            ) : null}
                        </div>
                    </SearchFilter>
                    <SearchFilter title="Author" onClick={fetchAuthorList}>
                        <div className="search-page-filter-header">
                            <input
                                type="text"
                                placeholder="Search..."
                                spellCheck={false}
                                value={authorSearchValue}
                                onChange={(event) =>
                                    setAuthorSearchValue(event.target.value)
                                }
                            />
                        </div>
                        <div className="search-page-filter-option-container">
                            {authorList === null ? (
                                <LoadingPanel size={30} speedMultiplier={0.6} />
                            ) : (
                                <>
                                    {authorList.length === 0 ? <p className="search-page-filter-not-found">No Author Found</p> : null}
                                    {shownAuthorList.map((data) => (
                                        <button
                                            key={data.name}
                                            className={data.selected ? "selected" : ""}
                                            onClick={() => updateAuthorList(data)}
                                        >
                                            <p>{data.name}</p>
                                            <p>{data.selected ? "✓" : null}</p>
                                        </button>
                                    ))}
                                </>
                            )}
                        </div>
                    </SearchFilter>
                    <SearchFilter title="Publication Date"></SearchFilter>
                    <SearchFilter title="Other"></SearchFilter>
                </div>
                <div id="search-page-container">
                    {shownDocumentList.map((data) => (
                        <DocumentCard
                            key={data.id}
                            data={data}
                            onClick={handleOpenResult}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default SearchPage;
