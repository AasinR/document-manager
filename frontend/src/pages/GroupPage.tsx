import axios, { AxiosResponse } from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { LoadingPanel, SearchBar, SpinnerButton } from "../components";
import { useAuth } from "../hooks";
import { GroupPermission, UserPermission } from "../utils/data";
import { changeStateListValue, removeStateListValue } from "../utils/util";
import LoadingPage from "./LoadingPage";
import ErrorPage from "./ErrorPage";
import "./GroupPage.css";

function GroupPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { auth } = useAuth();

    const [loading, setLoading] = useState<boolean>(true);
    const [group, setGroup] = useState<Group | null>(null);
    const [authPermission, setAuthPermission] =
        useState<GroupPermission | null>(null);
    const [addSelect, setAddSelect] = useState<boolean>(false);
    const [userList, setUserList] = useState<User[] | null>(null);
    const [shownUserList, setShownUserList] = useState<User[] | null>(null);
    const [shownMemberList, setShownMemberList] = useState<
        GroupMember[] | null
    >(null);
    const [searchValue, setSearchValue] = useState<string>("");
    const [editing, setEditing] = useState<boolean>(false);
    const [editValue, setEditValue] = useState<string>("");
    const [errorMessage, setErrorMessage] = useState<string>("");

    useEffect(() => {
        if (!loading) return;
        (async () => {
            await axios
                .get(`${process.env.REACT_APP_API_URL}/groups/get/${id}`)
                .then((response: AxiosResponse<Group>) => {
                    setGroup(response.data);
                    setAuthPermission(
                        response.data.groupMemberList.find(
                            (member) => member.username === auth!.username
                        )?.permission ?? null
                    );
                    setShownMemberList(response.data.groupMemberList);
                })
                .catch((error) => {
                    console.log(error.response.data);
                });
            setLoading(false);
        })();
    }, [auth, id, loading]);

    const searchMember = (value: string, list?: GroupMember[]) => {
        if (group === null) return;
        const searchString = value.toLowerCase();
        const searchList = list ? list : group.groupMemberList;
        const result = searchList.filter(
            (member) =>
                member.username.toLowerCase().includes(searchString) ||
                member.shownName.toLowerCase().includes(searchString)
        );
        setShownMemberList(result);
    };

    const searchUser = (value: string, list?: User[]) => {
        if (list === undefined && userList === null) return;
        const searchString = value.toLowerCase();
        const searchList = list ? list : userList;
        const result = searchList!.filter(
            (member) =>
                member.username.toLowerCase().includes(searchString) ||
                member.shownName.toLowerCase().includes(searchString)
        );
        setShownUserList(result);
    };

    const handleSearch = (value: string) => {
        setSearchValue(value);
        if (addSelect) searchUser(value);
        else searchMember(value);
    };

    const fetchUserList = () => {
        if (group === null) return;
        if (userList !== null) {
            searchUser(searchValue);
            return;
        }
        axios
            .get(`${process.env.REACT_APP_API_URL}/users/all`)
            .then((response: AxiosResponse<User[]>) => {
                const filteredList = response.data.filter(
                    (user) =>
                        !group.groupMemberList.some(
                            (member) => member.username === user.username
                        )
                );
                setUserList(filteredList);
                searchUser(searchValue, filteredList);
            })
            .catch((error) => {
                console.log(error.response.data);
            });
    };

    const handleSelect = (value: boolean) => {
        if (value === addSelect) return;
        if (value) fetchUserList();
        else searchMember(searchValue);
        setAddSelect(value);
    };

    const handleEditing = () => {
        if (group === null) return;
        setEditValue(group.name);
        setErrorMessage("");
        setEditing(!editing);
    };

    const handleSaveEdit = async () => {
        if (group === null) return;
        const name = editValue.trim();
        if (!name) {
            setErrorMessage("Group name cannot be empty!");
            return;
        }
        if (name === group.name) {
            setErrorMessage("New name cannot be identical to the current one!");
            return;
        }
        const requestBody = {
            groupName: name,
        };
        await axios
            .put(
                `${process.env.REACT_APP_API_URL}/groups/update/${id}`,
                requestBody
            )
            .then(() => {
                setGroup({
                    id: group.id,
                    name: name,
                    groupMemberList: group.groupMemberList,
                });
                setErrorMessage("");
                setEditing(false);
            })
            .catch((error) => {
                console.log(error.response.data);
                setErrorMessage("Failed to update group name!");
            });
    };

    const handleQuit = async () => {
        await axios
            .put(`${process.env.REACT_APP_API_URL}/groups/member/quit/${id}`)
            .then(() => {
                navigate("/library");
            })
            .catch((error) => {
                const apiError: ApiError | undefined = error.response?.data;
                let message: string;
                if (apiError === undefined || apiError.statusCode >= 500) {
                    message =
                        "Oops! Something went wrong on the server. Please try again later.";
                } else if (apiError.statusCode === 401) {
                    message = "Owner is not allowed to quit the group!";
                } else if (apiError.statusCode === 404) {
                    message = "User is not a member of this group!";
                } else {
                    message = "Failed to quit from group!";
                }
                setErrorMessage(message);
            });
    };

    const handleAddMember = async (index: number) => {
        if (userList === null || shownUserList === null || group === null) {
            return;
        }
        const user = shownUserList[index];
        const requestBody = {
            username: user.username,
        };
        await axios
            .put(
                `${process.env.REACT_APP_API_URL}/groups/member/add/${id}`,
                requestBody
            )
            .then(() => {
                setGroup({
                    id: group.id,
                    name: group.name,
                    groupMemberList: [
                        ...group.groupMemberList,
                        {
                            username: user.username,
                            shownName: user.shownName,
                            permission: GroupPermission.MEMBER,
                        },
                    ],
                });
                setUserList(
                    userList.filter((value) => value.username !== user.username)
                );
                setShownUserList(removeStateListValue(index, shownUserList));
            })
            .catch((error) => {
                console.log(error.response.data);
            });
    };

    const handlePromote = async (member: GroupMember) => {
        if (group === null || shownMemberList === null) return;
        const requestBody = {
            username: member.username,
        };
        let success = false;
        await axios
            .put(
                `${process.env.REACT_APP_API_URL}/groups/member/promote/${id}`,
                requestBody
            )
            .then(() => {
                success = true;
            })
            .catch((error) => {
                console.log(error.response.data);
            });
        if (!success) return;
        if (member.permission === GroupPermission.MEMBER) {
            const newMember: GroupMember = {
                username: member.username,
                shownName: member.shownName,
                permission: GroupPermission.ADMIN,
            };
            setGroup({
                id: group.id,
                name: group.name,
                groupMemberList: changeStateListValue(
                    group.groupMemberList,
                    member,
                    newMember
                ),
            });
            setShownMemberList(
                changeStateListValue(shownMemberList, member, newMember)
            );
            return;
        }
        if (authPermission === GroupPermission.OWNER) {
            setAuthPermission(GroupPermission.ADMIN);
        }
        setGroup({
            id: group.id,
            name: group.name,
            groupMemberList: group.groupMemberList.map((value) => {
                if (value.username === member.username) {
                    return {
                        username: member.username,
                        shownName: member.shownName,
                        permission: GroupPermission.OWNER,
                    };
                } else if (value.permission === GroupPermission.OWNER) {
                    return {
                        username: value.username,
                        shownName: value.shownName,
                        permission: GroupPermission.ADMIN,
                    };
                }
                return value;
            }),
        });
        setShownMemberList(
            shownMemberList.map((value) => {
                if (value.username === member.username) {
                    return {
                        username: member.username,
                        shownName: member.shownName,
                        permission: GroupPermission.OWNER,
                    };
                } else if (value.permission === GroupPermission.OWNER) {
                    return {
                        username: value.username,
                        shownName: value.shownName,
                        permission: GroupPermission.ADMIN,
                    };
                }
                return value;
            })
        );
    };

    const handleDemote = async (member: GroupMember) => {
        if (group === null || shownMemberList === null) return;
        const requestBody = {
            username: member.username,
        };
        await axios
            .put(
                `${process.env.REACT_APP_API_URL}/groups/member/demote/${id}`,
                requestBody
            )
            .then(() => {
                const newState: GroupMember = {
                    username: member.username,
                    shownName: member.shownName,
                    permission: GroupPermission.MEMBER,
                };
                setGroup({
                    id: group.id,
                    name: group.name,
                    groupMemberList: changeStateListValue(
                        group.groupMemberList,
                        member,
                        newState
                    ),
                });
                setShownMemberList(
                    changeStateListValue(shownMemberList, member, newState)
                );
            })
            .catch((error) => {
                console.log(error.response.data);
            });
    };

    const handleKickMember = async (index: number) => {
        if (group === null || shownMemberList === null || userList === null) {
            return;
        }
        const member = shownMemberList[index];
        const requestBody = {
            username: member.username,
        };
        await axios
            .put(
                `${process.env.REACT_APP_API_URL}/groups/member/remove/${id}`,
                requestBody
            )
            .then(() => {
                setUserList([
                    ...userList,
                    {
                        username: member.username,
                        shownName: member.shownName,
                        email: null,
                        permission: UserPermission.USER,
                    },
                ]);
                setGroup({
                    id: group.id,
                    name: group.name,
                    groupMemberList: group.groupMemberList.filter(
                        (value) => value.username !== member.username
                    ),
                });
                setShownMemberList(
                    removeStateListValue(index, shownMemberList)
                );
            })
            .catch((error) => {
                console.log(error.response.data);
            });
    };

    const showKick = (permission: GroupPermission): boolean => {
        if (authPermission === GroupPermission.OWNER) return true;
        if (authPermission === GroupPermission.MEMBER) return false;
        return permission === GroupPermission.MEMBER;
    };

    const showDemote = (permission: GroupPermission): boolean => {
        if (authPermission !== GroupPermission.OWNER) return false;
        return permission === GroupPermission.ADMIN;
    };

    const showPromote = (permission: GroupPermission): boolean => {
        if (authPermission === GroupPermission.OWNER) return true;
        if (authPermission === GroupPermission.MEMBER) return false;
        return permission === GroupPermission.MEMBER;
    };

    const showAdd = (): boolean => {
        return authPermission !== GroupPermission.MEMBER;
    };

    return loading ? (
        <LoadingPage />
    ) : group === null ? (
        <ErrorPage error={`Group with ID "${id}" does not exist!`} />
    ) : (
        <div id="group-page" className="page">
            <div id="group-mid">
                <div id="group-header">
                    {editing ? (
                        <input
                            placeholder="Group Name"
                            value={editValue}
                            onChange={(event) =>
                                setEditValue(event.target.value)
                            }
                        />
                    ) : (
                        <h1>{group.name}</h1>
                    )}
                    <div>
                        {authPermission !== GroupPermission.MEMBER && (
                            <button onClick={handleEditing}>
                                {editing ? "Cancel" : "Rename"}
                            </button>
                        )}
                        <SpinnerButton
                            onClick={editing ? handleSaveEdit : handleQuit}
                            spinnerColor="#808080"
                            spinnerSize={14}
                            speedMultiplier={0.6}
                        >
                            {editing ? "Save" : "Leave Group"}
                        </SpinnerButton>
                    </div>
                </div>
                <div id="group-container">
                    <div>
                        <SearchBar
                            id="group-search"
                            onChange={handleSearch}
                            onSearch={handleSearch}
                        />
                        <div id="group-select">
                            <button
                                className={!addSelect ? "selected" : ""}
                                onClick={() => handleSelect(false)}
                            >
                                Member List
                            </button>
                            <button
                                className={addSelect ? "selected" : ""}
                                onClick={() => handleSelect(true)}
                            >
                                Add New Member
                            </button>
                        </div>
                        {errorMessage && (
                            <p id="group-error">Error: {errorMessage}</p>
                        )}
                    </div>
                    <div id="group-list">
                        {addSelect ? (
                            shownUserList === null ? (
                                <LoadingPanel size={80} speedMultiplier={0.6} />
                            ) : shownUserList.length === 0 ? (
                                <p>No Users Found</p>
                            ) : (
                                shownUserList.map((user, index) => (
                                    <div
                                        key={user.username}
                                        className="group-member"
                                    >
                                        <div className="group-member-header">
                                            <div className="group-member-name">
                                                <p>{user.shownName}</p>
                                                <p>@{user.username}</p>
                                            </div>
                                        </div>
                                        <div className="group-member-buttons">
                                            {showAdd() && (
                                                <SpinnerButton
                                                    onClick={async () => {
                                                        await handleAddMember(
                                                            index
                                                        );
                                                    }}
                                                    spinnerColor="#808080"
                                                    spinnerSize={14}
                                                    speedMultiplier={0.6}
                                                >
                                                    Add
                                                </SpinnerButton>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )
                        ) : shownMemberList === null ? (
                            <LoadingPanel size={80} speedMultiplier={0.6} />
                        ) : shownMemberList.length === 0 ? (
                            <p>No Members Found</p>
                        ) : (
                            shownMemberList.map((member, index) => (
                                <div
                                    key={member.username}
                                    className={`group-member ${
                                        member.username === auth?.username
                                            ? "own"
                                            : ""
                                    }`}
                                >
                                    <div className="group-member-header">
                                        <div className="group-member-name">
                                            <p>{member.shownName}</p>
                                            <p>@{member.username}</p>
                                        </div>
                                        <p className="group-member-permission">
                                            {member.permission}
                                        </p>
                                    </div>
                                    {member.username !== auth?.username && (
                                        <div className="group-member-buttons">
                                            {showKick(member.permission) && (
                                                <SpinnerButton
                                                    onClick={async () => {
                                                        await handleKickMember(
                                                            index
                                                        );
                                                    }}
                                                    spinnerColor="#808080"
                                                    spinnerSize={14}
                                                    speedMultiplier={0.6}
                                                >
                                                    Kick
                                                </SpinnerButton>
                                            )}
                                            {showDemote(member.permission) && (
                                                <SpinnerButton
                                                    onClick={async () => {
                                                        await handleDemote(
                                                            member
                                                        );
                                                    }}
                                                    spinnerColor="#808080"
                                                    spinnerSize={14}
                                                    speedMultiplier={0.6}
                                                >
                                                    Demote
                                                </SpinnerButton>
                                            )}
                                            {showPromote(member.permission) && (
                                                <SpinnerButton
                                                    onClick={async () => {
                                                        await handlePromote(
                                                            member
                                                        );
                                                    }}
                                                    spinnerColor="#808080"
                                                    spinnerSize={14}
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
            </div>
        </div>
    );
}

export default GroupPage;
