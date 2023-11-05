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

export function validateRecordList(
    list: [string, string][],
    name: string
): Record<string, string> | string | null {
    let record: Record<string, string> = {};
    for (const [key, value] of list) {
        const keyTrim = key.trim();
        const valueTrim = value.trim();
        if (!keyTrim || !valueTrim) {
            return `Invalid ${name} key or value!`;
        } else if (record.hasOwnProperty(keyTrim)) {
            return `Duplicate ${name} key!`;
        }
        record[keyTrim] = valueTrim;
    }
    if (Object.keys(record).length === 0) return null;
    return record;
}

export function validateMetadata(
    title: string,
    authorList: string[],
    description: string,
    publicationDate: string,
    otherData: [string, string][],
    identifierList: [string, string][]
): MetadataRequest | string {
    const titleValue = title.trim();
    if (!titleValue) return "Title field cannot be empty!";
    const authors = authorList.map((author) => author.trim()).filter(Boolean);
    const descriptionValue = description.trim();
    const otherValues = validateRecordList(otherData, "Other Data");
    if (typeof otherValues === "string") return otherValues;
    const identifiers = validateRecordList(identifierList, "Identifier");
    if (typeof identifiers === "string") return identifiers;
    const requestAuthor = authors.length > 0 ? authors : null;
    const requestDescription = descriptionValue ? descriptionValue : null;
    const requestDate = publicationDate ? publicationDate : null;
    return {
        title: titleValue,
        authorList: requestAuthor,
        description: requestDescription,
        publicationDate: requestDate,
        identifierList: identifiers,
        otherData: otherValues,
    };
}
