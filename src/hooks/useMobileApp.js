export const useMobileApp = () => {
  const isMobileApp =
    typeof localStorage !== 'undefined'
      ? localStorage.getItem('mobile-app') === 'true'
      : false;

  if (typeof document !== 'undefined' && isMobileApp) {
    document.documentElement.classList.add('mobile-app');
  }

  return isMobileApp;
};
