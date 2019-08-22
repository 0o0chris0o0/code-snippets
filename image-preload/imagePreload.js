// import imagesLoaded from 'imagesloaded';

export default function Preload(targets) {
	return new Promise(resolve => {
		const preloadedImages = [];
		const promises = [];
		for (let i = 0; i < targets.length; i++) {
			preloadedImages[i] = new Image();
			promises[i] = new Promise(resolve1 => {
				preloadedImages[i].onload = resolve1;
			});
			preloadedImages[i].src = targets[i];
		}
		Promise.all(promises).then(() => resolve());
	});
}
