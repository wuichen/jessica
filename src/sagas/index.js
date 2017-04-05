import { takeLatest } from "redux-saga";
import { fork } from "redux-saga/effects";
import {insertJessicaChannelList} from './video';

// // main saga generators
export function* sagas() {
	yield [
	    fork(takeLatest, 'FETCH_JESSICA_CHANNEL_LIST', insertJessicaChannelList)
	];
}