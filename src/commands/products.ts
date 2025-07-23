import { CallbackQueryContext, InlineKeyboard } from "grammy";
import { MyContext } from "../types.js";
import { getProducts, ModelName } from "../utils/getProducts.js";

export const productsCommand = async (ctx: CallbackQueryContext<MyContext>) => {
  try {
    await ctx.answerCallbackQuery();
  } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Error answering callback query:', errorMessage);
      // Optionally handle the error (e.g., ignore if it's just a timeout)
  }
  const products = getProducts(process.env.MODEL_NAME as ModelName);

  const productList = products.reduce((acc, curr) => {
    return ( acc + `⚡ ${curr.description} ${curr.price} ₽\n Описание: ${curr.description}\n\n`)
  }, '')

  const messageText = `🛍 Все товары:\n\n${productList}`
  const keyboadrsButtonRows = products.map((product) => {
    return InlineKeyboard.text(product.name, `buyProduct-${product.id}`);
  });
  const keyboard = InlineKeyboard.from([
    keyboadrsButtonRows,
    [InlineKeyboard.text('Назад в меню', 'backToMenu')]
  ])

  ctx.callbackQuery.message?.editText(messageText, {
    reply_markup: keyboard
  });
}