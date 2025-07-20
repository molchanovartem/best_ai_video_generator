// Файл: src/types.ts

import { Context, SessionFlavor } from "grammy";
import { HydrateFlavor } from "@grammyjs/hydrate";
import { type ConversationFlavor } from "@grammyjs/conversations";

// 1. Определяем данные сессии
interface MySessionData {
  // Оставьте пустым, если пока ничего не храните
}

// 2. Комбинируем все типы.
//    Обратите внимание на изменение: ConversationFlavor<Context>
export type MyContext = HydrateFlavor<Context> &
  SessionFlavor<MySessionData> &
  ConversationFlavor<Context>; // <- ИЗМЕНЕНИЕ ЗДЕСЬ