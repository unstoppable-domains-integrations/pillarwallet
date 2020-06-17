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
import styled from 'styled-components/native';
import LinearGradient from 'react-native-linear-gradient';
import { BaseText } from 'components/Typography';
import { themedColors } from 'utils/themes';


type CardProps = {
  image?: string,
  backgroundColor?: string,
  title?: string,
  titleColor: string,
};

type Props = CardProps & {
  onPress: () => void,
  animated?: boolean,
  style?: Object,
  seen: boolean,
};


const Wrapper = styled.View`
  margin: 0 6px;
  border-radius: 10px;
  overflow: hidden;
  ${({ seen }) => !!seen && 'opacity: 0.5;'} 
`;

const StoryTouchable = styled.TouchableOpacity`
  ${({ animated }) => !!animated && 'position: absolute;'} 
`;

const StoryMonoColorBg = styled.View`
  width: 86px;
  height: 108px;
  background-color: ${themedColors.tertiary}
`;

const ImageBackground = styled.ImageBackground`
  width: 86px;
  height: 108px;
`;

const ContentHolder = styled.View`
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  flex: 1;
  position: relative;
  width: 100%;
`;

const StyledLinearGradient = styled(LinearGradient)`
  height: 54px;
  width: 100%;
  position: absolute;
  bottom: 0;
  left: 0;
`;

const AnimatedWrapper = Animated.createAnimatedComponent(Wrapper);


const StoryContentWrapper = ({ image, backgroundColor, children }) => {
  if (image) {
    return (
      <ImageBackground source={{ uri: image }}>
        {children}
      </ImageBackground>
    );
  }
  return (
    <StoryMonoColorBg style={{ backgroundColor }}>
      {children}
    </StoryMonoColorBg>
  );
};

const StoryCard = (props: CardProps) => {
  const {
    image,
    backgroundColor,
    title,
    titleColor,
  } = props;

  return (
    <StoryContentWrapper backgroundColor={backgroundColor} image={image}>
      <ContentHolder>
        {!!title &&
        <>
          <StyledLinearGradient
            start={{ x: 0, y: 1 }}
            end={{ x: 0, y: 0 }}
            colors={['#000000', 'transparent']}
          />
          <BaseText
            tiny
            color={titleColor}
            numberOfLines={3}
            ellipsizeMode="tail"
            style={{ padding: 6 }}
          >
            {title}
          </BaseText>
        </>}
      </ContentHolder>
    </StoryContentWrapper>
  );
};

const StoryPreview = (props: Props) => {
  const {
    onPress,
    animated,
    style,
    seen,
  } = props;

  const isDisabled = !onPress;

  return (
    <StoryTouchable onPress={onPress} animated={animated} disabled={isDisabled}>
      <AnimatedWrapper style={style} seen={seen}>
        <StoryCard {...props} />
      </AnimatedWrapper>
    </StoryTouchable>
  );
};

export default StoryPreview;
