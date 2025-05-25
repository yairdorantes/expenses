// src/sw.js
self.addEventListener("push", (event) => {
  const data = event.data?.json() || {};

  event.waitUntil(
    self.registration.showNotification(data.title || "Notification", {
      body: data.body || "You have a new update.",
      icon: "/expenses.png",
    })
  );
});
