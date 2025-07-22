import { fal } from '@fal-ai/client';
import { User } from '../models/User.js';
import { InlineKeyboard } from 'grammy';
import { menuKeyboard } from "../keyboards/index.js";
import 'dotenv/config';

// --- Логика диалога ---
export async function generateConversation(conversation: any, ctx: any) {
  // 1. Проверки пользователя и баланса
  let user = await User.findOne({ telegramId: ctx.from?.id });

  if (!user) {
    await ctx.editMessageText('Профиль не найден. Пожалуйста, зарегистрируйтесь заново используя команду /start', {
      reply_markup: new InlineKeyboard().text('Назад в меню', 'backToMenu')
    });
    return;
  }

  if (user.balanceSilent < 1) {
    await ctx.editMessageText('У вас нет генераций. Купить их можно по кнопке ниже', {
      reply_markup: new InlineKeyboard().text('🛍️ Товары', 'products')
    });
    return;
  }

  // 2. Запрашиваем у пользователя промпт или изображение
  await ctx.reply("Что вы хотите видеть на сгенерированном видео? Вы можете отправить текстовый промпт или изображение с подписью.", {
    reply_markup: new InlineKeyboard().text('Отмена', 'EXITbackToMenu')
  });

  // 3. АЛЬТЕРНАТИВА race(): Используем wait() и проверяем результат
  const replyCtx = await conversation.wait();

  // 4. Обрабатываем ответ пользователя
  let userPrompt: string | undefined;
  let imageUrl: string | undefined;

  // Если пользователь нажал кнопку
  if (replyCtx.callbackQuery?.data === 'EXITbackToMenu') {
      await replyCtx.answerCallbackQuery({ text: 'Генерация отменена.' });
      await replyCtx.editMessageText('Вы вернулись в главное меню.', { reply_markup: menuKeyboard });
      return; // Выходим из диалога
  }

  // Если пользователь отправил фото
  if (replyCtx.message?.photo) {
      userPrompt = replyCtx.message.caption || ''; // Берем подпись к фото

      const photo = replyCtx.message.photo.pop();
      if (photo) {
        const file = await replyCtx.api.getFile(photo.file_id);
        const filePath = file.file_path;

        if (filePath) {
          const fileUrl = `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${filePath}`;
          await replyCtx.reply('Фото получено, загружаю его на сервер...');
          const response = await fetch(fileUrl);
          const blob = await response.blob();
          imageUrl = await conversation.external(() => fal.storage.upload(blob));
          console.log('File uploaded to fal.storage:', imageUrl);
        }
      }

      // Если у фото не было подписи, запрашиваем текст отдельно
      if (!userPrompt) {
        await replyCtx.reply("Отлично! Теперь отправьте текстовый промпт, описывающий, что должно происходить на видео.");
        // Ждем конкретно текстовое сообщение
        const textCtx = await conversation.waitFor('message:text');
        userPrompt = textCtx.message.text;
      }

  } // Если пользователь отправил текст
  else if (replyCtx.message?.text) {
      userPrompt = replyCtx.message.text;
  }

  // Если пользователь не отправил ни текст, ни фото, ни колбэк
  if (!userPrompt) {
      await ctx.reply("Не удалось распознать ваш ввод. Пожалуйста, попробуйте снова, отправив текст или фото.", { reply_markup: menuKeyboard });
      return;
  }

  // 5. Запускаем генерацию
  await replyCtx.reply(`Принял! Начинаю генерацию видео по вашему запросу: "${userPrompt}". Это может занять некоторое время...`);

  user.balanceSilent -= 1;
  await user.save();

  try {
    await replyCtx.replyWithChatAction("upload_video");

    const videoUrl = await conversation.external(() => generateVideoFile(userPrompt, imageUrl));

    await replyCtx.replyWithVideo(videoUrl, {
        supports_streaming: true,
    });

    await replyCtx.reply('Ваше видео готово!\nСоздадим еще одно?', {
      reply_markup: menuKeyboard
    });
  } catch (error) {
    user.balanceSilent += 1;
    await user.save();
    console.error(`(ID чата: ${ctx.from?.id}) Ошибка при генерации видео:`, error);

    await replyCtx.reply('❌ Упс! Во время генерации произошла ошибка. Попробуйте другой промт или повторите попытку позже. \n\nМы вернули 1 генерацию на ваш баланс.', {
      reply_markup: menuKeyboard
    });
  }
}
// Вспомогательная функция для генерации (остается без изменений)
async function generateVideoFile(prompt: string, imageUrl?: string): Promise<string> {
    try {
        console.log(`[GENERATION] Начало генерации для промпта: "${prompt}"${imageUrl ? ' с изображением' : ''}`);

        const input: { prompt: string; image_url?: string } = { prompt };
        if (imageUrl) input.image_url = imageUrl;

        const model = imageUrl ? 'fal-ai/pixverse/v4.5/image-to-video' : 'fal-ai/pixverse/v4.5/text-to-video';

        const result: any = await fal.run(model, { input });

        if (!result?.data?.video?.url) {
          console.error("Неожиданный ответ от fal.ai:", result);
          throw new Error("API генерации вернуло неверный формат данных.");
        }

        const videoUrl = result.data.video.url;
        console.log(`[GENERATION] Генерация завершена. Файл: ${videoUrl}`);
        return videoUrl;
    } catch (error) {
        console.error(`[ERROR] Ошибка при генерации видео: ${error}`);
        throw new Error("Не удалось сгенерировать видео. Пожалуйста, попробуйте позже.");
    }
}
