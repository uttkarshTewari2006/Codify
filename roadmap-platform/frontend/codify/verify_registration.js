
const appBaseUrl =
  (process.env.FRONTEND_APP_URL || process.env.NEXTAUTH_URL || "").replace(/\/+$/, "");

if (!appBaseUrl) {
  throw new Error("Set FRONTEND_APP_URL or NEXTAUTH_URL before running verify_registration.js");
}

async function testRegistration() {
    const email = `test-${Date.now()}@example.com`;
    const password = "Password123!";
    const name = "Test User";

    console.log(`Attempting to register user: ${email}`);

    try {
        const res = await fetch(`${appBaseUrl}/api/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, name }),
        });

        console.log(`Response status: ${res.status}`);
        const data = await res.json();
        console.log("Response body:", data);

        if (res.status === 201) {
            console.log("SUCCESS: User registered.");
        } else {
            console.log("FAILED: Registration failed.");
        }

        // Try verifying duplicate
        console.log("Verifying duplicate registration prevention...");
        const res2 = await fetch(`${appBaseUrl}/api/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, name }),
        });
        console.log(`Duplicate response status: ${res2.status}`);
        if (res2.status === 400) {
            console.log("SUCCESS: Duplicate prevented.");
        } else {
            console.log("FAILED: Duplicate not prevented.");
        }

    } catch (error) {
        console.error("Error during verification:", error);
    }
}

testRegistration();
