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

import type { Dispatch, GetState } from 'reducers/rootReducer';
import { SET_STORIES, SET_SEEN_STORIES, SET_STORY_AS_SEEN } from 'constants/storiesConstants';


export const fetchStoriesAction = () => {
  return (dispatch: Dispatch, getState: GetState) => {
    const {
      session: { data: { isOnline } },
      stories: { seenStories },
    } = getState();

    if (!isOnline) return;

    fetch('https://v2-api.sheety.co/68293db1d365e904bd3fd18233a5b8b7/navigationRoutes/stories')
      .then(resp => resp.json())
      .then(data => {
        const { stories } = data;
        if (!stories) return;

        dispatch({
          type: SET_STORIES,
          payload: stories,
        });

        // TODO: persist state;
        const updatedSeenStories = seenStories.filter(storyId => stories.find(({ id }) => id === storyId));

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
