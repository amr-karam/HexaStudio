import fetch from "node-fetch";

const HOSTINGER_API = "https://developers.hostinger.com/api/dns/v1/zones";
const API_TOKEN = process.env.HOSTINGER_API_KEY || "your-token-here";
const DOMAIN = process.env.DNS_DOMAIN || "hexastudio.net";
const IP = process.env.SERVER_IP || "19.16.1.100";

async function listRecords() {
  const url = `${HOSTINGER_API}/${DOMAIN}`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${API_TOKEN}`,
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function setARecords() {
  const url = `${HOSTINGER_API}/${DOMAIN}`;
  const zone = [
    { name: "@", type: "A", ttl: 14400, records: [{ content: IP }] },
    { name: "www", type: "A", ttl: 14400, records: [{ content: IP }] },
    { name: "*", type: "A", ttl: 14400, records: [{ content: IP }] },
    // Add other subdomains as needed
  ];
  const body = { overwrite: false, zone };
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${API_TOKEN}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

(async () => {
  try {
    const list = await listRecords();
    console.log("Current records:", JSON.stringify(list, null, 2));
    const update = await setARecords();
    console.log("DNS updated:", update?.updated === true ? "succeeded" : "failed");
  } catch (e) {
    console.error(e);
  }
})();
