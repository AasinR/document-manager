import axios, { AxiosResponse } from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import LoadingPage from "./LoadingPage";
import ErrorPage from "./ErrorPage";
import {
    matchDateString,
    matchRecords,
    matchStringArrays,
    removeStateListValue,
    updateStateListListValue,
    validateMetadata,
} from "../utils/util";
import "./MetadataPage.css";
import { SpinnerButton } from "../components";

function MetadataPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState<boolean>(true);
    const [metadataList, setMetadataList] = useState<MetadataResponse[]>([]);
    const [currentMetadata, setCurrentMetadata] =
        useState<MetadataResponse | null>(null);
    const [errorMessage, setErrorMessage] = useState<string>("");

    const [titleValue, setTitleValue] = useState<string>("");
    const [authorList, setAuthorList] = useState<string[]>([]);
    const [descriptionValue, setDescriptionValue] = useState<string>("");
    const [dateValue, setDateValue] = useState<string>("");
    const [otherData, setOtherData] = useState<[string, string][]>([]);
    const [identifierList, setIdentifierList] = useState<[string, string][]>(
        []
    );

    useEffect(() => {
        axios
            .get(
                `${process.env.REACT_APP_API_URL}/documents/metadata/all/${id}`
            )
            .then((response: AxiosResponse<MetadataResponse[]>) => {
                if (response.data.length !== 0) {
                    const descList = response.data.sort(
                        (a, b) =>
                            new Date(b.timestamp).getTime() -
                            new Date(a.timestamp).getTime()
                    );
                    setCurrentMetadata(descList[0]);
                    setMetadataValues(descList[0]);
                    setMetadataList(descList.slice(1));
                }
                setLoading(false);
            })
            .catch((error) => {
                console.log(error.response.data);
            });
    }, [id]);

    const setMetadataValues = (metadata: MetadataResponse) => {
        setTitleValue(metadata.title);
        setAuthorList(metadata.authorList);
        setDescriptionValue(metadata.description ?? "");
        if (metadata.publicationDate) {
            const date = new Date(metadata.publicationDate);
            setDateValue(date.toISOString().slice(0, 10));
        } else setDateValue("");
        const otherDataList = Object.entries(metadata.otherData);
        setOtherData(otherDataList);
        const identifierDataList = Object.entries(metadata.identifierList);
        setIdentifierList(identifierDataList);
    };

    const handleSave = async () => {
        const metadata = validateMetadata(
            titleValue,
            authorList,
            descriptionValue,
            dateValue,
            otherData,
            identifierList
        );
        if (typeof metadata === "string") {
            setErrorMessage(metadata);
            return;
        }

        if (
            metadata.title === currentMetadata!.title &&
            matchStringArrays(
                metadata.authorList ?? [],
                currentMetadata!.authorList
            ) &&
            metadata.description === currentMetadata!.description &&
            matchDateString(
                metadata.publicationDate,
                currentMetadata!.publicationDate
            ) &&
            matchRecords(
                metadata.otherData ?? {},
                currentMetadata!.otherData
            ) &&
            matchRecords(
                metadata.identifierList ?? {},
                currentMetadata!.identifierList
            )
        ) {
            setErrorMessage("Metadata is identical to the current one!");
            return;
        }
        await axios
            .post(
                `${process.env.REACT_APP_API_URL}/documents/update/${id}`,
                metadata
            )
            .then(() => {
                navigate(`/document/${id}`);
            })
            .catch((error) => {
                const apiError: ApiError = error.response.data;
                const message: string =
                    apiError?.statusCode && apiError.statusCode < 500
                        ? "Failed to update metadata!"
                        : "Oops! Something went wrong on the server. Please try again later.";
                setErrorMessage(message);
            });
    };

    const handleUpdateAuthor = (index: number, value: string) => {
        const newArray = [...authorList];
        newArray[index] = value;
        setAuthorList(newArray);
    };

    const renderIdentifierList = (collection: { [p: string]: string }) => {
        const list = Object.entries(collection);
        if (list.length === 0) return <p>Not Specified</p>;
        return (
            <div>
                {list.map(([key, value]) => (
                    <div key={key} className="metadata-history-option">
                        <p>{key}:</p>
                        <p>{value}</p>
                    </div>
                ))}
            </div>
        );
    };

    const getTimestampString = (metadata: MetadataResponse) => {
        const date = new Date(metadata.timestamp);
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        const timestamp = `${date.toLocaleDateString()} ${hours}:${minutes}`;
        if (metadata.user.username) {
            return `Edited at ${timestamp} by @${metadata.user.username}`;
        }
        return `Created at ${timestamp}`;
    };

    return loading ? (
        <LoadingPage />
    ) : currentMetadata === null ? (
        <ErrorPage error={`Document with ID "${id}" does not exist!`} />
    ) : (
        <div id="metadata-page" className="page">
            <div id="metadata-main">
                <div id="metadata-current-panel">
                    <h1>Metadata</h1>
                    <div id="metadata-current-container">
                        <div className="metadata-current-data">
                            <p>Title</p>
                            <input
                                type="text"
                                placeholder="Title"
                                value={titleValue}
                                onChange={(event) =>
                                    setTitleValue(event.target.value)
                                }
                            />
                        </div>
                        <div className="metadata-current-data">
                            <p>Authors</p>
                            {authorList.map((value, index) => (
                                <div key={index} className="metadata-list-data">
                                    <input
                                        type="text"
                                        placeholder="Author"
                                        value={value}
                                        onChange={(event) =>
                                            handleUpdateAuthor(
                                                index,
                                                event.target.value
                                            )
                                        }
                                    />
                                    <button
                                        className="metadata-button"
                                        onClick={() =>
                                            setAuthorList(
                                                removeStateListValue(
                                                    index,
                                                    authorList
                                                )
                                            )
                                        }
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                            <button
                                className="metadata-button"
                                onClick={() =>
                                    setAuthorList([...authorList, ""])
                                }
                            >
                                Add New +
                            </button>
                        </div>
                        <div className="metadata-current-data">
                            <p>Description</p>
                            <textarea
                                placeholder="Description"
                                value={descriptionValue}
                                onChange={(event) =>
                                    setDescriptionValue(event.target.value)
                                }
                            />
                        </div>
                        <div className="metadata-current-data">
                            <p>Publication Date</p>
                            <input
                                type="date"
                                value={dateValue}
                                onChange={(event) =>
                                    setDateValue(event.target.value)
                                }
                            />
                        </div>
                        <div className="metadata-current-data">
                            <p>Other Data</p>
                            {otherData.map(([key, value], index) => (
                                <div key={index} className="metadata-list-data">
                                    <input
                                        type="text"
                                        placeholder="Key"
                                        value={key}
                                        onChange={(event) =>
                                            setOtherData(
                                                updateStateListListValue(
                                                    index,
                                                    0,
                                                    event.target.value,
                                                    otherData
                                                )
                                            )
                                        }
                                    />
                                    <input
                                        type="text"
                                        placeholder="Value"
                                        value={value}
                                        onChange={(event) =>
                                            setOtherData(
                                                updateStateListListValue(
                                                    index,
                                                    1,
                                                    event.target.value,
                                                    otherData
                                                )
                                            )
                                        }
                                    />
                                    <button
                                        className="metadata-button"
                                        onClick={() =>
                                            setOtherData(
                                                removeStateListValue(
                                                    index,
                                                    otherData
                                                )
                                            )
                                        }
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                            <button
                                className="metadata-button"
                                onClick={() =>
                                    setOtherData([...otherData, ["", ""]])
                                }
                            >
                                Add New +
                            </button>
                        </div>
                        <div className="metadata-current-data">
                            <p>Identifiers</p>
                            {identifierList.map(([key, value], index) => (
                                <div key={index} className="metadata-list-data">
                                    <input
                                        type="text"
                                        placeholder="Key"
                                        value={key}
                                        onChange={(event) =>
                                            setIdentifierList(
                                                updateStateListListValue(
                                                    index,
                                                    0,
                                                    event.target.value,
                                                    identifierList
                                                )
                                            )
                                        }
                                    />
                                    <input
                                        type="text"
                                        placeholder="Value"
                                        value={value}
                                        onChange={(event) =>
                                            setIdentifierList(
                                                updateStateListListValue(
                                                    index,
                                                    1,
                                                    event.target.value,
                                                    identifierList
                                                )
                                            )
                                        }
                                    />
                                    <button
                                        className="metadata-button"
                                        onClick={() =>
                                            setIdentifierList(
                                                removeStateListValue(
                                                    index,
                                                    identifierList
                                                )
                                            )
                                        }
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                            <button
                                className="metadata-button"
                                onClick={() =>
                                    setIdentifierList([
                                        ...identifierList,
                                        ["", ""],
                                    ])
                                }
                            >
                                Add New +
                            </button>
                        </div>
                    </div>
                    <p id="metadata-error">
                        {errorMessage ? `Error: ${errorMessage}` : ""}
                    </p>
                    <div id="metadata-current-button-container">
                        <button
                            className="metadata-button"
                            onClick={() => navigate(`/document/${id}`)}
                        >
                            Back
                        </button>
                        <button
                            className="metadata-button"
                            onClick={() => setMetadataValues(currentMetadata)}
                        >
                            Reset
                        </button>
                        <SpinnerButton
                            className="metadata-button"
                            onClick={handleSave}
                            spinnerColor="#808080"
                            spinnerSize={20}
                            speedMultiplier={0.6}
                        >
                            Save
                        </SpinnerButton>
                    </div>
                </div>
                <div id="metadata-history-panel">
                    <h1>Metadata History</h1>
                    <div>
                        {metadataList.length === 0 ? (
                            <p>No Data Found</p>
                        ) : (
                            metadataList.map((metadata) => (
                                <div
                                    key={metadata.id}
                                    className="metadata-history-option-container"
                                >
                                    <div>
                                        <h1>{metadata.id}</h1>
                                        <button
                                            onClick={() =>
                                                setMetadataValues(metadata)
                                            }
                                        >
                                            Restore
                                        </button>
                                    </div>
                                    <div>
                                        <div className="metadata-history-option">
                                            <p>Title:</p>
                                            <p>{metadata.title}</p>
                                        </div>
                                        <div className="metadata-history-option">
                                            <p>Author:</p>
                                            <p>
                                                {metadata.authorList.length ===
                                                0
                                                    ? "Not Specified"
                                                    : `"${metadata.authorList.join(
                                                          '", "'
                                                      )}"`}
                                            </p>
                                        </div>
                                        <div className="metadata-history-option">
                                            <p>Description:</p>
                                            <p>{metadata.description}</p>
                                        </div>
                                        <div className="metadata-history-option">
                                            <p>Publication Date:</p>
                                            <p>
                                                {metadata.publicationDate
                                                    ? new Date(
                                                          metadata.publicationDate
                                                      ).toLocaleDateString()
                                                    : "Not Specified"}
                                            </p>
                                        </div>
                                        {Object.entries(metadata.otherData).map(
                                            ([key, value]) => (
                                                <div
                                                    key={key}
                                                    className="metadata-history-option"
                                                >
                                                    <p>{key}:</p>
                                                    <p>{value}</p>
                                                </div>
                                            )
                                        )}
                                        <div
                                            className={`metadata-history-option ${
                                                Object.keys(
                                                    metadata.identifierList
                                                ).length === 0
                                                    ? ""
                                                    : "metadata-history-object-list"
                                            }`}
                                        >
                                            <p>Identifiers:</p>
                                            {renderIdentifierList(
                                                metadata.identifierList
                                            )}
                                        </div>
                                    </div>
                                    <p>{getTimestampString(metadata)}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MetadataPage;
