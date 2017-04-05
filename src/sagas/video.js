import { call, put } from "redux-saga/effects";
// import request from 'request';
import axios from 'axios';

export function* insertJessicaChannelList() {
    const videos = yield call(fetchJessicaChannelList);
    console.log(videos)
    // save the users in state
    yield put({
        type: 'FETCH_JESSICA_CHANNEL_SUCCEED',
        videos: videos.data,
    });
}

function fetchJessicaChannelList() {
	return axios.get('/api/youtube/jessicaschannel');
}
