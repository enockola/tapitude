import ContentPage from "../models/ContentPage";

export async function publishDueScheduledPosts() {
  const now = new Date();

  const result = await ContentPage.updateMany(
    {
      status: "scheduled",
      scheduledFor: { $lte: now }
    },
    {
      $set: {
        status: "published",
        publishedAt: now
      }
    }
  );

  if (result.modifiedCount > 0) {
    console.log(`Published ${result.modifiedCount} scheduled content page(s).`);
  }
}

export function startContentScheduler() {
  publishDueScheduledPosts().catch((error) => {
    console.error("Failed to publish due scheduled posts:", error);
  });

  setInterval(() => {
    publishDueScheduledPosts().catch((error) => {
      console.error("Failed to publish due scheduled posts:", error);
    });
  }, 60 * 1000);
}