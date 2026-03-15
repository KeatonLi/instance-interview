import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { ResumeData } from '@/types/resume';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Noto Sans SC',
    backgroundColor: '#ffffff',
  },
  header: {
    backgroundColor: '#1e293b',
    padding: 25,
    marginBottom: 20,
    marginHorizontal: -40,
    marginTop: -40,
  },
  headerContent: {
    flexDirection: 'row',
  },
  photoArea: {
    width: 60,
    height: 60,
    borderWidth: 1,
    borderColor: '#475569',
    marginRight: 15,
  },
  photoText: {
    fontSize: 10,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 22,
  },
  infoArea: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 3,
  },
  title: {
    fontSize: 11,
    color: '#93c5fd',
    marginBottom: 6,
  },
  contact: {
    fontSize: 8,
    color: '#cbd5e1',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  contactItem: {
    marginRight: 6,
  },
  separator: {
    marginRight: 6,
    color: '#64748b',
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e293b',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    paddingBottom: 3,
    marginBottom: 8,
  },
  item: {
    marginBottom: 8,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  itemTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1e2937',
  },
  itemSub: {
    fontSize: 9,
    color: '#2563eb',
  },
  itemDate: {
    fontSize: 8,
    color: '#6b7280',
  },
  itemDesc: {
    fontSize: 9,
    color: '#374151',
    marginTop: 2,
    lineHeight: 1.4,
  },
  achievement: {
    fontSize: 9,
    color: '#374151',
    marginTop: 1,
    paddingLeft: 10,
  },
  techRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 3,
  },
  techTag: {
    fontSize: 7,
    color: '#1e40af',
    marginRight: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  skillCategory: {
    marginBottom: 6,
  },
  skillCategoryName: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#4b5563',
    marginBottom: 2,
  },
  skillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillItem: {
    fontSize: 8,
    color: '#334155',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingHorizontal: 5,
    paddingVertical: 1,
    marginRight: 4,
    marginBottom: 3,
  },
  languageRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  languageItem: {
    fontSize: 8,
    color: '#334155',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 6,
  },
  summary: {
    fontSize: 9,
    color: '#374151',
    lineHeight: 1.5,
  },
  awardItem: {
    marginBottom: 5,
  },
  awardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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

export const ResumeDocument: React.FC<ResumeDocumentProps> = ({ data }) => {
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
              <Text style={styles.photoText}>Photo</Text>
            </View>
            <View style={styles.infoArea}>
              <Text style={styles.name}>{personalInfo.name || 'Name'}</Text>
              <Text style={styles.title}>{personalInfo.title || 'Title'}</Text>
              <View style={styles.contact}>
                {renderContactItems()}
              </View>
            </View>
          </View>
        </View>

        {personalInfo.summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Summary</Text>
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
                  <Text key={aIndex} style={styles.achievement}>- {achievement}</Text>
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
                      <Text key={tIndex} style={styles.techTag}>[{tech}]</Text>
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
                    <Text style={styles.itemSub}>{edu.degree}{edu.field ? ` | ${edu.field}` : ''}</Text>
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
                <View style={styles.awardHeader}>
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

export default ResumeDocument;
