"use client";
import React, { useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Box, Typography, Paper, Chip } from "@mui/material";
import type { Entry } from "../types";

function getMonth(dateStr: string) {
  if (!dateStr) return "";
  return dateStr.slice(0, 7); // YYYY-MM
}

interface CategoryTrendChartProps {
  entries: Entry[];
}

export default function CategoryTrendChart({ entries }: CategoryTrendChartProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // 利用可能なカテゴリを取得
  const availableCategories = useMemo(() => {
    if (!entries || entries.length === 0) return [];
    const categories = Array.from(new Set(entries.map(e => e.category))).sort();
    return categories;
  }, [entries]);

  // 利用可能な月を取得
  const availableMonths = useMemo(() => {
    if (!entries || entries.length === 0) return [];
    const months = Array.from(new Set(entries.map(e => getMonth(e.date))))
      .filter(Boolean)
      .sort();
    return months;
  }, [entries]);

  // カテゴリ別の月ごとのデータを生成
  const chartData = useMemo(() => {
    if (!entries || entries.length === 0) return [];
    
    const data: any[] = [];
    
    availableMonths.forEach(month => {
      const monthData: any = { month };
      
      availableCategories.forEach(category => {
        const monthEntries = entries.filter(e => 
          getMonth(e.date) === month && e.category === category
        );
        const total = monthEntries.reduce((sum, e) => sum + e.amount, 0);
        monthData[category] = total;
      });
      
      data.push(monthData);
    });
    
    return data;
  }, [entries, availableCategories, availableMonths]);

  // カテゴリの選択状態を切り替え
  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  // 初期表示用に最初の3つのカテゴリを選択
  React.useEffect(() => {
    if (availableCategories.length > 0 && selectedCategories.length === 0) {
      setSelectedCategories(availableCategories.slice(0, 3));
    }
  }, [availableCategories, selectedCategories]);

  // グラフ用の色配列
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28BFE", "#FF6699", "#FFB347", "#B0E57C", "#FF6666"];

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom>カテゴリ別月次推移</Typography>
      
      {/* カテゴリ選択 */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>表示するカテゴリを選択:</Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {availableCategories.map((category, index) => (
            <Chip
              key={category}
              label={category}
              onClick={() => toggleCategory(category)}
              color={selectedCategories.includes(category) ? "primary" : "default"}
              variant={selectedCategories.includes(category) ? "filled" : "outlined"}
              sx={{ 
                cursor: "pointer",
                backgroundColor: selectedCategories.includes(category) ? COLORS[index % COLORS.length] : undefined,
                color: selectedCategories.includes(category) ? "white" : undefined
              }}
            />
          ))}
        </Box>
      </Box>

      {/* 折れ線グラフ */}
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="month" 
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `¥${value.toLocaleString()}`}
          />
          <Tooltip 
            formatter={(value: number) => [`¥${value.toLocaleString()}`, '金額']}
            labelFormatter={(label) => `${label}月`}
          />
          <Legend />
          {selectedCategories.map((category, index) => (
            <Line
              key={category}
              type="monotone"
              dataKey={category}
              stroke={COLORS[index % COLORS.length]}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>

      {/* 統計情報 */}
      <Box sx={{ mt: 2, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 2 }}>
        {selectedCategories.map((category, index) => {
          const totalAmount = entries
            .filter(e => e.category === category)
            .reduce((sum, e) => sum + e.amount, 0);
          
          const avgAmount = availableMonths.length > 0 
            ? Math.round(totalAmount / availableMonths.length) 
            : 0;
          
          return (
            <Paper key={category} sx={{ p: 1, textAlign: "center" }}>
              <Typography variant="subtitle2" color="text.secondary">{category}</Typography>
              <Typography variant="h6" color={COLORS[index % COLORS.length]}>
                ¥{totalAmount.toLocaleString()}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                月平均: ¥{avgAmount.toLocaleString()}
              </Typography>
            </Paper>
          );
        })}
      </Box>
    </Paper>
  );
}


