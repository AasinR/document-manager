import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
    DocumentCard,
    LoadingPanel,
    SearchBar,
    SearchFilter,
} from "../components";
import { useAuth, useAuthorFilter, useLabelFilter } from "../hooks";
import { LabelType } from "../utils/data";
import "./SearchPage.css";

function SearchPage() {
    const { auth } = useAuth();
    const {
        shownLabelList,
        fetchLabelList,
        updateLabelList,
        isLabelListExists,
        isLabelListEmpty,
        queryLabelList,
    } = useLabelFilter();
    const {
        authorList,
        shownAuthorList,
        fetchAuthorList,
        updateAuthorList,
        queryAuthorList,
    } = useAuthorFilter();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [documentList, setDocumentList] = useState<DocumentResponse[]>([]);
    const [shownDocumentList, setShownDocumentList] = useState<
        DocumentResponse[]
    >([]);

    const [groupList, setGroupList] = useState<Group[] | null>(null);
    const [activeLabel, setActiveLabel] = useState<ActiveLabelType | null>(
        null
    );

    const [labelSearchValue, setLabelSearchValue] = useState<string>("");
    const [authorSearchValue, setAuthorSearchValue] = useState<string>("");

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
        setLabelSearchValue("");
        if (activeLabel === null) {
            const labelType: ActiveLabelType = { type: LabelType.PUBLIC };
            setActiveLabel(labelType);
            fetchLabelList(labelType);
        }
    };

    const updateLabelType = (value: ActiveLabelType) => {
        if (value === activeLabel) return;
        setActiveLabel(value);
        fetchLabelList(value);
    };

    const getLabelFilterText = (): string => {
        if (activeLabel === null) return "";
        const labelTypeToText: { [key: string]: string } = {
            [LabelType.PUBLIC]: "Public",
            [LabelType.PRIVATE]: "Private",
            [LabelType.GROUP]: `Group: ${activeLabel.groupName}`,
        };
        return labelTypeToText[activeLabel.type] || "";
    };

    const fetchGroupList = () => {
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

    const handelAuthorFilterSelect = () => {
        setAuthorSearchValue("");
        fetchAuthorList(documentList);
    };

    useEffect(() => {
        queryLabelList(activeLabel, labelSearchValue);
    }, [activeLabel, labelSearchValue, queryLabelList]);

    useEffect(() => {
        queryAuthorList(authorSearchValue);
    }, [authorSearchValue, queryAuthorList]);

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
                                value={labelSearchValue}
                                onChange={(event) =>
                                    setLabelSearchValue(event.target.value)
                                }
                            />
                            <div className="search-page-filter-header-options">
                                <button
                                    className={
                                        activeLabel?.type === LabelType.PUBLIC
                                            ? "selected"
                                            : ""
                                    }
                                    onClick={() =>
                                        updateLabelType({
                                            type: LabelType.PUBLIC,
                                        })
                                    }
                                >
                                    Public
                                </button>
                                <button
                                    className={
                                        activeLabel?.type === LabelType.PRIVATE
                                            ? "selected"
                                            : ""
                                    }
                                    onClick={() =>
                                        updateLabelType({
                                            type: LabelType.PRIVATE,
                                        })
                                    }
                                >
                                    Private
                                </button>
                                <SearchFilter
                                    title="Group"
                                    onClick={fetchGroupList}
                                    containerId="search-page-group-select-container"
                                    showAsActive={
                                        activeLabel?.type === LabelType.GROUP
                                    }
                                >
                                    <div className="search-page-filter-option-container">
                                        {groupList === null ? (
                                            <LoadingPanel
                                                size={30}
                                                speedMultiplier={0.6}
                                            />
                                        ) : (
                                            <>
                                                {groupList.length === 0 ? (
                                                    <p className="search-page-filter-not-found">
                                                        No Groups Found
                                                    </p>
                                                ) : null}
                                                {groupList.map((group) => (
                                                    <button
                                                        key={group.id}
                                                        className={
                                                            group.id ===
                                                            activeLabel?.groupId
                                                                ? "selected"
                                                                : ""
                                                        }
                                                        onClick={() =>
                                                            updateLabelType({
                                                                type: LabelType.GROUP,
                                                                groupId:
                                                                    group.id,
                                                                groupName:
                                                                    group.name,
                                                            })
                                                        }
                                                    >
                                                        <p>{group.name}</p>
                                                        {group.id ===
                                                            activeLabel?.groupId && (
                                                            <p>✓</p>
                                                        )}
                                                    </button>
                                                ))}
                                            </>
                                        )}
                                    </div>
                                </SearchFilter>
                            </div>
                            <p id="search-page-label-text">
                                Filtered by {getLabelFilterText()}
                            </p>
                        </div>
                        <div className="search-page-filter-option-container">
                            {isLabelListExists(activeLabel) ? (
                                <LoadingPanel size={30} speedMultiplier={0.6} />
                            ) : (
                                <>
                                    {isLabelListEmpty(activeLabel) ? (
                                        <p className="search-page-filter-not-found">
                                            No Label Found
                                        </p>
                                    ) : null}
                                    {shownLabelList.map((data) => (
                                        <button
                                            key={data.tag.id}
                                            className={
                                                data.selected ? "selected" : ""
                                            }
                                            onClick={() =>
                                                updateLabelList(
                                                    activeLabel,
                                                    data
                                                )
                                            }
                                        >
                                            <p>{data.tag.name}</p>
                                            <p>{data.selected ? "✓" : null}</p>
                                        </button>
                                    ))}
                                </>
                            )}
                        </div>
                    </SearchFilter>
                    <SearchFilter
                        title="Author"
                        onClick={handelAuthorFilterSelect}
                    >
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
                                    {authorList.length === 0 ? (
                                        <p className="search-page-filter-not-found">
                                            No Author Found
                                        </p>
                                    ) : null}
                                    {shownAuthorList.map((data) => (
                                        <button
                                            key={data.name}
                                            className={
                                                data.selected ? "selected" : ""
                                            }
                                            onClick={() =>
                                                updateAuthorList(data)
                                            }
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
