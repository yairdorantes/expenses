import { precacheAndRoute } from "workbox-precaching";

// ⬇️ Required for Workbox to inject files to precache
precacheAndRoute(self.__WB_MANIFEST);
