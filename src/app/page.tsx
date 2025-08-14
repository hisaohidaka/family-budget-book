"use client";
import React, { useEffect, useState } from "react";
import EntryForm from "./components/EntryForm";
import type { Entry } from "./types";
import { v4 as uuidv4 } from "uuid";
import { Box, Typography, Container, Button } from "@mui/material";
import MonthlyView from "./components/MonthlyView";

const STORAGE_KEY = "kakeibo-entries";

export default function Home() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [editEntry, setEditEntry] = useState<Entry | null>(null);
  const [copyEntry, setCopyEntry] = useState<Omit<Entry, "id"> | null>(null);
  const [showPasteArea, setShowPasteArea] = useState(false);
  const [pasteText, setPasteText] = useState("");

  // localStorageから初期データ取得
  useEffect(() => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      setEntries(JSON.parse(data));
    }
  }, []);

  // 追加・編集時にlocalStorageへ保存
  const handleAdd = (entry: Omit<Entry, "id">) => {
    if (editEntry) {
      // 編集モード
      const updated = entries.map(e => e.id === editEntry.id ? { ...editEntry, ...entry } : e);
      setEntries(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setEditEntry(null);
    } else {
      // 新規追加
      const newEntry: Entry = { ...entry, id: uuidv4() };
      const newEntries = [newEntry, ...entries];
      setEntries(newEntries);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newEntries));
    }
    setCopyEntry(null); // 追加後はコピー状態も解除
  };

  // 削除
  const handleDelete = (id: string) => {
    const filtered = entries.filter(e => e.id !== id);
    setEntries(filtered);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    if (editEntry && editEntry.id === id) setEditEntry(null);
  };

  // 編集開始
  const handleEdit = (entry: Entry) => {
    setEditEntry(entry);
  };

  // コピー登録
  const handleCopy = (entry: Entry) => {
    const today = new Date().toISOString().slice(0, 10);
    setCopyEntry({
      date: today,
      category: entry.category,
      amount: entry.amount,
      memo: entry.memo,
      payer: entry.payer,
    });
    setEditEntry(null); // 編集状態は解除
  };

  // CSVインポート処理
  const handleCsvImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split(/\r?\n/).filter(Boolean);
      if (lines.length < 2) return;
      const header = lines[0].split(",");
      const entriesToAdd: Entry[] = lines.slice(1).map(line => {
        const cols = line.split(",");
        const obj: any = {};
        header.forEach((h, i) => {
          obj[h.trim()] = cols[i]?.trim();
        });
        return {
          id: uuidv4(),
          date: obj.date,
          category: obj.category,
          amount: Number(obj.amount),
          memo: obj.memo,
          payer: obj.payer,
        } as Entry;
      });
      const newEntries = [...entriesToAdd, ...entries];
      setEntries(newEntries);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newEntries));
    };
    reader.readAsText(file);
    // inputの値をリセットして同じファイルを再度選択できるように
    e.target.value = "";
  };

  const handlePasteImport = () => {
    if (!pasteText.trim()) return;
    const lines = pasteText.split(/\r?\n/).filter(Boolean);
    if (lines.length < 2) return;
    // カンマまたはタブ区切り対応
    const delimiter = lines[0].includes("\t") ? "\t" : ",";
    const header = lines[0].split(delimiter);
    const entriesToAdd: Entry[] = lines.slice(1).map(line => {
      const cols = line.split(delimiter);
      const obj: any = {};
      header.forEach((h, i) => {
        obj[h.trim()] = cols[i]?.trim();
      });
      return {
        id: uuidv4(),
        date: obj.date,
        category: obj.category,
        amount: Number(obj.amount),
        memo: obj.memo,
        payer: obj.payer,
      } as Entry;
    });
    const newEntries = [...entriesToAdd, ...entries];
    setEntries(newEntries);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newEntries));
    setPasteText("");
    setShowPasteArea(false);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>夫婦の家計簿</Typography>
      <Box sx={{ mb: 2, display: "flex", gap: 2 }}>
        <Button variant="outlined" component="label">
          CSVインポート
          <input type="file" accept=".csv" hidden onChange={handleCsvImport} />
        </Button>
        <Button variant="outlined" onClick={() => setShowPasteArea(v => !v)}>
          貼り付けインポート
        </Button>
      </Box>
      {showPasteArea && (
        <Box sx={{ mb: 2 }}>
          <textarea
            rows={6}
            style={{ width: "100%", fontFamily: "monospace" }}
            placeholder="スプレッドシートからコピーした内容をここに貼り付けてください"
            value={pasteText}
            onChange={e => setPasteText(e.target.value)}
          />
          <Box sx={{ mt: 1, display: "flex", gap: 2 }}>
            <Button variant="contained" onClick={handlePasteImport}>インポート</Button>
            <Button variant="text" onClick={() => setShowPasteArea(false)}>キャンセル</Button>
          </Box>
        </Box>
      )}
      <EntryForm
        onAdd={handleAdd}
        initialValue={editEntry ? {
          date: editEntry.date,
          category: editEntry.category,
          amount: editEntry.amount,
          memo: editEntry.memo,
          payer: editEntry.payer,
        } : copyEntry ? copyEntry : undefined}
        isEdit={!!editEntry}
      />
      <MonthlyView entries={entries} onDelete={handleDelete} onEdit={handleEdit} onCopy={handleCopy} />
    </Container>
  );
}
