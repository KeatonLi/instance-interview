import { Document, Page, Text, View, StyleSheet, Font, pdf } from '@react-pdf/renderer';
import type { ResumeData } from '@/types/resume';

Font.register({
  family: 'Noto Sans SC',
  fonts: [
    { src: '/fonts/NotoSansCJKsc-Regular.otf', fontWeight: 'normal' },
    { src: '/fonts/NotoSansCJKsc-Bold.otf', fontWeight: 'bold' },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Noto Sans SC',
  },
  header: {
    background: '#1e293b',
    padding: 30,
    marginBottom: 20,
    marginHorizontal: -40,
    marginTop: -40,
  },
  headerContent: {
    flexDirection: 'row',
    gap: 20,
  },
  photoArea: {
    width: 70,
    height: 70,
    background: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoText: {
    fontSize: 10,
    color: '#94a3b8',
  },
  infoArea: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  title: {
    fontSize: 12,
    color: '#93c5fd',
    marginBottom: 8,
  },
  contact: {
    fontSize: 9,
    color: '#e2e8f0',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  contactItem: {
    marginRight: 8,
  },
  separator: {
    marginRight: 8,
    color: '#64748b',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e293b',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 4,
    marginBottom: 10,
  },
  item: {
    marginBottom: 10,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  itemTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  itemSub: {
    fontSize: 9,
    color: '#3b82f6',
  },
  itemDate: {
    fontSize: 8,
    color: '#6b7280',
  },
  itemDesc: {
    fontSize: 9,
    color: '#374151',
    marginTop: 4,
    lineHeight: 1.5,
  },
  achievement: {
    fontSize: 9,
    color: '#374151',
    marginTop: 2,
    paddingLeft: 8,
  },
  techTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
    gap: 4,
  },
  techTag: {
    fontSize: 8,
    color: '#1d4ed8',
    background: '#eff6ff',
    padding: '2 6',
    borderRadius: 3,
  },
  skillCategory: {
    marginBottom: 8,
  },
  skillCategoryName: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#6b7280',
    marginBottom: 4,
  },
  skillItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  skillItem: {
    fontSize: 8,
    color: '#334155',
    background: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: '2 6',
    borderRadius: 3,
  },
  languageItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  languageItem: {
    fontSize: 9,
    color: '#334155',
    background: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: '4 8',
    borderRadius: 3,
  },
  summary: {
    fontSize: 9,
    color: '#374151',
    lineHeight: 1.6,
  },
});

const formatDate = (dateStr: string): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}`;
};

interface ResumeDocumentProps {
  data: ResumeData;
}

const ResumeDocument: React.FC<ResumeDocumentProps> = ({ data }) => {
  const { personalInfo, education, workExperience, projects, skills, awards, languages } = data;

  const renderContactItems = () => {
    const items: React.ReactNode[] = [];
    if (personalInfo.email) {
      items.push(<Text key="email" style={styles.contactItem}>{personalInfo.email}</Text>);
    }
    if (personalInfo.email && personalInfo.phone) {
      items.push(<Text key="sep1" style={styles.separator}>|</Text>);
    }
    if (personalInfo.phone) {
      items.push(<Text key="phone" style={styles.contactItem}>{personalInfo.phone}</Text>);
    }
    if ((personalInfo.email || personalInfo.phone) && personalInfo.location) {
      items.push(<Text key="sep2" style={styles.separator}>|</Text>);
    }
    if (personalInfo.location) {
      items.push(<Text key="location" style={styles.contactItem}>{personalInfo.location}</Text>);
    }
    if ((personalInfo.email || personalInfo.phone || personalInfo.location) && personalInfo.github) {
      items.push(<Text key="sep3" style={styles.separator}>|</Text>);
    }
    if (personalInfo.github) {
      items.push(<Text key="github" style={styles.contactItem}>{personalInfo.github}</Text>);
    }
    return items;
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.photoArea}>
              <Text style={styles.photoText}>照片</Text>
            </View>
            <View style={styles.infoArea}>
              <Text style={styles.name}>{personalInfo.name || '姓名'}</Text>
              <Text style={styles.title}>{personalInfo.title || '职位'}</Text>
              <View style={styles.contact}>
                {renderContactItems()}
              </View>
            </View>
          </View>
        </View>

        {personalInfo.summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>个人简介</Text>
            <Text style={styles.summary}>{personalInfo.summary}</Text>
          </View>
        )}

        {workExperience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>工作经验</Text>
            {workExperience.map((exp, index) => (
              <View key={index} style={styles.item}>
                <View style={styles.itemHeader}>
                  <View>
                    <Text style={styles.itemTitle}>{exp.position}</Text>
                    <Text style={styles.itemSub}>{exp.company}</Text>
                  </View>
                  <Text style={styles.itemDate}>
                    {formatDate(exp.startDate)} - {exp.current ? '至今' : formatDate(exp.endDate)}
                  </Text>
                </View>
                {exp.description && <Text style={styles.itemDesc}>{exp.description}</Text>}
                {exp.achievements?.map((achievement, aIndex) => (
                  <Text key={aIndex} style={styles.achievement}>▪ {achievement}</Text>
                ))}
              </View>
            ))}
          </View>
        )}

        {projects.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>项目经历</Text>
            {projects.map((project, index) => (
              <View key={index} style={styles.item}>
                <View style={styles.itemHeader}>
                  <View>
                    <Text style={styles.itemTitle}>{project.name}</Text>
                    {project.role && <Text style={styles.itemSub}>{project.role}</Text>}
                  </View>
                  <Text style={styles.itemDate}>
                    {formatDate(project.startDate)} - {project.current ? '至今' : formatDate(project.endDate)}
                  </Text>
                </View>
                {project.description && <Text style={styles.itemDesc}>{project.description}</Text>}
                {project.technologies?.length && (
                  <View style={styles.techTags}>
                    {project.technologies.map((tech, tIndex) => (
                      <Text key={tIndex} style={styles.techTag}>{tech}</Text>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {education.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>教育背景</Text>
            {education.map((edu, index) => (
              <View key={index} style={styles.item}>
                <View style={styles.itemHeader}>
                  <View>
                    <Text style={styles.itemTitle}>{edu.school}</Text>
                    <Text style={styles.itemSub}>{edu.degree}{edu.field ? ` · ${edu.field}` : ''}</Text>
                  </View>
                  <Text style={styles.itemDate}>
                    {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>专业技能</Text>
            {skills.map((skill, index) => (
              <View key={index} style={styles.skillCategory}>
                <Text style={styles.skillCategoryName}>{skill.category}</Text>
                <View style={styles.skillItems}>
                  {skill.items.map((item, sIndex) => (
                    <Text key={sIndex} style={styles.skillItem}>{item}</Text>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}

        {awards.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>荣誉奖项</Text>
            {awards.map((award, index) => (
              <View key={index} style={styles.item}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>{award.title}</Text>
                  <Text style={styles.itemDate}>{award.date}</Text>
                </View>
                <Text style={styles.itemSub}>{award.organization}</Text>
              </View>
            ))}
          </View>
        )}

        {languages.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>语言能力</Text>
            <View style={styles.languageItems}>
              {languages.filter(l => l.name && l.level).map((lang, index) => (
                <Text key={index} style={styles.languageItem}>{lang.name} · {lang.level}</Text>
              ))}
            </View>
          </View>
        )}
      </Page>
    </Document>
  );
};

export const generateResumePDF = async ({ data, filename = 'resume' }: { data: ResumeData; filename?: string }): Promise<void> => {
  const blob = await pdf(<ResumeDocument data={data} />).toBlob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export default generateResumePDF;
