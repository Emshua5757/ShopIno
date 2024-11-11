import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

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
    { 
        id: 1, 
        name: "Arduino Uno", 
        price: 25.99, 
        description: "The Arduino Uno is a highly popular microcontroller board ideal for beginners and hobbyists. It is widely used for prototyping and learning the basics of electronics and programming, supporting a variety of add-ons and sensors to create custom projects.", 
        image: "ArduinoUno.png", 
        stock: 50,
        category: "Microcontroller"
    },
    { 
        id: 2, 
        name: "ESP32", 
        price: 14.99, 
        description: "The ESP32 microcontroller combines WiFi and Bluetooth capabilities, making it perfect for IoT projects. It is equipped with dual-core processing power and is widely used in smart home and wearable device development.", 
        image: "ESP32.png", 
        stock: 75,
        category: "Microcontroller"
    },
    { 
        id: 3, 
        name: "Arduino Mega", 
        price: 39.99, 
        description: "The Arduino Mega offers more I/O pins and memory than the Uno, making it ideal for complex projects that require multiple inputs and outputs. It’s commonly used in robotics and large-scale automation systems.", 
        image: "ArduinoMega.png", 
        stock: 100,
        category: "Microcontroller"
    },
    { 
        id: 4, 
        name: "Raspberry Pi 4", 
        price: 55.99, 
        description: "The Raspberry Pi 4 is a small, versatile computer with desktop-level processing power. It’s ideal for DIY projects, learning programming, or even as a low-cost media center, supporting a range of operating systems.", 
        image: "RaspberryPi4.png", 
        stock: 50,
        category: "Single-Board Computer"
    },
    { 
        id: 5, 
        name: "Arduino Nano", 
        price: 19.99, 
        description: "The Arduino Nano is a compact version of the Arduino Uno, designed for projects with space constraints. It’s perfect for embedded systems and wearable projects where a small footprint is essential.", 
        image: "ArduinoNano.png", 
        stock: 75,
        category: "Microcontroller"
    },
    { 
        id: 6, 
        name: "ESP8266", 
        price: 6.99, 
        description: "The ESP8266 is a low-cost WiFi module often used in IoT projects for simple wireless connectivity. It’s popular for home automation projects, offering a compact, efficient way to add WiFi to a project.", 
        image: "ESP8266.jpg", 
        stock: 100,
        category: "Module"
    },
    { 
        id: 7, 
        name: "NodeMCU", 
        price: 8.99, 
        description: "NodeMCU is an open-source IoT platform based on the ESP8266 WiFi module. It is easy to program and perfect for IoT and home automation projects, with a compact form factor ideal for small projects.", 
        image: "NodeMCU.jpg", 
        stock: 50,
        category: "Microcontroller"
    },
    { 
        id: 8, 
        name: "STM32 Mini", 
        price: 29.99, 
        description: "The STM32 Mini is a powerful, advanced microcontroller based on ARM Cortex technology, featuring high processing speed and performance for complex applications like robotics, drones, and industrial automation.", 
        image: "STM32Mini.jpg", 
        stock: 25,
        category: "Microcontroller"
    },
    { 
        id: 9, 
        name: "Arduino Pro Mini", 
        price: 14.99, 
        description: "The Arduino Pro Mini is a small, flexible microcontroller board for embedded systems. Its compact design is suitable for wearable tech, miniaturized prototypes, and other compact applications.", 
        image: "ArduinoProMini.png", 
        stock: 100,
        category: "Microcontroller"
    },
    { 
        id: 10, 
        name: "Raspberry Pi Pico", 
        price: 4.99, 
        description: "The Raspberry Pi Pico is a microcontroller development board with a dual-core processor and programmable I/O pins. It's designed for embedded applications and provides an affordable solution for learning electronics and coding.", 
        image: "RaspberryPiPico.jpg", 
        stock: 50,
        category: "Microcontroller"
    },
    { 
        id: 11, 
        name: "Teensy 4.0", 
        price: 19.99, 
        description: "Teensy 4.0 is a high-performance microcontroller board known for its speed and versatility. Ideal for audio, MIDI, and complex computations, it’s used widely in gaming and art installations.", 
        image: "Teensy4.png", 
        stock: 25,
        category: "Microcontroller"
    },
    { 
        id: 12, 
        name: "ESP32-S2", 
        price: 15.99, 
        description: "The ESP32-S2 is a powerful microcontroller with enhanced WiFi capabilities and USB support, ideal for IoT devices requiring reliable wireless communication and USB connectivity.", 
        image: "ESP32S2.jpg", 
        stock: 100,
        category: "Microcontroller"
    },
    { 
        id: 13, 
        name: "Arduino Leonardo", 
        price: 24.99, 
        description: "The Arduino Leonardo features built-in USB communication, making it ideal for USB-based projects such as custom HID devices. It’s used in creative coding, wearable technology, and DIY keyboard projects.", 
        image: "ArduinoLeonardo.png", 
        stock: 50,
        category: "Microcontroller"
    },
    { 
        id: 14, 
        name: "ESP32-CAM", 
        price: 9.99, 
        description: "The ESP32-CAM is a compact camera module based on ESP32, designed for streaming video, taking photos, and image recognition in IoT applications.", 
        image: "ESP32CAM.jpg", 
        stock: 25,
        category: "Module"
    },
    { 
        id: 15, 
        name: "Arduino MKR WiFi 1010", 
        price: 34.99, 
        description: "The Arduino MKR WiFi 1010 is a microcontroller with integrated WiFi capabilities, aimed at IoT applications. It’s commonly used in smart home projects, data logging, and sensor networks.", 
        image: "ArduinoMKRWiFi1010.jpg", 
        stock: 100,
        category: "Microcontroller"
    },
    { 
        id: 16, 
        name: "ESP32-WROOM", 
        price: 10.99, 
        description: "The ESP32-WROOM is a high-performance module with WiFi and Bluetooth support, perfect for IoT devices needing fast and reliable wireless communication in compact designs.", 
        image: "ESP32WROOM.jpg", 
        stock: 50,
        category: "Module"
    },
    { 
        id: 17, 
        name: "Raspberry Pi Zero", 
        price: 10.99, 
        description: "The Raspberry Pi Zero is an ultra-low-cost, compact single-board computer with extensive support for IoT projects and media applications, perfect for portable and embedded solutions.", 
        image: "RaspberryPiZero.png", 
        stock: 25,
        category: "Single-Board Computer"
    },
    { 
        id: 18, 
        name: "Adafruit Feather M0", 
        price: 15.99, 
        description: "The Adafruit Feather M0 is a versatile development board featuring the ATSAMD21 Cortex M0 processor. It’s designed for wearable electronics and low-power IoT projects.", 
        image: "FeatherM0.jpg", 
        stock: 100,
        category: "Microcontroller"
    },
    { 
        id: 19, 
        name: "Arduino Due", 
        price: 49.99, 
        description: "The Arduino Due is the first Arduino board with a 32-bit ARM processor, offering high performance for demanding applications in robotics, signal processing, and industrial automation.", 
        image: "ArduinoDue.png", 
        stock: 50,
        category: "Microcontroller"
    },
    { 
        id: 20, 
        name: "Raspberry Pi Compute Module", 
        price: 59.99, 
        description: "The Raspberry Pi Compute Module is designed for industrial use, offering the computing power of a Raspberry Pi in a compact form factor ideal for custom hardware designs and embedded applications.", 
        image: "RaspberryPiComputeModule.jpg", 
        stock: 25,
        category: "Single-Board Computer"
    }
];



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

uploadProducts().then(() => {
    console.log("Migration complete!");
}).catch((error) => {
    console.error("Error during migration:", error);
});

console.log("Script is running. Press Ctrl+C to exit.");
