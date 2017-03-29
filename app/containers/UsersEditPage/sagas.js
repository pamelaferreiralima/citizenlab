import request from 'utils/request'; // eslint-disable-line import/no-duplicates
import { call, put } from 'redux-saga/effects';
import { takeLatest } from 'redux-saga';

import {
  currentUserLoadError, currentUserLoaded, profileStored, storeProfileError, avatarStored,
  storeAvatarError, avatarLoaded, loadAvatarError,
} from './actions';
import { LOAD_AVATAR, STORE_AVATAR, STORE_PROFILE } from './constants';
import { getCurrentUserRequest } from '../../utils/request'; // eslint-disable-line import/no-duplicates
import { mergeJsonApiResources } from '../../utils/resources/actions';
import { LOAD_CURRENT_USER } from '../App/constants';

// Individual exports for testing
export function* getProfile() {
  try {
    const currentUserResponse = yield call(getCurrentUserRequest);

    yield put(mergeJsonApiResources(currentUserResponse));
    yield put(currentUserLoaded(currentUserResponse));
  } catch (err) {
    yield put(currentUserLoadError(err));
  }
}

export function* postProfile(action) {
  const requestURL = 'http://demo9193680.mockable.io/profile-post';

  try {
    yield call(request, requestURL, {
      method: 'POST',
      body: JSON.stringify(action.userData),
    });

    yield put(profileStored(action.data.attributes));
  } catch (err) {
    yield put(storeProfileError());
  }
}

export function* getAvatar() {
  const requestURL = 'http://demo9193680.mockable.io/avatar-get';

  try {
    const response = yield call(request, requestURL);

    yield put(avatarLoaded(response.avatar));
  } catch (err) {
    yield put(loadAvatarError(err));
  }
}

export function* postAvatar(action) {
  const requestURL = 'http://demo9193680.mockable.io/avatar-post';

  try {
    const response = yield call(request, requestURL, {
      method: 'POST',
      body: JSON.stringify(action.avatar),
    });

    yield put(avatarStored(response.avatar));
  } catch (err) {
    yield put(storeAvatarError(err));
  }
}

export function* storeProfile() {
  yield takeLatest(STORE_PROFILE, postProfile);
}

export function* loadCurrentUser() {
  yield takeLatest(LOAD_CURRENT_USER, getProfile);
}

export function* storeAvatar() {
  yield takeLatest(STORE_AVATAR, postAvatar);
}

export function* loadAvatar() {
  yield takeLatest(LOAD_AVATAR, getAvatar);
}

// All sagas to be loaded
export default [
  loadCurrentUser,
  storeProfile,
  storeAvatar,
  loadAvatar,
];
