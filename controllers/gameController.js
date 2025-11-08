const Words = require("../models/wordsModel");
const User = require("../models/userModel");
const Achievements = require("../models/achievementModel");
const AsyncHandler = require("express-async-handler");

exports.createWord = async (req, res, next) => {
  const newWord = await Words.create(req.body);

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
      user.unlockedAchievements.push({
        achievementId: achievement._id,
        unlockedAt: new Date(),
      });

      newlyUnlocked.push({
        achievementId: achievement.achievementId,
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
      user.winRate = (
        (user.totalWins / (user.totalWins + user.totalLoses)) *
        100
      ).toFixed(1);

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
      user.winRate = (
        (user.totalWins / (user.totalWins + user.totalLoses)) *
        100
      ).toFixed(1);
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
        winRate: user.winRate,
      },
      newAchievements: newAchievements,
      rank: 1,
      score: user.totalWins * 15 + (user.unlockedAchievements.length || 0) * 5,
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

exports.leaderboard = AsyncHandler(async (req, res) => {
  try {
    const allUsers = await User.find({})
      .sort({
        score: -1,
        totalWins: -1,
      })
      .select("username rank score totalWins")
      .lean();

    let currentRank = 1;
    const rankedUsers = allUsers.map((user, index) => {
      if (
        index > 0 &&
        user.score === allUsers[index - 1].score &&
        user.totalWins === allUsers[index - 1].totalWins
      ) {
        currentRank = index - 1;
      } else {
        currentRank = index + 1;
      }
    });
  } catch (error) {
    console.log(error);

    res.status(400).json({
      status: "success",
      message: "An error occurred!",
    });
  }
});
