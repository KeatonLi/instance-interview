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
    backgroundColor: '#ffffff',
  },
  header: {
    backgroundColor: '#1a1a2e',
    padding: 24,
    marginBottom: 20,
    marginHorizontal: -40,
    marginTop: -40,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  photoArea: {
    width: 64,
    height: 64,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    marginRight: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  photoText: {
    fontSize: 10,
    color: '#94a3b8',
  },
  infoArea: {
    flex: 1,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  title: {
    fontSize: 12,
    color: '#a5b4fc',
    marginBottom: 8,
  },
  contact: {
    fontSize: 9,
    color: '#94a3b8',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  contactItem: {
    marginRight: 4,
  },
  separator: {
    marginRight: 4,
    color: '#475569',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1e293b',
    borderBottomWidth: 2,
    borderBottomColor: '#4f46e5',
    paddingBottom: 4,
    marginBottom: 10,
  },
  item: {
    marginBottom: 12,
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: '#334155',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 2,
  },
  itemTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  itemSub: {
    fontSize: 9,
    color: '#4f46e5',
  },
  itemDate: {
    fontSize: 8,
    color: '#94a3b8',
    backgroundColor: '#f8fafc',
    padding: '2 6',
    borderRadius: 3,
  },
  itemDesc: {
    fontSize: 9,
    color: '#475569',
    marginTop: 4,
    lineHeight: 1.5,
  },
  achievement: {
    fontSize: 9,
    color: '#64748b',
    marginTop: 2,
    paddingLeft: 8,
  },
  techRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
    gap: 4,
  },
  techTag: {
    fontSize: 7,
    color: '#4f46e5',
    backgroundColor: '#eef2ff',
    padding: '2 6',
    borderRadius: 10,
  },
  skillCategory: {
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  skillCategoryName: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#475569',
    minWidth: 80,
  },
  skillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
    gap: 4,
  },
  skillItem: {
    fontSize: 8,
    color: '#1e293b',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: '2 6',
    borderRadius: 3,
  },
  languageRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingLeft: 12,
  },
  languageItem: {
    fontSize: 8,
    color: '#1e293b',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: '4 10',
    borderRadius: 6,
    marginRight: 8,
  },
  summary: {
    fontSize: 9,
    color: '#475569',
    lineHeight: 1.6,
  },
  awardItem: {
    marginBottom: 8,
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: '#334155',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  awardOrg: {
    fontSize: 9,
    color: '#4f46e5',
  },
});

const formatDate = (dateStr: string): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}`;
};

export const ResumeDocument: React.FC<{ data: ResumeData }> = ({ data }) => {
  const { personalInfo, education, workExperience, projects, skills, awards, languages } = data;

  const renderContactItems = () => {
    const items: React.ReactNode[] = [];
    if (personalInfo.email) {
      items.push(<Text key="email" style={styles.contactItem}>{personalInfo.email}</Text>);
    }
    if (personalInfo.email && personalInfo.phone) {
      items.push(<Text key="sep1" style={styles.separator}>•</Text>);
    }
    if (personalInfo.phone) {
      items.push(<Text key="phone" style={styles.contactItem}>{personalInfo.phone}</Text>);
    }
    if ((personalInfo.email || personalInfo.phone) && personalInfo.location) {
      items.push(<Text key="sep2" style={styles.separator}>•</Text>);
    }
    if (personalInfo.location) {
      items.push(<Text key="location" style={styles.contactItem}>{personalInfo.location}</Text>);
    }
    if ((personalInfo.email || personalInfo.phone || personalInfo.location) && personalInfo.github) {
      items.push(<Text key="sep3" style={styles.separator}>•</Text>);
    }
    if (personalInfo.github) {
      items.push(<Text key="github" style={{ ...styles.contactItem, color: '#a5b4fc' }}>{personalInfo.github}</Text>);
    }
    return items;
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.photoArea}>
              <Text style={styles.photoText}>Photo</Text>
            </View>
            <View style={styles.infoArea}>
              <Text style={styles.name}>{personalInfo.name || 'Your Name'}</Text>
              <Text style={styles.title}>{personalInfo.title || 'Professional Title'}</Text>
              <View style={styles.contact}>
                {renderContactItems()}
              </View>
            </View>
          </View>
        </View>

        {personalInfo.summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About Me</Text>
            <Text style={styles.summary}>{personalInfo.summary}</Text>
          </View>
        )}

        {workExperience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experience</Text>
            {workExperience.map((exp, index) => (
              <View key={index} style={styles.item}>
                <View style={styles.itemHeader}>
                  <View>
                    <Text style={styles.itemTitle}>{exp.position}</Text>
                    <Text style={styles.itemSub}>{exp.company}</Text>
                  </View>
                  <Text style={styles.itemDate}>
                    {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}
                  </Text>
                </View>
                {exp.description && <Text style={styles.itemDesc}>{exp.description}</Text>}
                {exp.achievements?.map((achievement, aIndex) => (
                  <Text key={aIndex} style={styles.achievement}>▸ {achievement}</Text>
                ))}
              </View>
            ))}
          </View>
        )}

        {projects.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Projects</Text>
            {projects.map((project, index) => (
              <View key={index} style={styles.item}>
                <View style={styles.itemHeader}>
                  <View>
                    <Text style={styles.itemTitle}>{project.name}</Text>
                    {project.role && <Text style={styles.itemSub}>{project.role}</Text>}
                  </View>
                  <Text style={styles.itemDate}>
                    {formatDate(project.startDate)} - {project.current ? 'Present' : formatDate(project.endDate)}
                  </Text>
                </View>
                {project.description && <Text style={styles.itemDesc}>{project.description}</Text>}
                {project.technologies?.length && (
                  <View style={styles.techRow}>
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
            <Text style={styles.sectionTitle}>Education</Text>
            {education.map((edu, index) => (
              <View key={index} style={styles.item}>
                <View style={styles.itemHeader}>
                  <View>
                    <Text style={styles.itemTitle}>{edu.school}</Text>
                    <Text style={styles.itemSub}>{edu.degree}{edu.field ? ` • ${edu.field}` : ''}</Text>
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
            <Text style={styles.sectionTitle}>Skills</Text>
            {skills.map((skill, index) => (
              <View key={index} style={styles.skillCategory}>
                <Text style={styles.skillCategoryName}>{skill.category}:</Text>
                <View style={styles.skillRow}>
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
            <Text style={styles.sectionTitle}>Awards</Text>
            {awards.map((award, index) => (
              <View key={index} style={styles.awardItem}>
                <View>
                  <Text style={styles.itemTitle}>{award.title}</Text>
                  <Text style={styles.awardOrg}>• {award.organization}</Text>
                </View>
                <Text style={styles.itemDate}>{award.date}</Text>
              </View>
            ))}
          </View>
        )}

        {languages.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Languages</Text>
            <View style={styles.languageRow}>
              {languages.filter(l => l.name && l.level).map((lang, index) => (
                <Text key={index} style={styles.languageItem}>{lang.name} - {lang.level}</Text>
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

export default ResumeDocument;
