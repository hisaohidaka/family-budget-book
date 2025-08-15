"use client";
import React, { useEffect, useState } from "react";
import EntryForm from "./components/EntryForm";
import type { Entry } from "./types";
import { v4 as uuidv4 } from "uuid";
import { Box, Typography, Container, Button } from "@mui/material";
import MonthlyView from "./components/MonthlyView";
import CategoryTrendChart from "./components/CategoryTrendChart";

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
      const rawHeader = lines[0].split(",");
      // 空でないヘッダーのインデックスのみ抽出
      const validHeaderIndexes = rawHeader.map((h, i) => h.trim() ? i : -1).filter(i => i !== -1);
      const header = validHeaderIndexes.map(i => rawHeader[i].trim());
      const entriesToAdd: Entry[] = lines.slice(1).map(line => {
        const cols = line.split(",");
        const obj: any = {};
        header.forEach((h, idx) => {
          const colIdx = validHeaderIndexes[idx];
          obj[h] = cols[colIdx]?.trim();
        });
        
        // 日付形式を統一
        const normalizedDate = normalizeDate(obj.date);
        
        return {
          id: uuidv4(),
          date: normalizedDate,
          category: obj.category,
          amount: Number(obj.amount),
          memo: obj.memo || "",
          payer: obj.payer || "夫", // payerがない場合は「夫」をデフォルト値として設定
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

  // 日付形式を統一する関数（スラッシュ区切り → ハイフン形式）
  const normalizeDate = (dateStr: string): string => {
    if (!dateStr) return "";
    
    // スラッシュ区切りの日付をハイフン形式に変換
    if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        const year = parts[0].padStart(4, '0');
        const month = parts[1].padStart(2, '0');
        const day = parts[2].padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
    }
    
    // 既にハイフン形式の場合はそのまま返す
    if (dateStr.includes('-')) {
      return dateStr;
    }
    
    return dateStr;
  };

  const handlePasteImport = () => {
    if (!pasteText.trim()) return;
    
    try {
      const lines = pasteText.split(/\r?\n/).filter(Boolean);
      if (lines.length < 2) {
        alert("データが不足しています。ヘッダー行とデータ行が必要です。");
        return;
      }
      
      // カンマまたはタブ区切り対応
      const delimiter = lines[0].includes("\t") ? "\t" : ",";
      const header = lines[0].split(delimiter).map(h => h.trim());
      
      // 必須ヘッダーの確認
      const requiredHeaders = ['date', 'category', 'amount', 'memo', 'payer'];
      const missingHeaders = requiredHeaders.filter(h => !header.includes(h));
      if (missingHeaders.length > 0) {
        alert(`必須ヘッダーが不足しています: ${missingHeaders.join(', ')}`);
        return;
      }
      
      const entriesToAdd: Entry[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        const cols = line.split(delimiter);
        
        // 列数の確認
        if (cols.length < header.length) {
          console.warn(`行 ${i + 1} の列数が不足しています。スキップします。`);
          continue;
        }
        
        const obj: any = {};
        header.forEach((h, index) => {
          obj[h] = cols[index]?.trim() || "";
        });
        
        // データの検証
        if (!obj.date || !obj.category || !obj.amount || !obj.payer) {
          console.warn(`行 ${i + 1} の必須データが不足しています。スキップします。`);
          continue;
        }
        
        // 日付形式を統一
        const normalizedDate = normalizeDate(obj.date);
        
        // 日付の形式確認（ハイフン形式のみ）
        if (!/^\d{4}-\d{2}-\d{2}$/.test(normalizedDate)) {
          console.warn(`行 ${i + 1} の日付形式が正しくありません (YYYY-MM-DD): ${obj.date} → ${normalizedDate}`);
          continue;
        }
        
        // 金額の数値確認
        const amount = Number(obj.amount);
        if (isNaN(amount) || amount <= 0) {
          console.warn(`行 ${i + 1} の金額が正しくありません: ${obj.amount}`);
          continue;
        }
        
        entriesToAdd.push({
          id: uuidv4(),
          date: normalizedDate,
          category: obj.category,
          amount: amount,
          memo: obj.memo || "",
          payer: obj.payer,
        });
      }
      
      if (entriesToAdd.length === 0) {
        alert("有効なデータが見つかりませんでした。データ形式を確認してください。");
        return;
      }
      
      const newEntries = [...entriesToAdd, ...entries];
      setEntries(newEntries);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newEntries));
      setPasteText("");
      setShowPasteArea(false);
      
      alert(`${entriesToAdd.length}件のデータをインポートしました。`);
      
    } catch (error) {
      console.error("貼り付けインポートエラー:", error);
      alert("インポート中にエラーが発生しました。データ形式を確認してください。");
    }
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
      <CategoryTrendChart entries={entries} />
    </Container>
  );
}
