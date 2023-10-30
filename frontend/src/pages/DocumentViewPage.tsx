import axios, { AxiosResponse } from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ErrorPage from "./ErrorPage";
import LoadingPage from "./LoadingPage";
import "./DocumentViewPage.css";

function DocumentViewPage() {
    const { id } = useParams();

    const [loading, setLoading] = useState<boolean>(true);
    const [documentData, setDocumentData] = useState<DocumentResponse | null>(
        null
    );
    const [fileContent, setFileContent] = useState<Blob | null>(null);

    useEffect(() => {
        if (!loading) return;
        (async () => {
            let fileId = "";
            await axios
                .get(`${process.env.REACT_APP_API_URL}/documents/get/${id}`)
                .then((response: AxiosResponse<DocumentResponse>) => {
                    fileId = response.data.fileId;
                    setDocumentData(response.data);
                })
                .catch((error) => {
                    console.log(error.response.data);
                });
            if (fileId) {
                await axios
                    .get(
                        `${process.env.REACT_APP_API_URL}/files/get/${fileId}`,
                        { responseType: "arraybuffer" }
                    )
                    .then((response) => {
                        const blob = new Blob([response.data], {
                            type: response.headers["content-type"],
                        });
                        setFileContent(blob);
                    })
                    .catch((error) => {
                        console.log(error.response.data);
                    });
            }
            setLoading(false);
        })();
    }, [id, loading]);

    return loading ? (
        <LoadingPage />
    ) : documentData === null || fileContent === null ? (
        <ErrorPage error={`Document with ID "${id}" does not exist!`} />
    ) : (
        <div id="view-page" className="page">
            <object
                id="view-object"
                data={URL.createObjectURL(fileContent)}
                type={fileContent.type}
            >
                <p>Failed to load document with ID: {documentData.id}</p>
            </object>
        </div>
    );
}

export default DocumentViewPage;
