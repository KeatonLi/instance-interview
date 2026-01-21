import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import type { ResumeData } from '@/types/resume';

// 注册中文字体 - 使用Google Fonts的Noto Sans SC
Font.register({
  family: 'Noto Sans SC',
  fonts: [
    {
      src: 'https://fonts.gstatic.com/s/notosanssc/v36/k3kJo84MPvpLmixcA63oeALhLOCT-xWNm8Hqd37x1-A.woff2',
      fontWeight: 400,
    },
    {
      src: 'https://fonts.gstatic.com/s/notosanssc/v36/k3kJo84MPvpLmixcA63oeALhLOCT-xWNm8Hqd37x1-A.woff2',
      fontWeight: 700,
    },
  ],
});

interface ResumePDFProps {
  data: ResumeData;
}

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Noto Sans SC',
    backgroundColor: '#ffffff',
    padding: 0,
    fontSize: 10,
  },
  // Header Section
  header: {
    backgroundColor: '#1e293b',
    color: '#ffffff',
    paddingHorizontal: 40,
    paddingTop: 40,
    paddingBottom: 32,
  },
  headerContent: {
    flexDirection: 'row',
    gap: 24,
  },
  photoPlaceholder: {
    width: 112,
    height: 112,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 9,
  },
  nameSection: {
    flex: 1,
  },
  name: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    color: '#93c5fd',
    marginBottom: 4,
  },
  contactInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
    marginTop: 24,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contactText: {
    fontSize: 10,
    color: '#e2e8f0',
  },
  contactLink: {
    color: '#93c5fd',
    fontSize: 10,
  },

  // Content Area
  content: {
    paddingHorizontal: 40,
    paddingVertical: 32,
    gap: 24,
  },

  // Section Headers
  sectionHeader: {
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e293b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e2e8f0',
    marginLeft: 12,
  },

  // Summary
  summary: {
    fontSize: 10,
    lineHeight: 1.6,
    color: '#374151',
  },

  // Timeline Items
  timeline: {
    gap: 20,
  },
  timelineItem: {
    flexDirection: 'row',
    gap: 16,
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3b82f6',
    marginTop: 4,
  },
  timelineContent: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  itemTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  itemSubtitle: {
    fontSize: 10,
    color: '#3b82f6',
    marginBottom: 2,
  },
  itemDate: {
    backgroundColor: '#f9fafb',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 9,
    color: '#6b7280',
  },
  itemDescription: {
    fontSize: 10,
    lineHeight: 1.5,
    color: '#374151',
    marginTop: 4,
  },
  achievement: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  achievementDot: {
    color: '#3b82f6',
    fontSize: 10,
  },
  achievementText: {
    flex: 1,
    fontSize: 10,
    lineHeight: 1.4,
    color: '#374151',
  },

  // Skills
  skillGroup: {
    marginBottom: 12,
  },
  skillCategory: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  skillItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillTag: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    fontSize: 9,
    color: '#334155',
  },

  // Project Tech Tags
  techTag: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    fontSize: 8,
    color: '#1d4ed8',
    marginRight: 6,
    marginTop: 6,
  },

  // Awards
  awardItem: {
    backgroundColor: '#fefce8',
    borderWidth: 1,
    borderColor: '#fde047',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  awardContent: {
    flex: 1,
  },
  awardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 2,
  },
  awardTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  awardOrg: {
    fontSize: 10,
    color: '#6b7280',
  },
  awardDate: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 8,
    color: '#6b7280',
    borderWidth: 1,
    borderColor: '#fde68a',
  },

  // Languages
  languageItem: {
    backgroundColor: '#f8fafc',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginRight: 12,
    marginBottom: 12,
  },
  languageName: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  languageLevel: {
    fontSize: 9,
    color: '#6b7280',
  },

  // GPA and small labels
  gpaText: {
    fontSize: 9,
    color: '#6b7280',
    marginTop: 2,
  },
  fieldText: {
    fontSize: 10,
    color: '#6b7280',
  },
});

const formatDate = (dateStr: string): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit' });
};

const ResumePDF: React.FC<ResumePDFProps> = ({ data }) => {
  const { personalInfo, education, workExperience, projects, skills, awards, languages } = data;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.photoPlaceholder}>
              <Text style={styles.photoText}>照片</Text>
            </View>
            <View style={styles.nameSection}>
              {personalInfo.name && <Text style={styles.name}>{personalInfo.name}</Text>}
              {personalInfo.title && <Text style={styles.title}>{personalInfo.title}</Text>}
            </View>
          </View>

          <View style={styles.contactInfo}>
            {personalInfo.email && (
              <View style={styles.contactItem}>
                <Text style={styles.contactText}>{personalInfo.email}</Text>
              </View>
            )}
            {personalInfo.phone && (
              <View style={styles.contactItem}>
                <Text style={styles.contactText}>{personalInfo.phone}</Text>
              </View>
            )}
            {personalInfo.location && (
              <View style={styles.contactItem}>
                <Text style={styles.contactText}>{personalInfo.location}</Text>
              </View>
            )}
            {personalInfo.linkedin && (
              <View style={styles.contactItem}>
                <Text style={styles.contactLink}>{personalInfo.linkedin}</Text>
              </View>
            )}
            {personalInfo.github && (
              <View style={styles.contactItem}>
                <Text style={styles.contactLink}>{personalInfo.github}</Text>
              </View>
            )}
            {personalInfo.website && (
              <View style={styles.contactItem}>
                <Text style={styles.contactLink}>{personalInfo.website}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Content Area */}
        <View style={styles.content}>
          {/* Summary */}
          {personalInfo.summary && (
            <View>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>个人简介</Text>
                <View style={styles.sectionLine} />
              </View>
              <Text style={styles.summary}>{personalInfo.summary}</Text>
            </View>
          )}

          {/* Work Experience */}
          {workExperience.length > 0 && (
            <View>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>工作经验</Text>
                <View style={styles.sectionLine} />
              </View>
              <View style={styles.timeline}>
                {workExperience.map((exp) => (
                  <View key={exp.id} style={styles.timelineItem}>
                    <View style={styles.timelineDot} />
                    <View style={styles.timelineContent}>
                      <View style={styles.itemHeader}>
                        <View>
                          <Text style={styles.itemTitle}>{exp.position}</Text>
                          <Text style={styles.itemSubtitle}>{exp.company}</Text>
                        </View>
                        <Text style={styles.itemDate}>
                          {formatDate(exp.startDate)} - {exp.current ? '至今' : formatDate(exp.endDate)}
                        </Text>
                      </View>
                      {exp.description && <Text style={styles.itemDescription}>{exp.description}</Text>}
                      {exp.achievements.length > 0 && (
                        <View>
                          {exp.achievements.map((achievement, idx) => (
                            <View key={idx} style={styles.achievement}>
                              <Text style={styles.achievementDot}>▪</Text>
                              <Text style={styles.achievementText}>{achievement}</Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Projects */}
          {projects.length > 0 && (
            <View>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>项目经历</Text>
                <View style={styles.sectionLine} />
              </View>
              <View style={styles.timeline}>
                {projects.map((project) => (
                  <View key={project.id} style={styles.timelineItem}>
                    <View style={[styles.timelineDot, { backgroundColor: '#60a5fa' }]} />
                    <View style={styles.timelineContent}>
                      <View style={styles.itemHeader}>
                        <View>
                          <Text style={styles.itemTitle}>{project.name}</Text>
                          {project.role && <Text style={styles.itemSubtitle}>{project.role}</Text>}
                        </View>
                        <Text style={styles.itemDate}>
                          {formatDate(project.startDate)} - {project.current ? '至今' : formatDate(project.endDate)}
                        </Text>
                      </View>
                      {project.description && <Text style={styles.itemDescription}>{project.description}</Text>}
                      {project.technologies.length > 0 && (
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                          {project.technologies.map((tech, idx) => (
                            <Text key={idx} style={styles.techTag}>
                              {tech}
                            </Text>
                          ))}
                        </View>
                      )}
                      {project.link && (
                        <Text style={{ fontSize: 9, color: '#2563eb', marginTop: 6 }}>{project.link}</Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Education */}
          {education.length > 0 && (
            <View>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>教育背景</Text>
                <View style={styles.sectionLine} />
              </View>
              <View style={styles.timeline}>
                {education.map((edu) => (
                  <View key={edu.id} style={styles.timelineItem}>
                    <View style={[styles.timelineDot, { backgroundColor: '#93c5fd' }]} />
                    <View style={styles.timelineContent}>
                      <View style={styles.itemHeader}>
                        <View>
                          <Text style={styles.itemTitle}>{edu.school}</Text>
                          <Text style={styles.itemSubtitle}>
                            <Text style={{ fontWeight: 'bold' }}>{edu.degree}</Text>
                            {edu.field && <Text style={styles.fieldText}> · {edu.field}</Text>}
                          </Text>
                          {edu.gpa && <Text style={styles.gpaText}>GPA: {edu.gpa}</Text>}
                        </View>
                        <Text style={styles.itemDate}>
                          {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                        </Text>
                      </View>
                      {edu.description && <Text style={styles.itemDescription}>{edu.description}</Text>}
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Skills */}
          {skills.length > 0 && (
            <View>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>专业技能</Text>
                <View style={styles.sectionLine} />
              </View>
              {skills.map((skillGroup) => (
                <View key={skillGroup.id} style={styles.skillGroup}>
                  <Text style={styles.skillCategory}>{skillGroup.category}</Text>
                  <View style={styles.skillItems}>
                    {skillGroup.items.map((skill, idx) => (
                      <Text key={idx} style={styles.skillTag}>
                        {skill}
                      </Text>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Awards */}
          {awards.length > 0 && (
            <View>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>荣誉奖项</Text>
                <View style={styles.sectionLine} />
              </View>
              {awards.map((award) => (
                <View key={award.id} style={styles.awardItem}>
                  <View style={styles.awardContent}>
                    <View style={styles.awardHeader}>
                      <Text style={styles.awardTitle}>{award.title}</Text>
                      <Text style={styles.awardDate}>{award.date}</Text>
                    </View>
                    <Text style={styles.awardOrg}>{award.organization}</Text>
                    {award.description && <Text style={styles.itemDescription}>{award.description}</Text>}
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Languages */}
          {languages.length > 0 && (
            <View>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>语言能力</Text>
                <View style={styles.sectionLine} />
              </View>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {languages.map((lang) => (
                  <View key={lang.id} style={styles.languageItem}>
                    <Text style={styles.languageName}>{lang.name}</Text>
                    <Text style={styles.languageLevel}>· {lang.level}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </Page>
    </Document>
  );
};

export default ResumePDF;
