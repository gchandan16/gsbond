// Purpose: Handle incoming push notifications with firebase
console.log("🔧 Firebase Service Worker loading...");


importScripts('https://www.gstatic.com/firebasejs/10.11.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.11.1/firebase-messaging-compat.js');

console.log("🔧 Service Worker loaded");


// Initialize Firebase with your project credentials

try {
    // Initialize Firebase with your project credentials
    firebase.initializeApp({
        apiKey: "AIzaSyAyZiZbajZx1zEE4hSQd4nNHdmwjK5GO_s",
        authDomain: "gsbc-crm.firebaseapp.com",
        projectId: "gsbc-crm",
        storageBucket: "gsbc-crm.firebasestorage.app",
        messagingSenderId: "54493497251",
        appId: "1:54493497251:web:4d52a45fc549c1bf37bc16",
        measurementId: "G-93HVTX6CD8"
    });

    console.log("✅ Firebase initialized in Service Worker");

} catch (error) {
    console.error("❌ Firebase initialization failed:", error);
}


// Initialize FCM to enable this(sw) to receive push notifications from firebase servers
const messaging = firebase.messaging();

console.log("✅ Messaging instance created",messaging);

// ✨ HANDLE BACKGROUND MESSAGES - THIS IS THE KEY PART
messaging.onBackgroundMessage((payload) => {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📬 BACKGROUND MESSAGE RECEIVED!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Payload:", payload);
    console.log("Notification:", payload.notification);

    try {
        const notificationTitle = payload.notification?.title || "Notification";
        const notificationBody = payload.notification?.body || "New message";

        
        const notificationIcon = "/icon.webp" || payload.notification?.icon;

        const notificationOptions = {
            body: notificationBody,
            icon: notificationIcon,  // Changed!
            badge: "/icon.webp",
            data: {
                url: payload.fcmOptions?.link || "/"
            }
        };

        console.log("📢 Displaying notification...");
        console.log("   Title:", notificationTitle);
        console.log("   Body:", notificationBody);
        console.log("   Icon:", notificationIcon);

        // ✨ Added error handling
        return self.registration.showNotification(notificationTitle, notificationOptions)
            .then(() => {
                console.log("✅ Notification displayed successfully!");
                console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            })
            .catch(error => {
                console.error("❌ Failed to show notification:", error);
                console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            });

    } catch (error) {
        console.error("❌ Error in onBackgroundMessage:", error);
    }
});




console.log("✅ Message handler registered");

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
    console.log("👆 Notification clicked!");
    event.notification.close();
    const targetUrl = event.notification.data?.url || "/dashboard";

    event.waitUntil(
        clients.matchAll({ type: "window", includeUncontrolled: true })
            .then((clientList) => {
                for (const client of clientList) {
                    if (client.url.includes(targetUrl) && "focus" in client) {
                        return client.focus();
                    }
                }
                return clients.openWindow(targetUrl);
            })
    );
});

console.log("✅ Service Worker ready!");


console.log("🎉 Firebase Service Worker setup complete!");