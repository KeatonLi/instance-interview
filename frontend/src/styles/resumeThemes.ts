// 简历模板主题配置

// 经典商务 - 蓝白色调，黑色细线
export const classicTheme = {
  name: '经典商务',
  colors: {
    header: '#1e293b',
    headerText: '#ffffff',
    headerSubtitle: '#93c5fd',
    headerContact: '#cbd5e1',
    headerContactSep: '#64748b',
    border: '#334155',
    text: '#374151',
    title: '#1e2937',
    subtitle: '#2563eb',
    date: '#6b7280',
    categoryTitle: '#4b5563',
    skillBorder: '#cbd5e1',
    techTag: '#1e40af',
    photoBorder: '#475569',
    photoText: '#94a3b8',
    accent: '#2563eb',
  },
};

// 现代简约 - 纯白底色，黑灰文字
export const minimalistTheme = {
  name: '现代简约',
  colors: {
    header: '#ffffff',
    headerText: '#111827',
    headerSubtitle: '#6b7280',
    headerContact: '#9ca3af',
    headerContactSep: '#d1d5db',
    border: '#e5e7eb',
    text: '#374151',
    title: '#111827',
    subtitle: '#059669',
    date: '#9ca3af',
    categoryTitle: '#374151',
    skillBorder: '#e5e7eb',
    techTag: '#059669',
    photoBorder: '#e5e7eb',
    photoText: '#9ca3af',
    accent: '#059669',
  },
};

// 彩色渐变 - 蓝色渐变头部
export const gradientTheme = {
  name: '现代渐变',
  colors: {
    header: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
    headerText: '#ffffff',
    headerSubtitle: '#bfdbfe',
    headerContact: '#dbeafe',
    headerContactSep: '#93c5fd',
    border: '#8b5cf6',
    text: '#374151',
    title: '#1f2937',
    subtitle: '#8b5cf6',
    date: '#6b7280',
    categoryTitle: '#4b5563',
    skillBorder: '#c4b5fd',
    techTag: '#7c3aed',
    photoBorder: '#a78bfa',
    photoText: '#c4b5fd',
    accent: '#8b5cf6',
  },
};

// 温暖橙色调
export const warmTheme = {
  name: '温暖橙光',
  colors: {
    header: '#f97316',
    headerText: '#ffffff',
    headerSubtitle: '#fed7aa',
    headerContact: '#ffedd5',
    headerContactSep: '#fdba74',
    border: '#ea580c',
    text: '#374151',
    title: '#1f2937',
    subtitle: '#ea580c',
    date: '#9ca3af',
    categoryTitle: '#4b5563',
    skillBorder: '#fdba74',
    techTag: '#c2410c',
    photoBorder: '#fb923c',
    photoText: '#fed7aa',
    accent: '#f97316',
  },
};

// 清新绿色
export const greenTheme = {
  name: '清新绿意',
  colors: {
    header: '#059669',
    headerText: '#ffffff',
    headerSubtitle: '#a7f3d0',
    headerContact: '#d1fae5',
    headerContactSep: '#6ee7b7',
    border: '#047857',
    text: '#374151',
    title: '#1f2937',
    subtitle: '#059669',
    date: '#9ca3af',
    categoryTitle: '#4b5563',
    skillBorder: '#a7f3d0',
    techTag: '#047857',
    photoBorder: '#34d399',
    photoText: '#a7f3d0',
    accent: '#059669',
  },
};

export const themes = [classicTheme, minimalistTheme, gradientTheme, warmTheme, greenTheme];

export const defaultTheme = classicTheme;
