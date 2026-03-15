export const colors = {
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
};

export const fonts = {
  family: 'Noto Sans SC, sans-serif',
};

export const sizes = {
  pageWidth: 520,
  pageHeight: 738,
  headerPadding: 25,
  contentPadding: 40,
  sectionMargin: 16,
  itemMargin: 8,
};

export const fontSizes = {
  name: 20,
  title: 11,
  contact: 8,
  sectionTitle: 12,
  itemTitle: 10,
  itemSub: 9,
  itemDate: 8,
  itemDesc: 9,
  techTag: 7,
  skillCategory: 9,
  skillItem: 8,
  summary: 9,
};

export const styles = {
  header: {
    backgroundColor: colors.header,
    padding: sizes.headerPadding,
  },
  photo: {
    width: 60,
    height: 60,
    borderColor: colors.photoBorder,
    marginRight: 15,
  },
  name: {
    fontSize: fontSizes.name,
    fontWeight: 'bold' as const,
    color: colors.headerText,
    marginBottom: 3,
  },
  title: {
    fontSize: fontSizes.title,
    color: colors.headerSubtitle,
    marginBottom: 6,
  },
  contact: {
    fontSize: fontSizes.contact,
    color: colors.headerContact,
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
  },
  contactItem: {
    marginRight: 6,
  },
  separator: {
    marginRight: 6,
    color: colors.headerContactSep,
  },
  section: {
    marginBottom: sizes.sectionMargin,
  },
  sectionTitle: {
    fontSize: fontSizes.sectionTitle,
    fontWeight: 'bold' as const,
    color: colors.header,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 3,
    marginBottom: 8,
  },
  item: {
    marginBottom: sizes.itemMargin,
  },
  itemHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    marginBottom: 2,
  },
  itemTitle: {
    fontSize: fontSizes.itemTitle,
    fontWeight: 'bold' as const,
    color: colors.title,
  },
  itemSub: {
    fontSize: fontSizes.itemSub,
    color: colors.subtitle,
  },
  itemDate: {
    fontSize: fontSizes.itemDate,
    color: colors.date,
  },
  itemDesc: {
    fontSize: fontSizes.itemDesc,
    color: colors.text,
    marginTop: 2,
    lineHeight: 1.4,
  },
  achievement: {
    fontSize: fontSizes.itemDesc,
    color: colors.text,
    marginTop: 1,
    paddingLeft: 10,
  },
  techRow: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    marginTop: 3,
  },
  techTag: {
    fontSize: fontSizes.techTag,
    color: colors.techTag,
    marginRight: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  skillCategory: {
    marginBottom: 6,
  },
  skillCategoryName: {
    fontSize: fontSizes.skillCategory,
    fontWeight: 'bold' as const,
    color: colors.categoryTitle,
    marginBottom: 2,
  },
  skillRow: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
  },
  skillItem: {
    fontSize: fontSizes.skillItem,
    color: colors.title,
    borderWidth: 1,
    borderColor: colors.skillBorder,
    paddingHorizontal: 5,
    paddingVertical: 1,
    marginRight: 4,
    marginBottom: 3,
  },
  languageRow: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
  },
  languageItem: {
    fontSize: fontSizes.skillItem,
    color: colors.title,
    borderWidth: 1,
    borderColor: colors.skillBorder,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 6,
  },
  summary: {
    fontSize: fontSizes.summary,
    color: colors.text,
    lineHeight: 1.5,
  },
  awardItem: {
    marginBottom: 5,
  },
  awardHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
  },
};
