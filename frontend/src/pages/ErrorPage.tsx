import errorImage from "../assets/error.png";
import "./ErrorPage.css";

function ErrorPage({ error, code }: ErrorPageParams) {
    return (
        <div id="error-page" className="page">
            <div>
                <img src={errorImage} alt="error" />
                <div>
                    <h1>{code}</h1>
                    <h2>{error}</h2>
                </div>
            </div>
        </div>
    );
}

ErrorPage.defaultProps = {
    error: "Page Not Found!",
    code: 404,
};

export default ErrorPage;
