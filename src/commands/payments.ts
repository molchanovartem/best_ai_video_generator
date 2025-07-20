import { CallbackQueryContext } from "grammy";
// import { products } from "../consts/products.js";
import { MyContext } from "../types.js";
import 'dotenv/config.js';
import { User } from "../models/User.js";
import { Order } from "../models/Order.js";
import { getProducts, ModelName } from "../utils/getProducts.js";
import { menuKeyboard } from "../keyboards/index.js";

export const payments = async (ctx: CallbackQueryContext<MyContext>) => {
  try {
    await ctx.answerCallbackQuery();
  } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Error answering callback query:', errorMessage);
      // Optionally handle the error (e.g., ignore if it's just a timeout)
  }
  const productId = ctx.callbackQuery.data?.split('-')[1];

    const products = getProducts(process.env.MODEL_NAME as ModelName);
  

  if (!productId) {
    return ctx.callbackQuery.message?.editText('Произошла ошибка при обработке вашего запроса. Пожалуйста, попробуйте еще раз.');
  }

  const product = products.find(p => p.id === parseInt(productId));

  if (!product) {
    return ctx.callbackQuery.message?.editText('Товар не найден. Пожалуйста, попробуйте еще раз.');
  }

  try {
    const chatId = ctx.chat?.id;
    if (!chatId) {
      throw new Error('Chat ID is not available');
    }

    const providerInvoiceData = {
        receipt: {
            items: [{
                description: product.description,
                quantity: 1,
                amount: {
                    value: `${product.price}.00`,
                    currency: 'RUB'
                },
                vat_code: 1
            }],
        }
    }

    ctx.api.sendInvoice(
        chatId,
        product.name,
        product.description,
        product.id.toString(),
        'RUB',
        [
            {
                label: 'Руб',
                amount: product.price * 100, // Сумма в копейках
            }
        ], {
            provider_token: process.env.PAYMENT_TOKEN,
            need_email: true,
            send_email_to_provider: true,
            provider_data: JSON.stringify(providerInvoiceData)
        })

  } catch (error) {
    console.error('Error processing payment:', error);
    ctx.reply('Произошла ошибка при обработке платежа. Поддержка @var_molchanov')
    // return ctx.callbackQuery.message?.editText('Произошла ошибка при обработке платежа. Пожалуйста, попробуйте еще раз.');
  }
}

export const telegramSuccessPaymentHsndler = async (ctx: MyContext) => {
  if (!ctx.message?.successful_payment || !ctx.from?.id) {
    return ctx.reply('Не удалось обработать платеж. Пожалуйста, попробуйте еще раз.');
  }

    const { invoice_payload, total_amount } = ctx.message?.successful_payment

    const productId = parseInt(invoice_payload);
    const price = total_amount / 100; // Преобразуем сумму из копеек в рубли

    const products = getProducts(process.env.MODEL_NAME as ModelName);
    const product = products.find(p => p.id === productId);


    try {
      const user = await User.findOne({ telegramId: ctx.from.id });

      if (!user) {
        throw new Error(`Пользователь c id ${ctx.from.id} не найден. Пожалуйста, попробуйте еще раз.`);
      }

      await Order.create({
        userId: user._id,
        productId,
        price,
      });

      user.balanceSilent += product?.numberOfGenerations || 0; // Добавляем количество генераций к балансу пользователя
      await user.save();

      console.log(`Пользователь ${user.telegramId} успешно оплатил товар ${product?.name} на сумму ${price} руб.`);
      ctx.reply('Оплата прошла успешно. Теперь вы можете создать видео!', {
        reply_markup: menuKeyboard
      })
    } catch(error) { 
      console.error('Error processing successful payment:', error);
      ctx.reply('Произошла ошибка при обработке платежа. Поддержка @var_molchanov')
    }
}