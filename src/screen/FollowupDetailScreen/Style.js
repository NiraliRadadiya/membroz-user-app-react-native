import React from 'react';
import {
  StyleSheet, Dimensions
} from 'react-native';
import * as COLOR from '../../styles/colors';
import * as FONT from '../../styles/typography';
import * as KEY from '../../context/actions/key';

const HEIGHT = Dimensions.get('window').height;
const WIDTH = Dimensions.get('window').width;

const styles = StyleSheet.create({
  touchStyle: {
    width: 60,
    height: 60,
    alignItems: KEY.CENTER,
    justifyContent: KEY.CENTER,
    borderRadius: 100,
    marginRight: 20,
    backgroundColor: COLOR.DEFALUTCOLOR
  },
  floatImage: {
    resizeMode: KEY.CONTAIN,
    width: 15,
    height: 15,
    tintColor: COLOR.WHITE
  },
  textTitle: {
    textTransform: KEY.CAPITALIZE,
    color: COLOR.LIGHT_BLACK,
    fontWeight: FONT.FONT_WEIGHT_BOLD,
    fontSize: FONT.FONT_SIZE_20
  },
  textDate: {
    textTransform: KEY.UPPERCASE,
    color: COLOR.LIGHT_BLACK,
    fontWeight: FONT.FONT_WEIGHT_BOLD,
    fontSize: FONT.FONT_SIZE_20
  },
  textEmail: {
    color: COLOR.LIGHT_BLACK,
    fontWeight: FONT.FONT_WEIGHT_BOLD,
    fontSize: FONT.FONT_SIZE_20
  },
  textsub: {
    textTransform: KEY.CAPITALIZE,
    color: COLOR.MENU_TEXT_COLOR,
    fontSize: FONT.FONT_SIZE_18
  },
  listTab: {
    backgroundColor: COLOR.WHITE,
    marginTop: 10,
    borderRadius: 20,
    flexDirection: KEY.ROW
  },
  btnTab: {
    flexDirection: KEY.ROW,
    width: "50%",
    padding: 10,
    justifyContent: KEY.CENTER
  },
  tabText: {
    fontSize: FONT.FONT_SIZE_18,
    fontWeight: FONT.FONT_WEIGHT_BOLD,
    textTransform: KEY.CAPITALIZE,
    color: COLOR.LIGHT_BLACK
  },
  tabTextActive: {
    fontSize: FONT.FONT_SIZE_18,
    fontWeight: FONT.FONT_WEIGHT_BOLD,
    textTransform: KEY.CAPITALIZE,
    color: COLOR.DEFALUTCOLOR

  },
  tabActive: {
    borderBottomColor: COLOR.DEFALUTCOLOR,
    borderBottomWidth: 3
  },
});

export default styles;