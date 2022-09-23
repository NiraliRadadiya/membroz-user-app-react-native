import React, { useEffect, useState } from 'react';
import {
    Dimensions,
    SafeAreaView,
    ScrollView,
    Image,
    Text,
    View, TouchableOpacity, TextInput,
    StatusBar, RefreshControl, FlatList, Linking
} from 'react-native';
import { MemberLanguage } from '../../services/LocalService/LanguageService';
import { getMemberList } from '../../services/MemberService/MemberService';
import * as LocalService from '../../services/LocalService/LocalService';
import AntDesign from 'react-native-vector-icons/AntDesign';
import languageConfig from '../../languages/languageConfig';
import * as SCREEN from '../../context/screen/screenName';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import * as KEY from '../../context/actions/key';
import * as FONT from '../../styles/typography';
import Toast from 'react-native-simple-toast';
import * as COLOR from '../../styles/colors';
import Loader from '../../components/loader';
import * as IMAGE from '../../styles/image';
import styles from './Style';

const WIDTH = Dimensions.get('window').width;

export default MyTeamScreen = (props) => {
    const [loading, setLoading] = useState(false);
    const [teamList, setTeamList] = useState([]);
    const [refreshing, setrefreshing] = useState(false);
    const [searchList, setSearchList] = useState([]);
    const [searchText, setSearchText] = useState(null);

    useEffect(() => {
        //LANGUAGE MANAGEMENT FUNCTION
        MemberLanguage();
        setLoading(true);
        getMyTeamList();
    }, [])

    useEffect(() => {
    }, [loading, searchList, searchText, refreshing, teamList])

    const onRefresh = () => {
        setrefreshing(true);
        getMyTeamList();
        wait(3000).then(() => setrefreshing(false));
    }

    //TIME OUT FUNCTION
    const wait = (timeout) => {
        return new Promise(resolve => {
            setTimeout(resolve, timeout);
        });
    }

    //GET MYTEAM API THROUGH FETCH DATA
    const getMyTeamList = async () => {
        try {
            const response = await getMemberList();
            if (response.data != null && response.data != 'undefind' && response.status == 200) {
                setLoading(false);
                setTeamList(response.data);
                setSearchList(response.data);
            }
        } catch (error) {
            firebase.crashlytics().recordError(error);
            setLoading(false);
        }
    }

    //ON PRESS TO EMAIL TO USE FUNCTION
    const onPressEmail = (item) => {
        if (item && item.property && item.property.primaryemail) {
            let EmailAddress = item?.property?.primaryemail;
            const url = `mailto:${EmailAddress}`
            Linking.openURL(url);
        } else {
            Toast.show(languageConfig.emailwrong, Toast.SHORT);
        }
    }

    //ON PRESS TO CALL DIALER TO USE FUNCTION
    const onPressCall = (item) => {
        if (item && item.property && item.property.mobile) {
            let mobile = item?.property?.mobile;
            let phoneNumber = mobile;
            if (Platform.OS !== 'android') {
                phoneNumber = `telprompt:${mobile}`;
            }
            else {
                phoneNumber = `tel:${mobile}`;
            }
            Linking.openURL(phoneNumber);
        } else {
            Toast.show('Contact number is not valid', Toast.SHORT);
        }
    }

    //RENDER REFER FRIEND LIST USING FLATLIST
    const renderMyTeamList = ({ item }) => (
        <View style={styles.cardView}>
            <View style={{ flexDirection: KEY.ROW, marginLeft: 0, width: WIDTH - 40, padding: 5, flex: 1, alignItems: KEY.CENTER }}>
                <View style={{ flexDirection: KEY.COLUMN, alignItems: KEY.CENTER, margin: 10 }}>
                    <View style={styles.viewRound}>
                        <Image source={!item.profilepic ? IMAGE.USERPROFILE : { uri: item.profilepic }}
                            style={!item.profilepic ? { height: 50, width: 50 } : { height: 70, width: 70, borderRadius: 100 }} />
                    </View>
                    <View style={{ marginTop: 10, flexDirection: KEY.ROW, alignItems: KEY.SPACEBETWEEN }}>
                        {/* <TouchableOpacity onPress={() => onPressCall(item)}
                            style={{ marginRight: 0, alignItems: KEY.CENTER }}>
                            <Ionicons size={20} name="call" color={COLOR.DEFALUTCOLOR} style={{ marginRight: 10 }} />
                        </TouchableOpacity> */}
                        <TouchableOpacity style={{ alignSelf: KEY.FLEX_END, }} onPress={() => props.navigation.navigate(SCREEN.CHATSCREEN, { memberDetails: item })} >
                            <Ionicons size={20} name="chatbubbles-sharp" color={COLOR.DEFALUTCOLOR} style={{ marginRight: 0 }} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => onPressEmail(item)}
                            style={{ marginLeft: 10, alignItems: KEY.CENTER }}>
                            <Ionicons size={20} name="mail" color={COLOR.DEFALUTCOLOR} style={{ marginRight: 0 }} />
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={{ marginLeft: 10, flexDirection: KEY.COLUMN, alignItems: KEY.FLEX_START, width: WIDTH / 2 }}>
                    {item.property && item.property.fullname &&
                        <Text style={{ fontSize: FONT.FONT_SIZE_18, color: COLOR.BLACK, fontWeight: FONT.FONT_WEIGHT_BOLD, textTransform: KEY.CAPITALIZE }}>
                            {item.property.fullname}</Text>}
                    {item.designationid && item.designationid.title &&
                        <Text style={{ marginTop: 2, fontSize: FONT.FONT_SIZE_14, color: COLOR.GRANITE_GRAY, textTransform: KEY.CAPITALIZE }}>
                            {item.designationid.title}</Text>}
                    {item.property && item.property.primaryemail &&
                        <Text style={{ marginTop: 2, fontSize: FONT.FONT_SIZE_14, color: COLOR.GRANITE_GRAY }}>
                            {item.property.primaryemail}</Text>}
                    {item.property && item.property.mobile &&
                        <Text style={{ marginTop: 2, fontSize: FONT.FONT_SIZE_14, color: COLOR.GRANITE_GRAY }}>
                            {item.property.mobile}</Text>}
                </View>
            </View>
        </View>
    )

    //local search Filter Function
    const searchFilterFunction = (text) => {
        if (text && text != null && text != undefined) {
            setSearchText(text);
            const newData = teamList.filter(item => {
                const itemData = `${item.property.fullname.toUpperCase()}`
                const textData = text.toUpperCase();
                return itemData.indexOf(textData) > -1;
            });
            return setSearchList(newData);
        }
    };

    //local search Text Cancel Function
    const searchTextCancelFunction = (text) => {
        setSearchText(null);
        setSearchList(teamList);
        return;
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: COLOR.BACKGROUNDCOLOR }}>
            <StatusBar hidden={false} translucent={true} backgroundColor={COLOR.DEFALUTCOLOR} barStyle={KEY.DARK_CONTENT} />
            <Image source={IMAGE.HEADER} resizeMode={KEY.STRETCH} style={{ width: WIDTH, height: 60, marginTop: 0, tintColor: COLOR.DEFALUTCOLOR }} />
            {teamList && teamList.length > 0 &&
                <View style={styles.centerView}>
                    <View style={styles.statusbar}>
                        <TextInput
                            placeholder={languageConfig.search}
                            placeholderTextColor={COLOR.BLACK}
                            selectionColor={COLOR.DEFALUTCOLOR}
                            returnKeyType={KEY.DONE}
                            defaultValue={searchText}
                            autoCapitalize="none"
                            style={styles.inputTextView}
                            autoCorrect={false}
                            onChangeText={(value) => searchFilterFunction(value)}
                        />
                        {
                            !searchText ?
                                <TouchableOpacity style={{}} onPress={() => searchFilterFunction(searchText)}>
                                    <AntDesign name='search1' size={23} color={COLOR.BLACK} style={{ padding: 10 }} />
                                </TouchableOpacity>
                                :
                                <TouchableOpacity style={{}} onPress={() => searchTextCancelFunction()}>
                                    <Entypo name='cross' size={23} color={COLOR.BLACK} style={{ padding: 10 }} />
                                </TouchableOpacity>
                        }

                    </View>
                </View>
            }
            {
                <FlatList
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 50, marginTop: 0 }}
                    data={searchList}
                    renderItem={renderMyTeamList}
                    keyExtractor={item => item._id}
                    keyboardShouldPersistTaps={KEY.ALWAYS}
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
                        searchList && searchList.length > 0 ?
                            <></>
                            :
                            <View style={{ justifyContent: KEY.CENTER, alignItems: KEY.CENTER }}>
                                <Image source={IMAGE.RECORD_ICON} style={{ height: 150, width: 200, marginTop: 50 }} resizeMode={KEY.CONTAIN} />
                                <Text style={{ fontSize: FONT.FONT_SIZE_16, color: COLOR.TAUPE_GRAY, marginTop: 10 }}>{languageConfig.norecordtext}</Text>
                            </View>
                    )}
                />
            }
            {loading ? <Loader /> : null}
        </SafeAreaView>
    );
}


