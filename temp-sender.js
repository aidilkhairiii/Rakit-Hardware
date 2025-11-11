import fetch from "node-fetch";

// Generate one random realistic temperature (°C)
function randomTemp() {
  // normal human body temp range: 36.1–37.5 °C
  const temp = (Math.random() * 1.4 + 36.1).toFixed(1);
  return temp;
}

async function sendTempOnce() {
  const temp = randomTemp();
  const value = `Temp : ${temp}°C`;

  try {
    const res = await fetch("http://localhost:2000/api/temp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value }),
    });
    const data = await res.json();
    console.log(`🌡️ Sent one-time temperature: ${value}`);
  } catch (err) {
    console.error("❌ Error sending temperature:", err.message);
  } finally {
    // Gracefully exit after sending
    process.exit(0);
  }
}

sendTempOnce();
