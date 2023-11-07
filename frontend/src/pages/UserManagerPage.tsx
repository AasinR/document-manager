import axios, { AxiosResponse } from "axios";
import React, { useEffect, useState } from "react";
import { LoadingPanel, SearchBar, SpinnerButton } from "../components";
import { useAuth } from "../hooks";
import { UserPermission } from "../utils/data";
import "./UserManagerPage.css";
import { changeStateListValue, removeStateListValue } from "../utils/util";

function UserManagerPage() {
    const { auth } = useAuth();

    const [userList, setUserList] = useState<User[] | null>(null);
    const [shownList, setShownList] = useState<User[] | null>(null);
    const [searchValue, setSearchValue] = useState<string>("");
    const [editing, setEditing] = useState<boolean>(false);
    const [addValue, setAddValue] = useState<string>("");
    const [errorMessage, setErrorMessage] = useState<string>("");

    useEffect(() => {
        axios
            .get(`${process.env.REACT_APP_API_URL}/users/all`)
            .then((response) => {
                setUserList(response.data);
                setShownList(response.data);
            })
            .catch((error) => {
                console.log(error.response.data);
            });
    }, []);

    const search = (value: string, list?: User[]) => {
        if (userList === null) return;
        const searchString = value.toLowerCase();
        const searchList = list ? list : userList;
        const result = searchList.filter(
            (user) =>
                user.username.toLowerCase().includes(searchString) ||
                user.shownName.toLowerCase().includes(searchString) ||
                user.permission.toLowerCase().includes(searchString)
        );
        setShownList(result);
    };

    const handleSearch = (value: string) => {
        setSearchValue(value);
        search(value);
    };

    const handleAddUser = async () => {
        if (userList === null) return;
        const username = addValue.trim();
        if (!username) {
            setErrorMessage("Username cannot be empty!");
            return;
        }
        if (userList.some((value) => value.username.includes(username))) {
            setErrorMessage(`User with username "${username}" already exists!`);
            return;
        }
        const requestBody = {
            username: username,
        };
        await axios
            .post(
                `${process.env.REACT_APP_API_URL}/users/admin/add`,
                requestBody
            )
            .then((response: AxiosResponse<User>) => {
                const newState = [...userList, response.data];
                setUserList(newState);
                search(searchValue, newState);
                handleManageAdd(false);
            })
            .catch(() => {
                setErrorMessage("Failed to add user!");
            });
    };

    const handleManageAdd = (value: boolean) => {
        setEditing(value);
        setAddValue("");
        setErrorMessage("");
    };

    const handleDelete = async (index: number) => {
        if (userList === null || shownList === null) return;
        const user = shownList[index];
        await axios
            .delete(
                `${process.env.REACT_APP_API_URL}/users/admin/delete/${user.username}`
            )
            .then(() => {
                setUserList(
                    userList.filter((value) => value.username !== user.username)
                );
                setShownList(removeStateListValue(index, shownList));
            })
            .catch((error) => {
                const apiError: ApiError | undefined = error.response?.data;
                let message: string;
                if (apiError === undefined || apiError.statusCode >= 500) {
                    message =
                        "Oops! Something went wrong on the server. Please try again later.";
                } else if (apiError.statusCode === 401) {
                    message = `User "${user.username}" cannot be deleted while being an owner of a group!`;
                } else if (apiError.statusCode === 404) {
                    message = `User with username "${user.username}" does not exist!`;
                } else {
                    message = "Failed to delete user!";
                }
                setErrorMessage(message);
            });
    };

    const handlePromote = async (user: User) => {
        if (userList === null || shownList === null) return;
        await axios
            .put(
                `${process.env.REACT_APP_API_URL}/users/admin/promote/${user.username}`
            )
            .then(() => {
                const newState: User = {
                    username: user.username,
                    shownName: user.shownName,
                    email: user.email,
                    permission: UserPermission.ADMIN,
                };
                setUserList(changeStateListValue(userList, user, newState));
                setShownList(changeStateListValue(shownList, user, newState));
            })
            .catch((error) => {
                const apiError: ApiError | undefined = error.response?.data;
                let message: string;
                if (apiError === undefined || apiError.statusCode >= 500) {
                    message =
                        "Oops! Something went wrong on the server. Please try again later.";
                } else if (apiError.statusCode === 404) {
                    message = `User with username "${user.username}" does not exist!`;
                } else {
                    message = "Failed to promote user!";
                }
                setErrorMessage(message);
            });
    };

    return (
        <div id="user-manager-page" className="page">
            <h1>User Manager</h1>
            <div id="user-manager-header">
                <SearchBar
                    id="user-manager-search"
                    onChange={handleSearch}
                    onSearch={handleSearch}
                />
                <div id="user-manager-add">
                    {editing ? (
                        <>
                            <input
                                placeholder="Add new user"
                                value={addValue}
                                onChange={(event) =>
                                    setAddValue(event.target.value)
                                }
                            />
                            <button onClick={() => handleManageAdd(false)}>
                                Cancel
                            </button>
                            <SpinnerButton
                                onClick={handleAddUser}
                                spinnerColor="#808080"
                                spinnerSize={20}
                                speedMultiplier={0.6}
                            >
                                Add User
                            </SpinnerButton>
                        </>
                    ) : (
                        <button
                            id="user-manager-add-button"
                            onClick={() => handleManageAdd(true)}
                        >
                            Add New User
                        </button>
                    )}
                </div>
                {errorMessage && (
                    <p id="user-manager-error">Error: {errorMessage}</p>
                )}
            </div>
            <div id="user-manager-list">
                {shownList === null ? (
                    <LoadingPanel size={80} speedMultiplier={0.6} />
                ) : shownList.length === 0 ? (
                    <p>No Users Found</p>
                ) : (
                    shownList.map((user, index) => (
                        <div
                            key={user.username}
                            className={`user-manager-user ${
                                user.username === auth!.username ? "own" : ""
                            }`}
                        >
                            <div className="user-manager-user-header">
                                <div className="user-manager-user-name">
                                    <p>{user.shownName}</p>
                                    <p>@{user.username}</p>
                                </div>
                                <p>{user.permission}</p>
                            </div>
                            {user.username !== auth!.username && (
                                <div className="user-manager-user-buttons">
                                    <SpinnerButton
                                        onClick={async () => {
                                            await handleDelete(index);
                                        }}
                                        spinnerColor="#808080"
                                        spinnerSize={12}
                                        speedMultiplier={0.6}
                                    >
                                        Delete
                                    </SpinnerButton>
                                    {user.permission ===
                                        UserPermission.USER && (
                                        <SpinnerButton
                                            onClick={async () => {
                                                await handlePromote(user);
                                            }}
                                            spinnerColor="#808080"
                                            spinnerSize={12}
                                            speedMultiplier={0.6}
                                        >
                                            Promote
                                        </SpinnerButton>
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default UserManagerPage;
