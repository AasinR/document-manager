export function changeStateListValue(
    list: any[],
    oldValue: any,
    newValue: any
) {
    return list.map((obj) => (obj === oldValue ? newValue : obj));
}

export function updateStateListListValue(
    index: number,
    valueIndex: number,
    value: any,
    list: [string, string][]
) {
    const newArray = [...list];
    newArray[index][valueIndex] = value;
    return newArray;
}

export function removeStateListValue(index: number, list: any[]) {
    const newArray = [...list];
    newArray.splice(index, 1);
    return newArray;
}

export function matchStringArrays(list1: string[], list2: string[]): boolean {
    if (list1.length !== list2.length) return false;
    for (let i = 0; i < list1.length; i++) {
        if (list1[i] !== list2[i]) return false;
    }
    return true;
}

export function matchDateString(
    value1: string | null,
    value2: string | null
): boolean {
    if (value1 === null && value2 === null) return true;
    if (value1 !== null && value2 !== null) {
        return new Date(value1).getTime() === new Date(value2).getTime();
    }
    return false;
}

export function matchRecords(
    record1: Record<string, string>,
    record2: Record<string, string>
): boolean {
    const list1 = Object.keys(record1);
    const list2 = Object.keys(record2);
    if (list1.length !== list2.length) return false;
    for (const key of list1) {
        if (!record2.hasOwnProperty(key) || record1[key] !== record2[key]) {
            return false;
        }
    }
    return true;
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
