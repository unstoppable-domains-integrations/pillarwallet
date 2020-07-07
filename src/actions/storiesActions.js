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

import { SET_STORIES, SET_SEEN_STORIES, SET_STORY_AS_SEEN } from 'constants/storiesConstants';
import type { Dispatch, GetState } from 'reducers/rootReducer';


export const fetchStoriesAction = () => {
  return async (dispatch: Dispatch, getState: GetState) => {
    const {
      session: { data: { isOnline } },
      stories: { seenStories },
      // user: { data: { walletId } },
    } = getState();

    if (!isOnline) return;

    // const stories = await api.fetchStories(walletId);


    fetch('https://api.npoint.io/b99768fcf4f8260de906')
      .then(resp => resp.json())
      .then(data => {
        if (!data) return;

        dispatch({
          type: SET_STORIES,
          payload: data,
        });

        // TODO: persist state;
        const updatedSeenStories = seenStories.filter(storyId => data.find(({ id }) => id === storyId));

        dispatch({
          type: SET_SEEN_STORIES,
          payload: updatedSeenStories,
        });
      })
      .catch(() => {});
  };
};


export const manageStoriesSeenStateAction = (storyId: string) => {
  return (dispatch: Dispatch) => {
    dispatch({
      type: SET_STORY_AS_SEEN,
      payload: storyId,
    });
  };
};
