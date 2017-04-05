import axios from 'axios';

const initialState = {
    jChannelList: [],
    selectedVideo: null
}

// video reducer
export default function videos(state = initialState, action) {
  switch (action.type) {
    case 'FETCH_JESSICA_CHANNEL_SUCCEED':
        return {
            jChannelList: action.videos,
            selectedVideo: action.videos[0]
        };

    // initial state
    default:
      return state;
  }
}