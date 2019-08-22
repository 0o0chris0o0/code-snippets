import Cookies from 'js-cookie';

export default function routeTracker() {
  let currentRoute = Cookies.get('route-tracking');

  if (!currentRoute) {
    currentRoute = window.location.pathname;
  } else {
    const currentRouteArray = currentRoute.split(',');
    const latestRoute = currentRouteArray[currentRouteArray.length - 1];

    // ensure we don't repeat the last path
    if (window.location.pathname !== latestRoute) {
      // only store the last 3 route paths
      if (currentRouteArray.length >= 3) {
        // drop first item in array
        currentRouteArray.shift();
      }

      currentRouteArray.push(window.location.pathname);
      currentRoute = currentRouteArray.join(',');
    }
  }
  const in5Minutes = 1 / 48;
  Cookies.set('route-tracking', currentRoute, { expires: in5Minutes });
}
