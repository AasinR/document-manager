import { useCallback, useState } from "react";
import axios, { AxiosResponse } from "axios";
import { LabelType } from "../utils/data";
import {
    changeStateListValue,
    getLabelOptionList,
    resetLabelOptionList,
} from "../utils/util";
import {
    getGroupTagUrlParam,
    getPrivateTagUrlParam,
    getPublicTagUrlParam,
} from "../utils/search";

function useLabelFilter(searchParams: URLSearchParams) {
    const [publicLabelList, setPublicLabelList] = useState<
        LabelOption[] | null
    >(null);
    const [privateLabelList, setPrivateLabelList] = useState<
        LabelOption[] | null
    >(null);
    const [groupLabelList, setGroupLabelList] = useState<GroupLabelOption[]>(
        []
    );
    const [shownLabelList, setShownLabelList] = useState<LabelOption[]>([]);

    const fetchLabelList = (activeLabel: ActiveLabelType) => {
        let axiosPromise;

        switch (activeLabel.type) {
            case LabelType.PUBLIC:
                if (publicLabelList === null) {
                    axiosPromise = axios.get(
                        `${process.env.REACT_APP_API_URL}/tags/all/public`
                    );
                } else setShownLabelList(publicLabelList);
                break;

            case LabelType.PRIVATE:
                if (privateLabelList === null) {
                    axiosPromise = axios.get(
                        `${process.env.REACT_APP_API_URL}/tags/all/private`
                    );
                } else setShownLabelList(privateLabelList);
                break;

            case LabelType.GROUP:
                const groupLabelOption = groupLabelList.find(
                    (obj) => obj.groupId === activeLabel.groupId
                );
                if (!groupLabelOption) {
                    axiosPromise = axios.get(
                        `${process.env.REACT_APP_API_URL}/tags/all/private?groupId=${activeLabel.groupId}`
                    );
                } else setShownLabelList(groupLabelOption.tagList);
                break;

            default:
                break;
        }

        if (axiosPromise) {
            axiosPromise
                .then((response: AxiosResponse<Tag[]>) => {
                    let shownLabelOptionList: LabelOption[] = [];
                    switch (activeLabel.type) {
                        case LabelType.PUBLIC:
                            const publicList = getLabelOptionList(
                                response.data,
                                getPublicTagUrlParam(searchParams)
                            );
                            setPublicLabelList(publicList);
                            shownLabelOptionList = publicList;
                            break;

                        case LabelType.PRIVATE:
                            const privateList = getLabelOptionList(
                                response.data,
                                getPrivateTagUrlParam(searchParams)
                            );
                            setPrivateLabelList(privateList);
                            shownLabelOptionList = privateList;
                            break;

                        case LabelType.GROUP:
                            const selectedGroup = getGroupTagUrlParam(
                                searchParams
                            ).find(
                                (value) => value.groupId === activeLabel.groupId
                            );
                            const tagList = selectedGroup
                                ? selectedGroup.tagIdList
                                : undefined;
                            const groupList = getLabelOptionList(
                                response.data,
                                tagList
                            );
                            setGroupLabelList([
                                ...groupLabelList,
                                {
                                    groupId: activeLabel.groupId!,
                                    tagList: groupList,
                                },
                            ]);
                            shownLabelOptionList = groupList;
                            break;

                        default:
                            break;
                    }
                    setShownLabelList(shownLabelOptionList);
                })
                .catch((error) => {
                    console.error(error);
                });
        }
    };

    const updateLabelList = (
        activeLabel: ActiveLabelType | null,
        value: LabelOption
    ) => {
        if (activeLabel === null) return;
        const updatedLabel: LabelOption = {
            tag: value.tag,
            selected: !value.selected,
        };

        switch (activeLabel.type) {
            case LabelType.PUBLIC:
                setPublicLabelList(
                    changeStateListValue(publicLabelList!, value, updatedLabel)
                );
                break;
            case LabelType.PRIVATE:
                setPrivateLabelList(
                    changeStateListValue(privateLabelList!, value, updatedLabel)
                );
                break;
            case LabelType.GROUP:
                const groupLabelOption = groupLabelList.find(
                    (obj) => obj.groupId === activeLabel.groupId
                );
                if (groupLabelOption) {
                    const newState: GroupLabelOption = {
                        groupId: activeLabel.groupId!,
                        tagList: changeStateListValue(
                            groupLabelOption.tagList,
                            value,
                            updatedLabel
                        ),
                    };
                    setGroupLabelList(
                        changeStateListValue(
                            groupLabelList,
                            groupLabelOption,
                            newState
                        )
                    );
                }
                break;
            default:
                break;
        }
        setShownLabelList(
            changeStateListValue(shownLabelList, value, updatedLabel)
        );
    };

    const isLabelListExists = (
        activeLabel: ActiveLabelType | null
    ): boolean => {
        if (activeLabel === null) return false;
        if (activeLabel.type === LabelType.PUBLIC) {
            return publicLabelList === null;
        }
        if (activeLabel.type === LabelType.PRIVATE) {
            return privateLabelList === null;
        }
        if (activeLabel.type === LabelType.GROUP) {
            return !groupLabelList.some(
                (obj) => obj.groupId === activeLabel.groupId
            );
        }
        return false;
    };

    const isLabelListEmpty = (activeLabel: ActiveLabelType | null): boolean => {
        if (activeLabel === null) return false;
        if (activeLabel.type === LabelType.PUBLIC) {
            return publicLabelList!.length === 0;
        }
        if (activeLabel.type === LabelType.PRIVATE) {
            return privateLabelList!.length === 0;
        }
        if (activeLabel.type === LabelType.GROUP) {
            const groupLabelOption = groupLabelList.find(
                (obj) => obj.groupId === activeLabel.groupId
            );
            if (groupLabelOption) {
                return groupLabelOption.tagList.length === 0;
            }
        }
        return false;
    };

    const queryLabelList = useCallback(
        (activeLabel: ActiveLabelType | null, value: string) => {
            if (activeLabel === null) return;
            let queryList: LabelOption[] | null = null;
            switch (activeLabel.type) {
                case LabelType.PUBLIC:
                    queryList = publicLabelList;
                    break;
                case LabelType.PRIVATE:
                    queryList = privateLabelList;
                    break;
                case LabelType.GROUP:
                    const groupLabelOption = groupLabelList.find(
                        (obj) => obj.groupId === activeLabel.groupId
                    );
                    if (groupLabelOption) {
                        queryList = groupLabelOption.tagList;
                    }
                    break;
                default:
                    break;
            }

            if (queryList === null) return;
            const searchQuery = value.toLowerCase();
            const result = queryList.filter((value) =>
                value.tag.name.toLowerCase().includes(searchQuery)
            );
            setShownLabelList(result);
        },
        [groupLabelList, privateLabelList, publicLabelList]
    );

    const resetLabelLists = () => {
        if (publicLabelList) {
            setPublicLabelList(resetLabelOptionList(publicLabelList));
        }
        if (privateLabelList) {
            setPrivateLabelList(resetLabelOptionList(privateLabelList));
        }
        if (groupLabelList) {
            setGroupLabelList(
                groupLabelList.map((group) => ({
                    groupId: group.groupId,
                    tagList: resetLabelOptionList(group.tagList),
                }))
            );
        }
        setShownLabelList(resetLabelOptionList(shownLabelList));
    };

    return {
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
    };
}

export default useLabelFilter;
