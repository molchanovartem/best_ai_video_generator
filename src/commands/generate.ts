import { CallbackQueryContext, InlineKeyboard } from "grammy";
import { User } from "../models/User.js";
import { MyContext } from "../types.js";

export const generate =  async (ctx: CallbackQueryContext<MyContext>) => {
  try {
    await ctx.answerCallbackQuery();
  } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Error answering callback query:', errorMessage);
      // Optionally handle the error (e.g., ignore if it's just a timeout)
  }
  const user = await User.findOne({ telegramId: ctx.from?.id });

  if (!user) {
    return ctx.callbackQuery.message?.editText('Профиль не найден. Пожалуйста, зарегистрируйтесь заново используя команду /start', {
      reply_markup: new InlineKeyboard().text('Назад в меню', 'backToMenu')
    });
  }

  const registrationDate = user.createdAt.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  ctx.callbackQuery.message?.editText(`Здравствуйте ${ctx.from?.first_name}.\n Дата регистрации: ${registrationDate}\n 
  💎 *Ваш баланс:*
  🔊 Видео: ${user.balanceSilent}`, {
    reply_markup: new InlineKeyboard().text('Назад в меню', 'backToMenu')
  });
}