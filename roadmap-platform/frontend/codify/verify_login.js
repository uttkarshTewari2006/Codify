
// Removing jsdom dependency as we only need fetch for this check.
// We are verifying the server-side redirect behavior (middleware).

async function testLoginRedirect() {
    console.log("Testing Middleware Redirect Logic...");

    try {
        // Port 3001 as seen in the logs
        const protectedUrl = "http://localhost:3001/dashboard";

        // fetch with redirect: "manual" lets us inspect the 307 response
        const res = await fetch(protectedUrl, { redirect: "manual" });

        console.log(`Request to ${protectedUrl}`);
        console.log(`Status: ${res.status}`);

        if (res.status === 307 || res.status === 302) {
            const location = res.headers.get("location");
            console.log(`Redirect Location: ${location}`);

            // Check if redirect contains /signin and callbackUrl
            if (location && location.includes("/signin") && location.includes("callbackUrl=%2Fdashboard")) {
                console.log("SUCCESS: Middleware correctly redirects unauthenticated users to Sign In with callbackUrl.");
            } else {
                console.log("FAILED: Redirect URL does not match expected format.");
                console.log("Expected: /signin?callbackUrl=/dashboard");
                console.log(`Received: ${location}`);
            }
        } else {
            console.log("FAILED: Did not redirect. Status code:", res.status);
        }

    } catch (error) {
        console.error("Error during verification:", error);
    }
}

testLoginRedirect();
