import {createAction} from 'redux-actions'
import constants from '../constants'
import {setData} from './editor'
import {setFlashMsg} from './app'
import {get as getIfExists} from 'lodash'
import client from '../api/client'
import urls from '@city-assets/urls.json';

/**
 * Fetch images from the API.
 *
 * @param user
 * @param pageSize = page size, how many images do you want to display on a single page.
 * @param pageNumber
 * @returns Object
 */
async function makeImageRequest(user = {}, pageSize, pageNumber = null) {
    const params = {
        page_size: pageSize,
        page: pageNumber,
        publisher: user.organization && user.userType === constants.USER_TYPE.ADMIN ? user.organization : null,
        created_by: user.userType === constants.USER_TYPE.REGULAR ? 'me' : null,
    }

    const result = await client.get('image', params);

    // Append the page number to the JSON array so that it can be easily used in the pagination
    if (pageNumber !== null) {
        result.data.meta.currentPage = pageNumber;
    }

    return result;
}

async function makeImageRequestDefault(user = {}, pageSize, pageNumber = null, publisher) {
    const params = {
        page_size: pageSize,
        page: pageNumber,
        publisher: publisher,
        created_by: user.userType === constants.USER_TYPE.REGULAR ? 'me' : null,
    }

    const result = await client.get('image', params);

    // Append the page number to the JSON array so that it can be easily used in the pagination
    if (pageNumber !== null) {
        result.data.meta.currentPage = pageNumber;
    }

    return result;
}

export function fetchUserImages(pageSize = 100, pageNumber = null, mainPage = false) {
    const startFetching = createAction(constants.REQUEST_IMAGES_AND_META);

    if (mainPage) {
        return async (dispatch, getState) => {
            // const {user} = getState()
            let response;
            try {
                dispatch(startFetching);

                response = await makeImageRequestDefault({}, pageSize, pageNumber, urls.defaultImagesPublisherId);

                dispatch(receiveDefaultImagesAndMeta(response));
            } catch (error) {
                dispatch(setFlashMsg(getIfExists(response, 'detail', 'Error fetching images'), 'error', response));
                dispatch(receiveUserImagesFail(response));
                new Error(error);
            }
        };
    } else {
        return async (dispatch, getState) => {
            const {user} = getState()
            let response;

            try {
                dispatch(startFetching);

                response = await makeImageRequest(user, pageSize, pageNumber);

                dispatch(receiveUserImagesAndMeta(response));
            } catch (error) {
                dispatch(setFlashMsg(getIfExists(response, 'detail', 'Error fetching images'), 'error', response));
                dispatch(receiveUserImagesFail(response));
                new Error(error);
            }
        };
    }


}

export function selectImage(image) {
    return {
        type: constants.SELECT_IMAGE_BY_ID,
        img: image,
    }
}

/**
 * An action for fetching both images and meta data, that holds the next / previous page information and image count.
 *
 * @param response
 * @returns Object
 */
export function receiveUserImagesAndMeta(response) {
    return {
        type: constants.RECEIVE_IMAGES_AND_META,
        items: response.data.data,
        meta: response.data.meta,
    }
}

export function receiveDefaultImagesAndMeta(response) {
    return {
        type: 'defaultImages',
        items: response.data.data,
        meta: response.data.meta,
    }
}

export function receiveUserImagesFail(response) {
    return {
        type: constants.RECEIVE_IMAGES_ERROR,
        items: [],
    }
}

export function imageUploadFailed(json) {
    return {
        type: constants.IMAGE_UPLOAD_ERROR,
        data: json,
    }
}

export function imageUploadComplete(json) {
    return {
        type: constants.IMAGE_UPLOAD_SUCCESS,
        data: json,
    }
}

export function postImage(formData, user, imageId = null) {
    return async (dispatch) => {
        try {
            let request;

            // Use PUT when updating the existing image metadata, use POST when adding a new image.
            if (imageId) {
                request = await client.put(`image/${imageId}`, formData);
            } else {
                request = await client.post(`image/`, formData);

                // Append uploaded image data to the form
                dispatch(setData({'image': request.data}));
            }

            dispatch(imageUploadComplete(request));

            dispatch(setFlashMsg(imageId ? 'image-update-success' : 'image-creation-success', 'success', request))
        } catch (error) {
            dispatch(setFlashMsg('image-creation-error', 'error'));

            dispatch(imageUploadFailed(error));

            new Error(error);
        }
    }
}

export function deleteImage(selectedImage, user) {
    return async (dispatch) => {
        try {
            const request = await client.delete(`image/${selectedImage.id}`);

            // Update form image value
            dispatch(setData({'image': null}));

            dispatch(setFlashMsg('image-deletion-success', 'success', ''));

            // Update image listing
            dispatch(fetchUserImages());
        } catch (error) {
            dispatch(setFlashMsg('image-deletion-error', 'error', error));

            new Error(error);
        }
    }
}
