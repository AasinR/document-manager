import { ClipLoader } from "react-spinners";
import React, { useState } from "react";

function SpinnerButton({
    children,
    id,
    className,
    onClick,
    spinnerColor,
    spinnerSize,
    speedMultiplier,
}: SpinnerButtonParams) {
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleOnClick = (
        event: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) => {
        event.preventDefault();
        if (!onClick) return;
        (async () => {
            setIsLoading(true);
            await onClick();
            setIsLoading(false);
        })();
    };

    return (
        <button
            id={id}
            className={className}
            onClick={handleOnClick}
            disabled={isLoading}
        >
            {isLoading ? (
                <ClipLoader
                    color={spinnerColor}
                    size={spinnerSize}
                    speedMultiplier={speedMultiplier}
                />
            ) : (
                children
            )}
        </button>
    );
}

export default SpinnerButton;
