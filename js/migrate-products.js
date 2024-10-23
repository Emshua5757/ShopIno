// Replace the import statements with require statements
const { initializeApp } = require("firebase/app");
const { getFirestore, collection, addDoc } = require("firebase/firestore");

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDdH5tB-1Sin3zaEIBOUX7Odc0BU_NHdww",
    authDomain: "shopino-e7be0.firebaseapp.com",
    databaseURL: "https://shopino-e7be0-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "shopino-e7be0",
    storageBucket: "shopino-e7be0.appspot.com",
    messagingSenderId: "205905447592",
    appId: "1:205905447592:web:0a7b0933336a4d4495509d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Your product data
const products = [
    { id: 1, name: "Arduino Uno", price: 25.99, description: "A popular microcontroller board for beginners.", image: "ArduinoUno.png", stock: 50 },
    { id: 2, name: "ESP32", price: 14.99, description: "WiFi and Bluetooth enabled microcontroller.", image: "ESP32.png", stock: 75 },
    { id: 3, name: "Arduino Mega", price: 39.99, description: "A powerful microcontroller with more pins and memory.", image: "ArduinoMega.png", stock: 100 },
    { id: 4, name: "Raspberry Pi 4", price: 55.99, description: "A small computer perfect for DIY projects.", image: "RaspberryPi4.png", stock: 50 },
    { id: 5, name: "Arduino Nano", price: 19.99, description: "Compact version of Arduino Uno.", image: "ArduinoNano.png", stock: 75 },
    { id: 6, name: "ESP8266", price: 6.99, description: "WiFi module for IoT projects.", image: "ESP8266.jpg", stock: 100 },
    { id: 7, name: "NodeMCU", price: 8.99, description: "Open-source IoT platform based on ESP8266.", image: "NodeMCU.jpg", stock: 50 },
    { id: 8, name: "STM32 Mini", price: 29.99, description: "Powerful microcontroller with advanced features.", image: "STM32Mini.jpg", stock: 25 },
    { id: 9, name: "Arduino Pro Mini", price: 14.99, description: "Small and flexible microcontroller board.", image: "ArduinoProMini.png", stock: 100 },
    { id: 10, name: "Raspberry Pi Pico", price: 4.99, description: "Microcontroller development board with dual-core processor.", image: "RaspberryPiPico.jpg", stock: 50 },
    { id: 11, name: "Teensy 4.0", price: 19.99, description: "High-performance microcontroller board.", image: "Teensy4.png", stock: 25 },
    { id: 12, name: "ESP32-S2", price: 15.99, description: "Powerful microcontroller with Wi-Fi and USB.", image: "ESP32S2.jpg", stock: 100 },
    { id: 13, name: "Arduino Leonardo", price: 24.99, description: "Microcontroller with built-in USB communication.", image: "ArduinoLeonardo.png", stock: 50 },
    { id: 14, name: "ESP32-CAM", price: 9.99, description: "Camera module based on ESP32 for video projects.", image: "ESP32CAM.jpg", stock: 25 },
    { id: 15, name: "Arduino MKR WiFi 1010", price: 34.99, description: "Microcontroller board with WiFi for IoT applications.", image: "ArduinoMKRWiFi1010.jpg", stock: 100 },
    { id: 16, name: "ESP32-WROOM", price: 10.99, description: "Advanced WiFi and Bluetooth module for IoT devices.", image: "ESP32WROOM.jpg", stock: 50 },
    { id: 17, name: "Raspberry Pi Zero", price: 10.99, description: "Ultra-low-cost and compact Raspberry Pi board.", image: "RaspberryPiZero.png", stock: 25 },
    { id: 18, name: "Adafruit Feather M0", price: 15.99, description: "Development board with ATSAMD21 Cortex M0 processor.", image: "FeatherM0.jpg", stock: 100 },
    { id: 19, name: "Arduino Due", price: 49.99, description: "Microcontroller board with 32-bit ARM processor.", image: "ArduinoDue.png", stock: 50 },
    { id: 20, name: "Raspberry Pi Compute Module", price: 59.99, description: "Compact version of Raspberry Pi for industrial use.", image: "RaspberryPiComputeModule.jpg", stock: 25 }
];


// Function to upload products to Firestore
async function uploadProducts() {
    console.log("Starting product upload...");
    const productsCollection = collection(db, "products");

    for (const product of products) {
        try {
            const docRef = await addDoc(productsCollection, product);
            console.log(`Product "${product.name}" added with ID: ${docRef.id}`);
        } catch (e) {
            console.error(`Error adding product "${product.name}":`, e);
        }
    }

    console.log("All products uploaded successfully!");
}

// Run the upload function
uploadProducts().then(() => {
    console.log("Migration complete!");
    // Remove the process.exit(0) to keep the script running
}).catch((error) => {
    console.error("Error during migration:", error);
    // Remove the process.exit(1) to keep the script running
});

// Add this line to keep the script running
console.log("Script is running. Press Ctrl+C to exit.");
