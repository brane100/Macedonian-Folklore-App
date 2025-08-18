// keepalive.js

const URL = `${process.env.URL}:${process.env.PORT}/keepalive`;

setInterval(async () => {
  try {
    const res = await fetch(URL);
    const text = await res.text();
    console.log("Keepalive ping success:", text);
  } catch (err) {
    console.error("Keepalive failed:", err.message);
  }
}, 3 * 60 * 1000); // every 2 minutes
