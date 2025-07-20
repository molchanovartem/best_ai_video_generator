import { ModelName } from "./getModelName.js";

export const getModelDescription = (modelName: ModelName | undefined, userBalanceSilent: number): string => {
    if (modelName === 'veo-3') {
        return `
      🎬 Добро пожаловать в ${modelName} Bot!

    Создавайте реалистичные видео c озвучкой в ${modelName}!
    
    ✨ *Что умеет ${modelName}:*
    • Генерация видео из описания и изображения
    • Реалистичные физика, сцены, персонажи
    • Профессиональная озвучка и аудио эффекты
    
    🎯 Начните создавать прямо сейчас!
    
    💎 *Ваш баланс:*
    🔊 Видео: ${userBalanceSilent}
    `
    }
    if (modelName === 'kling-v2.1') {
        return `
      🎬 Добро пожаловать в ${modelName} Bot!

    Создавайте реалистичные видео в ${modelName}!
    
    ✨ *Что умеет ${modelName}:*
    • Генерация видео из описания и изображения
    • Реалистичные физика, сцены, персонажи
    
    🎯 Начните создавать прямо сейчас!
    
    💎 *Ваш баланс:*
    🔊 Видео: ${userBalanceSilent}
    `
    }
  return 'Unknown Model';
}