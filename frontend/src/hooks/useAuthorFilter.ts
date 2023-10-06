import { useCallback, useState } from "react";
import { changeStateListValue } from "../utils/util";

function useAuthorFilter() {
    const [authorList, setAuthorList] = useState<AuthorOption[] | null>(null);
    const [shownAuthorList, setShownAuthorList] = useState<AuthorOption[]>([]);

    const fetchAuthorList = (documentList: DocumentResponse[]) => {
        if (authorList !== null) return;
        const authors = documentList.flatMap(
            (data) => data.metadata.authorList
        );
        const uniqueAuthorList = Array.from(new Set(authors)).sort();
        const authorOptionList = uniqueAuthorList.map(
            (author): AuthorOption => ({
                name: author,
                selected: false,
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

    return {
        authorList,
        shownAuthorList,
        fetchAuthorList,
        updateAuthorList,
        queryAuthorList,
    };
}

export default useAuthorFilter;
