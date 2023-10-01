import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { DocumentCard, SearchBar } from "../components";
import "./SearchPage.css";

function SearchPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [documentList, setDocumentList] = useState<DocumentResponse[]>([]);
    const [shownDocumentList, setShownDocumentList] = useState<
        DocumentResponse[]
    >([]);

    const search = useCallback(
        (searchValue: string) => {
            const searchWord = searchValue.toLowerCase();
            const result = documentList.filter((value: DocumentResponse) => {
                return (
                    value.metadata.title.toLowerCase().includes(searchWord) ||
                    value.metadata.authorList.some((author) =>
                        author.toLowerCase().includes(searchWord)
                    )
                );
            });
            setShownDocumentList(result);
        },
        [documentList]
    );

    const handleSearch = (searchValue: string) => {
        search(searchValue);
        navigate(`/search?query=${searchValue}`);
    };

    const handleOpenResult = (data: DocumentResponse) => {
        console.log(`clicked on result: ${data.id}`);
    };

    useEffect(() => {
        axios
            .get(`${process.env.REACT_APP_API_URL}/documents/all`)
            .then((response) => {
                setDocumentList(response.data);
                setShownDocumentList(response.data);
            })
            .catch((error) => {
                console.log(error);
            });
    }, []);

    useEffect(() => {
        search(searchParams.get("query") ?? "");
    }, [search, searchParams, documentList]);

    return (
        <div id="search-page" className="page">
            <div className="search-side-panel"></div>
            <div id="search-mid">
                <SearchBar
                    id="search-search-bar"
                    defaultValue={searchParams.get("query") ?? ""}
                    onSearch={handleSearch}
                />
                <div id="search-container">
                    {shownDocumentList.map((data) => (
                        <DocumentCard
                            key={data.id}
                            data={data}
                            onClick={handleOpenResult}
                        />
                    ))}
                </div>
            </div>
            <div className="search-side-panel"></div>
        </div>
    );
}

export default SearchPage;
