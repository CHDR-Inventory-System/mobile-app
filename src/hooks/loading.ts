import { useState } from 'react';

type UseLoadingHook = {
  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
  toggleLoading: (isLoading: boolean) => void;
  /**
   * A helper function used to delay code execution in async function.
   * Takes a number in milliseconds
   *
   * @WARNING Don't use this in production
   */
  sleep: (ms: number) => Promise<void>;
};

/**
 * A custom hook that pairs will with the `Loading` component. This
 * helps components manage their loading state.
 * 
 * @param {bool?} initialValue The initial loading state value (`false` by default)
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

  const startLoading = () => setLoading(true);

  const stopLoading = () => setLoading(false);

  const toggleLoading = (loading: boolean) => setLoading(loading);

  const sleep = (ms: number): Promise<void> => {
    if (!__DEV__) {
      // eslint-disable-next-line no-console
      console.error("Don't use sleep() in a production environment");
      return Promise.resolve();
    }

    return new Promise(resolve => setTimeout(resolve, ms));
  };

  return {
    isLoading,
    startLoading,
    stopLoading,
    toggleLoading,
    sleep
  };
};

export default useLoader;
