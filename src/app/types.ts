// 家計簿1件分の型
export interface Entry {
  id: string; // ユニークID
  date: string; // YYYY-MM-DD
  category: Category;
  amount: number;
  memo: string;
  payer: Payer;
}

// カテゴリ型
export type Category =
  | "食費"
  | "日用品"
  | "交通費"
  | "娯楽"
  | "交際費"
  | "医療・保険"
  | "教育・教養"
  | "特別支出"
  | "その他";

// 支払者型
export type Payer = "夫" | "妻";
