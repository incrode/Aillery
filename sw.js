const cacheName = "cache-v1";
const currentPath = location.href.slice(0,location.href.lastIndexOf("/"));

const res = [
	currentPath + "/",
	currentPath + "/index.html",
	currentPath + "/image.html",
	currentPath + "/folder.html",
	currentPath + "/capture.html",
	currentPath + "/media/app/img/logo.png",
	currentPath + "/manifest.json",
	currentPath + "/css/Init.css",
	currentPath + "/css/index.css",
	currentPath + "/css/image.css",
	currentPath + "/css/folder.css",
	currentPath + "/css/capture.css",
	currentPath + "/js/index.js",
	currentPath + "/js/image.js",
	currentPath + "/js/capture.js",
	currentPath + "/js/folder.js",
	currentPath + "/js/Settings.js",
	currentPath + "/js/APIs/Camera.js",
	currentPath + "/js/APIs/Storage.js",
	currentPath + "/UI/css/Loader.css",
	currentPath + "/UI/css/OptionBox.css",
	currentPath + "/UI/js/Loader.js",
	currentPath + "/UI/js/OptionBox.js"
];

// event on sw-install
self.addEventListener("install", ev => {
	ev.waitUntil(caches.open(cacheName).then((cache)=>{
		cache.addAll(res);
	}));
});


// putInCache
async function putInCache(request, response) 
{
  const cache = await caches.open(cacheName);
  await cache.put(request, response);
};

// cacheFirst
async function cacheFirst(request, ev) {
	const responseFromCache = await caches.match(request);
	if (responseFromCache && !responseFromCache.redirected) {
		return responseFromCache;
	}

	const responseFromNetwork = await fetch(request, {
		method: "GET",
		redirect: "manual"
	});

	if (!responseFromNetwork) {
		return responseFromNetwork;
	}

	ev.waitUntil(putInCache(request, responseFromNetwork.clone()));
	return responseFromNetwork;
};

// event on sw-fetch
self.addEventListener("fetch", async (ev) => {
	ev.respondWith(cacheFirst(ev.request, ev));
});
