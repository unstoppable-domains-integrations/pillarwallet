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
import { FlatList } from 'react-native';
import styled from 'styled-components/native';
import { withNavigation } from 'react-navigation';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';

import { spacing } from 'utils/variables';
import { STORY_FRAME } from 'constants/navigationConstants';
import { storiesWithSeenStateSelector } from 'selectors/stories';
import { fetchStoriesAction } from 'actions/storiesActions';

import type { NavigationScreenProp } from 'react-navigation';
import type { Dispatch, RootReducerState } from 'reducers/rootReducer';
import type { SeenStories, Story } from 'reducers/storiesReducer';

import StoryPreview from './StoryPreview';


type Props = {
  navigation: NavigationScreenProp<*>,
  seenStories: SeenStories,
  stories: Story[],
  fetchStories: () => void,
  children?: React.Node,
};

// type State = {
//   cardStateValue: Animated.Value,
//   showExtendedCard: boolean,
// };


const StoriesHolder = styled.View`
  width: 100%;
  position: relative;
  z-index: 1000;
`;

// const ChildrenWrapper = styled.View`
//   width: 108px;
//   height: 108px;
//   align-items: center;
//   justify-content: center;
//   z-index: 9999;
//   position: absolute;
// `;


class PillarStories extends React.Component<Props> {
  // state = {
  //   cardStateValue: new Animated.Value(0),
  //   showExtendedCard: false,
  // };

  componentDidMount() {
    const { fetchStories } = this.props;
    fetchStories();
  }

  handleStoryPress = (storyIndex, story) => {
    const { navigation } = this.props;
    navigation.navigate(STORY_FRAME, { storyIndex, story });
  };

  // animateCard = () => {
  //   this.setState({ showExtendedCard: true },() => {
  //     Animated.timing(this.state.cardStateValue, {
  //       toValue: 1,
  //       duration: 200,
  //     }).start();
  //   });
  // };

  renderStory = ({ item, index }) => {
    const {
      imagePreview,
      backgroundColor,
      title,
      titleColor,
      seen,
    } = item;

    // if (id === 'CHILDREN') {
    //   return (
    //     <ChildrenWrapper>
    //       {children}
    //     </ChildrenWrapper>
    //   )
    // }

    return (
      <StoryPreview
        image={imagePreview}
        backgroundColor={backgroundColor}
        title={title}
        titleColor={titleColor}
        onPress={() => this.handleStoryPress(index - 1, item)} // 0 is balance item!
        seen={seen}
      />
    );
  };

  render() {
    // const { showExtendedCard, cardStateValue } = this.state;
    const { stories, seenStories } = this.props;
    //
    // const hasAddon = !!children;
    //
    // const cardWidth = cardStateValue.interpolate({
    //   inputRange: [0, 1],
    //   outputRange: [86, 200],
    // });
    //
    // const cardHeight = cardStateValue.interpolate({
    //   inputRange: [0, 1],
    //   outputRange: [106, 400],
    // });
    //
    // const topPos = cardStateValue.interpolate({
    //   inputRange: [0, 1],
    //   outputRange: [0, -50],
    // });
    //
    // const leftPos = cardStateValue.interpolate({
    //   inputRange: [0, 1],
    //   outputRange: [0, -8],
    // });

    return (
      <StoriesHolder>
        <FlatList
          data={[{ id: 'CHILDREN' }, ...stories]}
          extraData={seenStories}
          horizontal
          keyExtractor={(item) => (item.id.toString())}
          renderItem={this.renderStory}
          style={{ width: '100%', paddingBottom: spacing.medium, position: 'relative' }}
          initialNumToRender={5}
        />
        {/* {showExtendedCard &&
        <StoryPreview
          animated
          style={{
            width: cardWidth || 86,
            height: cardHeight || 108,
            top: topPos,
            left: leftPos,
          }}
        />
        } */}
      </StoriesHolder>
    );
  }
}

const mapStateToProps = ({
  stories: { seenStories },
}: RootReducerState): $Shape<Props> => ({
  seenStories,
});

const structuredSelector = createStructuredSelector({
  stories: storiesWithSeenStateSelector,
});

const combinedMapStateToProps = (state: RootReducerState): $Shape<Props> => ({
  ...structuredSelector(state),
  ...mapStateToProps(state),
});

const mapDispatchToProps = (dispatch: Dispatch): $Shape<Props> => ({
  fetchStories: () => dispatch(fetchStoriesAction()),
});


export default withNavigation(connect(combinedMapStateToProps, mapDispatchToProps)(PillarStories));

