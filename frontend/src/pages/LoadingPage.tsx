import { ClipLoader } from "react-spinners";
import "./LoadingPage.css";

function LoadingPage() {
    return (
        <div className="page loading-page">
            <ClipLoader color="#fff" size={160} speedMultiplier={0.6} />
        </div>
    );
}

export default LoadingPage;
