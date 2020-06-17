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

import * as React from 'react';
import { Animated } from 'react-native';
import { WebView } from 'react-native-webview';
import ContainerWithHeader from 'components/Layout/ContainerWithHeader';
import { WALLETCONNECT } from 'constants/navigationConstants';
import { manageStoriesSeenStateAction } from 'actions/storiesActions';
import { connect } from 'react-redux';
import styled from 'styled-components/native';

import type { NavigationScreenProp } from 'react-navigation';

type Props = {
  navigation: NavigationScreenProp<*>,
  manageStoriesSeenState: (storyId: string) => void,
};

type State = {
  canShowStories: boolean,
  overlayOpacity: Animated.Value,
};


const Wrapper = styled.View`
  flex: 1;
  position: relative;
`;

const PreviewOverlay = styled.Image`
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
`;

const AnimatedPreviewOverlay = Animated.createAnimatedComponent(PreviewOverlay);


const getMessage = (json) => {
  let messageObj = null;
  try {
    messageObj = JSON.parse(json);
  } catch (e) {
    //
  }
  return messageObj;
};

const initStoriesInWebView = (index) => (`
  try {
    startSwiperStories(${index})
  } catch(e) {
    window.ReactNativeWebView.postMessage(JSON.stringify({ error: true}));
    true;
  }
  true;
`);

class StoryFrame extends React.Component<Props, State> {
  webRef: WebView;

  state = {
    canShowStories: false,
    overlayOpacity: new Animated.Value(1),
  };

  componentDidMount() {

  }

  handleMessage = (json) => {
    const { navigation } = this.props;
    const storyIndex = navigation.getParam('storyIndex');
    const messageObj = getMessage(json);
    if (!messageObj) return;

    const {
      actionKey,
      seenStoryId,
      swiperInit,
      storiesStart,
      storiesEnd,
    } = messageObj;

    if (actionKey) this.handleInAppNavigation(actionKey);
    if (seenStoryId) this.handleStorySeenState(seenStoryId);
    if (swiperInit) this.adjustSwipersInitSlide(storyIndex);
    if (storiesStart) this.handleStoriesStart();
    if (storiesEnd) this.handleStoriesEnd();
  };

  handleStoriesStart = () => {
    const { overlayOpacity } = this.state;
    Animated.timing(
      overlayOpacity,
      {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      },
    ).start(() => this.setState({ canShowStories: true }));
  };

  handleStoriesEnd = () => {
    const { navigation } = this.props;
    navigation.dismiss();
  };

  adjustSwipersInitSlide = (storyIndex: number) => {
    if (!this.webRef) return;
    this.webRef.injectJavaScript(initStoriesInWebView(storyIndex));
  };

  handleStorySeenState = (storyId: string) => {
    const { manageStoriesSeenState } = this.props;
    manageStoriesSeenState(storyId);
  };

  handleInAppNavigation = (actionKey: string) => {
    const { navigation } = this.props;
    switch (actionKey) {
      case 'WALLET_CONNECT':
        return navigation.navigate(WALLETCONNECT);
      default:
        return null;
    }
  };

  render() {
    const { canShowStories, overlayOpacity } = this.state;
    const { navigation } = this.props;
    const story = navigation.getParam('story', {});
    const { imageLarge } = story;

    return (
      <ContainerWithHeader
        headerProps={{
          floating: true,
          rightItems: [{ close: true }],
          noBack: true,
        }}
      >
        <Wrapper>
          {!!imageLarge && !canShowStories &&
          <AnimatedPreviewOverlay source={{ uri: imageLarge }} style={{ opacity: overlayOpacity }} />
          }
          <WebView
            ref={ref => { this.webRef = ref; }}
            source={{ uri: 'http://pillar-stories.dev.imas.lt/' }}
            originWhitelist={['*']}
            onMessage={event => {
              this.handleMessage(event.nativeEvent.data);
            }}
            mediaPlaybackRequiresUserAction={false}
            allowsInlineMediaPlayback
            // onHttpError={syntheticEvent => {
            //   const { nativeEvent } = syntheticEvent;
            //   console.warn(
            //     nativeEvent.statusCode,
            //   );
            // }}
            style={{ flex: 1 }}
            incognito
            cacheEnabled={false}
          />
        </Wrapper>
      </ContainerWithHeader>
    );
  }
}

const mapDispatchToProps = (dispatch: Function) => ({
  manageStoriesSeenState: (storyId) => dispatch(manageStoriesSeenStateAction(storyId)),
});

export default connect(null, mapDispatchToProps)(StoryFrame);

