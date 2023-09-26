import axios from "axios";
import { useState } from "react";
import { useAuth, useLogout } from "../hooks";
import { SpinnerButton } from "../components";
import "./AccountPage.css";

function AccountPage() {
    const { auth, setAuth } = useAuth();
    const logout = useLogout();

    const [editing, setEditing] = useState<boolean>(false);
    const [shownName, setShownName] = useState<string>(auth?.shownName || "");
    const [email, setEmail] = useState<string>(auth?.email || "");
    const [saveErrorMessage, setSaveErrorMessage] = useState<string>("");

    const [deleting, setDeleting] = useState<boolean>(false);
    const [deleteErrorMessage, setDeleteErrorMessage] = useState<string>("");

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
                setSaveErrorMessage(message);
            });
    };

    const handleDelete = async () => {
        await axios
            .delete(`${process.env.REACT_APP_API_URL}/users/delete`)
            .then(() => logout())
            .catch((error) => {
                const apiError: ApiError | undefined = error.response?.data;
                const message: string =
                    apiError?.statusCode && apiError.statusCode < 500
                        ? "Cannot delete account while being the owner of a group!"
                        : "Oops! Something went wrong on the server. Please try again later.";
                setDeleteErrorMessage(message);
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
                    <p id="account-settings-error">{saveErrorMessage}</p>
                    <div className="account-settings-button-container">
                        <button
                            className={`account-settings-button ${
                                editing ? "account-settings-button-red" : null
                            }`}
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
                <div>
                    <h2>Delete Account</h2>
                    <p>When you delete your account:</p>
                    <ul>
                        <li>
                            All your private data associated with this account
                            will be permanently removed.
                        </li>
                        <li>
                            Publicly shared data will remain unaffected and
                            continue to be visible.
                        </li>
                    </ul>
                    <p>
                        Please note that this action is irreversible, and you
                        won't be able to recover your account or its data once
                        deleted.
                    </p>
                    <p id="account-settings-delete-error">
                        {deleteErrorMessage}
                    </p>
                    <div
                        id="account-settings-delete-button-container"
                        className="account-settings-button-container"
                    >
                        <button
                            className="account-settings-button account-settings-button-red"
                            type="button"
                            onClick={() => setDeleting(!deleting)}
                        >
                            {deleting ? "Cancel" : "Delete Account"}
                        </button>
                        {deleting ? (
                            <SpinnerButton
                                className="account-settings-button account-settings-button-red"
                                type="submit"
                                onClick={handleDelete}
                                spinnerColor="#ffffff"
                                spinnerSize={12}
                                speedMultiplier={0.6}
                            >
                                Delete Account
                            </SpinnerButton>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AccountPage;
