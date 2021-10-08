import React, { useState, useEffect } from 'react';
import {
    Dimensions,
    SafeAreaView,
    ScrollView,
    Image,
    Text,
    View,
    StatusBar,
    TouchableOpacity,
    Platform,
    FlatList, TextInput,
    Linking, RefreshControl, Modal, Keyboard
} from 'react-native';
import * as IMAGE from '../../styles/image';
import * as FONT from '../../styles/typography';
import * as COLOR from '../../styles/colors';
import * as SCREEN from '../../context/screen/screenName';
import * as KEY from '../../context/actions/key';
import styles from './Style';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Entypo from 'react-native-vector-icons/Entypo';
import * as LocalService from '../../services/LocalService/LocalService';
import moment from 'moment';
import Toast from 'react-native-simple-toast';
import Loader from '../../components/loader/index';
import crashlytics, { firebase } from "@react-native-firebase/crashlytics";
import { DispositionService, followupHistoryService } from '../../services/DispositionService/DispositionService';
import TreeView from "react-native-animated-tree-view";
import DateTimePickerModal from 'react-native-modal-datetime-picker';
const WIDTH = Dimensions.get('window').width;
const ListTab = [
    {
        'status': 'disposition'
    },
    {
        'status': 'followup history'
    }
]

const FollowupDetailScreen = (props) => {
    const followupDetail = props.route.params.item;
    const [userInfo, setUserInfo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [followupHistoryList, setFollowupHistoryList] = useState([]);
    const [dispositionRenderList, setDispositionRenderList] = useState([]);
    const [dispositionList, setDispositionList] = useState([]);
    const [userID, setUserID] = useState(null);
    const [refreshing, setrefreshing] = useState(false);
    const [showMessageModalVisible, setshowMessageModalVisible] = useState(false);
    const [formFields, setFormFields] = useState([]);
    const [isFollowUpChecked, setIsFollowUpChecked] = useState(false);
    const [status, setStatus] = useState('disposition');
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [isTimePickerVisible, setTimePickerVisibility] = useState(false);
    const [followUpDate, setFollowUpDate] = useState(null);
    const [followUpTime, setFollowUpTime] = useState(null);
    const [assignTO, setAssignTO] = useState(null);

    useEffect(() => {
        setLoading(true);
        getUserDeatilsLocalStorage();
        getDispositionList();
    }, [])

    useEffect(() => {
    }, [loading, userID, status, followupHistoryList, dispositionList, refreshing,
        formFields, isDatePickerVisible, isTimePickerVisible, followUpDate, followUpTime, assignTO]);

    //ONPRESS TO SHOW DATE PICKER
    const showDatePicker = () => {
        setDatePickerVisibility(true);
    };

    //ONPRESS TO HIDE DATE PICKER
    const hideDatePicker = () => {
        Keyboard.dismiss();
        setDatePickerVisibility(false);
    };

    //ONPRESS TO SET DATE IN DATE PICKER
    const handleDateConfirm = (date) => {
        let datetime = moment(date).format()
        setFollowUpDate(datetime);
        Keyboard.dismiss();
        hideDatePicker();
    };

    //ONPRESS TO SHOW TIME PICKER
    const showTimePicker = () => {
        setTimePickerVisibility(true);
    };

    //ONPRESS TO HIDE TIME PICKER
    const hideTimePicker = () => {
        Keyboard.dismiss();
        setTimePickerVisibility(false);
    };

    //ONPRESS TO SET TIME IN TIME PICKER
    const handleTimeConfirm = (date) => {
        let datetime = moment(date).format()
        setFollowUpTime(datetime);
        Keyboard.dismiss();
        hideTimePicker();
    };

    //GET USER DATA IN MOBILE LOCAL STORAGE
    const getUserDeatilsLocalStorage = async () => {
        var userInfo = await LocalService.LocalStorageService();
        setUserInfo(userInfo);
        setUserID(userInfo._id);
        getFollowupHistoryList(followupDetail._id);
        wait(1000).then(() => setLoading(false));
    }

    //MANAGE AND GENERATE TREE DROPDOWN FUNCTION
    function list_to_tree(list) {
        var map = {}, node, roots = [], i;
        for (i = 0; i < list.length; i += 1) {
            map[list[i]._id] = i;
            list[i]['value'] = list[i]['_id'];
            list[i]['name'] = list[i]['disposition'];
        }
        for (i = 0; i < list.length; i += 1) {
            node = list[i];
            if (node.parentid !== null) {
                var parentid = node && node.parentid && node.parentid._id ? node.parentid._id : node.parentid;
                if (list[map[parentid]]) {
                    if (!list[map[parentid]].items) {
                        list[map[parentid]].items = [];
                    }
                    list[map[parentid]].items.push(node);
                }
            } else {
                roots.push(node);
            }
        }
        return roots;
    }

    //FILTER TREE DROPDOWN FUNCTION
    const getDispositionList = async () => {
        try {
            const response = await DispositionService();
            // console.log(`response.data`, response.data);
            if (response.data != null && response.data != 'undefind' && response.status == 200) {
                wait(1000).then(() => {
                    setLoading(false);
                    setDispositionList(response.data);
                    setDispositionRenderList(list_to_tree(response.data));
                });
            }
        } catch (error) {
            firebase.crashlytics().recordError(error);
            setLoading(false);
        }
    }

    //GET API THROUGHT FOLLOWUP HISTORY LIST
    const getFollowupHistoryList = async (id) => {
        try {
            const response = await followupHistoryService(id);
            if (response.data != null && response.data != 'undefind' && response.status == 200) {
                wait(1000).then(() => {
                    setLoading(false);
                    setFollowupHistoryList(response.data);
                });
            }
        } catch (error) {
            firebase.crashlytics().recordError(error);
            setLoading(false);
        }
    }

    //ON PRESS TO CALL DIALER TO USE FUNCTION
    const onPressCall = () => {
        let mobile = followupDetail?.property?.mobile;
        let phoneNumber = mobile;
        if (Platform.OS !== 'android') {
            phoneNumber = `telprompt:${mobile}`;
        }
        else {
            phoneNumber = `tel:${mobile}`;
        }
        Linking.openURL(phoneNumber);
    }

    //ON PRESS TO WHATSAPP MESSAGE TO USE FUNCTION
    const onPressWhatsapp = () => {
        let msg = `Hii, I am ${userInfo.fullname}`;
        let phoneWithCountryCode = followupDetail?.property?.mobile;
        let mobile = Platform.OS == 'ios' ? phoneWithCountryCode : '+' + phoneWithCountryCode;
        if (mobile) {
            if (msg) {
                let url = 'whatsapp://send?text=' + msg + '&phone=' + mobile;
                Linking.openURL(url).then((data) => {
                }).catch(() => {
                    Toast.show('Make sure WhatsApp installed on your device', Toast.SHORT);
                });
            } else {
                Toast.show('Please insert message to send', Toast.SHORT);
            }
        } else {
            Toast.show('Please insert mobile no', Toast.SHORT);
        }
    }

    //ON PRESS TO SMS TO USE FUNCTION
    const onPressSMS = () => {
        let message = `Hii, I am ${userInfo.fullname}`;
        let phoneNumber = followupDetail?.property?.mobile;
        const separator = Platform.OS === 'ios' ? '&' : '?'
        const url = `sms:${phoneNumber}${separator}body=${message}`
        Linking.openURL(url);
    }

    //TAB WINDOW CLICK TO USE FUNCTION
    const setStatusFilter = (status, index) => {
        const tab = ListTab.map((item) => {
            item.selected = false;
            return item;
        });
        tab[index].selected = true;
        setStatus(status)
    }

    //TIME OUT FUNCTION
    const wait = (timeout) => {
        return new Promise(resolve => {
            setTimeout(resolve, timeout);
        });
    }

    //GET PULL TO REFERSH FUNCTION
    const onRefresh = () => {
        setrefreshing(true);
        wait(3000).then(() => setrefreshing(false));
    }

    //RENDER FOLLOWUP HISTORY LIST USING FLATLIST
    const renderFollowupHistoryList = ({ item }) => (
        <View>
            <View style={{ justifyContent: KEY.SPACEBETWEEN, alignItems: KEY.CENTER, flexDirection: KEY.ROW, marginTop: 5, marginLeft: 5, marginRight: 5 }}>
                <View style={{ justifyContent: KEY.FLEX_START, flexDirection: KEY.ROW, alignItems: KEY.CENTER, marginLeft: 20 }}>
                    <View style={{ flexDirection: KEY.COLUMN, alignItems: KEY.FLEX_START }}>
                        <Text style={styles.textTitle}>{item?.customerid?.property?.fullname}</Text>
                        <Text style={styles.textsub}>{item?.customerid?.property?.mobile}</Text>
                    </View>
                </View>

                <TouchableOpacity style={{ justifyContent: KEY.FLEX_END, marginRight: 20 }}>
                    <Ionicons name='call-outline' size={40} style={{ color: COLOR.WEB_FOREST_GREEN, alignItems: KEY.FLEX_START, marginTop: 8 }} />
                </TouchableOpacity>
            </View>
            <View style={{ borderBottomColor: COLOR.GRAY_MEDIUM, borderBottomWidth: 1, marginTop: 10, marginRight: 15, marginLeft: 15 }} />
        </View>
    )

    //GENERATE DYNAMIC FIELD CONTROL
    const generateControl = ({ item }) => (
        <>
            {item.fieldtype === "text" &&
                <TextInput
                    placeholder={item.displayname}
                    style={styles.inputTextView}
                    type={KEY.CLEAR}
                    returnKeyType={KEY.DONE}
                    placeholderTextColor={COLOR.PLACEHOLDER_COLOR}
                    defaultValue={'remark'}
                    blurOnSubmit={false}
                    onSubmitEditing={() => Keyboard.dismiss()}
                    onChangeText={(fullname) => checkFullName(fullname)}
                />
            }
            {
                item.fieldtype === "number" &&
                <TextInput
                    keyboardType={KEY.EMAILADDRESS}
                    placeholder={item.displayname}
                    style={styles.inputTextView}
                    type={KEY.CLEAR}
                    returnKeyType={KEY.DONE}
                    placeholderTextColor={COLOR.PLACEHOLDER_COLOR}
                    defaultValue={'number'}
                    blurOnSubmit={false}
                    onSubmitEditing={() => Keyboard.dismiss()}
                    onChangeText={(fullname) => checkFullName(fullname)}
                />
            }
            {
                item.fieldtype === "long_text" &&
                <TextInput placeholder={item.displayname}
                    style={styles.addressView}
                    placeholderTextColor={COLOR.PLACEHOLDER_COLOR}
                    type={KEY.CLEAR}
                    returnKeyType={'default'}
                    multiline={true}
                    numberOfLines={3}
                    defaultValue={'address'}
                    blurOnSubmit={false}
                    onSubmitEditing={() => Keyboard.dismiss()}
                    onChangeText={(address) => setUserAddress(address)}
                />
            }

        </>
    )

    //MANGE DISPOSITON FIELD DYNAMICLY
    const dispositionMangeField = (formDetails) => {
        console.log(`e`, formDetails.fields);
        if (formDetails && formDetails.fields.length < 0) {
            setFormFields(formDetails.fields);
        }
        setshowMessageModalVisible(true);
    }

    //CANCEL BUTTON ONPRESS TO CALL FUNCTION
    const closeModelPopUp = () => {
        setFollowUpDate(false);
        setFollowUpTime(false);
        setIsFollowUpChecked(false);
        setshowMessageModalVisible(false);
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: COLOR.WHITE }}>
            <StatusBar hidden={false} translucent={true} backgroundColor={COLOR.DEFALUTCOLOR} barStyle={KEY.DARK_CONTENT} />
            <Image source={IMAGE.HEADER} resizeMode={KEY.STRETCH} style={{ width: WIDTH, height: 60, marginTop: 0, tintColor: COLOR.DEFALUTCOLOR }} />
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps={KEY.ALWAYS}>
                <View style={{ marginLeft: 20, justifyContent: KEY.CENTER, marginTop: 5 }}>
                    <View style={{ flexDirection: KEY.ROW, marginTop: 10, alignItems: 'center' }}>
                        <Entypo size={30} name="user" color={COLOR.DEFALUTCOLOR} style={{ marginRight: 10 }} />
                        <Text style={styles.textTitle}>{followupDetail?.property?.fullname}</Text>
                    </View>
                    <View style={{ flexDirection: KEY.ROW, marginTop: 10, alignItems: 'center' }}>
                        <Ionicons size={30} name="call-outline" color={COLOR.DEFALUTCOLOR} style={{ marginRight: 10 }} />
                        <Text style={styles.textTitle}>{followupDetail?.property?.mobile}</Text>

                        <TouchableOpacity onPress={() => onPressCall()} style={[styles.touchStyle, { marginLeft: 10 }]}>
                            <Ionicons size={25} name="call-outline" color={COLOR.WHITE} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => onPressWhatsapp()} style={styles.touchStyle}>
                            <Ionicons size={25} name="logo-whatsapp" color={COLOR.WHITE} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => onPressSMS()} style={styles.touchStyle}>
                            <MaterialCommunityIcons size={25} name="message" color={COLOR.WHITE} />
                        </TouchableOpacity>
                    </View>
                    {
                        followupDetail?.property?.primaryemail &&
                        <View style={{ flexDirection: KEY.ROW, marginTop: 10, alignItems: 'center' }}>
                            <Ionicons size={30} name="mail" color={COLOR.DEFALUTCOLOR} style={{ marginRight: 10 }} />
                            <Text style={styles.textEmail}>{followupDetail?.property?.primaryemail}</Text>
                        </View>
                    }
                    <View style={{ flexDirection: KEY.ROW, marginTop: 10, alignItems: 'center', marginBottom: 10 }}>
                        <MaterialCommunityIcons size={30} name="calendar" color={COLOR.DEFALUTCOLOR} style={{ marginRight: 10 }} />
                        <Text style={styles.textDate}>{moment(followupDetail.createdAt).format('lll')}</Text>
                    </View>
                </View>
                <View style={{ height: 1, backgroundColor: COLOR.GRAY_MEDIUM, marginTop: 5 }} />
                <View style={styles.listTab}>
                    {
                        ListTab.map((e, index) => (
                            <TouchableOpacity style={[styles.btnTab, status === e.status && styles.tabActive]} onPress={() => setStatusFilter(e.status, index)}>
                                <Text style={[styles.tabText, status === e.status && styles.tabTextActive]}>
                                    {e.status}
                                </Text>
                            </TouchableOpacity>
                        ))
                    }
                </View>
                {
                    status == 'disposition' &&
                    <View style={{ marginTop: 20 }}>
                        <TreeView data={dispositionRenderList} onClick={(e) => dispositionMangeField(e)} leftImage={(<MaterialCommunityIcons size={10} name="message" color={COLOR.DEFALUTCOLOR} />)} />
                    </View>
                }
                {status == 'followup history' &&
                    <FlatList
                        style={{ marginTop: 5 }}
                        data={followupHistoryList}
                        showsVerticalScrollIndicator={false}
                        renderItem={renderFollowupHistoryList}
                        contentContainerStyle={{ paddingBottom: 20 }}
                        keyExtractor={item => item._id}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                title="Pull to refresh"
                                tintColor={COLOR.DEFALUTCOLOR}
                                titleColor={COLOR.DEFALUTCOLOR}
                                colors={[COLOR.DEFALUTCOLOR]}
                                onRefresh={onRefresh} />
                        }
                        ListFooterComponent={() => (
                            followupHistoryList && followupHistoryList.length > 0 ?
                                <></>
                                :
                                <View style={{ justifyContent: KEY.CENTER, alignItems: KEY.CENTER }}>
                                    <Image source={IMAGE.RECORD_ICON} style={{ height: 150, width: 200, marginTop: 100 }} resizeMode={KEY.CONTAIN} />
                                    <Text style={{ fontSize: FONT.FONT_SIZE_16, color: COLOR.TAUPE_GRAY, marginTop: 10 }}>No record found</Text>
                                </View>
                        )}
                    />
                }

                {/* message model Pop */}
                <Modal
                    animationType='slide'
                    transparent={true}
                    visible={showMessageModalVisible}
                    onRequestClose={() => setshowMessageModalVisible(!showMessageModalVisible)}>
                    <View style={{ flex: 1, alignItems: KEY.CENTER }}>
                        <View style={styles.msgModalView}>
                            {/* <FlatList
                                style={{ marginTop: 5 }}
                                data={followupHistoryList}
                                showsVerticalScrollIndicator={false}
                                renderItem={generateControl}
                                contentContainerStyle={{ paddingBottom: 20 }}
                                keyExtractor={item => item._id}
                            /> */}

                            <View style={{ marginTop: 10 }}>
                                {
                                    isFollowUpChecked === true ?
                                        <View style={{ justifyContent: 'space-evenly', alignItems: KEY.CENTER, flexDirection: KEY.ROW, marginTop: 10, marginLeft: 20 }}>
                                            <Text style={styles.textTitle}>Follow Up</Text>
                                            <TouchableOpacity onPress={() => setIsFollowUpChecked(false)}>
                                                <FontAwesome size={40}
                                                    color={COLOR.DEFALUTCOLOR} name='toggle-on'
                                                    style={{ margin: 5 }} />
                                            </TouchableOpacity>
                                        </View>
                                        :
                                        <View style={{ justifyContent: 'space-evenly', alignItems: KEY.CENTER, flexDirection: KEY.ROW, marginTop: 10, marginLeft: 20 }}>
                                            <Text style={styles.textTitle}>Follow Up</Text>
                                            <TouchableOpacity onPress={() => setIsFollowUpChecked(true)}>
                                                <FontAwesome size={40}
                                                    color={COLOR.DEFALUTCOLOR}
                                                    name='toggle-off'
                                                    style={{ margin: 5 }} />
                                            </TouchableOpacity>
                                        </View>
                                }
                            </View>

                            {isFollowUpChecked === true &&
                                <View style={{ alignItems: KEY.CENTER, justifyContent: KEY.CENTER }}>
                                    <View style={{ justifyContent: KEY.CENTER }}>
                                        <TextInput
                                            placeholder="Follow up Date"
                                            style={styles.inputTextView}
                                            type={KEY.CLEAR}
                                            returnKeyType={KEY.NEXT}
                                            placeholderTextColor={COLOR.PLACEHOLDER_COLOR}
                                            onTouchStart={() => showDatePicker()}
                                            defaultValue={followUpDate && moment(followUpDate).format('YYYY-MM-DD')}
                                            onSubmitEditing={() => Keyboard.dismiss()}
                                        />
                                        <DateTimePickerModal
                                            isVisible={isDatePickerVisible}
                                            mode='date'
                                            onConfirm={handleDateConfirm}
                                            onCancel={hideDatePicker}
                                        />
                                    </View>
                                    <View style={{ alignItems: KEY.CENTER, justifyContent: KEY.CENTER }}>
                                        <TextInput
                                            placeholder="Date Of Birth"
                                            style={styles.inputTextView}
                                            type={KEY.CLEAR}
                                            returnKeyType={KEY.NEXT}
                                            placeholderTextColor={COLOR.PLACEHOLDER_COLOR}
                                            onTouchStart={() => showTimePicker()}
                                            defaultValue={followUpTime && moment(followUpTime).format('LTS')}
                                            onSubmitEditing={() => Keyboard.dismiss()}
                                        />
                                        <DateTimePickerModal
                                            isVisible={isTimePickerVisible}
                                            mode='time'
                                            onConfirm={handleTimeConfirm}
                                            onCancel={hideTimePicker}
                                        />
                                    </View>
                                </View>
                            }

                            <TouchableOpacity onPress={() => CloseModelPopUp()}
                                style={{ bottom: 10, position: 'absolute', alignSelf: 'flex-start' }} >
                                <Text style={{ fontSize: FONT.FONT_SIZE_20, marginLeft: 25, color: COLOR.DEFALUTCOLOR }}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setshowMessageModalVisible(false)}
                                style={{ bottom: 10, position: 'absolute', alignSelf: 'flex-end' }} >
                                <Text style={{ fontSize: FONT.FONT_SIZE_20, marginRight: 25, color: COLOR.DEFALUTCOLOR }}>Submit</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </ScrollView>
            {loading ? <Loader /> : null}
        </SafeAreaView>
    );
}

export default FollowupDetailScreen;

