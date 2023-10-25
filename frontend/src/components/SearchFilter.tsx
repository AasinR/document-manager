import React, { useState } from "react";
import arrowImage from "../assets/icons/downward-arrow.png";
import "./SearchFilter.css";

function SearchFilter({
    children,
    id,
    className,
    containerId,
    containerClassName,
    title,
    onClick,
    showAsActive,
}: {
    children: React.ReactElement | (React.ReactElement | null)[] | null;
    id: string;
    className: string;
    containerId: string;
    containerClassName: string;
    title: string;
    onClick: () => void;
    showAsActive: boolean;
}) {
    const [active, setActive] = useState<boolean>(false);

    const handleButton = () => {
        onClick();
        setActive(!active);
    };

    return (
        <div className="search-filter">
            <button
                id={id}
                className={`search-filter-button ${className} ${
                    active || showAsActive ? "selected" : ""
                }`}
                onClick={handleButton}
            >
                <p>{title}</p>
                <img src={arrowImage} alt="v" />
            </button>
            {active ? (
                <>
                    <div
                        className="search-filter-overlay"
                        onClick={() => setActive(false)}
                    ></div>
                    <div className="search-filter-container-container">
                        <div
                            id={containerId}
                            className={`search-filter-container ${containerClassName}`}
                        >
                            {children}
                        </div>
                    </div>
                </>
            ) : null}
        </div>
    );
}

SearchFilter.defaultProps = {
    children: null,
    id: "",
    className: "",
    containerId: "",
    containerClassName: "",
    title: "",
    onClick: () => {},
    showAsActive: false,
};

export default SearchFilter;
