import axios, { AxiosResponse } from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LabelType } from "../utils/data";
import { changeStateListValue } from "../utils/util";
import LoadingPanel from "./LoadingPanel";
import settingsImage from "../assets/icons/setting.png";
import "./LabelListPanel.css";

function LabelListPanel({
    id,
    className,
    title,
    labelType,
    groupId,
    tagList,
    documentId,
    saveId,
    updateTagList,
}: {
    id: string;
    className: string;
    title: string;
    labelType: LabelType;
    groupId: string;
    tagList: Tag[];
    documentId: string;
    saveId: string;
    updateTagList: (list: Tag[], type: LabelType, groupId: string) => void;
}) {
    const navigate = useNavigate();

    const [editing, setEditing] = useState<boolean>(false);
    const [optionList, setOptionList] = useState<LabelOption[] | null>(null);
    const [shownList, setShownList] = useState<LabelOption[]>([]);
    const [disableButton, setDisableButton] = useState<boolean>(false);
    const [searchValue, setSearchValue] = useState<string>("");

    const handleEditing = () => {
        setEditing(!editing);
        if (optionList !== null) return;
        let requestUrl = "";
        switch (labelType) {
            case LabelType.PUBLIC:
                requestUrl = "public";
                break;
            case LabelType.PRIVATE:
                requestUrl = "private";
                break;
            case LabelType.GROUP:
                requestUrl = `private?groupId=${groupId}`;
                break;
            default:
                return;
        }
        axios
            .get(`${process.env.REACT_APP_API_URL}/tags/all/${requestUrl}`)
            .then((response: AxiosResponse<Tag[]>) => {
                const options: LabelOption[] = response.data.map((tag) => ({
                    tag: tag,
                    selected: tagList.some((value) => value.id === tag.id),
                }));
                setOptionList(options);
                setShownList(options);
            })
            .catch((error) => {
                console.log(error.response.data);
            });
    };

    const handleSelect = (value: LabelOption) => {
        if (optionList === null) return;
        const updatedLabel: LabelOption = {
            tag: value.tag,
            selected: !value.selected,
        };
        let requestUrl = "";
        switch (labelType) {
            case LabelType.PUBLIC:
                requestUrl = value.selected
                    ? `documents/tag/remove/${documentId}`
                    : `documents/tag/add/${documentId}`;
                break;
            case LabelType.PRIVATE:
            case LabelType.GROUP:
                requestUrl = value.selected
                    ? `saved/tag/remove/${saveId}`
                    : `saved/tag/add/${saveId}`;
                break;
            default:
                return;
        }
        setDisableButton(true);
        const requestBody = {
            tagId: value.tag.id,
        };
        axios
            .put(`${process.env.REACT_APP_API_URL}/${requestUrl}`, requestBody)
            .then(() => {
                if (value.selected) {
                    const newList = tagList.filter(
                        (tag) => tag.id !== value.tag.id
                    );
                    updateTagList(newList, labelType, groupId);
                } else {
                    updateTagList([...tagList, value.tag], labelType, groupId);
                }
                setOptionList(
                    changeStateListValue(optionList, value, updatedLabel)
                );
                setShownList(
                    changeStateListValue(shownList, value, updatedLabel)
                );
                setDisableButton(false);
            })
            .catch((error) => {
                console.log(error.response.data);
                setDisableButton(false);
            });
    };

    const handleSearch = (value: string) => {
        setSearchValue(value);
        if (optionList === null) return;
        const queryString = value.toLowerCase();
        const result = optionList.filter((value) =>
            value.tag.name.toLowerCase().includes(queryString)
        );
        setShownList(result);
    };

    const handleLabelNav = () => {
        navigate(`/label?type=${labelType}${groupId ? `&id=${groupId}` : ""}`);
    };

    return (
        <div id={id} className={`label-list-panel ${className}`}>
            <div className="label-list-header">
                <h1>{title}</h1>
                <button
                    className={editing ? "selected" : ""}
                    onClick={handleEditing}
                    disabled={disableButton}
                >
                    <img
                        src={settingsImage}
                        alt="settingsImage"
                        draggable={false}
                    />
                </button>
            </div>
            <div className="label-list-dropdown-container">
                {editing && (
                    <div className="label-list-dropdown">
                        <div className="label-list-dropdown-header">
                            <input
                                placeholder="Search..."
                                value={searchValue}
                                onChange={(event) =>
                                    handleSearch(event.target.value)
                                }
                            />
                        </div>
                        <div className="label-list-dropdown-list">
                            {optionList === null ? (
                                <LoadingPanel size={40} speedMultiplier={0.6} />
                            ) : shownList.length === 0 ? (
                                <p>No Labels Found</p>
                            ) : (
                                shownList.map((value) => (
                                    <button
                                        key={value.tag.id}
                                        onClick={() => handleSelect(value)}
                                    >
                                        <p>{value.tag.name}</p>
                                        <p>{value.selected && "✓"}</p>
                                    </button>
                                ))
                            )}
                        </div>
                        <button
                            className="label-list-dropdown-edit"
                            onClick={handleLabelNav}
                        >
                            Edit Labels
                        </button>
                    </div>
                )}
            </div>
            <div className="label-list-container">
                {tagList.length === 0 ? (
                    <p className="label-list-empty">No Labels Found</p>
                ) : (
                    tagList.map((tag) => (
                        <p key={tag.id} className="label-list-label">
                            {tag.name}
                        </p>
                    ))
                )}
            </div>
            {editing && (
                <div
                    className="label-list-overlay"
                    onClick={() => setEditing(false)}
                ></div>
            )}
        </div>
    );
}

LabelListPanel.defaultProps = {
    id: "",
    className: "",
    groupId: "",
    saveId: "",
};

export default LabelListPanel;
