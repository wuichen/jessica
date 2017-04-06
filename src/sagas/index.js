import { takeLatest } from "redux-saga";
import { fork } from "redux-saga/effects";
import {startFetchJessicaChannelList, startLoadMoreFromChannelList} from './video';

// // main saga generators
export function* sagas() {
	yield [
	    fork(takeLatest, 'FETCH_JESSICA_CHANNEL_LIST', startFetchJessicaChannelList),
	    fork(takeLatest, 'LOAD_MORE_FROM_CHANNEL_LIST', startLoadMoreFromChannelList)
	];
}