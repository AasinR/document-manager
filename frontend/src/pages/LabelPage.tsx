import axios, { AxiosResponse } from "axios";
import React, { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
    LoadingPanel,
    SearchBar,
    SearchFilter,
    SpinnerButton,
} from "../components";
import { useAuth, useFetchGroupList } from "../hooks";
import { LabelType } from "../utils/data";
import { changeStateListValue, removeStateListValue } from "../utils/util";
import LoadingPage from "./LoadingPage";
import deleteImage from "../assets/icons/delete.png";
import closeImage from "../assets/icons/close.png";
import editImage from "../assets/icons/edit.png";
import "./LabelPage.css";

function LabelPage() {
    const [searchParams] = useSearchParams();
    const { auth } = useAuth();
    const { groupList, fetchGroupList } = useFetchGroupList();

    const [loading, setLoading] = useState<boolean>(true);
    const [adding, setAdding] = useState<boolean>(false);
    const [inputValue, setInputValue] = useState<string>("");
    const [errorMessage, setErrorMessage] = useState<string>("");

    const [shownGroupList, setShownGroupList] = useState<Group[] | null>(null);
    const [groupSearchValue, setGroupSearchValue] = useState<string>("");
    const [activeLabel, setActiveLabel] = useState<ActiveLabelType | null>(
        null
    );
    const [labelList, setLabelList] = useState<Tag[] | null>(null);
    const [shownLabelList, setShownLabelList] = useState<Tag[] | null>(null);
    const [labelSearchValue, setLabelSearchValue] = useState<string>("");

    const [editId, setEditId] = useState<string>("");
    const [editValue, setEditValue] = useState<string>("");

    const searchLabel = useCallback(
        (value: string, list?: Tag[]) => {
            const searchList = list ? list : labelList;
            if (searchList === null) return;
            const searchString = value.toLowerCase();
            const result = searchList.filter((label) =>
                label.name.toLowerCase().includes(searchString)
            );
            setShownLabelList(result);
        },
        [labelList]
    );

    const fetchLabelList = useCallback(
        (labelType: ActiveLabelType) => {
            let requestUrl = "";
            switch (labelType.type) {
                case LabelType.PUBLIC:
                    requestUrl = "public";
                    break;
                case LabelType.PRIVATE:
                    requestUrl = "private";
                    break;
                case LabelType.GROUP:
                    requestUrl = `private?groupId=${labelType.groupId}`;
                    break;
                default:
                    return;
            }
            axios
                .get(`${process.env.REACT_APP_API_URL}/tags/all/${requestUrl}`)
                .then((response: AxiosResponse<Tag[]>) => {
                    setLabelList(response.data);
                    searchLabel(labelSearchValue, response.data);
                })
                .catch((error) => {
                    console.log(error.response.data);
                });
        },
        [labelSearchValue, searchLabel]
    );

    useEffect(() => {
        if (!loading) return;
        (async () => {
            const groups = await fetchGroupList(auth!.username);
            setShownGroupList(groups);
            setLoading(false);
            let selected: ActiveLabelType = {
                type: LabelType.PUBLIC,
            };
            const type = searchParams.get("type");
            if (type !== null) {
                const groupId = searchParams.get("id");
                const group = groups?.find((value) => value.id === groupId);
                selected = {
                    type: type as LabelType,
                    groupId: group?.id,
                    groupName: group?.name,
                };
            }
            setActiveLabel(selected);
            fetchLabelList(selected);
        })();
    }, [
        auth,
        fetchGroupList,
        fetchLabelList,
        labelList,
        loading,
        searchParams,
    ]);

    const updateLabelType = (value: ActiveLabelType) => {
        if (value === activeLabel) return;
        setActiveLabel(value);
        setShownLabelList(null);
        fetchLabelList(value);
        setEditId("");
    };

    const handleCancelAdd = () => {
        setAdding(false);
        setInputValue("");
        setErrorMessage("");
    };

    const handleAddNew = async () => {
        if (
            labelList === null ||
            shownLabelList === null ||
            activeLabel === null
        )
            return;
        let requestUrl = "";
        switch (activeLabel.type) {
            case LabelType.PUBLIC:
                requestUrl = "public";
                break;
            case LabelType.PRIVATE:
                requestUrl = "private";
                break;
            case LabelType.GROUP:
                requestUrl = `private?groupId=${activeLabel.groupId}`;
                break;
            default:
                return;
        }
        const value = inputValue.trim();
        if (value === "") {
            setErrorMessage("Label name cannot be empty!");
            return;
        }
        const requestBody = {
            name: value,
        };
        await axios
            .post(
                `${process.env.REACT_APP_API_URL}/tags/add/${requestUrl}`,
                requestBody
            )
            .then((response: AxiosResponse<Tag>) => {
                setLabelList([...labelList, response.data]);
                setShownLabelList([...shownLabelList, response.data]);
                handleCancelAdd();
            })
            .catch(() => {
                setErrorMessage("Failed to add new label!");
            });
    };

    const handleGroupOpen = async () => {
        if (groupList !== null) return;
        const groups = await fetchGroupList(auth!.username);
        setShownGroupList(groups);
    };

    const handleGroupSearch = (value: string) => {
        setGroupSearchValue(value);
        if (groupList === null) return;
        const searchString = value.toLowerCase();
        const result = groupList.filter((group) =>
            group.name.toLowerCase().includes(searchString)
        );
        setShownGroupList(result);
    };

    const handleLabelSearch = (value: string) => {
        setLabelSearchValue(value);
        searchLabel(value);
    };

    const handleEditing = (id: string, value: string) => {
        if (editId === id) {
            setEditId("");
            setErrorMessage("");
            return;
        }
        setEditValue(value);
        setEditId(id);
    };

    const handleLabelSave = async (value: Tag) => {
        if (labelList === null || shownLabelList === null) return;
        const name = editValue.trim();
        if (name === "") {
            setErrorMessage("New label name cannot be empty!");
            return;
        }
        if (name === value.name) {
            setErrorMessage(
                "New label name cannot be equal to an other label!"
            );
            return;
        }
        const requestBody = {
            name: name,
        };
        await axios
            .put(
                `${process.env.REACT_APP_API_URL}/tags/update/${value.id}`,
                requestBody
            )
            .then(() => {
                const newState: Tag = {
                    id: value.id,
                    ownerId: value.ownerId,
                    name: name,
                };
                setLabelList(changeStateListValue(labelList, value, newState));
                setShownLabelList(
                    changeStateListValue(shownLabelList, value, newState)
                );
                setEditId("");
                setErrorMessage("");
            })
            .catch((error) => {
                setErrorMessage("Failed to update label name!");
                console.log(error.response.data);
            });
    };

    const handleLabelDelete = async (index: number) => {
        if (labelList === null || shownLabelList === null) return;
        const label = shownLabelList[index];
        await axios
            .delete(`${process.env.REACT_APP_API_URL}/tags/delete/${label.id}`)
            .then(() => {
                setLabelList(labelList.filter((value) => value !== label));
                setShownLabelList(removeStateListValue(index, shownLabelList));
            })
            .catch((error) => {
                console.log(error.response.data);
            });
    };

    const getLabelText = (): string => {
        if (activeLabel === null) return "";
        const labelTypeToText: { [key: string]: string } = {
            [LabelType.PUBLIC]: "Public",
            [LabelType.PRIVATE]: "Private",
            [LabelType.GROUP]: `Group: ${activeLabel.groupName}`,
        };
        return labelTypeToText[activeLabel.type] || "";
    };

    return loading ? (
        <LoadingPage />
    ) : (
        <div id="label-page" className="page">
            <div id="label-page-mid">
                <div id="label-page-select-panel">
                    <SearchBar
                        id="label-page-search"
                        onChange={handleLabelSearch}
                    />
                    <div id="label-page-select">
                        <button
                            className={
                                activeLabel?.type === LabelType.PUBLIC
                                    ? "selected"
                                    : ""
                            }
                            onClick={() =>
                                updateLabelType({ type: LabelType.PUBLIC })
                            }
                        >
                            Public Labels
                        </button>
                        <button
                            className={
                                activeLabel?.type === LabelType.PRIVATE
                                    ? "selected"
                                    : ""
                            }
                            onClick={() =>
                                updateLabelType({ type: LabelType.PRIVATE })
                            }
                        >
                            Private Labels
                        </button>
                        <SearchFilter
                            id="label-page-select-group"
                            containerId="label-page-group-select"
                            title="Group Labels"
                            onClick={handleGroupOpen}
                            showAsActive={activeLabel?.type === LabelType.GROUP}
                        >
                            <div id="label-page-group-header">
                                <input
                                    placeholder="Search..."
                                    value={groupSearchValue}
                                    onChange={(event) =>
                                        handleGroupSearch(event.target.value)
                                    }
                                />
                            </div>
                            <div id="label-page-group-list">
                                {shownGroupList === null ? (
                                    <LoadingPanel
                                        size={30}
                                        speedMultiplier={0.6}
                                    />
                                ) : shownGroupList.length === 0 ? (
                                    <p>No Groups Found</p>
                                ) : (
                                    shownGroupList.map((group) => (
                                        <button
                                            key={group.id}
                                            className={
                                                activeLabel?.groupId ===
                                                group.id
                                                    ? "selected"
                                                    : ""
                                            }
                                            onClick={() =>
                                                updateLabelType({
                                                    type: LabelType.GROUP,
                                                    groupName: group.name,
                                                    groupId: group.id,
                                                })
                                            }
                                        >
                                            <p>{group.name}</p>
                                            <p>
                                                {activeLabel?.groupId ===
                                                    group.id && "✓"}
                                            </p>
                                        </button>
                                    ))
                                )}
                            </div>
                        </SearchFilter>
                    </div>
                    <p>Listed by {getLabelText()}</p>
                </div>
                <div id="label-page-new-panel">
                    {adding ? (
                        <div id="label-page-new-container">
                            <input
                                placeholder="Add new label..."
                                value={inputValue}
                                onChange={(event) =>
                                    setInputValue(event.target.value)
                                }
                            />
                            <div id="label-page-new-buttons">
                                <SpinnerButton
                                    onClick={handleAddNew}
                                    spinnerColor="#808080"
                                    spinnerSize={10}
                                    speedMultiplier={0.6}
                                >
                                    Add
                                </SpinnerButton>
                                <button onClick={handleCancelAdd}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            id="label-page-add-new"
                            onClick={() => setAdding(true)}
                        >
                            Add New +
                        </button>
                    )}
                    {errorMessage && <p>Error: {errorMessage}</p>}
                </div>
                <div id="label-page-list">
                    {shownLabelList === null ? (
                        <LoadingPanel size={80} speedMultiplier={0.6} />
                    ) : shownLabelList.length === 0 ? (
                        <p>No Labels Found</p>
                    ) : (
                        shownLabelList.map((label, index) => (
                            <div
                                key={label.id}
                                className={`label-page-option ${
                                    editId === label.id ? "editing" : ""
                                }`}
                            >
                                <input
                                    value={
                                        editId === label.id
                                            ? editValue
                                            : label.name
                                    }
                                    onChange={(event) =>
                                        setEditValue(event.target.value)
                                    }
                                    disabled={editId !== label.id}
                                />
                                <div>
                                    <button
                                        className="label-page-option-button"
                                        onClick={() =>
                                            handleEditing(label.id, label.name)
                                        }
                                    >
                                        <img
                                            src={
                                                editId === label.id
                                                    ? closeImage
                                                    : editImage
                                            }
                                            alt={
                                                editId === label.id
                                                    ? "close"
                                                    : "edit"
                                            }
                                            draggable={false}
                                        />
                                    </button>
                                    <SpinnerButton
                                        className="label-page-option-button"
                                        onClick={async () => {
                                            if (editId === label.id) {
                                                await handleLabelSave(label);
                                                return;
                                            }
                                            await handleLabelDelete(index);
                                        }}
                                        spinnerColor="#808080"
                                        spinnerSize={15}
                                        speedMultiplier={0.6}
                                    >
                                        <img
                                            src={
                                                editId === label.id
                                                    ? editImage
                                                    : deleteImage
                                            }
                                            alt={
                                                editId === label.id
                                                    ? "edit"
                                                    : "delete"
                                            }
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
    );
}

export default LabelPage;
