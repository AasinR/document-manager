import React, { useEffect, useState } from "react";
import searchImage from "../assets/icons/search.png";
import "./SearchBar.css";

function SearchBar({
    id,
    className,
    defaultValue,
    onChange,
    onSearch,
}: {
    id: string;
    className: string;
    defaultValue: string;
    onChange: (searchValue: string) => void;
    onSearch: (searchValue: string) => void;
}) {
    const [searchValue, setSearchValue] = useState<string>("");

    const handleSubmit = (
        event: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) => {
        event.preventDefault();
        onSearch(searchValue);
    };

    useEffect(() => {
        setSearchValue(defaultValue);
    }, [defaultValue]);

    useEffect(() => {
        onChange(searchValue);
    }, [searchValue]);

    return (
        <div id={id} className={`search-bar ${className}`}>
            <form className="search-bar-container">
                <button
                    className="search-bar-search-button"
                    type="submit"
                    onClick={handleSubmit}
                >
                    <img
                        src={searchImage}
                        alt="searchImage"
                        draggable={false}
                    />
                </button>
                <input
                    type="text"
                    placeholder="Search..."
                    spellCheck={false}
                    value={searchValue}
                    onChange={(event) => setSearchValue(event.target.value)}
                />
                {searchValue ? (
                    <button
                        className="search-bar-clear-button"
                        onClick={() => setSearchValue("")}
                    >
                        Clear
                    </button>
                ) : null}
            </form>
        </div>
    );
}

SearchBar.defaultProps = {
    id: "",
    className: "",
    defaultValue: "",
    onChange: () => {},
    onSearch: () => {},
};

export default SearchBar;
