import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DocumentCard, SearchBar } from "../components";
import "./HomePage.css";

function HomePage() {
    const navigate = useNavigate();

    const [documentList, setDocumentList] = useState<DocumentResponse[]>([]);
    const [shownDocumentList, setShownDocumentList] = useState<
        DocumentResponse[]
    >([]);
    const [showSearchPanel, setShowSearchPanel] = useState<boolean>(false);

    const handleSearch = (searchValue: string) => {
        navigate(`/search?query=${searchValue}`);
    };

    const handleWrite = (searchValue: string) => {
        if (!showSearchPanel && searchValue !== "") setShowSearchPanel(true);
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
    }, []);

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
