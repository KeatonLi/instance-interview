// 主题颜色配置类型
export interface ThemeColors {
  header: string;
  headerText: string;
  headerSubtitle: string;
  headerContact: string;
  headerContactSep: string;
  border: string;
  text: string;
  title: string;
  subtitle: string;
  date: string;
  categoryTitle: string;
  skillBorder: string;
  techTag: string;
  photoBorder: string;
  photoText: string;
  accent: string;
  // 额外字段
  sidebarBg?: string;
  sidebarText?: string;
  cardBg?: string;
  cardBorder?: string;
}

export interface ThemeConfig {
  name: string;
  colors: ThemeColors;
  layout?: 'classic' | 'minimalist' | 'sidebar' | 'card' | 'timeline';
}
