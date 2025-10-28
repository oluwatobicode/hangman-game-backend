const cron = require("node-cron");
const generateWordPerCategory = require("../services/aiGenWord");
const fs = require("fs");

cron.schedule("0 0 1 * *", async () => {
  console.log("cron job has started!");

  try {
    await generateWordPerCategory();

    fs.appendFileSync(
      "cron.log",
      `[${new Date().toISOString()}] Cron job ran successfully.\n`
    );

    console.log("It has finished uploading!");
  } catch (error) {
    fs.appendFileSync(
      "cron.log",
      `[${new Date().toISOString()}] Cron job ran successfully.\n`
    );
    console.log(error);
  }
});
