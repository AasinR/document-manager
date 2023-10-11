import "./LoadingPanel.css";
import { ClipLoader } from "react-spinners";

function LoadingPanel({
    id,
    className,
    color,
    size,
    speedMultiplier,
}: {
    id: string;
    className: string;
    color: string;
    size: number;
    speedMultiplier: number;
}) {
    return (
        <div id={id} className={`loading-panel ${className}`}>
            <ClipLoader
                color={color}
                size={size}
                speedMultiplier={speedMultiplier}
            />
        </div>
    );
}

LoadingPanel.defaultProps = {
    id: "",
    className: "",
    color: "fff",
    size: 20,
    speedMultiplier: 1,
};

export default LoadingPanel;
