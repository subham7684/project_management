export const createWebStorage = (type: string) => {
  if (typeof window !== 'undefined') {
    return {
      getItem: (key: string): Promise<string | null> => {
        try {
          const value = window.localStorage.getItem(key);
          return Promise.resolve(value);
        } catch (error) {
          return Promise.reject(error);
        }
      },
      setItem: (key: string, value: string): Promise<void> => {
        try {
          window.localStorage.setItem(key, value);
          return Promise.resolve();
        } catch (error) {
          return Promise.reject(error);
        }
      },
      removeItem: (key: string): Promise<void> => {
        try {
          window.localStorage.removeItem(key);
          return Promise.resolve();
        } catch (error) {
          return Promise.reject(error);
        }
      }
    };
  }

  return {
    getItem: (_: string): Promise<string | null> => Promise.resolve(null),
    setItem: (_: string, __: string): Promise<void> => Promise.resolve(),
    removeItem: (_: string): Promise<void> => Promise.resolve(),
  };
};
