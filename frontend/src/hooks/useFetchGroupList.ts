import { useCallback, useState } from "react";
import axios from "axios";

function useFetchGroupList() {
    const [groupList, setGroupList] = useState<Group[] | null>(null);

    const fetchGroupList = useCallback(
        async (username: string): Promise<Group[] | null> => {
            if (groupList !== null) return null;
            let list: Group[] = [];
            await axios
                .get(`${process.env.REACT_APP_API_URL}/groups/all/${username}`)
                .then((response) => {
                    list = response.data;
                })
                .catch((error) => {
                    console.log(error.response.data);
                });
            if (list.length > 0) {
                setGroupList(list);
            }
            return list;
        },
        [groupList]
    );

    return { groupList, fetchGroupList };
}

export default useFetchGroupList;
