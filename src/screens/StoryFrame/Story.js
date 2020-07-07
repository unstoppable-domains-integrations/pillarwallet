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
import { Animated } from 'react-native';
import styled from 'styled-components/native';
import isEqual from 'lodash.isequal';
import Carousel from 'react-native-snap-carousel';

import { themedColors } from 'utils/themes';

import type { StoryPage as StoryPageType } from 'reducers/storiesReducer';

import StoryPage from './StoryPage';


type Props = {
  isActive: boolean,
  pages: StoryPageType[],
  width: number,
  height: number,
  onStoryEnd: () => void,
};

type State = {
  isPlaying: boolean,
  activePage: number,
  currentProgress: number,
  progressAnimated: Animated.Value,
};


const PAGE_DURATION = 5000;
const FOOTER_HEIGHT = 50;


const Wrapper = styled.View`
  flex: 1;
  position: relative;
`;

const StatusBars = styled.View`
  width: 100%;
  position: absolute;
  top: 30px;
  left: 0;
  z-index: 1;
  flex-direction: row;
  padding: 0 4px;
`;

const StatusBarWrapper = styled.View`
  flex: 1;
  margin: 4px;
  background-color: ${themedColors.secondaryText};
`;

const StatusBar = styled.View`
  flex: 1;
  height: 2px;
  background-color: ${themedColors.control};
`;

const StoryFooter = styled.View`
  width: 100%;
  height: ${FOOTER_HEIGHT}px;
  background-color: #000000;
`;

const CarouselWrapper = styled.View`
  overflow: hidden;
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
  flex: 1;
`;

const AnimatedStatusBar = Animated.createAnimatedComponent(StatusBar);


class Story extends React.Component<Props, State> {
  storyCarousel: Carousel;
  activeProgressAnimation: IntervalID;
  progress: Number;
  currentProgress: Number;

  state = {
    isPlaying: false,
    activePage: 0,
    currentProgress: 0,
    progressAnimated: new Animated.Value(0),
  };

  componentDidMount() {
    const { isActive } = this.props;
    if (isActive) {
      this.startAutoplay();
    }
  }

  componentDidUpdate(prevProps: Props) {
    const { isActive } = this.props;
    if (prevProps.isActive !== isActive) {
      if (isActive) {
        this.startAutoplay();
      } else {
        this.resetAutoplay();
      }
    }
  }

  shouldComponentUpdate(nextProps: Props, nextState: State) {
    return !(isEqual(this.props, nextProps) && isEqual(this.state, nextState));
  }

  resetProgressAnimation = () => {
    const { progressAnimated } = this.state;
    progressAnimated.setValue(0);
    progressAnimated.resetAnimation();
    this.setState({ currentProgress: 0 }, () => {
      clearInterval(this.activeProgressAnimation);
    });
  };

  startAutoplay = () => {
    const { isPlaying } = this.state;

    if (!isPlaying) {
      this.setState(({ isPlaying: true }), () => {
        this.activeProgressAnimation = setInterval(() => this.progress(), PAGE_DURATION / 100);
      });
    }
  };

  resetAutoplay = () => {
    const { progressAnimated } = this.state;
    progressAnimated.setValue(0);
    this.storyCarousel.snapToItem(0, false);
    this.setState({
      isPlaying: false,
      activePage: 0,
      currentProgress: 0,
    }, () => {
      this.resetProgressAnimation();
    });
  };

  pauseAutoplay = () => {
    clearInterval(this.activeProgressAnimation);
    this.setState({ isPlaying: false });
  };

  resumeAutoplay = () => {
    this.startAutoplay();
  };

  progress = () => {
    const { currentProgress, progressAnimated } = this.state;
    if (currentProgress >= 100) {
      this.handleNextPage();
    } else {
      this.setState(prevState => ({ currentProgress: prevState.currentProgress + 1 }), () => {
        progressAnimated.setValue(currentProgress);
      });
    }
  };

  handleNextPage = () => {
    const { activePage } = this.state;
    const { pages, onStoryEnd } = this.props;
    const pagesCount = pages.length - 1;

    if (activePage < pagesCount) {
      this.storyCarousel.snapToNext();
      this.setState(prevState => ({ isPlaying: false, activePage: prevState.activePage + 1 }), () => {
        this.resetProgressAnimation();
        this.startAutoplay();
      });
    } else {
      this.resetProgressAnimation();
      if (onStoryEnd) onStoryEnd();
    }
  };

  renderPage = ({ item }: { item: StoryPageType }) => {
    const { height } = this.props;
    const { currentProgress } = this.state;
    return <StoryPage {...item} storyHeight={height - FOOTER_HEIGHT} currentProgress={currentProgress} />;
  };

  render() {
    const { pages, width } = this.props;
    const { progressAnimated, activePage } = this.state;
    const activeWidth = progressAnimated.interpolate({
      inputRange: [0, 100],
      outputRange: ['0%', '100%'],
    });

    return (
      <Wrapper onTouchStart={this.pauseAutoplay} onTouchEnd={this.resumeAutoplay}>
        <StatusBars>
          {pages.map((page, index) => {
            const widthByStatus = index <= activePage ? '100%' : '0%';
            const barWidth = index === activePage ? activeWidth : widthByStatus;
            return (
              <StatusBarWrapper>
                <AnimatedStatusBar style={{ width: barWidth }} />
              </StatusBarWrapper>);
            },
          )}
        </StatusBars>
        <CarouselWrapper>
          <Carousel
            ref={ref => { this.storyCarousel = ref; }}
            data={pages}
            renderItem={this.renderPage}
            sliderWidth={width}
            itemWidth={width}
            inactiveSlideScale={1}
            // for manual scrolling
            enableMomentum={false}
            lockScrollWhileSnapping
            scrollEnabled={false}
          />
        </CarouselWrapper>
        <StoryFooter />
      </Wrapper>
    );
  }
}

export default Story;
