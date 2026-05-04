export type CoinbaseAccount = {
  uuid?: string;
  name?: string;
  currency?: string;
  available_balance?: {
    value?: string;
    currency?: string;
  };
  hold?: {
    value?: string;
    currency?: string;
  };
  default?: boolean;
  active?: boolean;
  type?: string;
  ready?: boolean;
};

export type CoinbaseProduct = {
  product_id?: string;
  price?: string;
  price_percentage_change_24h?: string;
  volume_24h?: string;
  base_name?: string;
  quote_name?: string;
  status?: string;
};

export type CoinbaseOrder = {
  order_id?: string;
  product_id?: string;
  side?: string;
  status?: string;
  created_time?: string;
  completion_percentage?: string;
};
