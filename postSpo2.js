import fetch from "node-fetch";

// Generate random realistic readings
function randomSpo2() {
  return Math.floor(Math.random() * 4) + 96; // 96–99%
}
function randomBPM() {
  return Math.floor(Math.random() * 30) + 65; // 65–95 bpm
}

// Send continuously
async function sendData() {
  const spo2 = randomSpo2();
  const bpm = randomBPM();
  const value = `SpO2 : ${spo2}%, BPM : ${bpm}`;

  try {
    const res = await fetch("http://localhost:2000/api/spo2", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value }),
    });
    const data = await res.json();
    console.log("✅ Sent:", value);
  } catch (err) {
    console.error("❌ Error sending:", err.message);
  }
}

// Run every 1 second forever
setInterval(sendData, 1000);
