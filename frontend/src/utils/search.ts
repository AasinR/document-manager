export function matchTags(filterList: string[], targetList: Tag[]): boolean {
    return filterList.every((tagId) =>
        targetList.some((tag) => tag.id === tagId)
    );
}

export function matchGroupTags(
    filterList: GroupTagIdValue[],
    targetList: GroupTagCollection[]
): boolean {
    return filterList.every((activeGroup) =>
        activeGroup.tagIdList.every((tagId) =>
            targetList.some(
                (currentGroup) =>
                    currentGroup.groupId === activeGroup.groupId &&
                    currentGroup.groupTagList.some(
                        (currentTag) => currentTag.id === tagId
                    )
            )
        )
    );
}

export function matchAuthorFilter(
    filterList: string[],
    targetList: string[]
): boolean {
    return filterList.every((filterAuthor) =>
        targetList.some((currentAuthor) => currentAuthor === filterAuthor)
    );
}

export function matchQuerySting(
    data: DocumentResponse,
    query: string
): boolean {
    return (
        data.metadata.title.toLowerCase().includes(query) ||
        data.metadata.authorList.some((author) =>
            author.toLowerCase().includes(query)
        )
    );
}

function convertLabelToUrl(list: LabelOption[]): string {
    return list
        .filter((labelOption) => labelOption.selected)
        .map((labelOption) => encodeURIComponent(labelOption.tag.id))
        .join(",");
}

function convertGroupLabelToUrl(list: GroupLabelOption[]): string {
    return list
        .filter((group) =>
            group.tagList.some((labelOption) => labelOption.selected)
        )
        .map((group) => `${group.groupId}:${convertLabelToUrl(group.tagList)}`)
        .join(";");
}

function convertAuthorToUrl(list: AuthorOption[]): string {
    return list
        .filter((authorOption) => authorOption.selected)
        .map((authorOption) => authorOption.name)
        .join(",");
}

function convertYearFilterToUrl(value: YearFilterValue): string {
    if (Object.keys(value).length === 0) return "";
    else if (value.exact !== undefined) return value.exact.toString();
    else if (value.from !== undefined && value.to !== undefined) {
        const fromValue = value.from?.toString() ?? "";
        const toValue = value.to?.toString() ?? "";
        if (fromValue || toValue) return `${fromValue},${toValue}`;
    }
    return "";
}

export function generateSearchUrl(
    baseUrl: string,
    queryString: string | null = null,
    publicLabelList: LabelOption[] | null = null,
    privateLabelList: LabelOption[] | null = null,
    groupLabelList: GroupLabelOption[] | null = null,
    authorList: AuthorOption[] | null = null,
    yearFilter: YearFilterValue = {}
): string {
    const filters: string[] = [];

    if (queryString) filters.push(`q=${queryString}`);
    const publicTagString = convertLabelToUrl(publicLabelList ?? []);
    if (publicTagString) filters.push(`t=${publicTagString}`);
    const privateTagString = convertLabelToUrl(privateLabelList ?? []);
    if (privateTagString) filters.push(`pt=${privateTagString}`);
    const groupTagString = convertGroupLabelToUrl(groupLabelList ?? []);
    if (groupTagString) filters.push(`gt=${groupTagString}`);
    const authorString = convertAuthorToUrl(authorList ?? []);
    if (authorString) filters.push(`a=${authorString}`);
    const yearString = convertYearFilterToUrl(yearFilter);
    if (yearString) filters.push(`y=${yearString}`);

    return `${baseUrl}${filters.length > 0 ? `?${filters.join("&")}` : ""}`;
}

function revertListUrlParam(value: string | null): string[] {
    if (value === null) return [];
    return value.split(",");
}

export function getQueryUrlParam(params: URLSearchParams): string {
    return params.get("q") ?? "";
}

export function getPublicTagUrlParam(params: URLSearchParams): string[] {
    return revertListUrlParam(params.get("t"));
}

export function getPrivateTagUrlParam(params: URLSearchParams): string[] {
    return revertListUrlParam(params.get("pt"));
}

export function getGroupTagUrlParam(
    params: URLSearchParams
): GroupTagIdValue[] {
    const value = params.get("gt");
    if (value === null) return [];
    return value.split(";").map((groupString): GroupTagIdValue => {
        const [groupId, tagListString] = groupString.split(":");
        return {
            groupId,
            tagIdList: revertListUrlParam(tagListString),
        };
    });
}

export function getAuthorUrlParam(params: URLSearchParams): string[] {
    return revertListUrlParam(params.get("a"));
}

export function getYearUrlParam(params: URLSearchParams): YearFilterValue {
    const value = params.get("y");
    if (value === null) return {};
    const yearList = value.split(",");
    if (yearList.length === 1) {
        return { exact: parseInt(yearList[0], 10) };
    }
    return {
        from: yearList[0] !== "" ? parseInt(yearList[0], 10) : null,
        to: yearList[1] !== "" ? parseInt(yearList[1], 10) : null,
    };
}
