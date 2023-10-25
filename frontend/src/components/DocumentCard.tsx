import "./DocumentCard.css";

function DocumentCard({
    id,
    className,
    data,
    onClick,
}: {
    id: string;
    className: string;
    data: DocumentResponse;
    onClick: (data: DocumentResponse) => void;
}) {
    const handleCardClick = () => {
        onClick(data);
    };

    return (
        <div
            id={id}
            className={`document-card ${className}`}
            onClick={handleCardClick}
        >
            <div className="document-card-header">
                <h1>{data.metadata.title}</h1>
                {data.tagCollection.privateTagCollection && <p>Saved</p>}
            </div>
            <p>{data.metadata.authorList.join(", ")}</p>
        </div>
    );
}

DocumentCard.defaultProps = {
    id: "",
    className: "",
    onClick: () => {},
};

export default DocumentCard;
