export type Product = {
  id: number;
  name: string;
  description: string;
  numberOfGenerations: number;
  price: number;
};

const modelsMap = {
    'veo-3': [
        {
            id: 1,
            name: "1 - 699 ₽",
            description: "1 генерация",
            numberOfGenerations: 1,
            price: 699
          },
          {
            id: 2,
            name: "5 - 3375 ₽",
            description: "5 генераций",
            numberOfGenerations: 5,
            price: 3375
          },
          {
            id: 3,
            name: "10 - 6750 ₽",
            description: "10 генераций",
            numberOfGenerations: 10,
            price: 6750
          }
      ],
    'kling-v2.1': [
        {
            id: 4,
            name: '1 - 250 ₽',
            description: '1 генерация',
            numberOfGenerations: 1,
            price: 250,
          },
          {
            id: 5,
            name: '5 - 999 ₽',
            description: '5 генераций по цене 4',
            numberOfGenerations: 5,
            price: 999,
          },
          {
            id: 6,
            name: '10 - 1875 ₽',
            description: '10 генераций со скидкой',
            numberOfGenerations: 10,
            price: 1875,
          },
      ]
    };
  
  export type ModelName = keyof typeof modelsMap;

  export const getProducts = (modelName: ModelName): Product[] => {
    return modelsMap[modelName];
  }