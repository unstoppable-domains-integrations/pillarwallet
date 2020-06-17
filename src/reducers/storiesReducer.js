// @flow
import { SET_STORIES, SET_STORY_AS_SEEN, SET_SEEN_STORIES } from 'constants/storiesConstants';

export type Story = {
  id: string,
  title: string,
  titleColor: string,
  imagePreview: string,
  imageLarge: string,
  gradientColor: string,
  expirationDate?: number, // TODO: remove no longer valid stories?
}

export type SeenStories = string[];

export type StoriesReducerState = {
  stories: Story[],
  seenStories: SeenStories,
};

export type StoriesReducerAction = {
  type: string,
  payload: any,
};

export const initialState = {
  stories: [],
  seenStories: [],
};

export default function accountsReducer(
  state: StoriesReducerState = initialState,
  action: StoriesReducerAction,
): StoriesReducerState {
  switch (action.type) {
    case SET_STORIES:
      return { ...state, stories: action.payload };
    case SET_STORY_AS_SEEN:
      return { ...state, seenStories: [...state.seenStories, action.payload] };
    case SET_SEEN_STORIES:
      return { ...state, seenStories: action.payload };
    default:
      return state;
  }
}
