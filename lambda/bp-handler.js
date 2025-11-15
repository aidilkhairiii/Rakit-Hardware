import axios from "axios";

// Your server.js URL (You'll need to expose this publicly or use a tunnel)
// For now using localhost - you'll need ngrok or a public URL
const SERVER_URL = process.env.SERVER_URL || "http://localhost:3000";

// Lambda Handler
export const handler = async (event) => {
  console.log("Event:", JSON.stringify(event, null, 2));

  // CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

  // Handle OPTIONS preflight request
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: "OK" }),
    };
  }

  try {
    // Parse body
    const body = JSON.parse(event.body || "{}");
    const latestBP = body.value || "";

    console.log("🩺 Lambda received BP:", latestBP);
    console.log(`📤 Forwarding to server.js: ${SERVER_URL}/api/data`);

    // Forward the request to server.js
    const response = await axios.post(`${SERVER_URL}/api/data`, {
      value: latestBP
    }, {
      timeout: 5000 // 5 second timeout
    });

    console.log("✅ Server.js response:", response.data);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        message: "BP data forwarded to server.js",
        serverResponse: response.data
      }),
    };
  } catch (error) {
    console.error("❌ Error forwarding to server.js:", error.message);
    
    // Return success to Android even if server.js is down
    // This prevents Android from getting errors
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        message: "Lambda received data (server.js may be offline)",
        warning: error.message
      }),
    };
  }
};
