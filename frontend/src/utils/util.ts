export function changeStateListValue(
    list: any[],
    oldValue: any,
    newValue: any
) {
    return list.map((obj) => (obj === oldValue ? newValue : obj));
}

export function getLabelOptionList(
    labelList: Tag[],
    selectedList?: string[]
): LabelOption[] {
    return labelList.map(
        (tag: Tag): LabelOption => ({
            tag,
            selected: selectedList?.includes(tag.id) ?? false,
        })
    );
}

export function resetLabelOptionList(list: LabelOption[]): LabelOption[] {
    return list.map((labelOption) => ({
        tag: labelOption.tag,
        selected: false,
    }));
}
