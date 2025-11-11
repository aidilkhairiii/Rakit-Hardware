import fetch from "node-fetch";

// Generate a random BP value (systolic/diastolic)
function randomBP() {
  const systolic = Math.floor(Math.random() * 20) + 110; // 110–130
  const diastolic = Math.floor(Math.random() * 15) + 70; // 70–85
  return `${systolic}/${diastolic}`;
}

// Send data to your main server
async function sendData(value) {
  try {
    const res = await fetch("http://localhost:2000/api/data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value }),
    });
    const data = await res.json();
    console.log("✅ Sent:", value);
  } catch (err) {
    console.error("❌ Error sending data:", err.message);
  }
}

// Simulate device sending 10 ongoing readings, then a final result
let count = 0;
const interval = setInterval(async () => {
  count++;

  if (count <= 10) {
    const bp = randomBP();
    await sendData(`On going : ${bp}`);
  } else {
    const finalBP = randomBP();
    await sendData(`Result : ${finalBP}`);
    console.log("🏁 Final result sent. Stopping transmission.");
    clearInterval(interval); // stop after result
  }
}, 1000); // send every 1 second
