"use client";
import React, { useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import type { Entry } from "../types";
import { Box, Typography, Paper, Divider } from "@mui/material";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28BFE", "#FF6699", "#FFB347", "#B0E57C", "#FF6666"];

function getMonth(dateStr: string) {
  return dateStr.slice(0, 7); // YYYY-MM
}

export default function MonthlySummary({ entries }: { entries: Entry[] }) {
  // 最新月を自動選択
  const months = Array.from(new Set(entries.map(e => getMonth(e.date)))).sort().reverse();
  const currentMonth = months[0];
  const monthEntries = entries.filter(e => getMonth(e.date) === currentMonth);

  // カテゴリ別集計
  const categoryData = useMemo(() => {
    const map = new Map<string, number>();
    monthEntries.forEach(e => {
      map.set(e.category, (map.get(e.category) || 0) + e.amount);
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [monthEntries]);

  // 月別推移
  const monthlyData = useMemo(() => {
    const map = new Map<string, number>();
    entries.forEach(e => {
      const m = getMonth(e.date);
      map.set(m, (map.get(m) || 0) + e.amount);
    });
    return Array.from(map.entries()).sort().map(([month, value]) => ({ month, value }));
  }, [entries]);

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom>月ごとの集計・グラフ</Typography>
      <Typography variant="subtitle2" gutterBottom>{currentMonth} のカテゴリ別支出</Typography>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
            {categoryData.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
      <Divider sx={{ my: 2 }} />
      <Typography variant="subtitle2" gutterBottom>月別支出推移</Typography>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={monthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" name="合計" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );
} 