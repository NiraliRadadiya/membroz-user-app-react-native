import React, { useState, useEffect } from 'react';
import {
    Dimensions,
    SafeAreaView,
    ScrollView,
    Image,
    Text, TextInput,
    View, FlatList, RefreshControl,
    StatusBar, TouchableOpacity, Pressable
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { followUpService } from '../../services/FollowUpService/FollowUpService';
import { MemberLanguage } from '../../services/LocalService/LanguageService';
import crashlytics, { firebase } from "@react-native-firebase/crashlytics";
import * as LocalService from '../../services/LocalService/LocalService';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import AntDesign from 'react-native-vector-icons/AntDesign';
import languageConfig from '../../languages/languageConfig';
import { useFocusEffect } from '@react-navigation/native';
import * as SCREEN from '../../context/screen/screenName';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import Loader from '../../components/loader/index';
import * as KEY from '../../context/actions/key';
import * as FONT from '../../styles/typography';
import * as COLOR from '../../styles/colors';
import * as IMAGE from '../../styles/image';
import moment from 'moment-timezone';
//import moment from 'moment';
import styles from './Style';

const WIDTH = Dimensions.get('window').width;

const FollowupScreen = (props) => {
    const [loading, setLoading] = useState(false);
    const [followUpList, setFollowUpList] = useState([]);
    const [userID, setUserID] = useState(null);
    const [refreshing, setrefreshing] = useState(false);
    const [SearchfollowUp, setSearchfollowUp] = useState([]);

    useFocusEffect(
        React.useCallback(() => {
            getUserDeatilsLocalStorage();
        }, [])
    );

    useEffect(() => {
        //LANGUAGE MANAGEMENT FUNCTION
        MemberLanguage();
        setLoading(true);
    }, []);

    useEffect(() => {
    }, [loading, followUpList, userID, refreshing, SearchfollowUp]);

    //GET USER DATA IN MOBILE LOCAL STORAGE
    const getUserDeatilsLocalStorage = async () => {
        var userInfo = await LocalService.LocalStorageService();
        moment.tz.setDefault(userInfo?.branchid?.timezone);
        setUserID(userInfo._id);
        getFollowUpList(userInfo._id);
    }

    //GET PULL TO REFRSH FUNCTION
    const onRefresh = () => {
        setrefreshing(true);
        getFollowUpList(userID);
        wait(3000).then(() => setrefreshing(false));
    }

    //TIME OUT FUNCTION
    const wait = (timeout) => {
        return new Promise(resolve => {
            setTimeout(resolve, timeout);
        });
    }

    //GET My LEAD API THROUGH FETCH DATA
    const getFollowUpList = async (userID) => {
        try {
            const response = await followUpService(userID);
            if (response.data != null && response.data != 'undefind' && response.status == 200) {
                setFollowUpList(response.data);
                setSearchfollowUp(response.data);
                setLoading(false);
            }
        } catch (error) {
            firebase.crashlytics().recordError(error);
            setLoading(false);
        }
    }

    //select to collapsible (show data)
    const onPressToSelectFollowUp = (item, index, val) => {
        const followUp = followUpList.map((item) => {
            item.selected = false;
            return item;
        });
        if (val == false) {
            followUp[index].selected = false;
        }
        if (val == true) {
            followUp[index].selected = true;
        }
        setFollowUpList(followUp);
    }

    const renderFollowUpDeatils = (val) => {
        let item = {
            _id: val?.customerid?._id,
            property: {
                mobile: val?.customerid?.property?.mobile,
                fullname: val?.customerid?.property?.fullname,
                primaryemail: val?.customerid?.property?.primaryemail,
            },
            createdAt: val.duedate
        }
        props.navigation.navigate(SCREEN.FOLLOWUPDETAILSCREEN, { item });
    }

    //RENDER FOLLOW UP LIST USING FLATLIST
    const renderFollowUp = ({ item, index }) => (
        item.selected != true ?
            <>
                <TouchableOpacity onPress={() => onPressToSelectFollowUp(item, index, true)}>
                    <View style={{ justifyContent: KEY.SPACEBETWEEN, alignItems: KEY.CENTER, flexDirection: KEY.ROW, marginTop: 10 }}>
                        <View style={{ justifyContent: KEY.FLEX_START, flexDirection: KEY.ROW, alignItems: KEY.CENTER, marginLeft: 20 }}>
                            <View style={{ flexDirection: KEY.COLUMN, alignItems: KEY.FLEX_START }}>
                                <Text style={styles.textTitle}>{item?.customerid?.property?.fullname}</Text>
                                <Text style={styles.textTitle}>{item?.customerid?.property?.mobile}</Text>
                            </View>
                        </View>
                        <TouchableOpacity onPress={() => onPressToSelectFollowUp(item, index, true)}
                            style={{ justifyContent: KEY.FLEX_END, marginRight: 20 }}>
                            <AntDesign name='down' size={20} style={{ color: COLOR.BLACK, alignItems: KEY.FLEX_START, marginTop: 8 }} />
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
                <View style={{ borderBottomColor: COLOR.GRAY_MEDIUM, borderBottomWidth: 1, marginTop: 10, marginRight: 15, marginLeft: 15 }} />
            </>
            :
            <>
                <TouchableOpacity onPress={() => onPressToSelectFollowUp(item, index, false)}>
                    <View style={{ justifyContent: KEY.SPACEBETWEEN, alignItems: KEY.CENTER, flexDirection: KEY.ROW, marginTop: 5, marginLeft: 20 }}>
                        <Text style={styles.textTitle}>{item.type}</Text>
                        <TouchableOpacity onPress={() => onPressToSelectFollowUp(item, index, false)}
                            style={{ justifyContent: KEY.FLEX_END, marginRight: 20 }}>
                            <AntDesign name='up' size={20} style={{ color: COLOR.BLACK, alignItems: KEY.FLEX_START, marginTop: 8 }} />
                        </TouchableOpacity>
                    </View>
                    <View style={{ marginLeft: 20, justifyContent: KEY.CENTER, marginTop: 5, marginBottom: 10 }}>
                        <View style={{ flexDirection: KEY.ROW, marginTop: 8, alignItems: KEY.CENTER }}>
                            <Entypo size={25} name="user" color={COLOR.DEFALUTCOLOR} style={{ marginRight: 10 }} />
                            <Text style={styles.textsub}>{item?.customerid?.property?.fullname}</Text>
                        </View>
                        <View style={{ flexDirection: KEY.ROW, marginTop: 8, alignItems: KEY.CENTER }}>
                            <Ionicons size={25} name="call-outline" color={COLOR.DEFALUTCOLOR} style={{ marginRight: 10 }} />
                            <Text style={styles.textsub}>{item?.customerid?.property?.mobile}</Text>
                        </View>
                        <View style={{ flexDirection: KEY.ROW, marginTop: 8, alignItems: KEY.CENTER, marginBottom: 0 }}>
                            <MaterialCommunityIcons size={25} name="calendar" color={COLOR.DEFALUTCOLOR} style={{ marginRight: 10 }} />
                            <Text style={styles.textDate}>{moment(item?.duedate).format('lll')}</Text>
                        </View>
                        <View style={{ flexDirection: KEY.ROW, marginTop: 8, alignItems: KEY.CENTER }}>
                            <FontAwesome5 size={23} name="user-cog" color={COLOR.DEFALUTCOLOR} style={{ marginRight: 10 }} />
                            <Text style={styles.textsub}>{item?.addedby?.fullname}</Text>
                        </View>
                    </View>
                    <View style={{ marginLeft: 20, justifyContent: KEY.SPACEBETWEEN, alignItems: KEY.CENTER, flexDirection: KEY.ROW, marginTop: -5 }}>
                        <View style={{ justifyContent: KEY.FLEX_START, flexDirection: KEY.ROW, alignItems: KEY.CENTER }}>
                            <FontAwesome5 size={23} name="user-check" color={COLOR.DEFALUTCOLOR} style={{ marginRight: 10 }} />
                            <Text style={styles.textsub}>{item?.assingeeuser?.fullname}</Text>
                        </View>
                    </View>
                    <View style={{ justifyContent: KEY.CENTER, alignItems: KEY.CENTER, marginTop: 10 }}>
                        <TouchableOpacity onPress={() => renderFollowUpDeatils(item)}
                            style={{ justifyContent: KEY.CENTER, alignItems: KEY.CENTER, backgroundColor: COLOR.DEFALUTCOLOR, width: 150, height: 40, borderRadius: 100, flexDirection: KEY.ROW }}>
                            <Text style={styles.textsubCallBtn}>View More</Text>
                            <AntDesign name='rightcircle' size={25} style={{ color: COLOR.WHITE }} />
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
                <View style={{ borderBottomColor: COLOR.GRAY_MEDIUM, borderBottomWidth: 1, marginTop: 15, marginRight: 15, marginLeft: 15 }} />
            </>
    )

    //local search Filter Function
    const searchFilterFunction = (text) => {
        const newData = followUpList.filter(item => {
            const itemData = `${item?.customerid?.property?.fullname.toUpperCase()}`
            const textData = text.toUpperCase();
            return itemData.indexOf(textData) > -1;
        });
        return setSearchfollowUp(newData);
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: COLOR.BACKGROUNDCOLOR }}>
            <StatusBar hidden={false} translucent={true} backgroundColor={COLOR.DEFALUTCOLOR} barStyle={KEY.DARK_CONTENT} />
            <Image source={IMAGE.HEADER} resizeMode={KEY.STRETCH} style={{ width: WIDTH, height: 60, marginTop: 0, tintColor: COLOR.DEFALUTCOLOR }} />
            {followUpList && followUpList.length > 0 ?
                <>
                    <View style={styles.centerView}>
                        <View style={styles.statusbar}>
                            <TextInput
                                placeholder={KEY.SEARCH}
                                placeholderTextColor={COLOR.GRAY_MEDIUM}
                                selectionColor={COLOR.DEFALUTCOLOR}
                                returnKeyType={KEY.DONE}
                                autoCapitalize="none"
                                style={styles.inputTextView}
                                autoCorrect={false}
                                onChangeText={(value) => searchFilterFunction(value)}
                            />
                            <AntDesign name='search1' size={23} color={COLOR.BLACK} style={{ padding: 10 }} />
                        </View>
                    </View>
                    <View style={styles.viewMain}>
                        <FlatList
                            style={{ marginTop: 5 }}
                            data={SearchfollowUp}
                            showsVerticalScrollIndicator={false}
                            renderItem={renderFollowUp}
                            contentContainerStyle={{ marginTop: 10, paddingBottom: 20 }}
                            keyExtractor={item => item._id}
                            refreshControl={
                                <RefreshControl
                                    refreshing={refreshing}
                                    title={languageConfig.pullrefreshtext}
                                    tintColor={COLOR.DEFALUTCOLOR}
                                    titleColor={COLOR.DEFALUTCOLOR}
                                    colors={[COLOR.DEFALUTCOLOR]}
                                    onRefresh={onRefresh} />
                            }
                            ListFooterComponent={() => (
                                SearchfollowUp && SearchfollowUp.length == 0 &&
                                <View style={{ justifyContent: KEY.CENTER, alignItems: KEY.CENTER }}>
                                    <Image source={IMAGE.RECORD_ICON} style={{ height: 150, width: 200, marginTop: 50 }} resizeMode={KEY.CONTAIN} />
                                    <Text style={{ fontSize: FONT.FONT_SIZE_16, color: COLOR.TAUPE_GRAY, marginTop: 10 }}>{languageConfig.norecordtext}</Text>
                                </View>
                            )}
                        />
                    </View>
                </>
                :
                loading == false ?
                    <>
                        <View activeOpacity={0.7} style={{ justifyContent: KEY.CENTER, alignItems: KEY.CENTER }}>
                            <Image source={IMAGE.RECORD_ICON} style={{ height: 150, width: 200, marginTop: 150 }} resizeMode={KEY.CONTAIN} />
                            <Text style={{ fontSize: FONT.FONT_SIZE_16, color: COLOR.TAUPE_GRAY, marginTop: 10 }}>{languageConfig.norecordtext}</Text>
                        </View>
                    </>
                    : <Loader />
            }
        </SafeAreaView>
    );
}

export default FollowupScreen;

