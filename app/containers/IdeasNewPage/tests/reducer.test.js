
import { fromJS } from 'immutable';
import ideasNewPageReducer, { ideasNewPageInitialState } from '../reducer';

describe('ideasNewPageReducer', () => {
  it('returns the initial state', () => {
    expect(ideasNewPageReducer(ideasNewPageInitialState, {})).toEqual(fromJS(ideasNewPageInitialState));
  });

  it('should return draft.loading set to true, on LOAD_DRAFT action', () => {
    // TODO
    expect(true).toEqual(true);
  });

  it('should return draft.loading set to false and draft.content to not null, on LOAD_DRAFT_SUCCESS or SAVE_DRAFT actions', () => {
    // TODO
    expect(true).toEqual(true);
  });

  it('should return draft.stored set to true, on STORE_DRAFT_SUCCESS', () => {
    // TODO
    expect(true).toEqual(true);
  });

  it('should set shortTitleError to true if title < 5 chars', () => {
    // TODO
    expect(true).toEqual(true);
  });

  it('should set longTitleError to true if title > 120 chars', () => {
    // TODO
    expect(true).toEqual(true);
  });

  it('should returns existing attachments + stored one on store success', () => {
    // TODO
    expect(true).toEqual(true);
  });

  it('should returns existing images + stored one on store success', () => {
    // TODO
    expect(true).toEqual(true);
  });
});
