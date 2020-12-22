// @flow
/*
    Pillar Wallet: the personal data locker
    Copyright (C) 2019 Stiftung Pillar Project

    This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation; either version 2 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License along
    with this program; if not, write to the Free Software Foundation, Inc.,
    51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
*/

import { Animated, Easing } from 'react-native';
import { NavigationScreenProp } from 'react-navigation';
import { getThemeByType, getThemeColors } from 'utils/themes';
import { DARK_THEME } from 'constants/appSettingsConstants';

export const StackNavigatorModalConfig = {
  transitionConfig: () => ({
    transitionSpec: {
      duration: 0,
      timing: Animated.timing,
      easing: Easing.step0,
    },
  }),
  defaultNavigationOptions: {
    header: null,
  },
};

export const StackNavigatorConfig = {
  defaultNavigationOptions: {
    header: null,
    gesturesEnabled: true,
  },
  cardStyle: {
    backgroundColor: {
      dark: getThemeColors(getThemeByType(DARK_THEME)).basic070,
      light: getThemeColors(getThemeByType()).basic070,
    },
  },
};

export const hideTabNavigatorOnChildView = ({ navigation }: NavigationScreenProp<*>) => {
  const tabBarVisible = navigation.state.index < 1;
  return {
    tabBarVisible,
    animationEnabled: true,
  };
};
