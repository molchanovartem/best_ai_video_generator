import 'dotenv/config';
import { Bot, GrammyError, HttpError, InlineKeyboard, InputFile, session } from 'grammy';
import mongoose from 'mongoose';
import { hydrate } from '@grammyjs/hydrate';
import { MyContext } from './types.js';
import { start, profile, productsCommand, payments, telegramSuccessPaymentHsndler, generate } from './commands/index.js';
import {
  type Conversation,
  type ConversationFlavor,
  conversations,
  createConversation,
} from "@grammyjs/conversations";
import { generateConversation } from './conversations/generateConversation.js';
import { menuKeyboard } from './keyboards/menuKeyboard.js';

const botApiKey = process.env.BOT_TOKEN;
if (!botApiKey) {
  throw new Error('BOT_TOKEN is not defined in the environment variables');
}
const bot = new Bot<MyContext>(botApiKey);

bot.on('pre_checkout_query', (ctx) => {
  ctx.answerPreCheckoutQuery(true)
})

bot.use(hydrate());

bot.use(session({ initial: () => ({}) }));

// 2. Устанавливаем middleware для диалогов
bot.use(conversations());

// 3. Регистрируем наш диалог в боте под именем "generate"
bot.use(createConversation(generateConversation, "generate"));

bot.on(':successful_payment', telegramSuccessPaymentHsndler)

// Ответ на команду /start
bot.command('start', start);
bot.callbackQuery('menu', async (ctx) => {
  try {
    await ctx.answerCallbackQuery();
} catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Error answering callback query:', errorMessage);
    // Optionally handle the error (e.g., ignore if it's just a timeout)
}

  ctx.callbackQuery.message?.editText(`
    ✨ Вы в главном меню!
Отсюда вы можете перейти в каталог товаров 🛍️ или открыть свой профиль 👤.
Чтобы продолжить, нажмите кнопку ниже ⬇️
`, {
    reply_markup: menuKeyboard
  });
})

bot.callbackQuery('products', productsCommand)

bot.callbackQuery('profile', profile)

bot.callbackQuery('generate', async (ctx) => {
  console.log('[COMMAND] /generate received');
  await ctx.conversation.enter("generate");
})
// bot.command("generate", async (ctx) => {
//   console.log('[COMMAND] /generate received');
//   await ctx.conversation.enter("generate");
// });

bot.callbackQuery(/^buyProduct-\d+$/, payments)

bot.callbackQuery('backToMenu', async (ctx) => {
  try {
    await ctx.answerCallbackQuery();
  } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Error answering callback query:', errorMessage);
      // Optionally handle the error (e.g., ignore if it's just a timeout)
  }

  ctx.callbackQuery.message?.editText(`
    ✨ Вы в главном меню!
Отсюда вы можете перейти в каталог товаров 🛍️ или открыть свой профиль 👤.
Чтобы продолжить, нажмите кнопку ниже ⬇️
`, {
    reply_markup: menuKeyboard
  });
})

// Ответ на любое сообщение
// bot.on('message:text', (ctx) => {
//   ctx.reply(ctx.message.text);
// });

// Обработка ошибок согласно документации
bot.catch((err) => {
  const ctx = err.ctx;
  console.error(`Error while handling update ${ctx.update.update_id}:`);
  const e = err.error;

  if (e instanceof GrammyError) {
    console.error('Error in request:', e.description);
  } else if (e instanceof HttpError) {
    console.error('Could not contact Telegram:', e);
  } else {
    console.error('Unknown error:', e);
  }
});

// Функция запуска бота
async function startBot() {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined in the environment variables');
  }

  try {
    await mongoose.connect(MONGODB_URI)
    console.log('Mongodb started');
    bot.start();
    console.log('Bot started');
  } catch (error) {
    console.error('Error in startBot:', error);
  }
}

startBot();
