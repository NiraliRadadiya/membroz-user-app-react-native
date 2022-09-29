import React, { useEffect, useCallback, useState } from 'react';
import {
    View, Text, SafeAreaView, StyleSheet, ScrollView, TouchableOpacity, Image,
    TextInput, Modal, Dimensions, StatusBar, Platform, Keyboard
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-community/async-storage';
import AntDesign from 'react-native-vector-icons/AntDesign';
import * as SCREEN from '../../context/screen/screenName';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AUTHUSER } from '../../context/actions/type';
import * as COLOR from '../../styles/colors';
import * as KEY from '../../context/actions/key';
import * as FONT from '../../styles/typography';
import { GiftedChat, Bubble, Send, InputToolbar, Composer, Time } from 'react-native-gifted-chat';
import firestore from '@react-native-firebase/firestore';
import * as IMAGE from '../../styles/image';
import { EndChatService, FindChatById, StartChatService } from '../../services/ChatService/ChatService';
import moment from 'moment';
import Loader from '../../components/loader/index';
const noProfile = 'https://res.cloudinary.com/dnogrvbs2/image/upload/v1613538969/profile1_xspwoy.png';
import crashlytics, { firebase } from "@react-native-firebase/crashlytics";
import styles from './ChatScreenstyle';
import Toast from 'react-native-simple-toast';

const HEIGHT = Dimensions.get('window').height;
const WIDTH = Dimensions.get('window').width;

const ChatScreen = (props, { navigation }) => {
    const MemberDetails = props.route.params.memberDetails;
    const [loading, setloading] = useState(false);
    const [chatId, setchatId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [formdataDetails, setFormdataDetails] = useState(null);
    const [sender, setsender] = useState(null);
    let memberinfo;
    let formdatas;
    let formId;

    // chat portion
    useEffect(
        () => {
            AsyncStorage.getItem(AUTHUSER).then((res) => {
                let sender = JSON.parse(res)._id; //member id
                memberinfo = JSON.parse(res);
                setsender(sender);
                setloading(true);
                newChat(sender, MemberDetails).then((id) => {
                    setchatId(id);
                    let getMessages = firestore()
                        .collection('chat')
                        .doc(id)
                        .collection('messages')
                        .orderBy('order', 'desc');
                    getMessages.onSnapshot((snap) => {
                        let messages = snap.docs.map((item) => item.data());
                        setMessages(messages);
                    });
                });
            });
        },
        [navigation]
    );

    useEffect(() => {
    }, [formdataDetails, chatId, loading, messages])

    const startChat = async (sender, memberdata) => {
        const body = {
            // formid: '6319d8ee5d3f8a023af900e6',
            formid: '6333d90bc8e9e31addd12dc8',
            contextid: memberdata, //member id
            onModel: "Member",
            onModelAddedby: "User",
            status: "active",
            addedby: sender, //user id
            property: {
                memberid: memberdata,
                userid: sender,
                membername: MemberDetails.fullname,
                username: memberinfo.fullname,

            }
        }
        try {
            const response = await StartChatService(body);
            if (response.data != null && response.data != 'undefind' && response.status === 200) {
                formId = response.data._id;
                formdatas = response.data;
                FindChatByIdService(response.data._id);
            }
        }
        catch (error) {
            console.log(`error startChat`, error);
            firebase.crashlytics().recordError(error);
            setloading(false);
        }
    }

    // //new chat inite
    const newChat = async (sender, memberdata) => {
        try {
            let getChatId = firestore().collection('chat');
            let snap = await getChatId.where('member', 'in', [[sender, memberdata._id]]).get();
            if (snap && snap.empty) {
                let snap2 = await getChatId.where('member', 'in', [[memberdata._id, sender]]).get();
                if (snap2 && snap2.empty) {
                    await startChat(sender, memberdata._id);
                    let ref = await getChatId.add({
                        member: [sender, memberdata._id],
                        createdAt: moment().format(),
                        previewMessage: '',
                        formid: formId,
                        memberid: memberdata._id,
                        userid: sender
                    });
                    // setloading(false);
                    updateChatdata(ref.id, sender, memberdata._id);
                    return ref.id;
                } else {
                    FindChatByIdService(snap2.docs[0]._data.formid);
                    setloading(false);
                    return snap2.docs[0].id;
                }
            } else {
                FindChatByIdService(snap.docs[0]._data.formid);
                setloading(false);
                return snap.docs[0].id;
            }
        } catch (error) {
            console.log("error newChat", error);
        }
    };

    //update chat id
    const updateChatdata = async (chatId, sender, memberdata) => {
        let body = {
            // formid: '6319d8ee5d3f8a023af900e6',
            formid: '6333d90bc8e9e31addd12dc8',
            contextid: memberdata,
            onModel: "Member",
            onModelAddedby: "User",
            status: "active",
            addedby: sender,
            property: {
                memberid: memberdata,
                fierbasechatid: chatId,
                userid: sender,
                membername: MemberDetails.fullname,
                username: memberinfo.fullname
            }
        }
        try {
            const response = await EndChatService(formdatas._id, body);
            if (response.data != null && response.data != 'undefind' && response.status == 200) {
                FindChatByIdService(response.data._id);
                Toast.show("Your Chat Is Initial", Toast.SHORT);
                setloading(false);
            }
        } catch (error) {
            console.log(`error updateChatdata`, error);
            firebase.crashlytics().recordError(error);
            setloading(false);
            Toast.show("Your Chat Not Initial", Toast.SHORT);
        }
    }

    //current chat in find chat is end or not
    const FindChatByIdService = async (id) => {
        try {
            const response = await FindChatById(id);
            if (response.data != null && response.data != 'undefind' && response.status == 200) {
                setFormdataDetails(response.data[0]);
            }
        } catch (error) {
            console.log("error FindChatByIdService", error);
            firebase.crashlytics().recordError(error);
            setloading(false);
        }
    }

    async function sendpushalert(registrationid, message, subject) {
        var form = {
            to: registrationid,
            priority: "high",
            notification: {
                sound: "default",
                title: subject.toLowerCase().split(' ').map(s => s.charAt(0).toUpperCase() + s.substring(1)).join(' '),
                body: message
            }
        };
        var formData = JSON.stringify(form);
        await fetch('https://fcm.googleapis.com/fcm/send', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "Authorization": "key=AAAABc4YpwA:APA91bEDShmGWuTQU85roQMr_8ES6GP7n1lx8UbR0N2dARk1YzhHdQ0Wd748KjyNyl6V3p2qgGTau3Zr5xUwuQMLasxjRkLMzRtqG9I31z_sSGApWvAubVCSb5hPZxZ_WfQpcK616IsY"
            },
            body: formData
        })
            .then(response => response.json())
            .then((responseData) => {
            })
            .catch(error => {
                console.error('There was an error!', error);
            });
    }

    function sendpushalertmsgCheck(message) {
        let userInformation = formdataDetails.contextid;
        if (userInformation) {
            if (userInformation.anroiddevices && userInformation.anroiddevices.length !== 0) {
                userInformation.anroiddevices.forEach(elementAndroidDevices => {
                    if (
                        elementAndroidDevices.registrationid &&
                        elementAndroidDevices.registrationid != ""
                    )
                        sendpushalert(elementAndroidDevices.registrationid, message, userInformation.fullname)
                });
            }

            if (userInformation.iosdevices && userInformation.iosdevices.length !== 0) {
                userInformation.iosdevices.forEach(elementIosDevices => {
                    if (
                        elementIosDevices.registrationid &&
                        elementIosDevices.registrationid != ""
                    )
                        sendpushalert(elementIosDevices.registrationid, message, userInformation.fullname)
                });
            }
        }
    }

    //send btn click to send message 
    const onSend = useCallback((messages = []) => {
        try {
            sendpushalertmsgCheck(messages[0].text);
            let setMessage = firestore().collection('chat').doc(chatId).collection('messages').doc();
            for (let i = 0; i < messages.length; i++) {
                const { text, user, createdAt } = messages[i];
                firestore()
                    .collection('chat')
                    .doc(chatId)
                    .update({ previewMessage: messages[0].text, createdAt: createdAt.toString() });
                const message = {
                    _id: Math.random(),
                    text,
                    user,
                    createdAt: createdAt.toString(),
                    order: firestore.FieldValue.serverTimestamp(),
                    sent: true,
                    received: true,
                    panding: false
                };
                setMessage.set(message);
            }
        } catch (error) {
            console.log("error use call abck", error);
        }

    });

    const renderTime = (props) => (
        <Time
            {...props}
            timeTextStyle={{
                right: { color: '#FFFFFF', fontSize: 12 },
                left: { color: '#000000', fontSize: 12 }
            }}
        />
    );

    const renderBubble = (props, navigation) => {
        return (
            <Bubble
                {...props}
                renderTime={renderTime}
                renderTicks={() => null}
                renderMessageImage={() => null}
                textStyle={{
                    left: { fontSize: 16, color: '#000000' },
                    right: { fontSize: 16, color: '#FFFFFF' }
                }}
                wrapperStyle={{
                    left: {
                        elevation: 0,
                        marginTop: 0.5,
                        paddingVertical: 3,
                        backgroundColor: '#EEEEEE'

                    },
                    right: {
                        elevation: 0,
                        marginTop: 0.5,
                        paddingVertical: 3,
                        backgroundColor: '#FFB629'
                    }
                }}
            />
        );
    };

    const renderInputToolbar = (props) => (
        <InputToolbar
            {...props}
            containerStyle={{
                backgroundColor: '#fff',
                borderColor: '#737373',
                shadowOpacity: 0.5,
                shadowRadius: 2,
                shadowOffset: {
                    height: 0,
                    width: 0
                },
                elevation: 2,
                width: WIDTH - 20,
                //height: Platform.OS === "android" ? 0 : 50,
                flex: Platform.OS === "android" ? 1 : 0,
                borderRadius: 15,
                borderTopWidth: 0,
                paddingVertical: 3,
                marginTop: 15,
                marginBottom: 15,
                marginHorizontal: 10,
                justifyContent: 'center',
                alignItems: 'center',
                bottom: 0
            }}
            renderComposer={(props) => (
                <Composer
                    {...props}
                    multiline={true}
                    composerHeight={"auto"}
                    placeholder={'Write Something here'}
                    textInputStyle={{
                        paddingHorizontal: 15,
                        marginLeft: 7,
                        marginRight: 5,
                        lineHeight: 20,
                        fontSize: 16,
                        color: "#000000",
                    }}
                />
            )}
            renderActions={(props) => (
                <></>
                // <TouchableOpacity>
                // 	<Image
                // 		source={require('../../../assets/Images/addicon.png')}
                // 		style={{ width: 25, height: 25, marginLeft: 10, marginBottom: 10 }}
                // 	/>
                // </TouchableOpacity>
                /* <Actions
                    {...props}
                    icon={() => (
                        <Image
                            source={require('../../../assets/Images/addicon.png')}
                            style={{ width: 25, height: 25, marginLeft: 10 }}
                        />
                    )}
                /> */
            )}
            renderSend={(props) => (
                <Send {...props} containerStyle={{ justifyContent: 'center' }}>
                    <Image
                        source={IMAGE.SEND}
                        style={{ width: 25, height: 25, marginRight: 15, tintColor: COLOR.DEFALUTCOLOR }}
                    />
                </Send>
            )}
        />
    );

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: COLOR.BACKGROUNDCOLOR }}>
            <StatusBar hidden={false} translucent={false} backgroundColor={COLOR.STATUSBARCOLOR} barStyle={Platform.OS === 'ios' ? KEY.DARK_CONTENT : KEY.DARK_CONTENT} />
            <View style={styles.headerstyle}>
                <View style={{ justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row', marginTop: 20 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', marginLeft: 20 }}>
                        <TouchableOpacity onPress={() => props.navigation.goBack(null)}>
                            <AntDesign name='arrowleft' color='#000000' size={24} />
                        </TouchableOpacity>
                        <Image
                            source={{ uri: MemberDetails ? MemberDetails.profilepic !== null && MemberDetails.profilepic ? MemberDetails.profilepic : noProfile : noProfile }}
                            style={{ width: 50, height: 52, borderRadius: 100, marginLeft: 5 }}
                        />
                        <View style={{ justifyContent: 'flex-start', alignItems: 'flex-start', flexDirection: 'column', marginLeft: 10 }}>
                            <Text style={{ fontSize: 18, color: '#000000', textTransform: 'capitalize' }}>
                                {MemberDetails && MemberDetails.fullname.split(' ')[0]}
                            </Text>
                        </View>
                    </View>
                    <View style={{ justifyContent: 'flex-end', marginRight: 20 }}>
                        <TouchableOpacity onPress={() => props.navigation.navigate(SCREEN.HOMESCREEN)}>
                            <Image source={IMAGE.HAPPY_ICON} style={{ height: 30, width: 30 }} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <View style={{ flex: 1 }}>
                <GiftedChat
                    keyboardShouldPersistTaps={'always'}
                    user={{ _id: sender }}
                    isAnimated={true}
                    messages={messages}
                    onSend={onSend}
                    renderAvatar={null}
                    alwaysShowSend={true}
                    renderBubble={(props) => renderBubble(props, navigation)}
                    minInputToolbarHeight={80}
                    renderInputToolbar={renderInputToolbar}
                />
            </View>
            {loading ? <Loader /> : null}
        </SafeAreaView >
    )
}

export default ChatScreen;