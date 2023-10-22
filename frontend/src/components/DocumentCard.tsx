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
            <h1>{data.metadata.title}</h1>
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
