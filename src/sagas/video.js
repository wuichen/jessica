import { call, put } from "redux-saga/effects";
// import request from 'request';
import axios from 'axios';

export function* startFetchJessicaChannelList() {
    const jessicaschannel = yield call(fetchJessicaChannelList);
    yield put({
        type: 'FETCH_JESSICA_CHANNEL_SUCCEED',
        jessicaschannel: jessicaschannel.data,
    });
}

export function* startLoadMoreFromChannelList(action) {
    const jessicaschannel = yield call(loadMoreFromChannelList, action.nextPageToken);
    yield put({
        type: 'FETCH_JESSICA_CHANNEL_SUCCEED',
        jessicaschannel: jessicaschannel.data,
    });
}

function fetchJessicaChannelList() {
	return axios.get('/api/youtube/jessicaschannel');
}

function loadMoreFromChannelList(nextPageToken) {
	return axios.get('/api/youtube/jessicaschannel?nextPageToken=' + nextPageToken);
}