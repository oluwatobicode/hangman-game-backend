const Words = require("../models/wordsModel");
const User = require("../models/userModel");
const Achievements = require("../models/achievementModel");
const AsyncHandler = require("express-async-handler");
const uuid = require("uuid");
const { generateWordPerCategory } = require("../services/aiGenWord");

exports.createWord = async (req, res, next) => {
  const newWord = await Words.create(req.body);

  await generateWordPerCategory();

  try {
    res.status(201).json({
      status: "success",
      data: {
        newWord,
      },
    });
  } catch (error) {
    console.log(error);
  }

  next();
};

exports.createGame = AsyncHandler(async (req, res, next) => {
  console.log(req);
  const { category } = req.query;

  try {
    const count = await Words.countDocuments({ category });

    if (count === 0) {
      res.status(400).json({
        status: "fail",
        message: "there was no word found for this category",
      });
    }

    // this would helping in getting a random word using aggregation
    const [word] = await Words.aggregate([
      { $match: { category } },
      { $sample: { size: 1 } }, // this is MongoDB's random selector
    ]);

    // Update usage stats
    await Words.findByIdAndUpdate(word._id, {
      $inc: { usedCount: 1 },
      lastUsedAt: new Date(),
    });

    res.status(200).json({
      status: "success",
      data: {
        // gameId: uuid.v4(),
        word: word.word,
        id: word._id,
        category: word.category,
        hint: word.hint,
        difficulty: word.difficulty,
        length: word.word.length,
      },
    });
  } catch (error) {
    console.log(error);
  }

  next();
});

const checkAchievements = async (user, gameData) => {
  console.log("Checking achievements for user:", user.username);

  const allAchievements = await Achievements.find({ isActive: true });
  const newlyUnlocked = [];

  for (const achievement of allAchievements) {
    // Check if user already has this achievement
    const alreadyHas = user.unlockedAchievements.some(
      (a) => a.achievementId.toString() === achievement._id.toString()
    );

    if (alreadyHas) {
      console.log(`Achievement ${achievement.name} already unlocked`);
      continue;
    }

    let unlocked = false;

    switch (achievement.type) {
      case "win_count":
        unlocked = user.totalWins >= achievement.requirement.wins;
        break;

      case "streak":
        unlocked = user.currentStreak >= achievement.requirement.streak;
        break;

      case "no_hint":
        unlocked =
          user.achievementProgress.gamesWithoutHint >=
          achievement.requirement.noHintWins;
        break;

      case "difficulty":
        const diffWins =
          user.achievementProgress.difficultyWins[
            achievement.requirement.difficulty
          ] || 0;
        unlocked = diffWins >= achievement.requirement.wins;
        break;

      case "category":
        const catWins =
          user.achievementProgress.categoryWins[
            achievement.requirement.category
          ] || 0;
        unlocked = catWins >= achievement.requirement.wins;
        break;

      case "speed":
        if (
          gameData.won &&
          gameData.duration <= achievement.requirement.timeLimit
        ) {
          unlocked = true;
        }
        break;

      case "perfect":
        if (gameData.wrongGuesses === 0 && gameData.won) {
          unlocked =
            user.achievementProgress.perfectGames >=
            achievement.requirement.wins;
        }
        break;

      default:
        break;
    }

    if (unlocked) {
      // Add to user's unlocked achievements
      user.unlockedAchievements.push({
        achievementId: achievement._id,
        unlockedAt: new Date(),
      });

      // Return achievement details to show to user
      newlyUnlocked.push({
        achievementId: achievement.achievementId, // This is the string ID
        name: achievement.name,
        description: achievement.description,
        icon: achievement.icon,
        rarity: achievement.rarity,
        points: achievement.points,
      });

      console.log(`✨ New achievement unlocked: ${achievement.name}`);
    }
  }

  return newlyUnlocked;
};

exports.endGame = AsyncHandler(async (req, res, next) => {
  try {
    const { won, usedHint, wrongGuesses, duration, gameData } = req.body;

    console.log(usedHint);

    console.log("hi", req.body.usedHint);

    const userId = req.user.id;

    console.log("the user id", userId);

    // 1) get user
    const user = await User.findById(userId);

    console.log("the user has been found", user);

    console.log(won);

    // 2) update user stats
    if (won) {
      user.totalWins += 1;
      user.currentStreak += 1;
      user.bestStreak = Math.max(user.bestStreak, user.currentStreak);

      // update category wins
      user.achievementProgress.categoryWins[gameData.category] =
        (user.achievementProgress.categoryWins[gameData.category] || 0) + 1;

      // console.log("test", gameData);

      user.achievementProgress.difficultyWins[gameData.difficulty] =
        (user.achievementProgress.difficultyWins[gameData.difficulty] || 0) + 1;

      console.log("Hint used", usedHint);

      if (!usedHint) {
        user.achievementProgress.gamesWithoutHint += 1;
      } else {
        user.achievementProgress.gamesWithoutHint = 0;
      }

      if (wrongGuesses === 0) {
        user.achievementProgress.perfectGames += 1;
      }
    } else {
      user.totalLoses += 1;
      user.currentStreak = 0;
      user.achievementProgress.gamesWithoutHint = 0;
    }

    console.log("hi i am reaching here");
    // 3) check for new achievements
    const newAchievements = await checkAchievements(user, {
      won,
      duration,
      wrongGuesses,
      usedHint,
    });

    // 4) update word usage
    // await Words.findByIdAndUpdate(gameData._id, {
    //   $inc: { usedCount: 1 },
    //   lastUsedAt: new Date(),
    // });

    console.log("these are it", newAchievements);

    // 3) save
    await user.save();

    res.status(200).json({
      status: "success",
      stats: {
        totalWins: user.totalWins,
        totalLoses: user.totalLoses,
        currentStreak: user.currentStreak,
        bestStreak: user.bestStreak,
        winRate: (
          (user.totalWins / (user.totalWins + user.totalLoses)) *
          100
        ).toFixed(1),
      },
      newAchievements: newAchievements,
      rank: 1,
      totalAchievements: user.unlockedAchievements.length,
    });
  } catch (error) {
    console.log(error);

    res.status(400).json({
      status: "failed",
      message: "failed to end game, try again!",
    });
  }
});

/* 

exports.endGame = async (req, res) => {
  const { gameId, won, usedHint, wrongGuesses, duration } = req.body;
  const userId = req.userId;

  try {
    // 1. Get game session
    const gameData = JSON.parse(await redis.get(`game:${gameId}`));

    if (!gameData || gameData.userId !== userId) {
      return res.status(400).json({ error: "Invalid game" });
    }

    // 2. Get user
    const user = await User.findById(userId);

    // 3. Update user stats
    if (won) {
      user.totalWins += 1;
      user.currentStreak += 1;
      user.bestStreak = Math.max(user.bestStreak, user.currentStreak);
      user.guessedWords.push(gameData.word);

      // Update category wins
      user.achievementProgress.categoryWins[gameData.category] =
        (user.achievementProgress.categoryWins[gameData.category] || 0) + 1;

      // Update difficulty wins
      user.achievementProgress.difficultyWins[gameData.difficulty] =
        (user.achievementProgress.difficultyWins[gameData.difficulty] || 0) + 1;

      // Track hint usage
      if (!usedHint) {
        user.achievementProgress.gamesWithoutHint += 1;
      } else {
        user.achievementProgress.gamesWithoutHint = 0; // Reset counter
      }

      // Track perfect games
      if (wrongGuesses === 0) {
        user.achievementProgress.perfectGames += 1;
      }
    } else {
      user.totalLosses += 1;
      user.currentStreak = 0;
      user.achievementProgress.gamesWithoutHint = 0;
    }

    // 4. Check for new achievements
    const newAchievements = await checkAchievements(user, {
      won,
      duration,
      wrongGuesses,
    });

    // 5. Save user
    await user.save();

    // 6. Update leaderboard (if using Redis)
    if (won) {
      await redis.zadd("leaderboard:wins", user.totalWins, user.username);
      await redis.zadd(
        "leaderboard:achievements",
        user.unlockedAchievements.length,
        user.username
      );
    }

    // 7. Save game history (optional but recommended)
    await GameHistory.create({
      userId,
      wordId: gameData.wordId,
      word: gameData.word,
      category: gameData.category,
      difficulty: gameData.difficulty,
      won,
      usedHint,
      wrongGuesses,
      duration,
      playedAt: new Date(),
    });

    // 8. Update word usage stats
    await Word.findByIdAndUpdate(gameData.wordId, {
      $inc: { usedCount: 1 },
      lastUsedAt: new Date(),
    });

    // 9. Delete game session
    await redis.del(`game:${gameId}`);

    // 10. Get user's rank
    const rank = await redis.zrevrank("leaderboard:wins", user.username);

    // 11. Return response
    res.json({
      success: true,
      stats: {
        totalWins: user.totalWins,
        totalLosses: user.totalLosses,
        currentStreak: user.currentStreak,
        bestStreak: user.bestStreak,
        winRate: (
          (user.totalWins / (user.totalWins + user.totalLosses)) *
          100
        ).toFixed(1),
      },
      newAchievements, // Array of newly unlocked achievements
      rank: rank + 1, // Redis ranks are 0-indexed
      totalAchievements: user.unlockedAchievements.length,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to end game" });
  }
};

 */

// exports.createWordWithAI = async (req, res, next) => {
//   try {
//     const result = await generateWordPerCategory();

//     res.status(200).json({
//       status: "success",
//       message: "Words generated successfully",
//       data: result,
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(400).json({
//       status: "fail",
//       message: error.message,
//     });
//   }
// });
