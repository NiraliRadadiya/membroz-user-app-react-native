import Axios from '../../helpers/appConfig'

function StartChatService(body) {
    console.log("body", body);
    return Axios.post(`formdatas`, body);
}

function RecentChatService(id) {
    const body =
    {
        "search": [
            {
                "searchfield": "status",
                "searchvalue": "active",
                "criteria": "eq",
                "datatype": "text"
            },
            {
                "searchfield": "formid",
                "searchvalue": "6333d90bc8e9e31addd12dc8",
                "criteria": "eq",
                "datatype": "objectId"
            },
            {
                "searchfield": "property.userid",
                "searchvalue": id,
                "criteria": "eq",
                "datatype": "text"
            }
        ], "formname": "livechat"
    }
    return Axios.post('formdatas/filter', body);
}

function FindChatById(id) {
    let body =
    {
        "search": [{
            "searchfield": "status",
            "searchvalue": "active",
            "criteria": "eq",
            "datatype": "text"
        },
        {
            "searchfield": "_id",
            "searchvalue": id,
            "criteria": "eq",
            "datatype": "objectId"
        }
        ],
        "formname": "livechat"
    }
    return Axios.post('formdatas/filter', body);
}

function EndChatService(id, body) {
    return Axios.patch(`formdatas/${id}`, body);
}

function StartProject(body) {
    return Axios.post('formdatas', body);
}

function UserPaymentRequest(data) {
    const body = JSON.stringify(data)
    return Axios.post('bills', body);
}

export { StartChatService, RecentChatService, EndChatService, FindChatById, StartProject, UserPaymentRequest };