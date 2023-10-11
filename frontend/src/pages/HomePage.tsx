import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DocumentCard, SearchBar } from "../components";
import { useDocumentSearch } from "../hooks";
import { generateSearchUrl } from "../utils/search";
import "./HomePage.css";

function HomePage() {
    const navigate = useNavigate();
    const {
        documentList,
        setDocumentList,
        shownDocumentList,
        searchByStringQuery,
    } = useDocumentSearch();
    const [showSearchPanel, setShowSearchPanel] = useState<boolean>(false);

    const handleSearch = (searchValue: string) => {
        navigate(generateSearchUrl("/search", searchValue));
    };

    const handleWrite = (searchValue: string) => {
        if (!showSearchPanel && searchValue !== "") setShowSearchPanel(true);
        searchByStringQuery(documentList, searchValue);
    };

    const handleOpenResult = (data: DocumentResponse) => {
        console.log(`clicked on result: ${data.id}`);
    };

    useEffect(() => {
        axios
            .get(`${process.env.REACT_APP_API_URL}/documents/all`)
            .then((response) => {
                setDocumentList(response.data);
            })
            .catch((error) => {
                console.log(error);
            });
    }, [setDocumentList]);

    return (
        <div id="home-page" className="page">
            <div id="home-mid">
                <SearchBar
                    id="home-search-bar"
                    onChange={handleWrite}
                    onSearch={handleSearch}
                />
                {showSearchPanel ? (
                    <div id="home-search-container">
                        {shownDocumentList.map((data) => (
                            <DocumentCard
                                key={data.id}
                                data={data}
                                onClick={handleOpenResult}
                            />
                        ))}
                    </div>
                ) : null}
            </div>
        </div>
    );
}

export default HomePage;
