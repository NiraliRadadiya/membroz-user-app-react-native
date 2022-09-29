import Axios from '../../helpers/appConfig';


export const getMemberList = () => {
    const body = {
        "search": [
            {
                "searchfield": "status",
                "searchvalue": "active",
                "datatype": "text",
                "criteria": "eq"
            },
        ]
    }
    return Axios.post('members/filter', body);
}
