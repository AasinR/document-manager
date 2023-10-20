import { useCallback, useState } from "react";
import axios from "axios";

function useFetchGroupList() {
    const [groupList, setGroupList] = useState<Group[] | null>(null);

    const fetchGroupList = useCallback(
        async (username: string) => {
            if (groupList !== null) return;
            await axios
                .get(`${process.env.REACT_APP_API_URL}/groups/all/${username}`)
                .then((response) => {
                    setGroupList(response.data);
                })
                .catch((error) => {
                    console.log(error.response.data);
                });
        },
        [groupList]
    );

    return { groupList, fetchGroupList };
}

export default useFetchGroupList;
