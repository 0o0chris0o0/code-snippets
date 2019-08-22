import axios from 'axios';
import sortBy from 'lodash/sortBy';

import apiDetails from '../../utils/apiDetails.json';
import postcodeData from '../../utils/locationData.json';
import regionData from '../../utils/regionData.json';

// get users current location from browser
function getUserLocation() {
	return new Promise((resolve, reject) => {
		const getUserPosition = position => {
			const { latitude, longitude } = position.coords;

			const userPosition = {
				lat: latitude,
				lng: longitude
			};

			resolve(userPosition);
		};

		const locationError = error => {
			reject(error);
		};

		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(getUserPosition, locationError, { timeout: 30000 });
		} else {
			reject();
		}
	});
}

// returns first characters from postcode
function getShortcode(postcode) {
	return new Promise((resolve, reject) => {
		const rex = /[A-z]*(?=[0-9])/g;
		const shortcode = rex.exec(postcode)[0];

		if (shortcode) {
			resolve(postcodeData[shortcode.toUpperCase()]);
		} else {
			reject('Invalid postcode');
		}
	});
}

// get all course locations from CMS
function getAllLocations() {
	return new Promise(resolve => {
		axios.get(`${process.env.API_URL}locations`).then(response => {
			const locations = response.data.data;
			resolve(locations);
		});
	});
}

// get distances from the users location to each course location
function getLocationDistances(userLocation, locations) {
	const { mapquest } = apiDetails;
	// get shortcodes of nearest regions
	const nearestRegions = regionData[userLocation.shortcode];
	// add the users own region
	nearestRegions.push(userLocation.shortcode);
	// clone original array
	const allLocations = locations.slice(0);

	// build array of locations from nearest regions
	const nearestLocations = allLocations.filter(
		location => nearestRegions.indexOf(location.addressDetails.regionId) !== -1
	);

	let locationCords;

	// if we have atleast 3 regions then use these to determine nearest courses.
	// if not we'll use all locations
	if (nearestLocations.length >= 3) {
		locationCords = nearestLocations.map(
			location =>
				`${location.addressDetails.coordinates.lat}, ${location.addressDetails.coordinates.lng}`
		);
	} else {
		locationCords = allLocations.map(
			location =>
				`${location.addressDetails.coordinates.lat}, ${location.addressDetails.coordinates.lng}`
		);
	}

	const locationData =
		nearestLocations.length >= 3 ? nearestLocations.slice(0) : allLocations.slice(0);

	const key = mapquest.key;

	return new Promise((resolve, reject) => {
		axios
			.post(`${mapquest.endpoints.locationDistance}${key}`, {
				locations: [`${userLocation.lat}, ${userLocation.lng}`, ...locationCords],
				options: {
					manyToOne: true
				}
			})
			.then(response => {
				const distances = response.data.distance;
				// remove first item from array
				distances.shift();

				for (let i = 0; i < distances.length; i++) {
					// format distance to 1 decimal place
					const formattedDistance = distances[i].toFixed(1);
					locationData[i].distance = parseFloat(formattedDistance);
				}

				const sortedLocations = sortBy(locationData, 'distance');

				resolve(sortedLocations);
			})
			.catch(error => {
				reject(error);
			});
	});
}

// return a postcodes lat and lng
function getPostcodeCoords(postcode) {
	const { idealPostcodes } = apiDetails;

	return new Promise((resolve, reject) => {
		axios
			.get(`${idealPostcodes.endpoints.postcodeCords}/${postcode}`)
			.then(response => {
				const { latitude, longitude } = response.data.result;

				resolve({
					lat: latitude,
					lng: longitude
				});
			})
			.catch(error => {
				reject(error.response.data.error);
			});
	});
}

// get nearest postcodes to a given lat and lng
function reverseLookupLocation(userLocation) {
	const { reverseLookup } = apiDetails.idealPostcodes.endpoints;

	return new Promise((resolve, reject) => {
		axios
			.get(`${reverseLookup}lon=${userLocation.lng}&lat=${userLocation.lat}`)
			.then(response => {
				const postcode = response.data.result[0].postcode;
				resolve(postcode);
			})
			.catch(() => {
				reject();
			});
	});
}

export async function getLocationDetails(postcode) {
	let userLocation, locationDetails;

	try {
		// if we're searching with a postcode
		if (postcode) {
			// get user location (lat + lng) based on postcode
			// also gets user shortcode based on postcode
			userLocation = await getPostcodeCoords(postcode);

			userLocation.shortcode = await getShortcode(postcode);
		} else {
			// get user location (lat + lng) based on browser geolocation
			userLocation = await getUserLocation();
			// get users postcode based on lat, lng
			const userPostcode = await reverseLookupLocation(userLocation);
			// set the users shortcode based on postcode
			userLocation.shortcode = await getShortcode(userPostcode);
		}

		// get all locations
		const allLocations = await getAllLocations();

		// get location distances based on user location
		try {
			locationDetails = await getLocationDistances(userLocation, allLocations);
		} catch (error) {
			// if we cant get the distances from the API, fallback to getting nearest courses based on shortcodes
			if (error.message === 'Network Error') {
				locationDetails = allLocations.filter(
					location => location.addressDetails.regionId === userLocation.shortcode
				);
			}
		}

		return {
			shortcode: userLocation.shortcode,
			locations: locationDetails
		};
	} catch (error) {
		return Promise.reject(error || new Error('There was an error, please try again later.'));
	}
}

export function getSuggestedAddress(postcode) {
	const { idealPostcodes } = apiDetails;

	const key = idealPostcodes.key;

	return new Promise((resolve, reject) => {
		axios
			.get(`${idealPostcodes.endpoints.addressLookup}${postcode}`, {
				params: {
					api_key: key
				}
			})
			.then(response => {
				resolve(response.data.result);
			})
			.catch(error => reject(error));
	});
}
