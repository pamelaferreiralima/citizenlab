import { renderHook } from '@testing-library/react-hooks';
import useInsightsCategories from './useInsightsCategories';
import { Observable, Subscription } from 'rxjs';
import { waitFor } from 'utils/testUtils/rtl';
import { delay } from 'rxjs/operators';
import { insightsCategoriesStream } from 'modules/commercial/insights/services/insightsCategories';

const viewId = '1';

const mockCategories = {
  data: [
    {
      id: '1aa8a788-3aee-4ada-a581-6d934e49784b',
      type: 'category',
      attributes: {
        name: 'Test',
      },
    },
    {
      id: '4b429681-1744-456f-8550-e89a2c2c74b2',
      type: 'category',
      attributes: {
        name: 'Test 2',
      },
    },
  ],
};

let mockObservable = new Observable((subscriber) => {
  subscriber.next(mockCategories);
}).pipe(delay(1));

jest.mock('modules/commercial/insights/services/insightsCategories', () => {
  return {
    insightsCategoriesStream: jest.fn(() => {
      return {
        observable: mockObservable,
      };
    }),
  };
});

describe('useInsightsCategories', () => {
  it('should call insightsCategoriesStream with correct arguments', () => {
    renderHook(() => useInsightsCategories(viewId));
    expect(insightsCategoriesStream).toHaveBeenCalledWith(viewId);
  });
  it('should return data when data', () => {
    const { result } = renderHook(() => useInsightsCategories(viewId));
    expect(result.current).toBe(undefined); // initially, the hook returns undefined
    waitFor(() => expect(result.current).toBe(mockCategories.data));
  });
  it('should return error when error', () => {
    const error = new Error();
    mockObservable = new Observable((subscriber) => {
      subscriber.next({ data: new Error() });
    });
    const { result } = renderHook(() => useInsightsCategories(viewId));
    expect(result.current).toStrictEqual(error);
  });
  it('should return null when data is null', () => {
    mockObservable = new Observable((subscriber) => {
      subscriber.next({ data: null });
    });
    const { result } = renderHook(() => useInsightsCategories(viewId));
    expect(result.current).toBe(null);
  });
  it('should unsubscribe on unmount', () => {
    spyOn(Subscription.prototype, 'unsubscribe');
    const { unmount } = renderHook(() => useInsightsCategories(viewId));

    unmount();
    expect(Subscription.prototype.unsubscribe).toHaveBeenCalledTimes(1);
  });
});
