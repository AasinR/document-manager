import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
    DocumentCard,
    LoadingPanel,
    SearchBar,
    SearchFilter,
} from "../components";
import {
    useAuth,
    useAuthorFilter,
    useDocumentSearch,
    useFetchGroupList,
    useLabelFilter,
    useYearFilter,
} from "../hooks";
import { LabelType, YearFilterType } from "../utils/data";
import {
    generateSearchUrl,
    getAuthorUrlParam,
    getGroupTagUrlParam,
    getPrivateTagUrlParam,
    getPublicTagUrlParam,
    getQueryUrlParam,
    getYearUrlParam,
} from "../utils/search";
import "./SearchPage.css";

function SearchPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { auth } = useAuth();
    const {
        documentList,
        setDocumentList,
        shownDocumentList,
        searchByFilterQuery,
    } = useDocumentSearch();
    const {
        publicLabelList,
        privateLabelList,
        groupLabelList,
        shownLabelList,
        fetchLabelList,
        updateLabelList,
        isLabelListExists,
        isLabelListEmpty,
        queryLabelList,
        resetLabelLists,
    } = useLabelFilter(searchParams);
    const {
        authorList,
        shownAuthorList,
        fetchAuthorList,
        updateAuthorList,
        queryAuthorList,
        resetAuthorList,
    } = useAuthorFilter(searchParams);
    const {
        activeYearFilter,
        yearFilterValue,
        handleYearTypeSelect,
        updateExactYearValue,
        updateYearFromValue,
        updateYearToValue,
        resetYearFilter,
    } = useYearFilter(searchParams);
    const { groupList, fetchGroupList } = useFetchGroupList();

    const [activeLabel, setActiveLabel] = useState<ActiveLabelType | null>(
        null
    );

    const [labelSearchValue, setLabelSearchValue] = useState<string>("");
    const [authorSearchValue, setAuthorSearchValue] = useState<string>("");

    const handleSearch = (searchValue: string) => {
        navigate(
            generateSearchUrl(
                "/search",
                searchValue,
                publicLabelList,
                privateLabelList,
                groupLabelList,
                authorList,
                yearFilterValue
            )
        );
    };

    const handleOpenResult = (data: DocumentResponse) => {
        navigate(`/document/${data.id}`);
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

    const handleAuthorFilterSelect = () => {
        if (documentList === null) return;
        setAuthorSearchValue("");
        fetchAuthorList(documentList);
    };

    const renderYearFilter = (): React.ReactElement | null => {
        const yearFilters = {
            [YearFilterType.NONE]: (
                <p className="search-page-filter-not-found">
                    Publication year not filtered
                </p>
            ),
            [YearFilterType.EXACT]: (
                <input
                    className="search-page-year-input"
                    type="number"
                    placeholder="Year"
                    min={0}
                    value={yearFilterValue?.exact ?? ""}
                    onChange={(event) =>
                        updateExactYearValue(event.target.value)
                    }
                />
            ),
            [YearFilterType.RANGE]: (
                <div id="search-page-date-input-container">
                    <input
                        className="search-page-year-input"
                        type="number"
                        placeholder="From"
                        min={0}
                        max={yearFilterValue?.to ?? undefined}
                        value={yearFilterValue?.from ?? ""}
                        onChange={(event) =>
                            updateYearFromValue(event.target.value)
                        }
                        onBlur={() =>
                            updateYearFromValue(
                                yearFilterValue.from?.toString() ?? "",
                                true
                            )
                        }
                    />
                    <span>—</span>
                    <input
                        className="search-page-year-input"
                        type="number"
                        placeholder="To"
                        min={yearFilterValue?.from ?? undefined}
                        value={yearFilterValue?.to ?? ""}
                        onChange={(event) =>
                            updateYearToValue(event.target.value)
                        }
                        onBlur={() =>
                            updateYearToValue(
                                yearFilterValue.to?.toString() ?? "",
                                true
                            )
                        }
                    />
                </div>
            ),
        };

        return yearFilters[activeYearFilter] || null;
    };

    const handleFilterReset = () => {
        resetLabelLists();
        resetAuthorList();
        resetYearFilter();
        navigate("/search");
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
            })
            .catch((error) => {
                console.log(error);
            });
    }, [setDocumentList]);

    // set search value
    useEffect(() => {
        if (documentList !== null && documentList.length === 0) return;
        searchByFilterQuery(
            getPublicTagUrlParam(searchParams),
            getPrivateTagUrlParam(searchParams),
            getGroupTagUrlParam(searchParams),
            getAuthorUrlParam(searchParams),
            getYearUrlParam(searchParams),
            getQueryUrlParam(searchParams)
        );
    }, [documentList, searchByFilterQuery, searchParams]);

    return (
        <div id="search-page" className="page">
            <div id="search-page-mid">
                <SearchBar
                    id="search-page-search-bar"
                    defaultValue={getQueryUrlParam(searchParams)}
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
                            <div
                                id="search-page-label-button-container"
                                className="search-page-filter-header-options"
                            >
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
                                    onClick={() =>
                                        fetchGroupList(auth!.username)
                                    }
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
                        onClick={handleAuthorFilterSelect}
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
                    <SearchFilter
                        containerId="search-page-date-filter-container"
                        containerClassName="search-page-filter-header"
                        title="Publication Year"
                    >
                        <div
                            id="search-page-date-button-container"
                            className="search-page-filter-header-options"
                        >
                            <button
                                className={
                                    activeYearFilter === YearFilterType.NONE
                                        ? "selected"
                                        : ""
                                }
                                onClick={() =>
                                    handleYearTypeSelect(YearFilterType.NONE)
                                }
                            >
                                None
                            </button>
                            <button
                                className={
                                    activeYearFilter === YearFilterType.EXACT
                                        ? "selected"
                                        : ""
                                }
                                onClick={() =>
                                    handleYearTypeSelect(YearFilterType.EXACT)
                                }
                            >
                                Exact Year
                            </button>
                            <button
                                className={
                                    activeYearFilter === YearFilterType.RANGE
                                        ? "selected"
                                        : ""
                                }
                                onClick={() =>
                                    handleYearTypeSelect(YearFilterType.RANGE)
                                }
                            >
                                Year Range
                            </button>
                        </div>
                        {renderYearFilter()}
                    </SearchFilter>
                    <button
                        id="search-page-filter-reset"
                        onClick={handleFilterReset}
                    >
                        Reset Filters
                    </button>
                </div>
                <div id="search-page-container">
                    {documentList === null ? (
                        <LoadingPanel size={60} speedMultiplier={0.6} />
                    ) : shownDocumentList.length === 0 ? (
                        <p>No Documents Found</p>
                    ) : (
                        shownDocumentList.map((data) => (
                            <DocumentCard
                                key={data.id}
                                data={data}
                                onClick={handleOpenResult}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

export default SearchPage;
