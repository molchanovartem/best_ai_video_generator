export const modelsMap: Record<string, string> = {
  'veo-3': 'Veo 3',
  'kling-v2.1': 'Kling v2.1',
};

export type ModelName = keyof typeof modelsMap;

export const getModelName = (modelName: ModelName | undefined): string => {
  return modelName && modelsMap[modelName] ? modelsMap[modelName] : 'Unknown Model';
}