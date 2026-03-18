import type { ResumeData } from '@/types/resume';
import type { ThemeConfig } from './themeTypes';

interface TemplateProps {
  data: ResumeData;
  theme: ThemeConfig;
}

// 时间线模板 - 时间线样式展示经历
export const TimelineTemplate: React.FC<TemplateProps> = ({ data, theme }) => {
  const { personalInfo, education, workExperience, projects, skills, awards, languages } = data;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}`;
  };

  return (
    <div
      className="w-[540px] min-h-[766px] bg-white mx-auto rounded-xl shadow-xl overflow-hidden"
      style={{ fontFamily: 'Noto Sans SC, sans-serif' }}
    >
      {/* Header - 左侧装饰条 */}
      <div className="flex">
        {/* 左侧装饰条 */}
        <div
          className="w-2 flex-shrink-0"
          style={{
            background: theme.colors.accent,
          }}
        />

        {/* 右侧内容 */}
        <div className="flex-1">
          <div
            className="px-6 py-5"
            style={{
              background: theme.colors.header,
            }}
          >
            <h1
              className="font-bold"
              style={{
                fontSize: '24px',
                color: theme.colors.headerText,
              }}
            >
              {personalInfo.name || 'Your Name'}
            </h1>
            <p
              className="font-medium mt-1"
              style={{
                fontSize: '12px',
                color: theme.colors.headerSubtitle,
              }}
            >
              {personalInfo.title || 'Professional Title'}
            </p>
            <div
              className="flex flex-wrap gap-x-3 gap-y-1 mt-3"
              style={{
                fontSize: '9px',
                color: theme.colors.headerContact,
              }}
            >
              {personalInfo.email && <span>{personalInfo.email}</span>}
              {personalInfo.phone && <span>{personalInfo.phone}</span>}
              {personalInfo.location && <span>{personalInfo.location}</span>}
              {personalInfo.github && <span style={{ color: theme.colors.headerSubtitle }}>{personalInfo.github}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-5">
        {/* Summary */}
        {personalInfo.summary && (
          <div className="mb-6">
            <h2
              className="font-bold mb-3"
              style={{
                fontSize: '13px',
                color: theme.colors.title,
              }}
            >
              About Me
            </h2>
            <p
              className="leading-relaxed"
              style={{
                fontSize: '9px',
                color: theme.colors.text,
              }}
            >
              {personalInfo.summary}
            </p>
          </div>
        )}

        {/* Experience - 时间线布局 */}
        {workExperience.length > 0 && (
          <div className="mb-6">
            <h2
              className="font-bold mb-4"
              style={{
                fontSize: '13px',
                color: theme.colors.title,
              }}
            >
              Experience
            </h2>
            <div className="relative">
              {/* 时间线 */}
              <div
                className="absolute left-[7px] top-2 bottom-2 w-0.5"
                style={{
                  background: theme.colors.accent,
                  opacity: 0.3,
                }}
              />

              <div className="space-y-4">
                {workExperience.map((exp) => (
                  <div key={exp.id} className="relative pl-6">
                    {/* 时间线圆点 */}
                    <div
                      className="absolute left-0 top-1 w-4 h-4 rounded-full border-2"
                      style={{
                        background: '#fff',
                        borderColor: theme.colors.accent,
                      }}
                    />
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <h3
                          className="font-bold"
                          style={{
                            fontSize: '10px',
                            color: theme.colors.title,
                          }}
                        >
                          {exp.position}
                        </h3>
                        <p
                          className="font-medium"
                          style={{
                            fontSize: '9px',
                            color: theme.colors.subtitle,
                          }}
                        >
                          {exp.company}
                        </p>
                      </div>
                      <span
                        className="px-2 py-0.5 rounded text-[7px]"
                        style={{
                          color: '#fff',
                          background: theme.colors.accent,
                        }}
                      >
                        {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}
                      </span>
                    </div>
                    {exp.description && (
                      <p
                        className="mt-1 leading-relaxed"
                        style={{
                          fontSize: '9px',
                          color: theme.colors.text,
                        }}
                      >
                        {exp.description}
                      </p>
                    )}
                    {exp.achievements.length > 0 && (
                      <ul className="mt-1 space-y-0.5">
                        {exp.achievements.map((a, i) => (
                          <li
                            key={i}
                            className="pl-2 relative"
                            style={{
                              fontSize: '8px',
                              color: theme.colors.text,
                            }}
                          >
                            <span
                              className="absolute left-0"
                              style={{ color: theme.colors.accent }}
                            >
                              ▸
                            </span>
                            {a}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Projects - 时间线布局 */}
        {projects.length > 0 && (
          <div className="mb-6">
            <h2
              className="font-bold mb-4"
              style={{
                fontSize: '13px',
                color: theme.colors.title,
              }}
            >
              Projects
            </h2>
            <div className="relative">
              {/* 时间线 */}
              <div
                className="absolute left-[7px] top-2 bottom-2 w-0.5"
                style={{
                  background: theme.colors.accent,
                  opacity: 0.3,
                }}
              />

              <div className="space-y-4">
                {projects.map((p) => (
                  <div key={p.id} className="relative pl-6">
                    {/* 时间线圆点 */}
                    <div
                      className="absolute left-0 top-1 w-4 h-4 rounded-full"
                      style={{
                        background: theme.colors.subtitle,
                      }}
                    />
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <h3
                          className="font-bold"
                          style={{
                            fontSize: '10px',
                            color: theme.colors.title,
                          }}
                        >
                          {p.name}
                        </h3>
                        {p.role && (
                          <p
                            className="font-medium"
                            style={{
                              fontSize: '9px',
                              color: theme.colors.subtitle,
                            }}
                          >
                            {p.role}
                          </p>
                        )}
                      </div>
                      <span
                        style={{
                          fontSize: '8px',
                          color: theme.colors.date,
                        }}
                      >
                        {formatDate(p.startDate)} - {p.current ? 'Present' : formatDate(p.endDate)}
                      </span>
                    </div>
                    {p.description && (
                      <p
                        className="mt-1 leading-relaxed"
                        style={{
                          fontSize: '9px',
                          color: theme.colors.text,
                        }}
                      >
                        {p.description}
                      </p>
                    )}
                    {p.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {p.technologies.map((t, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded text-[7px] font-medium"
                            style={{
                              color: theme.colors.techTag,
                              background: '#f1f5f9',
                            }}
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Education */}
        {education.length > 0 && (
          <div className="mb-6">
            <h2
              className="font-bold mb-4"
              style={{
                fontSize: '13px',
                color: theme.colors.title,
              }}
            >
              Education
            </h2>
            <div className="relative">
              {/* 时间线 */}
              <div
                className="absolute left-[7px] top-2 bottom-2 w-0.5"
                style={{
                  background: theme.colors.accent,
                  opacity: 0.3,
                }}
              />

              <div className="space-y-4">
                {education.map((e) => (
                  <div key={e.id} className="relative pl-6">
                    {/* 时间线圆点 */}
                    <div
                      className="absolute left-0 top-1 w-4 h-4 rounded-full"
                      style={{
                        background: theme.colors.categoryTitle,
                      }}
                    />
                    <div className="flex justify-between items-start">
                      <div>
                        <h3
                          className="font-bold"
                          style={{
                            fontSize: '10px',
                            color: theme.colors.title,
                          }}
                        >
                          {e.school}
                        </h3>
                        <p
                          style={{
                            fontSize: '9px',
                            color: theme.colors.subtitle,
                          }}
                        >
                          {e.degree}
                          {e.field ? ` • ${e.field}` : ''}
                        </p>
                      </div>
                      <span
                        style={{
                          fontSize: '8px',
                          color: theme.colors.date,
                        }}
                      >
                        {formatDate(e.startDate)} - {formatDate(e.endDate)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <div className="mb-6">
            <h2
              className="font-bold mb-3"
              style={{
                fontSize: '13px',
                color: theme.colors.title,
              }}
            >
              Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {skills.map((s) => (
                <div key={s.id} className="flex items-center gap-1">
                  <span
                    className="font-bold px-2 py-1 rounded text-[8px]"
                    style={{
                      color: '#fff',
                      background: theme.colors.accent,
                    }}
                  >
                    {s.category}
                  </span>
                  <span
                    style={{
                      fontSize: '8px',
                      color: theme.colors.text,
                    }}
                  >
                    {s.items.join(', ')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Awards & Languages */}
        <div className="grid grid-cols-2 gap-4">
          {awards.length > 0 && (
            <div>
              <h2
                className="font-bold mb-3"
                style={{
                  fontSize: '12px',
                  color: theme.colors.title,
                }}
              >
                Awards
              </h2>
              {awards.map((a) => (
                <div
                  key={a.id}
                  className="mb-2 flex justify-between items-center"
                >
                  <span
                    className="font-bold"
                    style={{
                      fontSize: '9px',
                      color: theme.colors.title,
                    }}
                  >
                    {a.title}
                  </span>
                  <span
                    style={{
                      fontSize: '8px',
                      color: theme.colors.date,
                    }}
                  >
                    {a.date}
                  </span>
                </div>
              ))}
            </div>
          )}

          {languages.length > 0 && (
            <div>
              <h2
                className="font-bold mb-3"
                style={{
                  fontSize: '12px',
                  color: theme.colors.title,
                }}
              >
                Languages
              </h2>
              {languages.filter((l) => l.name && l.level).map((l) => (
                <div key={l.id} className="flex justify-between mb-1">
                  <span
                    style={{
                      fontSize: '9px',
                      color: theme.colors.title,
                    }}
                  >
                    {l.name}
                  </span>
                  <span
                    style={{
                      fontSize: '9px',
                      color: theme.colors.subtitle,
                    }}
                  >
                    {l.level}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
