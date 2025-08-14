"use client";
import React, { useState, useMemo } from "react";
import { Box, Typography, Paper, ToggleButton, ToggleButtonGroup, FormControl, InputLabel, Select, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { PieChart, Pie, Cell, Tooltip as ChartTooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import type { Entry } from "../types";
import EntryTableRow from "./EntryTable/EntryTableRow";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28BFE", "#FF6699", "#FFB347", "#B0E57C", "#FF6666"];

function getMonth(dateStr: string | undefined) {
  if (!dateStr) return "";
  return dateStr.slice(0, 7); // YYYY-MM
}

interface MonthlyViewProps {
  entries: Entry[];
  onDelete: (id: string) => void;
  onEdit: (entry: Entry) => void;
  onCopy: (entry: Entry) => void;
}

export default function MonthlyView({ entries, onDelete, onEdit, onCopy }: MonthlyViewProps) {
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [viewMode, setViewMode] = useState<"graph" | "table">("table");

  // 利用可能な月を取得
  const availableMonths = useMemo(() => {
    const months = Array.from(new Set(entries
      .filter(e => e.date) // dateが存在するエントリのみフィルタ
      .map(e => getMonth(e.date))
      .filter(Boolean) // 空文字列を除外
    )).sort().reverse();
    return months;
  }, [entries]);

  // 選択された月のデータを取得
  const monthEntries = useMemo(() => {
    if (!selectedMonth) return [];
    return entries.filter(e => e.date && getMonth(e.date) === selectedMonth);
  }, [entries, selectedMonth]);

  // カテゴリ別集計
  const categoryData = useMemo(() => {
    const map = new Map<string, number>();
    monthEntries.forEach(e => {
      map.set(e.category, (map.get(e.category) || 0) + e.amount);
    });
    const total = Array.from(map.values()).reduce((sum, val) => sum + val, 0);
    return Array.from(map.entries()).map(([name, value]) => ({ 
      name, 
      value,
      percentage: total > 0 ? Math.round((value / total) * 100) : 0
    }));
  }, [monthEntries]);

  // 月別推移
  const monthlyData = useMemo(() => {
    const map = new Map<string, number>();
    entries
      .filter(e => e.date) // dateが存在するエントリのみフィルタ
      .forEach(e => {
        const m = getMonth(e.date);
        if (m) { // 有効な月の場合のみ処理
          map.set(m, (map.get(m) || 0) + e.amount);
        }
      });
    return Array.from(map.entries()).sort().map(([month, value]) => ({ month, value }));
  }, [entries]);

  // 初期月を設定
  React.useEffect(() => {
    if (availableMonths.length > 0 && !selectedMonth) {
      setSelectedMonth(availableMonths[0]);
    }
  }, [availableMonths, selectedMonth]);

  const handleViewChange = (_: React.MouseEvent<HTMLElement>, newView: "graph" | "table" | null) => {
    if (newView !== null) {
      setViewMode(newView);
    }
  };

  const totalAmount = monthEntries.reduce((sum, entry) => sum + entry.amount, 0);

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h6">月ごとの集計・グラフ</Typography>
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>月を選択</InputLabel>
            <Select
              value={selectedMonth}
              label="月を選択"
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              {availableMonths.map((month) => (
                <MenuItem key={month} value={month}>
                  {month}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleViewChange}
            size="small"
          >
            <ToggleButton value="table">一覧</ToggleButton>
            <ToggleButton value="graph">グラフ</ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      {selectedMonth && (
        <>
          <Typography variant="subtitle2" gutterBottom>
            {selectedMonth} の合計: ¥{totalAmount.toLocaleString()}
          </Typography>

          {viewMode === "graph" ? (
            <Box>
              <Typography variant="subtitle2" gutterBottom>カテゴリ別支出</Typography>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie 
                    data={categoryData} 
                    dataKey="value" 
                    nameKey="name" 
                    cx="50%" 
                    cy="50%" 
                    outerRadius={80} 
                    label={({ name, value }) => {
                      if (value === undefined) return name;
                      const total = categoryData.reduce((sum, d) => sum + d.value, 0);
                      const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                      return `${name}\n¥${value.toLocaleString()} (${percentage}%)`;
                    }}
                  >
                    {categoryData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip 
                    formatter={(value: number, name: string) => [
                      `¥${value.toLocaleString()} (${categoryData.find(d => d.name === name)?.percentage}%)`,
                      name
                    ]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
              <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>月別支出推移</Typography>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={monthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip />
                  <Legend />
                  <Bar dataKey="value" name="合計" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          ) : (
            <Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>日付</TableCell>
                      <TableCell>カテゴリ</TableCell>
                      <TableCell align="right">金額</TableCell>
                      <TableCell>メモ</TableCell>
                      <TableCell>支払者</TableCell>
                      <TableCell>操作</TableCell>
                      <TableCell>コピー</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {monthEntries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>{entry.date}</TableCell>
                        <TableCell>{entry.category}</TableCell>
                        <TableCell align="right">¥{entry.amount.toLocaleString()}</TableCell>
                        <TableCell>{entry.memo}</TableCell>
                        <TableCell>{entry.payer}</TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex", gap: 1 }}>
                            <Tooltip title="編集" arrow placement="bottom">
                              <IconButton size="small" onClick={() => onEdit(entry)}>
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="削除" arrow placement="bottom">
                              <IconButton size="small" onClick={() => onDelete(entry.id)}>
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Tooltip title="コピー" arrow placement="bottom">
                            <IconButton size="small" onClick={() => onCopy(entry)}>
                              <ContentCopyIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </>
      )}
    </Paper>
  );
} 