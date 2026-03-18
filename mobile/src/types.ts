export type RootStackParamList = {
  Main: undefined;
  UIKit: undefined;
  CollectPayment: undefined;
  TapToPay: {
    amount: number;
    description: string;
    category: string;
    phone: string;
  };
  Receipt: {
    amount: number;
    description: string;
    category: string;
    cardLast4: string;
    cardBrand: string;
    paymentIntentId: string;
    phone: string;
  };
};

export type TabParamList = {
  Home: undefined;
  History: undefined;
};
