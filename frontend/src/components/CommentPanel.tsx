import axios, { AxiosResponse } from "axios";
import React, { useCallback, useEffect, useState } from "react";
import { useAuth } from "../hooks";
import { CommentType } from "../utils/data";
import { changeStateListValue, removeStateListValue } from "../utils/util";
import SpinnerButton from "./SpinnerButton";
import LoadingPanel from "./LoadingPanel";
import deleteImage from "../assets/icons/delete.png";
import editImage from "../assets/icons/edit.png";
import closeImage from "../assets/icons/close.png";
import "./CommentPanel.css";

function CommentPanel({
    id,
    className,
    documentId,
    groupList,
    commentType,
    setCommentType,
}: {
    id: string;
    className: string;
    documentId: string;
    groupList: Group[];
    commentType: ActiveCommentType;
    setCommentType: (value: ActiveCommentType) => void;
}) {
    const { auth } = useAuth();
    const [commentList, setCommentList] = useState<CommentResponse[] | null>(
        null
    );
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [commentValue, setCommentValue] = useState<string>("");
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    const fetchCommentList = useCallback(() => {
        let requestUrl = "";
        switch (commentType.type) {
            case CommentType.PUBLIC:
                requestUrl = `public/${documentId}`;
                break;
            case CommentType.PRIVATE:
                requestUrl = `private/${documentId}`;
                break;
            case CommentType.GROUP:
                requestUrl = `private/${documentId}?groupId=${commentType.groupId}`;
                break;
            default:
                return;
        }
        axios
            .get(`${process.env.REACT_APP_API_URL}/comments/all/${requestUrl}`)
            .then((response: AxiosResponse<CommentResponse[]>) => {
                const sortedList = response.data.sort(
                    (a, b) =>
                        new Date(b.timestamp).getTime() -
                        new Date(a.timestamp).getTime()
                );
                setCommentList(sortedList);
            })
            .catch((error) => {
                console.log(error.response.data);
            });
    }, [documentId, commentType]);

    useEffect(fetchCommentList, [fetchCommentList]);

    const handleTypeSelect = (type: CommentType, groupId?: string) => {
        if (commentType.type === type && commentType.groupId === groupId)
            return;
        if (errorMessage) setErrorMessage("");
        setCommentList(null);
        setCommentType({ type: type, groupId: groupId });
    };

    const handleComment = async () => {
        const value = commentValue.trim();
        if (!value) {
            setErrorMessage("Comment text cannot be empty!");
            return;
        }
        let requestUrl = "";
        switch (commentType.type) {
            case CommentType.PUBLIC:
                requestUrl = `public`;
                break;
            case CommentType.PRIVATE:
                requestUrl = `private`;
                break;
            case CommentType.GROUP:
                requestUrl = `private?groupId=${commentType.groupId}`;
                break;
            default:
                return;
        }
        const requestBody = {
            documentId: documentId,
            content: value,
        };
        await axios
            .post(
                `${process.env.REACT_APP_API_URL}/comments/add/${requestUrl}`,
                requestBody
            )
            .then(() => {
                fetchCommentList();
                setCommentValue("");
            })
            .catch((error) => {
                const apiError: ApiError = error.response.data;
                const message: string =
                    apiError?.statusCode && apiError.statusCode < 500
                        ? "Failed to sent comment!"
                        : "Oops! Something went wrong on the server. Please try again later.";
                setErrorMessage(message);
            });
    };

    const handleEditing = (index: number) => {
        if (commentList === null) return;
        if (errorMessage) setErrorMessage("");
        if (editingIndex === index) {
            setEditingIndex(null);
            setCommentValue("");
            return;
        }
        setEditingIndex(index);
        setCommentValue(commentList[index].content);
    };

    const handleSaveEdit = async () => {
        if (commentList === null || editingIndex === null) return;
        const newValue = commentValue.trim();
        if (!newValue) {
            setErrorMessage("Comment text cannot be empty!");
            return;
        }
        const comment = commentList[editingIndex];
        if (newValue === comment.content) {
            setErrorMessage("Edited comment is identical to the current one!");
            return;
        }
        const requestBody = {
            content: newValue,
        };
        await axios
            .put(
                `${process.env.REACT_APP_API_URL}/comments/update/${comment.id}`,
                requestBody
            )
            .then(() => {
                const updatedComment: CommentResponse = {
                    id: comment.id,
                    ownerId: comment.ownerId,
                    documentId: comment.documentId,
                    user: comment.user,
                    content: newValue,
                    timestamp: comment.timestamp,
                };
                setCommentList(
                    changeStateListValue(commentList, comment, updatedComment)
                );
                setEditingIndex(null);
                setCommentValue("");
            })
            .catch((error) => {
                const apiError: ApiError = error.response.data;
                const message: string =
                    apiError?.statusCode && apiError.statusCode < 500
                        ? "Failed to update comment!"
                        : "Oops! Something went wrong on the server. Please try again later.";
                setErrorMessage(message);
            });
    };

    const handleDelete = async (index: number) => {
        if (commentList === null) return;
        await axios
            .delete(
                `${process.env.REACT_APP_API_URL}/comments/delete/${commentList[index].id}`
            )
            .then(() => {
                setCommentList(removeStateListValue(index, commentList));
            })
            .catch((error) => {
                console.log(error.response.data);
            });
    };

    const getTimestampString = (value: string) => {
        const date = new Date(value);
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        return `${date.toLocaleDateString()} ${hours}:${minutes}`;
    };

    return (
        <div id={id} className={`comment-panel ${className}`}>
            <div className="comment-header">
                <div className="comment-type-select">
                    <button
                        className={
                            commentType.type === CommentType.PUBLIC
                                ? "selected"
                                : ""
                        }
                        onClick={() => handleTypeSelect(CommentType.PUBLIC)}
                    >
                        Public
                    </button>
                    <button
                        className={
                            commentType.type === CommentType.PRIVATE
                                ? "selected"
                                : ""
                        }
                        onClick={() => handleTypeSelect(CommentType.PRIVATE)}
                    >
                        Private
                    </button>
                    {groupList.map((group) => (
                        <button
                            key={group.id}
                            className={
                                commentType.type === CommentType.GROUP &&
                                commentType.groupId === group.id
                                    ? "selected"
                                    : ""
                            }
                            onClick={() =>
                                handleTypeSelect(CommentType.GROUP, group.id)
                            }
                        >
                            {group.name}
                        </button>
                    ))}
                </div>
                <div className="comment-input-container">
                    <textarea
                        placeholder="Write Comment..."
                        value={commentValue}
                        onChange={(event) =>
                            setCommentValue(event.target.value)
                        }
                    />
                    <SpinnerButton
                        onClick={
                            editingIndex === null
                                ? handleComment
                                : handleSaveEdit
                        }
                        spinnerColor="#808080"
                        spinnerSize={20}
                        speedMultiplier={0.6}
                    >
                        {editingIndex === null ? "Send" : "Edit"}
                    </SpinnerButton>
                </div>
                <p className="comment-error">
                    {errorMessage ? `Error: ${errorMessage}` : ""}
                </p>
            </div>
            <div className="comment-list-container">
                {commentList === null ? (
                    <LoadingPanel size={60} speedMultiplier={0.6} />
                ) : commentList.length === 0 ? (
                    <p>No Comments Found</p>
                ) : (
                    commentList.map((comment, index) => (
                        <div
                            key={comment.id}
                            className={`comment-data ${
                                auth?.username === comment.user.username
                                    ? "own"
                                    : ""
                            } ${editingIndex === index ? "edit" : ""}`}
                        >
                            <div className="comment-data-header">
                                <div className="comment-data-user">
                                    <p>{comment.user.shownName}</p>
                                    <p>@{comment.user.username}</p>
                                </div>
                                {auth?.username === comment.user.username && (
                                    <div className="comment-data-buttons">
                                        <button
                                            onClick={() => handleEditing(index)}
                                        >
                                            <img
                                                src={
                                                    editingIndex === index
                                                        ? closeImage
                                                        : editImage
                                                }
                                                alt={
                                                    editingIndex === index
                                                        ? "close"
                                                        : "edit"
                                                }
                                                draggable={false}
                                            />
                                        </button>
                                        <SpinnerButton
                                            onClick={() => handleDelete(index)}
                                            spinnerColor="#808080"
                                            spinnerSize={15}
                                            speedMultiplier={0.6}
                                        >
                                            <img
                                                src={deleteImage}
                                                alt="deleteImage"
                                                draggable={false}
                                            />
                                        </SpinnerButton>
                                    </div>
                                )}
                            </div>
                            <p>{comment.content}</p>
                            <p>{getTimestampString(comment.timestamp)}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

CommentPanel.defaultProps = {
    id: "",
    className: "",
    groupList: [],
};

export default CommentPanel;
