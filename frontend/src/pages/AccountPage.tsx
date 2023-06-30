import { useState } from "react";
import { useAuth } from "../hooks";
import { SpinnerButton } from "../components";
import "./AccountPage.css";
import axios from "axios";

function AccountPage() {
    const { auth, setAuth } = useAuth();

    const [editing, setEditing] = useState<boolean>(false);
    const [shownName, setShownName] = useState<string>(auth?.shownName || "");
    const [email, setEmail] = useState<string>(auth?.email || "");
    const [errorMessage, setErrorMessage] = useState<string>("");

    const handleEditing = () => {
        if (editing) {
            setShownName(auth?.shownName || "");
            setEmail(auth?.email || "");
        }
        setEditing(!editing);
    };

    const handleSave = async () => {
        const shownNameValue = shownName.trim();
        const emailValue = email.trim();
        const requestBody = {
            shownName: shownNameValue ? shownNameValue : null,
            email: emailValue ? emailValue : null,
        };
        await axios
            .put(`${process.env.REACT_APP_API_URL}/users/update`, requestBody)
            .then(() => {
                if (auth) {
                    const name = shownNameValue
                        ? shownNameValue
                        : auth.username;
                    setAuth({
                        username: auth.username,
                        shownName: name,
                        email: emailValue,
                        permission: auth.permission,
                    });
                    setShownName(name);
                }
                setEditing(false);
            })
            .catch((error) => {
                const apiError: ApiError | undefined = error.response?.data;
                const message: string =
                    apiError?.statusCode && apiError.statusCode < 500
                        ? "Failed to update user data!"
                        : "Oops! Something went wrong on the server. Please try again later.";
                setErrorMessage(message);
            });
    };

    return (
        <div id="account-page" className="page">
            <h1>Account Settings</h1>
            <div className="account-settings-container">
                <h2>Account Details</h2>
                <form>
                    <label className="account-page-data">
                        Username:
                        <input value={auth?.username} disabled />
                    </label>
                    <label className="account-page-data">
                        Shown Name:
                        <input
                            value={shownName}
                            onChange={(event) =>
                                setShownName(event.target.value)
                            }
                            disabled={!editing}
                        />
                    </label>
                    <label className="account-page-data">
                        Email address:
                        <input
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            disabled={!editing}
                        />
                    </label>
                    <label className="account-page-data">
                        User permission:
                        <input value={auth?.permission} disabled />
                    </label>
                    <p id="account-settings-error">{errorMessage}</p>
                    <div className="account-settings-button-container">
                        <button
                            className="account-settings-button"
                            type="button"
                            onClick={handleEditing}
                        >
                            {editing ? "Cancel" : "Edit"}
                        </button>
                        {editing ? (
                            <SpinnerButton
                                className="account-settings-button"
                                type="submit"
                                onClick={handleSave}
                                spinnerColor="#ffffff"
                                spinnerSize={12}
                                speedMultiplier={0.6}
                            >
                                Save
                            </SpinnerButton>
                        ) : null}
                    </div>
                </form>
            </div>
            <div className="account-settings-container">
                <h2>Delete Account</h2>
                <div>
                    <p>TODO: account deletion with proper explanation</p>
                    <button
                        className="account-settings-delete-button"
                        type="button"
                    >
                        Delete Account
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AccountPage;
