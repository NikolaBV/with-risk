async function syncAllPosts() {
  try {
    console.log("Starting post sync...");

    const response = await fetch("http://localhost:3000/api/sync/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });

    const result = await response.json();
    console.log("Sync result:", result);
  } catch (error) {
    console.error("Sync failed:", error);
  }
}

syncAllPosts();
