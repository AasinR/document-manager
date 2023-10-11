import "./DocumentCard.css";

function DocumentCard({
    data,
    onClick,
}: {
    data: DocumentResponse;
    onClick: (data: DocumentResponse) => void;
}) {
    const handleCardClick = () => {
        onClick(data);
    };

    return (
        <div className="document-card" onClick={handleCardClick}>
            <h1>{data.metadata.title}</h1>
            <p>{data.metadata.authorList.join(", ")}</p>
        </div>
    );
}

DocumentCard.defaultProps = {
    onClick: () => {},
};

export default DocumentCard;
