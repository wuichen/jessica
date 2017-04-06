import axios from 'axios';

const initialState = {
    jChannelList: [],
    selectedVideo: null,
    nextPageToken: ''
}

// video reducer
export default function videos(state = initialState, action) {
  switch (action.type) {
    case 'FETCH_JESSICA_CHANNEL_SUCCEED':
        return {
            jChannelList: [...state.jChannelList , ...action.jessicaschannel.items],
            selectedVideo: (state.jChannelList.length ? state.selectedVideo : action.jessicaschannel.items[0]),
            nextPageToken: action.jessicaschannel.nextPageToken,
        };
    case 'SELECT_VIDEO':
        return {
            ...state,
            selectedVideo: action.video
        }
    // initial state
    default:
      return state;
  }
}
