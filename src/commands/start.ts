import { InlineKeyboard } from "grammy";
import { User } from "../models/User.js";
import { MyContext } from "../types.js";
import { getModelName } from "../utils/getModelName.js";
import { getModelDescription } from "../utils/getModelDescription.js";

export const start = async (ctx: MyContext) => {
  if (!ctx.from) {
    return ctx.reply('User info is not available.');
  }

  const { id, username, first_name } = ctx.from;

  try {
    const keybosard = new InlineKeyboard().text('Меню', 'menu');
    let user = await User.findOne({ telegramId: id });

    if (!user) {
      user = new User({
        telegramId: id,
        firstName: first_name || 'Unknown',
        username: username || 'Unknown',
      });
      await user.save();
      console.log(`New user created: ${user.telegramId}`);
    }
    // const modelName = getModelName(process.env.MODEL_NAME);
    const modelDescription = getModelDescription(process.env.MODEL_NAME, user.balanceSilent);

    const welcomeText = modelDescription;

    return ctx.reply(welcomeText, {
      reply_markup: keybosard,
    });
  } catch (error) {
    console.error('Error while processing /start command:', error);
    return ctx.reply('Произошла ошибка при регистрации. Пожалуйста, попробуйте позже.');
  }
}

// TODO: когда сделаю реферальную систему

// const welcomeText = `🎬 Добро пожаловать в ${modelName} Bot!

// Создавайте реалистичные видео c озвучкой в ${modelName} от Google DeepMind!

// ✨ *Что умеет ${modelName}:*
// • Генерация видео из описания и изображения
// • Реалистичные физика, сцены, персонажи
// • Профессиональная озвучка и аудио эффекты

// 🎯 Начните создавать прямо сейчас!

// 💎 *Ваш баланс:*
// 🔊 Видео с озвучкой: ${user.balance_voiced}
// 🔇 Видео без озвучки: ${user.balance_silent}
// Приглашено друзей: ${user.invited_friends}
// 💰 Ваш реферальный код: ${user.referralCode}`;