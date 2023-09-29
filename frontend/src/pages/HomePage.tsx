import { useEffect, useState } from "react";
import { DocumentCard, SearchBar } from "../components";
import "./HomePage.css";

function HomePage() {
    const [documentList, setDocumentList] = useState<DocumentResponse[]>([]);
    const [shownDocumentList, setShownDocumentList] = useState<
        DocumentResponse[]
    >([]);
    const [showSearchPanel, setShowSearchPanel] = useState<boolean>(false);

    const handleSearch = () => {
        console.log("search button pressed");
    };

    const handleSearchChange = (searchValue: string) => {
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
        setDocumentList([
            {
                id: "6488894af738853762b53269",
                fileId: "64888949f738853762b53267",
                metadata: {
                    id: "6488894af738853762b5326a",
                    username: null,
                    documentId: "6488894af738853762b53269",
                    timestamp: new Date("2023-06-13T15:20:42.537"),
                    relatedDocumentList: [],
                    title: "test document",
                    authorList: ["Larry"],
                    description: "this is a document",
                    publicationDate: null,
                    identifierList: null,
                    otherData: {
                        extra: "cool",
                    },
                },
                tagCollection: {
                    tagList: [],
                    privateTagList: [],
                    groupTagCollectionList: [],
                },
            },
            {
                id: "6512ff289cac1d3bee21f106",
                fileId: "6512ff289cac1d3bee21f104",
                metadata: {
                    id: "6512ff289cac1d3bee21f107",
                    username: null,
                    documentId: "6512ff289cac1d3bee21f106",
                    timestamp: new Date("2023-09-26T15:56:24.613"),
                    relatedDocumentList: [],
                    title: "Second Document",
                    authorList: ["Jeff, Larry"],
                    description: "Colors...I think",
                    publicationDate: null,
                    identifierList: null,
                    otherData: {
                        location: "eeeh",
                    },
                },
                tagCollection: {
                    tagList: [],
                    privateTagList: [],
                    groupTagCollectionList: [],
                },
            },
        ]);
    }, []);

    return (
        <div id="home-page" className="page">
            <div id="home-mid">
                <SearchBar
                    id="home-search-bar"
                    onChange={handleSearchChange}
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
