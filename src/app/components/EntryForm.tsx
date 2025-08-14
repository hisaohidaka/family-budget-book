"use client";
import React, { useState, useEffect } from "react";
import { Box } from "@mui/material";
import type { Entry, Category, Payer } from "../types";
import DateInput from "./EntryForm/DateInput";
import CategorySelect from "./EntryForm/CategorySelect";
import AmountInput from "./EntryForm/AmountInput";
import MemoInput from "./EntryForm/MemoInput";
import PayerSelect from "./EntryForm/PayerSelect";
import AddButton from "./EntryForm/AddButton";

const categories: Category[] = [
  "食費", "日用品", "交通費", "娯楽", "交際費", "医療・保険", "教育・教養", "特別支出", "その他"
];
const payers: Payer[] = ["夫", "妻"];

interface EntryFormProps {
  onAdd: (entry: Omit<Entry, "id">) => void;
  initialValue?: Omit<Entry, "id">;
  isEdit?: boolean;
}

export default function EntryForm({ onAdd, initialValue, isEdit }: EntryFormProps) {
  // 本日の日付をYYYY-MM-DD形式で取得
  const getToday = () => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  };

  const [date, setDate] = useState(getToday());
  const [category, setCategory] = useState<Category>("食費");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [payer, setPayer] = useState<Payer>("夫");

  useEffect(() => {
    if (initialValue) {
      setDate(initialValue.date || getToday());
      setCategory(initialValue.category || "食費");
      setAmount(initialValue.amount !== undefined ? String(initialValue.amount) : "");
      setMemo(initialValue.memo || "");
      setPayer(initialValue.payer || "夫");
    } else {
      setDate(getToday());
      setCategory("食費");
      setAmount("");
      setMemo("");
      setPayer("夫");
    }
  }, [initialValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !amount) return;
    onAdd({
      date,
      category,
      amount: Number(amount),
      memo,
      payer,
    });
    setDate("");
    setCategory("食費");
    setAmount("");
    setMemo("");
    setPayer("夫");
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 2 }}>
      <DateInput value={date} onChange={setDate} />
      <CategorySelect value={category} onChange={setCategory} categories={categories} />
      <AmountInput value={amount} onChange={setAmount} />
      <MemoInput value={memo} onChange={setMemo} />
      <PayerSelect value={payer} onChange={setPayer} payers={payers} />
      <AddButton isEdit={isEdit} />
    </Box>
  );
} 