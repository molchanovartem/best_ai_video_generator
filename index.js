import 'dotenv/config';
import { Bot } from 'grammy';
import { GrammyError, HttpError } from 'grammy';

const bot = new Bot(process.env.BOT_TOKEN);

// Ответ на команду /start
bot.command('start', (ctx) =>
  ctx.reply('Привет! Отправь мне любой текст, и я его повторю.'),
);

// Ответ на любое сообщение
bot.on('message', (ctx) => {
  ctx.reply(ctx.message.text);
});

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
  try {
    bot.start();
    console.log('Bot started');
  } catch (error) {
    console.error('Error in startBot:', error);
  }
}

startBot();
