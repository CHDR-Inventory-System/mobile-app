import { useState } from 'react';

type UseLoadingHook = {
  readonly isLoading: boolean;
  readonly isRefreshing: boolean;
  startLoading: () => void;
  stopLoading: () => void;
  toggleLoading: (isLoading: boolean) => void;
  startRefreshing:() => void;
  stopRefreshing:() => void;
  toggleRefreshing: (isRefreshing: boolean) => void;
  /**
   * A helper function used to delay code execution in async functions.
   *
   * @WARNING Don't use this in production
   *
   * @param ms The amount of time (in milliseconds) to wait.
   */
  sleep: (ms: number) => Promise<void>;
};

/**
 * A custom hook that pairs will with the `Loading` component. This
 * helps components manage their loading state. This hook also provides
 * a utility to manage refresh state for list views too.
 *
 * @param initialValue The initial loading state value (`false` by default)
 *
 * @example
 * ```jsx
 * const Component = () => {
 *  const loader = useLoading();
 *
 *  const fetchData = async () => {
 *    loading.startLoading();
 *    // Doing some work might take a while...
 *    loader.stopLoading();
 *  }
 *
 *
 *  return (
 *    <Loading isLoading={loader.isLoading}/>
 *  );
 * }
 * ```
 */
const useLoader = (initialValue = false): UseLoadingHook => {
  const [isLoading, setLoading] = useState(initialValue);
  const [isRefreshing, setRefreshing] = useState(false);

  const startLoading = () => setLoading(true);
  const stopLoading = () => setLoading(false);
  const toggleLoading = (loading: boolean) => setLoading(loading);

  const startRefreshing = () => setRefreshing(true);
  const stopRefreshing = () => setRefreshing(false);
  const toggleRefreshing = (refreshing: boolean) => setLoading(refreshing);

  const sleep = (ms: number): Promise<void> => {
    if (!__DEV__) {
      // There's no sleeping in production!
      return Promise.resolve();
    }

    return new Promise(resolve => setTimeout(resolve, ms));
  };

  return {
    isLoading,
    startLoading,
    stopLoading,
    toggleLoading,
    sleep,
    startRefreshing,
    stopRefreshing,
    toggleRefreshing,
    isRefreshing
  };
};

export default useLoader;
