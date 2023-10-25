import { useCallback, useState } from "react";
import {
    matchAuthorFilter,
    matchGroupTags,
    matchQuerySting,
    matchTags,
} from "../utils/search";

function useDocumentSearch() {
    const [documentList, setDocumentList] = useState<DocumentResponse[] | null>(
        null
    );
    const [shownDocumentList, setShownDocumentList] = useState<
        DocumentResponse[]
    >([]);

    const searchByStringQuery = useCallback(
        (queryList: DocumentResponse[], query: string) => {
            const queryString = query.toLowerCase();
            const result = queryList.filter((data) =>
                matchQuerySting(data, queryString)
            );
            setShownDocumentList(result);
        },
        []
    );

    const searchByFilterQuery = useCallback(
        (
            publicTagIdList: string[],
            privateTagIdList: string[],
            groupTagIdList: GroupTagIdValue[],
            authorList: string[],
            yearFilter: YearFilterValue, // TODO: filter after backend change
            query: string
        ) => {
            if (documentList === null) return;
            const queryString = query.toLowerCase();

            const result = documentList.filter((data) => {
                return (
                    matchTags(publicTagIdList, data.tagCollection.tagList) &&
                    matchTags(
                        privateTagIdList,
                        data.tagCollection.privateTagCollection
                            ?.privateTagList ?? []
                    ) &&
                    matchGroupTags(
                        groupTagIdList,
                        data.tagCollection.groupTagCollectionList
                    ) &&
                    matchAuthorFilter(authorList, data.metadata.authorList) &&
                    matchQuerySting(data, queryString)
                );
            });
            setShownDocumentList(result);
        },
        [documentList]
    );

    return {
        documentList,
        setDocumentList,
        shownDocumentList,
        searchByStringQuery,
        searchByFilterQuery,
    };
}

export default useDocumentSearch;
