import { useCallback, useState } from "react";
import { changeStateListValue } from "../utils/util";
import { getAuthorUrlParam } from "../utils/search";

function useAuthorFilter(searchParams: URLSearchParams) {
    const [authorList, setAuthorList] = useState<AuthorOption[] | null>(null);
    const [shownAuthorList, setShownAuthorList] = useState<AuthorOption[]>([]);

    const fetchAuthorList = (documentList: DocumentResponse[]) => {
        if (authorList !== null) return;
        const authors = documentList.flatMap(
            (data) => data.metadata.authorList
        );
        const uniqueAuthorList = Array.from(new Set(authors)).sort();
        const selectedAuthorList = getAuthorUrlParam(searchParams);
        const authorOptionList = uniqueAuthorList.map(
            (author): AuthorOption => ({
                name: author,
                selected: selectedAuthorList.includes(author),
            })
        );
        setAuthorList(authorOptionList);
        setShownAuthorList(authorOptionList);
    };

    const updateAuthorList = (value: AuthorOption) => {
        if (authorList === null) return;
        const updatedAuthor = {
            name: value.name,
            selected: !value.selected,
        };
        setAuthorList(changeStateListValue(authorList, value, updatedAuthor));
        setShownAuthorList(
            changeStateListValue(shownAuthorList, value, updatedAuthor)
        );
    };

    const queryAuthorList = useCallback(
        (value: string) => {
            if (authorList === null) return;
            const searchQuery = value.toLowerCase();
            const result =
                authorList.filter((value) =>
                    value.name.toLowerCase().includes(searchQuery)
                ) ?? [];
            setShownAuthorList(result);
        },
        [authorList]
    );

    const resetAuthorList = () => {
        if (authorList) {
            const newList: AuthorOption[] = authorList?.map((author) => ({
                name: author.name,
                selected: false,
            }));
            setAuthorList(newList);
            setShownAuthorList(newList);
        }
    };

    return {
        authorList,
        shownAuthorList,
        fetchAuthorList,
        updateAuthorList,
        queryAuthorList,
        resetAuthorList,
    };
}

export default useAuthorFilter;
