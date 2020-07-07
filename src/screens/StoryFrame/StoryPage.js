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
import styled from 'styled-components/native';
import { CachedImage } from 'react-native-cached-image';
import { BaseText, MediumText } from 'components/Typography';
import { fontSizes, fontStyles, spacing } from 'utils/variables';
import Button from 'components/Button';
import { SafeAreaView } from 'react-navigation';


type Props = {
  image: string,
  storyHeight: number,
  backgroundColor: string,
  labelBackgroundColor: string,
  labelColor: string,
  label: string,
  title: string,
  titleColor: string,
  body: string,
};


const StoryWrapper = styled.View`
  flex: 1;
`;

const StoryImage = styled(CachedImage)`
  width: 100%;
`;

const StoryTextWrapper = styled(SafeAreaView)`
  flex: 1;
  padding: ${spacing.large}px;
  justify-content: space-between;
`;

const ContentWrapper = styled.View`
  flex: 1;
  width: 100%;
`;

const LabelWrapper = styled.View`
  padding: 2px 10px;
  border-radius: 10px;
  align-self: flex-start;
`;

const Label = styled(BaseText)`
  text-transform: uppercase;
  font-size: ${fontSizes.regular}px;
`;

const Body = styled(BaseText)`
  ${fontStyles.medium};
`;

const Title = styled(MediumText)`
  text-transform: uppercase;
  ${fontStyles.large};
  font-style: italic;
  margin: ${spacing.medium}px 0;
`;


const StoryPage = (props: Props) => {
  const {
    image,
    storyHeight,
    backgroundColor,
    labelBackgroundColor,
    labelColor,
    label,
    title,
    titleColor,
    body,
  } = props;
  return (
    <StoryWrapper>
      <StoryImage source={{ uri: image }} style={{ height: storyHeight / 2 }} />
      <StoryTextWrapper style={{ backgroundColor }}>
        <ContentWrapper>
          <LabelWrapper style={{ backgroundColor: labelBackgroundColor }}>
            <Label style={{ color: labelColor }}>{label}</Label>
          </LabelWrapper>
          <Title style={{ color: titleColor }}>{title}</Title>
          <Body style={{ color: titleColor }}>{body}</Body>
        </ContentWrapper>
        <Button title="Action" />
      </StoryTextWrapper>
    </StoryWrapper>
  );
};

export default StoryPage;
