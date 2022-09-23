import React, { useState, useCallback, useEffect } from 'react'
import {
    View,
    Text,
    Dimensions,
    SafeAreaView,
    ImageBackground,
    TextInput, Modal, RefreshControl,
    ScrollView, FlatList,
    TouchableOpacity,
    StatusBar, Image, Linking, Platform, Alert
} from 'react-native';
import languageConfig from '../../languages/languageConfig';
import * as SCREEN from '../../context/screen/screenName';
import Loader from '../../components/loader/index';
import * as KEY from '../../context/actions/key';
import * as COLOR from '../../styles/colors';
import * as IMAGE from '../../styles/image';
import { AUTHUSER } from '../../context/actions/type';
import styles from './ChatScreenHistorystyle';
import AsyncStorage from '@react-native-community/async-storage';
import axiosConfig from '../../helpers/axiosConfig';
import { useFocusEffect } from '@react-navigation/native';
import { firebase } from '@react-native-firebase/crashlytics';
import { RecentChatService } from "../../services/ChatService/ChatService";
const noProfile = 'https://res.cloudinary.com/dnogrvbs2/image/upload/v1613538969/profile1_xspwoy.png';

const HEIGHT = Dimensions.get('window').height;
const WIDTH = Dimensions.get('window').width;

const ChatScreenHistory = (props, item) => {

    const [loading, setloading] = useState(false);
    const [recentChat, setrecentChat] = useState([]);
    const [refreshing, setrefreshing] = useState(false);
    const [currentUserId, setcurrentUserId] = useState(null);
    const [SearchConsultant, setSearchConsultant] = useState([]);

    useFocusEffect(
        React.useCallback(() => {
            AsyncStorage.getItem(AUTHUSER).then((res) => {
                let currentUser = JSON.parse(res)._id;
                axiosConfig(currentUser);
                setcurrentUserId(currentUser);
                recentchatlist(currentUser);
            });
        }, [])
    );

    useEffect(() => {
        setloading(true);
    }, [])

    useEffect(() => {
    }, [currentUserId, recentChat, refreshing])

    const wait = (timeout) => {
        return new Promise(resolve => {
            setTimeout(resolve, timeout);
        });
    }

    const onRefresh = () => {
        let id = currentUserId;
        setrefreshing(true);
        recentchatlist(id);
        wait(3000).then(() => setrefreshing(false));
    }

    const recentchatlist = async (id) => {
        try {
            const response = await RecentChatService(id);
            if (response.data != null && response.data != 'undefind' && response.status == 200) {
                setrecentChat(response.data);
                setSearchConsultant(response.data);
                setloading(false);
            }
        }
        catch (error) {
            setloading(false);
            console.log(`error`, error);
            firebase.crashlytics().recordError(error);
        }
    }

    const navigationhandler = (item) => {
        if (item) {
            const memberDetails = {
                _id: item.contextid._id,
                profilepic: item.contextid.profilepic,
                fullname: item.contextid.fullname,
                consultanobject: item
            }
            props.navigation.navigate(SCREEN.CHATSCREEN, { memberDetails });
        }
    }

    const renderChatUser = ({ item }) => (
        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <TouchableOpacity style={styles.maincard} onPress={() => navigationhandler(item)}>
                <View style={{ marginTop: 10, marginBottom: 10, flexDirection: KEY.ROW, justifyContent: KEY.SPACEBETWEEN, alignItems: KEY.CENTER, width: WIDTH - 30 }}>
                    <View style={{ flexDirection: 'row' }}>
                        <Image source={{ uri: item && item.contextid && item.contextid.profilepic ? item.contextid.profilepic : noProfile }}
                            style={{ width: 70, height: 70, borderRadius: 100, marginLeft: 20, borderColor: '#555555', borderWidth: 0.2 }} />
                        {
                            item.contextid && item.contextid.property && item.contextid.property.live ?
                                <View style={{ marginLeft: -20, height: 15, width: 15, backgroundColor: '#25D366', borderColor: '#25D366', borderRadius: 100, borderWidth: 1 }}></View>
                                :
                                <View style={{ marginLeft: -20, height: 15, width: 15, backgroundColor: '#EEEEEE', borderColor: '#000000', borderRadius: 100, borderWidth: 1 }}></View>
                        }
                    </View>
                    <View style={{ marginRight: 60 }}>
                        <View style={{ justifyContent: 'flex-start', alignItems: 'flex-start' }}>
                            <Text style={{ fontSize: 22, fontWeight: 'bold', color: "#000000", textTransform: 'capitalize' }}>
                                {item && item.contextid && item.contextid.fullname && item.contextid.fullname.split(' ')[0]}</Text>
                            <Text style={{ fontSize: 14, color: "#999999" }}>{item.contextid && item.contextid.property && item.contextid.property.live ? item.contextid.property.live : null}</Text>
                        </View>
                    </View>
                    <View></View>
                </View>
            </TouchableOpacity >
        </View>
    )
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: COLOR.BACKGROUNDCOLOR }}>
            <StatusBar hidden={false} translucent={false} backgroundColor={COLOR.STATUSBARCOLOR} barStyle={Platform.OS === 'ios' ? KEY.DARK_CONTENT : KEY.DARK_CONTENT} />
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps={KEY.ALWAYS}>
                {(recentChat == null) || (recentChat && recentChat.length == 0) ?
                    (loading ? null :
                        <Text style={{ textAlign: 'center', fontSize: 16, color: '#555555', marginTop: 50 }}>Recent chat not available</Text>
                    )
                    :
                    <FlatList
                        data={recentChat}
                        renderItem={renderChatUser}
                        contentContainerStyle={{ justifyContent: KEY.CENTER, alignItems: KEY.CENTER }}
                        keyExtractor={item => item._id}
                    />
                }
            </ScrollView>
            <TouchableOpacity onPress={() => props.navigation.navigate(SCREEN.MYTEAMSCREEN)} style={styles.touchStyle}>
                <Image source={IMAGE.PLUS} style={styles.floatImage} />
            </TouchableOpacity>
        </SafeAreaView>
    )
}


export default ChatScreenHistory;