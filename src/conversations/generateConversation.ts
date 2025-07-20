import { fal } from '@fal-ai/client'
import { User } from '../models/User.js';
import { InlineKeyboard } from 'grammy';
import { menuKeyboard } from "../keyboards/index.js";

// const EXIT_COMMANDS = ['отмена', 'назад', 'отменить', 'cancel', 'exit'];

// --- Логика диалога ---
export async function generateConversation(conversation: any, ctx: any) {
  // 1. Спрашиваем пользователя, что он хочет сгенерировать
  await ctx.reply("Что вы хотите видеть на сгенерированном видео?", {
    reply_markup: new InlineKeyboard().text('Назад в меню', 'EXITbackToMenu')
  });

  // 2. Ждём ответ пользователя (следующее сообщение от него)
  const promptCtx = await conversation.wait();


  if (promptCtx?.update?.callback_query?.data === 'EXITbackToMenu') {
    await ctx.reply(`
      ✨ Вы в главном меню!
  Отсюда вы можете перейти в каталог товаров 🛍️ или открыть свой профиль 👤.
  Чтобы продолжить, нажмите кнопку ниже ⬇️
  `, {
    reply_markup: menuKeyboard
  });
    return; // Выходим из диалога
  }
  
  // Проверяем, что пользователь прислал именно текст
  if (!promptCtx.message?.text) {
    await ctx.reply("Пожалуйста, отправьте текстовый промпт.");
    return; // Выходим из диалога
  }
  
  const userPrompt = promptCtx.message.text;
  
  // Проверяем, не хочет ли пользователь выйти
  // if (EXIT_COMMANDS.includes(userPrompt.toLowerCase())) {
  //   await ctx.reply("Генерация отменена. Возвращаемся в главное меню.", {
  //     reply_markup: menuKeyboard
  //   });
  //   return;
  // }

  await ctx.reply(`Принял! Начинаю генерацию видео по вашему запросу: "${userPrompt}". Это может занять некоторое время...`);
  let user = await User.findOne({ telegramId: ctx.from?.id });

  if (!user) {
    return ctx.callbackQuery.message?.editText('Профиль не найден. Пожалуйста, зарегистрируйтесь заново используя команду /start', {
      reply_markup: new InlineKeyboard().text('Назад в меню', 'backToMenu')
    });
  }

  if (user.balanceSilent < 1) {
    return ctx.callbackQuery.message?.editText('У вас нет генераций. Купить их можно по кнопке ниже', {
      reply_markup: new InlineKeyboard().text('🛍️ Товары', 'products')
    });
  }

  user.balanceSilent -= 1;
  await user.save();

  try {
    await ctx.replyWithChatAction("upload_video");

    // const videoUrl = await conversation.external(() => generateVideoFile(userPrompt));
    const videoUrl = 'https://v3.fal.media/files/lion/NfyXdCFBvAzRsMe2R1Fb8_output.mp4'
    await ctx.replyWithVideo(videoUrl, {
        supports_streaming: true,
    });

    await ctx.reply('Твое видео готово!\nСоздадим еще одно?', {
      reply_markup: menuKeyboard
  });
  } catch (error) {
    user.balanceSilent += 1;
    await user.save();
    console.error(`(ID чата: ${ctx.from?.id}) Ошибка при генерации видео:`, error);

    await ctx.reply('❌ Упс! Во время генерации произошла ошибка. Попробуйте другой промт или повторите попытку позже. \n\nМы вернули 1 генерацию на ваш баланс.', {
      reply_markup: menuKeyboard
    });
  }
}

async function generateVideoFile(prompt: string): Promise<string> {
    try {
        console.log(`[GENERATION] Начало генерации для промпта: "${prompt}"`);

        const input = {
          prompt: prompt,
          // Вы можете добавить другие параметры, которые поддерживает модель
          // num_inference_steps: 25,
          // seed: 42,
      };
      
      const result = await fal.run('fal-ai/pixverse/v4.5/text-to-video', {
          input: input,
      });
      console.log(result);
      
      const videoUrl = result.data.video.url;
        
      console.log(`[GENERATION] Генерация завершена. Файл: ${videoUrl}`);
      return videoUrl;
    } catch (error) {
        console.error(`[ERROR] Ошибка при генерации видео: ${error}`);
        throw new Error("Не удалось сгенерировать видео. Пожалуйста, попробуйте позже.");
    }
}