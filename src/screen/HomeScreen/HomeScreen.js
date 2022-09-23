import {
  SafeAreaView, ScrollView,
  View,
  Text,
  ImageBackground,
  Dimensions,
  Image,
  TouchableOpacity,
  FlatList,
  StatusBar, Modal, Button,
  Platform, Alert, Linking, Share
} from 'react-native';
import { getByIdUserService, patchUserService } from '../../services/UserService/UserService';
import { NotificationService } from '../../services/NotificationService/NotificationService';
import { REMOTEDATA, MESSAGINGSENDERID, DEFAULTPROFILE } from '../../context/actions/type';
import * as AttendanceService from '../../services/AttendanceService/AttendanceService';
import PushNotificationIOS from "@react-native-community/push-notification-ios";
import { GalleryService } from '../../services/GalleryService/GalleryService';
import * as LocalService from '../../services/LocalService/LocalService';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-community/async-storage';
import MyPermissionController from '../../helpers/appPermission';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import PushNotification from "react-native-push-notification";
import crashlytics from "@react-native-firebase/crashlytics";
import * as SCREEN from '../../context/screen/screenName';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import messaging from '@react-native-firebase/messaging';
import NetInfo from "@react-native-community/netinfo";
import Loader from '../../components/loader/index';
import React, { useEffect, useState } from 'react';
import DeviceInfo from 'react-native-device-info';
import firebase from '@react-native-firebase/app';
import * as KEY from '../../context/actions/key';
import * as FONT from '../../styles/typography';
import RNExitApp from 'react-native-exit-app';
import Toast from 'react-native-simple-toast';
import * as COLOR from '../../styles/colors';
import * as IMAGE from '../../styles/image';
import moment from 'moment-timezone';
import styles from './HomeStyle';
import { getDashboard } from '../../services/HomeService/HomeService';
//import moment from 'moment';

//STATIC VARIABLE
const HEIGHT = Dimensions.get('window').height;
const WIDTH = Dimensions.get('window').width;

//STATIC DATA
let MenuDefaultArray = [
  { "menuname": "freshlead", "title": "Fresh Call", "screenname": "FreshLeadScreen", "colorcode": "#2AAA63", "imageurl": IMAGE.PHONE_WITH_WIRE, "height": 20, "width": 20 },
  { "menuname": "followup", "title": "Follow Up", "screenname": "FollowupScreen", "colorcode": "#FF4D4D", "imageurl": IMAGE.CLOCK, "height": 20, "width": 20 },
  { "menuname": "meeting", "title": "Meeting", "screenname": "MeetingScreen", "colorcode": "#007AFF", "imageurl": IMAGE.IC_GROUP, "height": 20, "width": 20 },
  { "menuname": "mylead", "title": "My Lead", "screenname": "MyLeadScreen", "colorcode": "#B366FF", "imageurl": IMAGE.PORTFOLIO, "height": 20, "width": 20 },
  { "menuname": "attendance", "title": "Attendance", "screenname": "AttendanceScreen", "colorcode": "#CFD13B", "imageurl": IMAGE.ATTENDANCE_ICON, "height": 20, "width": 20 },
  { "menuname": "calender", "title": "Calender", "screenname": "CalendarScreen", "colorcode": "#FF8D7F", "imageurl": IMAGE.CALENDER_ICON, "height": 20, "width": 20 },
  { "menuname": "booking", "title": "Book a Holiday", "screenname": "MyBookingScreen", "colorcode": "#FCD138", "imageurl": IMAGE.IC_LIBRARY, "height": 20, "width": 20 },
  { "menuname": "appointment", "title": "My Appointment", "screenname": "AppointmentScreen", "colorcode": "#F2542C", "imageurl": IMAGE.ATTENDANCE_ICON, "height": 20, "width": 20 },
  { "menuname": "event", "title": "Event", "screenname": "EventScreen", "colorcode": "#C889F2", "imageurl": IMAGE.IC_EVENT, "height": 20, "width": 20 },
  { "menuname": "salary", "title": "My Salary", "screenname": "SalaryScreen", "colorcode": "#4B9E47", "imageurl": IMAGE.PAYMENT_ICON, "height": 20, "width": 23 },
  { "menuname": "leave", "title": "My Leave", "screenname": "LeaveScreen", "colorcode": "#91479E", "imageurl": IMAGE.IC_PRESCRIPTION, "height": 20, "width": 20 },
  { "menuname": "timesheet", "title": "Timesheet", "screenname": "TimesheetScreen", "colorcode": "#757FD9", "imageurl": IMAGE.TIMELINEICON, "height": 20, "width": 20 },
  { "menuname": "claim", "title": "My Claim", "screenname": "MyClaimScreen", "colorcode": "#EB4034", "imageurl": IMAGE.CLAIMICON, "height": 20, "width": 20 },
  { "menuname": "announcement", "title": "Announcement", "screenname": "AnnouncementScreen", "colorcode": "#CFD03B", "imageurl": IMAGE.NOTICE_OUTLINE, "height": 20, "width": 20 },
  { "menuname": "team", "title": "Team", "screenname": "MyTeamScreen", "colorcode": "#0099EB", "imageurl": IMAGE.IC_GROUP, "height": 20, "width": 20 },
  { "menuname": "support", "title": "Support", "screenname": "SupportScreen", "colorcode": "#F9C688", "imageurl": IMAGE.SUPPORT_ICON, "height": 25, "width": 14 },
  { "menuname": "referfriend", "title": "Refer a Friend", "screenname": "ReferFriendScreen", "colorcode": "#9E7347", "imageurl": IMAGE.REFERICON, "height": 20, "width": 20 },
  { "menuname": "chat", "title": "Chat", "screenname": "ChatScreenHistory", "colorcode": "#5F1844", "imageurl": IMAGE.CHAT_ICON, "height": 23, "width": 23, },
];

//HOME SCREEN FUNCTION
const HomeScreen = (props) => {
  const [loading, setloading] = useState(true);
  const [backgroungImage, setBackgroungImage] = useState(null);
  const [mobileapppermissions, setMobileAppperMissions] = useState(null);
  const [scanIconVisible, setScanIconVisible] = useState(false);
  const [sharedIconVisible, setSharedIconVisible] = useState(false);
  const [notificationIconVisible, setNotificationIconVisible] = useState(false);
  const [notification, setNotification] = useState(0);
  const [userDesignation, setUserDesignation] = useState(null);
  const [userName, setUserName] = useState(null);
  const [userID, setUserID] = useState(null);
  const [userProfilePic, setUserProfilePic] = useState(null);
  const [photoCounter, setPhotoCounter] = useState(0);
  const [shareusAndroid, setSharesAndroid] = useState(null);
  const [shareusIos, setShareUsIos] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [todayAttendTime, setTodayAttendTime] = useState(null);
  const [timerShow, setTimerShow] = useState(false);
  const [interNetStatus, setInterNetStatus] = useState(false);
  const [visibleModel, setVisibleModel] = useState(false);
  const [freshCallCounter, setFreshCallCounter] = useState(0);
  const [followupCounter, setFollowupCounter] = useState(0);
  const [meetingCounter, setMeetingCounter] = useState(0);
  const [myLeadCounter, setMyLeadCounter] = useState(0);

  let currentTime = moment();
  let checkinTime = moment(todayAttendTime && todayAttendTime.checkin);
  let checkoutTime = moment(todayAttendTime && todayAttendTime.checkout);
  let duration = moment.duration(currentTime.diff(checkinTime));
  let finalcal = moment.utc(duration.as('milliseconds')).format('HH:mm:ss');

  let currentTimefinal = moment(todayAttendTime && todayAttendTime.checkout);
  let durationtime = moment.duration(currentTimefinal.diff(checkinTime));
  let totalTime = moment.utc(durationtime.as('milliseconds')).format('HH:mm:ss');
  let finalcalbreaktime = moment.duration(currentTime.diff(checkoutTime)).asMinutes();
  const [dt, setDt] = useState(moment.utc(duration.as('milliseconds')).format('HH:mm:ss'));
  let getuserid, appVersionCode, androidUrl, iosUrl;

  useFocusEffect(
    React.useCallback(() => {
      const getCallBackScreen = async () => {
        var userInfo = await LocalService.LocalStorageService();
        getuserid = userInfo?._id;
        await RemoteController();
        setUserDesignation(userInfo?.designationid?.title.substring(0, 15));
        setUserName(userInfo?.fullname.substring(0, 15));
        setUserID(userInfo?._id);
        getNotification(userInfo?._id);
        getCheckinTime(userInfo?._id);
        setUserProfilePic(userInfo?.profilepic);
        getDashboardDetails(userInfo?._id, userInfo?.branchid?._id);
        // await getAppVersion(appVersionCode);
      }
      getCallBackScreen();
    }, [])
  );

  useEffect(() => {
    inetrnetChecker();
    // CHECK REMOTECONTROLLER USE TO AUTOCONFIG APP
    RemoteController();
    getUserDeatilsLocalStorage();
    getGalleryImages();
  }, []);

  useEffect(() => {
  }, [loading, backgroungImage, scanIconVisible, sharedIconVisible, notificationIconVisible, photoCounter,
    todayAttendTime, timerShow, mobileapppermissions, notification, userDesignation, userName, userID,
    timerShow, userProfilePic, shareusAndroid, shareusIos, userInfo, interNetStatus, visibleModel, freshCallCounter,
    followupCounter, meetingCounter, myLeadCounter
  ])

  //Get CheckIn time
  const getCheckinTime = async (userid) => {
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    let data = {
      date: today,
      id: userid,
    }
    try {
      const checkindatetime = await AttendanceService.getTodayAttendenceService(data);
      if (checkindatetime.data && checkindatetime.data.length > 0) {
        setTodayAttendTime(checkindatetime.data[0]);
        if (checkindatetime.data[0] && checkindatetime.data[0].property &&
          checkindatetime.data[0].property.mode === 'checkin') {
          setTimerShow(true);
          let secTimer = setInterval(() => {
            setDt(new Date().toLocaleString())
          }, 100)
          return () => clearInterval(secTimer);
        } else {
          setTimerShow(false);
        }
      }
    } catch (error) {
      firebase.crashlytics().recordError(error);
      console.log(`error`, error);
    }
  }

  //check permission Function
  const checkPermission = () => {
    setTimeout(
      () => {
        MyPermissionController.checkAndRequestStoragePermission()
          .then((granted) => { })
          .catch((err) => console.log(err))
      },
      500
    );
  }

  //TIME OUT FUNCTION
  const wait = (timeout) => {
    return new Promise(resolve => {
      setTimeout(resolve, timeout);
    });
  }

  // REMOTECONTROLLER USE TO AUTOCONFIG APP
  const RemoteController = async () => {
    var getUser = await AsyncStorage.getItem(REMOTEDATA);
    var userData = JSON.parse(getUser);
    if (userData) {
      setBackgroungImage(userData.homeimage);
      setScanIconVisible(userData.scanicon);
      setSharedIconVisible(userData.sharedicon);
      setNotificationIconVisible(userData.notificationicon);
      setSharesAndroid(userData.playstoreid);
      setShareUsIos(userData.appstoreid);
      if (Platform.OS === KEY.IOS) {
        appVersionCode = userData.appstoreversioncode;
      } else {
        appVersionCode = userData.appversioncode;
      }
      androidUrl = userData.playstoreid;
      iosUrl = userData.appstoreid;
    };
  };

  //GET USER DATA IN MOBILE LOCAL STORAGE
  const getUserDeatilsLocalStorage = async () => {
    var userInfo = await LocalService.LocalStorageService();
    if (userInfo) {
      moment.tz.setDefault(userInfo?.branchid?.timezone);
      getuserid = userInfo?._id;
      getDashboardDetails(userInfo?._id, userInfo?.branchid?._id);
      setUserInfo(userInfo);
      setUserDesignation(userInfo?.designationid?.title.substring(0, 15));
      setUserName(userInfo?.fullname.substring(0, 15));
      setUserID(userInfo?._id);
      getUserDeatils(userInfo?._id);
      getCheckinTime(userInfo?._id);
      getNotification(userInfo?._id);
      setUserProfilePic(userInfo?.profilepic);
      PushNotifications();
      MenuPermission();
      await getAppVersion(appVersionCode);
      wait(1000).then(() => {
        setloading(false);
      });
    }
  }

  //GET USER DATA USEING API CALL
  const getUserDeatils = async (id) => {
    if (interNetStatus) {
      try {
        const response = await getByIdUserService(id);
        if (response.data != null && response.data != 'undefind' && response.status == 200) {
          if (response.data.message === 'You do not have permission') {
            setloading(false);
            LocalService.RemoveAuthenticateUser();
            props.navigation.replace(SCREEN.AUTH);
          } else {
            Toast.show('Welcome', Toast.SHORT);
            LocalService.AuthenticateUser(response.data);
          }
        }
      } catch (error) {
        setloading(false);
        firebase.crashlytics().recordError(error);
        //LocalService.RemoveAuthenticateUser();
        props.navigation.replace(SCREEN.AUTH);
      }
    }
  }

  //GET IMAGE GALLERY COUNT API DATA GET
  const getGalleryImages = async () => {
    try {
      const response = await GalleryService();
      if (response.data != null && response.data != 'undefind' && response.status == 200) {
        setDashBoard(response.data);
      }
    } catch (error) {
      setloading(false);
      firebase.crashlytics().recordError(error);
    }
  }

  //GET DASHBOARD DETAILS COUNT API DATA GET
  const getDashboardDetails = async (userID, branchID) => {
    var today = new Date();
    let startDateTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
    let endDateTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
    let date = { startdate: startDateTime, enddate: endDateTime };
    try {
      const response = await getDashboard(userID, branchID, date);
      if (response.data != null && response.data != 'undefind' && response.status == 200) {
        setFreshCallCounter(response.data[0].freshcall);
        setFollowupCounter(response.data[0].followup);
        setMeetingCounter(response.data[0].meeting);
        setMyLeadCounter(response.data[0].mylead);
      }
    } catch (error) {
      setloading(false);
      firebase.crashlytics().recordError(error);
    }
  }

  //CHECK MENU PERMISSION FUNCTION
  const MenuPermission = async () => {
    var userInfo = await LocalService.LocalStorageService();
    if (userInfo) {
      let mobileapppermissions = userInfo.role.mobileapppermissions;
      let finalMenuPermission = [];
      MenuDefaultArray.forEach(menuEle => {
        mobileapppermissions.forEach(MobileEle => {
          if (menuEle.menuname === MobileEle) {
            finalMenuPermission.push(menuEle)
          }
        });
      });
      setMobileAppperMissions(finalMenuPermission);
    }
  }

  //GET IMAGE GALLERY COUNT API DATA GET
  const getNotification = async (id) => {
    try {
      const response = await NotificationService(id);
      setNotification(response.data.length);
    } catch (error) {
      setloading(false);
      firebase.crashlytics().recordError(error);
    }
  }

  //MENU RENDER FUNCTION
  const renderMenu = (item) => (
    <TouchableOpacity onPress={() => props.navigation.navigate(item.item.screenname)} style={{ marginBottom: 5 }}>
      <View style={WIDTH <= 420 ? styles(item.item.colorcode).viewSquareTwoColumn : styles(item.item.colorcode).viewSquareThreeColumn}>
        <View style={{
          height: 40, width: 40, marginBottom: 10, backgroundColor: item.item.colorcode, borderRadius: 100,
          justifyContent: KEY.CENTER, alignItems: KEY.CENTER, marginTop: 15, marginLeft: 20
        }}>
          <Image source={item.item.imageurl} style={{ height: item.item.height, width: item.item.width }} />
        </View>
        {item.item.menuname === "freshlead" &&
          <Text numberOfLines={1} style={{
            flex: 1, fontSize: FONT.FONT_SIZE_16, marginLeft: 20,
            fontWeight: FONT.FONT_WEIGHT_BOLD, color: COLOR.MENU_TEXT_COLOR
          }}>{(item.item.title) + ' ' + (`(${freshCallCounter})`)}</Text>
        }
        {item.item.menuname === "followup" &&
          <Text numberOfLines={1} style={{
            flex: 1, fontSize: FONT.FONT_SIZE_16, marginLeft: 20,
            fontWeight: FONT.FONT_WEIGHT_BOLD, color: COLOR.MENU_TEXT_COLOR
          }}>{(item.item.title) + ' ' + (`(${followupCounter})`)}</Text>
        }
        {item.item.menuname === "meeting" &&
          <Text numberOfLines={1} style={{
            flex: 1, fontSize: FONT.FONT_SIZE_16, marginLeft: 20,
            fontWeight: FONT.FONT_WEIGHT_BOLD, color: COLOR.MENU_TEXT_COLOR
          }}>{(item.item.title) + ' ' + (`(${meetingCounter})`)}</Text>
        }
        {item.item.menuname === "mylead" &&
          <Text numberOfLines={1} style={{
            flex: 1, fontSize: FONT.FONT_SIZE_16, marginLeft: 20,
            fontWeight: FONT.FONT_WEIGHT_BOLD, color: COLOR.MENU_TEXT_COLOR
          }}>{(item.item.title) + ' ' + (`(${myLeadCounter})`)}</Text>
        }
        {item.item.menuname != "freshlead" && item.item.menuname != "followup" && item.item.menuname != "meeting" && item.item.menuname != "mylead" &&
          <Text numberOfLines={1} style={{
            flex: 1, fontSize: FONT.FONT_SIZE_16, marginLeft: 20,
            fontWeight: FONT.FONT_WEIGHT_BOLD, color: COLOR.MENU_TEXT_COLOR
          }}>{item.item.title}</Text>
        }
      </View>
    </TouchableOpacity>
  )

  //PUSHNOTIFICATION BACKGROUND FUNCTION
  const PushNotifications = async () => {
    let fcmToken = await firebase.messaging().getToken();
    if (fcmToken != undefined) {
      getFcmToken(fcmToken);
    }
    //PUSH NOTIFICATION FUNCTION
    PushNotification.configure({
      // (optional) Called when Token is generated (iOS and Android)
      onRegister: function (token) {
        //console.log(`token.token`, token.token)
        //getFcmToken(token.token)
      },

      // (required) Called when a remote is received or opened, or local notification is opened
      onNotification: function (notification) {
        // process the notification
        // (required) Called when a remote is received or opened, or local notification is opened
        if (notification.foreground) {
          notification.data = {
            message: notification.message,
            title: notification.title
          }
          //   console.log("NOTIFICATION:", notification);
          notification.finish(PushNotificationIOS.FetchResult.NoData);
        }
      },

      // (optional) Called when Registered Action is pressed and invokeApp is false, if true onNotification will be called (Android)
      onAction: function (notification) {
        // console.log("ACTION:", notification.action);
        // console.log("NOTIFICATION:", notification);

        // process the action
      },

      // (optional) Called when the user fails to register for remote notifications. Typically occurs when APNS is having issues, or the device is a simulator. (iOS)
      onRegistrationError: function (err) {
        console.error(err.message, err);
      },

      // IOS ONLY (optional): default: all - Permissions to register.
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },

      // Should the initial notification be popped automatically
      // default: true
      senderID: MESSAGINGSENDERID,
      popInitialNotification: true,

      /**
       * (optional) default: true
       * - Specified if permissions (ios) and token (android and ios) will requested or not,
       * - if not, you must call PushNotificationsHandler.requestPermissions() later
       * - if you are not using remote notification or do not have Firebase installed, use this:
       *     requestPermissions: Platform.OS === 'ios'
       */
      requestPermissions: true,
    });
  }

  //GET MESSAGE TOKEN
  const getFcmToken = async (fcmToken) => {
    let uniqueId;
    let deviceInfo;
    if (Platform.OS === 'android') {
      uniqueId = await DeviceInfo.getAndroidId()
      if (fcmToken) {
        deviceInfo = {
          anroiddevice: {
            "deviceid": uniqueId,
            "registrationid": fcmToken
          }
        }
        await UserPatch(deviceInfo);
      }
    } else {
      uniqueId = await DeviceInfo.getUniqueId();
      if (fcmToken) {
        deviceInfo = {
          iosdevice: {
            "deviceid": uniqueId,
            "registrationid": fcmToken
          }
        }
        await UserPatch(deviceInfo);
      }
    }
  }

  //UPDATE USER INFORMATION API CALL
  const UserPatch = async (deviceInfo) => {
    try {
      const response = await patchUserService(getuserid, deviceInfo);
      if (response.data != null && response.data != 'undefind' && response.status == 200) {
        console.log(`UPDATE DONE`);
      }
    }
    catch (error) {
      firebase.crashlytics().recordError(error);
    }
  }

  //ALERT BUTTON APP VERSIONCODE
  const checkAlertResponse = () =>
    Alert.alert(
      "Warning",
      Platform.OS === KEY.IOS ?
        "Please Update the app in App store otherwise cancel to close app."
        : "Please Update the app in Play store otherwise cancel to close app.",
      [
        {
          text: "Close",
          onPress: () => {
            if (Platform.OS === KEY.IOS) {
              RNExitApp.exitApp();
            } else {
              RNExitApp.exitApp();
            }
          }
        },
        {
          text: "Update Now", onPress: () => {
            if (Platform.OS === KEY.IOS) {
              Linking.openURL(`itms-apps://apps.apple.com/id/app/${iosUrl}`);
            } else {
              Linking.openURL(`market://details?id=${androidUrl}`);
            }
          }
        }
      ]
    );

  //CHECK APP VERSIONCODE
  const getAppVersion = (value) => {
    const appVersionCode = DeviceInfo.getVersion();
    if (appVersionCode != value) {
      return checkAlertResponse();
    }
  }

  //SHARE BUTTON CLICK
  const onPressShareButton = async () => {
    try {
      const result = await Share.share({
        title: 'App link',
        message: `Please install this app and stay safe , AppLink :https://play.google.com/store/apps/details?id=${androidUrl}&hl=en`,
        url: `https://play.google.com/store/apps/details?id=${androidUrl}&hl=en`
      });
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error) {
      alert(error.message);
    }
  }

  //LogOut Button click to call
  const onPressLogout = () => {
    Alert.alert(
      `${todayAttendTime?.property?.mode == 'checkin' ? 'Check out' : 'Check in'}`,
      `Are you sure you want to ${todayAttendTime?.property?.mode == 'checkin' ? 'check out' : 'check in'}`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: `${todayAttendTime?.property?.mode == 'checkin' ? 'check out' : 'check in'}`, onPress: () => {
            props.navigation.navigate(SCREEN.SCANNERSCREEN, { item: todayAttendTime });
            checkPermission();
          }
        }
      ]
    );
  }

  //Scan icon in check day in time
  const checkDayInTime = () => {
    if (todayAttendTime) {
      onPressLogout()
    } else {
      props.navigation.navigate(SCREEN.SCANNERSCREEN, { item: todayAttendTime })
    }
  }

  //VIEW PROFILE PICTURE
  const onTouchViewProfile = () => {
    let viewimage = userProfilePic ? userProfilePic : DEFAULTPROFILE;
    props.navigation.navigate(SCREEN.VIEWIMAGESCREEN, { viewimage });
  }

  //INTERNER CHECKER FUNCTION
  const inetrnetChecker = () => {
    NetInfo.fetch().then(state => {
      setInterNetStatus(state.isConnected);
      setVisibleModel(state.isConnected === false ? true : false);
    });
  }

  //MODEL POPUP OPEN IN TRY AGAIN CLICK TO CALL
  const onRetry = () => {
    setloading(true);
    RemoteController();
    getUserDeatilsLocalStorage();
    getGalleryImages();
    setVisibleModel(false);
    inetrnetChecker();
  }

  return (
    !visibleModel ?
      <SafeAreaView style={{ flex: 1, alignItems: KEY.CENTER, backgroundColor: COLOR.BACKGROUNDCOLOR }}>
        <StatusBar hidden={false} translucent={true} backgroundColor={COLOR.DEFALUTCOLOR} barStyle={KEY.DARK_CONTENT} />
        <ImageBackground source={backgroungImage ? { uri: backgroungImage } : IMAGE.BACKGROUND_IMAGE} resizeMode={KEY.COVER} style={{ width: WIDTH, height: HEIGHT }}>
          <View style={{ justifyContent: !scanIconVisible ? KEY.FLEX_END : KEY.SPACEBETWEEN || !sharedIconVisible ? KEY.SPACEBETWEEN : KEY.FLEX_END, alignItems: KEY.CENTER, flexDirection: KEY.ROW, marginTop: Platform.OS === KEY.IOS ? 25 : 35 }}>
            {
              scanIconVisible &&
              <TouchableOpacity onPress={() => checkDayInTime()}
                style={{ justifyContent: KEY.FLEX_START, alignItems: KEY.FLEX_START, tintColor: COLOR.WHITE, marginLeft: 15, marginTop: 10 }}>
                <Icon name='qrcode-scan' size={28} color={COLOR.WHITE} />
              </TouchableOpacity>
            }
            {
              sharedIconVisible &&
              <TouchableOpacity onPress={() => onPressShareButton()}
                style={{ justifyContent: KEY.FLEX_START, alignItems: KEY.FLEX_START, marginLeft: !scanIconVisible ? WIDTH / 2 + 100 : WIDTH / 2 + 30, marginRight: !scanIconVisible ? 15 : 0, marginTop: !scanIconVisible ? 10 : 10 }}>
                <Ionicons name='share-social' size={30} color={COLOR.WHITE} />
              </TouchableOpacity>
            }
            {
              notificationIconVisible &&
              <TouchableOpacity onPress={() => props.navigation.navigate(SCREEN.NOTIFICATIONSCREEN)}
                style={{ justifyContent: KEY.FLEX_END, alignItems: KEY.FLEX_END, marginRight: 25, marginTop: !scanIconVisible ? 0 : -15 || !sharedIconVisible ? 0 : -15 }}>
                <Ionicons name='notifications-outline' size={30} color={COLOR.WHITE} />
                <View style={{ marginLeft: 0, marginBottom: !sharedIconVisible ? 0 : 0, marginTop: -40, height: 22, width: 22, borderRadius: 100, justifyContent: KEY.CENTER, alignItems: KEY.CENTER, backgroundColor: COLOR.NOTIFICATION_COLOR }}>
                  <Text style={{ fontWeight: FONT.FONT_WEIGHT_BOLD, fontSize: 12, color: COLOR.WHITE }}>{notification}</Text>
                </View>
              </TouchableOpacity>
            }
          </View>

          <View style={{ justifyContent: KEY.CENTER, alignItems: KEY.CENTER }}>
            <TouchableOpacity style={styles().viewPhoto} onPress={() => props.navigation.navigate(SCREEN.GALLERYSCREEN)}>
              <Image source={IMAGE.PICTURE_ICON} style={styles().picture_Icon_iconPhoto} />
              <Text style={{ color: COLOR.WHITE, marginTop: 0, marginLeft: 10 }}>{`${photoCounter}` + ' ' + 'Photos'} </Text>
              <Icon name='chevron-right' size={25} style={styles().arror_iconPhoto} />
            </TouchableOpacity>
          </View>

          <View style={styles().viewName}>
            <TouchableOpacity onPress={() => onTouchViewProfile(userProfilePic)} style={styles().viweRound}>
              <Image source={!userProfilePic ? IMAGE.USERPROFILE : { uri: userProfilePic }}
                style={!userProfilePic ? { height: 70, width: 70 } : { height: 95, width: 95, borderRadius: 100 }} />
            </TouchableOpacity>

            <View>
              <View style={{ flexDirection: KEY.COLUMN }}>
                <Text style={styles().text} numberOfLines={1}>{userName}</Text>
                <Text style={{ color: COLOR.MENU_TEXT_COLOR, fontSize: FONT.FONT_SIZE_16, marginLeft: 5, maxWidth: WIDTH / 2, }} numberOfLines={1}>{userDesignation}</Text>
              </View>
            </View>

            <View style={styles().viewLine} />
            <TouchableOpacity onPress={() => props.navigation.navigate(SCREEN.UPDATEPROFILESCREEN)}>
              <Image source={IMAGE.PENCIL_ICON_SIMPLE} style={{ height: 20, width: 20, tintColor: COLOR.DEFALUTCOLOR, margin: 8 }} />
            </TouchableOpacity>
          </View>

          <View style={styles().viewMain}>
            {timerShow &&
              <View style={styles().viewRectangle}>
                <View style={{ marginLeft: 15 }}>
                  <Ionicons name='ios-alarm-outline' size={40} color={COLOR.WHITE} style={{ marginTop: 15, alignItems: KEY.CENTER, marginLeft: -70, marginBottom: 15 }} />
                </View>
                <View style={{ flexDirection: KEY.COLUMN, marginLeft: -5 }}>
                  <Text style={styles().rectangleText}>Checkin Time</Text>
                  <Text style={{ fontSize: FONT.FONT_SIZE_14, textTransform: KEY.UPPERCASE }}>{moment(checkinTime).format('DD MMM YYYY, h:mm:ss a')}</Text>
                  <Text style={styles().rectangleText}>Total Time</Text>
                  {todayAttendTime && todayAttendTime.property && todayAttendTime.property.mode === 'checkout' ?
                    <Text style={{ fontSize: FONT.FONT_SIZE_14 }}>{totalTime}</Text>
                    :
                    <Text style={{ fontSize: FONT.FONT_SIZE_14 }}>{finalcal}</Text>
                  }
                </View>
                <View style={{ flex: 1, alignItems: KEY.FLEX_END, marginTop: 0 }}>
                  <TouchableOpacity style={styles().rectangleRound} onPress={() => onPressLogout()} >
                    <FontAwesome name='sign-out' size={45} color={COLOR.DEFALUTCOLOR} />
                    {/* <Text style={{ color: COLOR.WHITE, fontSize: FONT.FONT_SIZE_14, fontWeight: FONT.FONT_WEIGHT_BOLD }}>{todayAttendTime?.property?.mode == 'checkin' ? 'Check out' : 'Check in'}</Text> */}
                  </TouchableOpacity>
                </View>
              </View>
            }
            <FlatList
              style={{ marginTop: 15 }}
              data={mobileapppermissions}
              numColumns={WIDTH <= 420 ? 2 : 3}
              scrollEnabled={true}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item, index) => index.toString()}
              keyboardShouldPersistTaps={KEY.ALWAYS}
              renderItem={renderMenu}
              contentContainerStyle={{ paddingBottom: HEIGHT / 2 + 100, alignSelf: KEY.CENTER }}
            />
          </View>


        </ImageBackground>
        {loading ? <Loader /> : null}
      </SafeAreaView>
      :
      <SafeAreaView style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <StatusBar hidden={false} translucent={true} backgroundColor={COLOR.DEFALUTCOLOR} barStyle={KEY.DARK_CONTENT} />
        {/* message model Pop */}
        <Modal
          animationType='slide'
          transparent={true}
          visible={visibleModel}
          animationInTiming={600}
          onRequestClose={() => setVisibleModel(!visibleModel)}
        >
          <View style={{ alignItems: KEY.CENTER, flex: 1 }}>
            <View style={{ position: KEY.ABSOLUTE, bottom: 0 }}>
              <View style={styles().modalContainer}>
                <Text style={styles().modalTitle}>Connection Error</Text>
                <Text style={styles().modalText}>
                  Oops! your device is
                </Text>
                <Text style={styles().modalText}>
                  not connected to the Internet.
                </Text>
                <TouchableOpacity style={styles().button} onPress={() => onRetry()}>
                  <Text style={styles().buttonText}>Try Again</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
  );
}

export default HomeScreen;