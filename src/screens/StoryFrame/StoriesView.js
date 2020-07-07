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

import React from 'react';
import Carousel, { getInputRangeFromIndexes } from 'react-native-snap-carousel';
import { Dimensions, Platform, View } from 'react-native';
import { connect } from 'react-redux';
import type { RootReducerState } from 'reducers/rootReducer';
import { manageStoriesSeenStateAction } from 'actions/storiesActions';

// types
import type { NavigationScreenProp } from 'react-navigation';
import type { Story as StoryType } from 'reducers/storiesReducer';

// partials
import Story from './Story';


type Props = {
  navigation: NavigationScreenProp<*>,
  stories: StoryType[],
  manageStoriesSeenState: (storyId: string) => void,
};

type State = {
  activeStory: number,
};

const { width, height } = Dimensions.get('window');


function toRadians(angle) {
  return angle * (Math.PI / 180);
}

const POSITION = Platform.OS === 'ios' ? 2 : 1.5;
const ZOOM = Math.sin(toRadians(65));
const MARGIN25 = ((width - 320) / 31.3) + 7;
const MARGIN50 = ((width - 320) / 23.5) + 13;
const MARGIN100 = ((width - 320) / 47) + 5;

class StoriesView extends React.Component<Props, State> {
  carousel: Carousel;

  state = {
    activeStory: 0,
  };

  showNextStory = () => {
    const { activeStory } = this.state;
    const { navigation, stories, manageStoriesSeenState } = this.props;
    const storiesCount = stories.length - 1;

    if (activeStory < storiesCount) {
      this.carousel.snapToNext();
      this.setState(prevState => ({ activeStory: prevState.activeStory + 1 }), () => {
        manageStoriesSeenState(this.state.activeStory.toString());
      });
    } else {
      navigation.dismiss();
      manageStoriesSeenState(stories.length.toString());
    }
  };

  scrollInterpolator(index, carouselProps) {
    const outputRange = [1, 0, -1];
    const inputRange = getInputRangeFromIndexes(outputRange, index, carouselProps);

    return { inputRange, outputRange };
  }

  animatedStyles(i, scrollX) {
    return {
      transform: [
        {
          perspective: 2 * width,
        },
        {
          translateX: scrollX.interpolate({
            inputRange: [
              -1,
              0,
              1,
            ],
            outputRange: [
              width / POSITION,
              0,
              -width / POSITION,
            ],
          }),
        },
        {
          rotateY: scrollX.interpolate({
            inputRange: [-1, 0, 1],
            outputRange: ['-90deg', '0deg', '90deg'],
          }),
        },
        {
          scale: scrollX.interpolate({
            inputRange: [
              -1,
              -0.5,
              0,
              0.5,
              1,
            ],
            outputRange: [
              1,
              ZOOM,
              1,
              ZOOM,
              1,
            ],
          }),
        },
        {
          translateX: scrollX.interpolate({
            inputRange: [
              -1,
              -0.75,
              -0.5,
              0,
              0.5,
              0.75,
              1,
            ],
            outputRange: [
              (-width / POSITION) + MARGIN100,
              ((-width * ZOOM * 0.75) / POSITION) + MARGIN25,
              ((-width * ZOOM * 0.5) / POSITION) + MARGIN50,
              0,
              ((width * ZOOM * 0.5) / POSITION) - MARGIN50,
              ((width * ZOOM * 0.75) / POSITION) - MARGIN25,
              (width / POSITION) - MARGIN100,
            ],
          }),
        },
      ],
      opacity: scrollX.interpolate({
        inputRange: [-1, -0.5, 0.5, 1],
        outputRange: [0.4, 1, 1, 0.4],
      }),
    };
  }

  renderItem = ({ item, index }) => {
    const { activeStory } = this.state;
    if (index > activeStory + 1) return null;
    return (<Story
      pages={item.pages}
      image={item.imageLarge}
      width={width}
      height={height}
      onStoryEnd={this.showNextStory}
      storyIndex={index}
      isActive={index === activeStory}
    />);
  };

  updateActiveStoryIndex = (activeStory) => {
    this.setState({ activeStory });
  };

  render() {
    const { stories } = this.props;
    return (
      <View style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        backgroundColor: '#000',
      }}
      >
        <Carousel
          ref={ref => { this.carousel = ref; }}
          firstItem={0}
          containerCustomStyle={{ width }}
          data={stories}
          useScrollView
          renderItem={this.renderItem}
          sliderWidth={width}
          itemWidth={width}
          scrollInterpolator={this.scrollInterpolator}
          slideInterpolatedStyle={this.animatedStyles}
          onSnapToItem={this.updateActiveStoryIndex}
        />
      </View>
    );
  }
}

const mapStateToProps = ({
  stories: { stories },
}: RootReducerState): $Shape<Props> => ({
  stories,
});

const mapDispatchToProps = (dispatch: Function) => ({
  manageStoriesSeenState: (storyId) => dispatch(manageStoriesSeenStateAction(storyId)),
});

export default connect(mapStateToProps, mapDispatchToProps)(StoriesView);
