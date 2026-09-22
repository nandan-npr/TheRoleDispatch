import { CategoryStructure, JobCategory, JobSource } from '../types';

export const CATEGORY_STRUCTURE: CategoryStructure[] = [
  {
    group: 'IT',
    description: 'Software development, systems architecture, cloud computing, and digital engineering disciplines.',
    subcategories: [
      {
        name: 'IT Fresher',
        description: 'Entry-level engineering, graduate software engineer trainees, junior full-stack, and QA roles.'
      },
      {
        name: 'IT Experienced',
        description: 'Mid to principal level software engineers, tech leads, backend architects, and DevOps specialists.'
      }
    ]
  },
  {
    group: 'Engineering',
    description: 'Core physical sciences, hardware systems, civil infrastructure, and multidisciplinary engineering.',
    subcategories: [
      {
        name: 'ECE',
        description: 'Electronics & Communication: Embedded systems, VLSI design, DSP, RF engineering, and firmware.'
      },
      {
        name: 'EEE',
        description: 'Electrical & Electronics: Power systems, high-voltage equipment, grid infrastructure, and control units.'
      },
      {
        name: 'Mechanical',
        description: 'Thermal analysis, CAD/CAM drafting, robotics, automated tooling, and manufacturing operations.'
      },
      {
        name: 'Civil',
        description: 'Structural planning, geotechnical surveying, site supervision, BIM modeling, and municipal works.'
      },
      {
        name: 'Automobile',
        description: 'Electric vehicle powertrain, chassis dynamics, automotive calibration, and NVH engineering.'
      },
      {
        name: 'Instrumentation',
        description: 'Industrial automation, SCADA systems, programmable logic controllers (PLC), and process measurement.'
      },
      {
        name: 'Other Engineering',
        description: 'Chemical, metallurgical, aerospace, biomedical, and specialized technical disciplines.'
      }
    ]
  },
  {
    group: 'Diploma',
    description: 'Practical technical training, polytechnic credentials, laboratory fabrication, and field maintenance.',
    subcategories: [
      {
        name: 'Diploma - CSE',
        description: 'IT infrastructure support, network routing, hardware troubleshooting, and technical operations.'
      },
      {
        name: 'Diploma - ECE',
        description: 'PCB testing, electronic assembly line calibration, soldering verification, and component repair.'
      },
      {
        name: 'Diploma - EEE',
        description: 'Substation maintenance, industrial electrical wiring, motor winding, and panel fabrication.'
      },
      {
        name: 'Diploma - Mechanical',
        description: 'CNC machine operation, precision tooling, quality inspection, and hydraulic maintenance.'
      },
      {
        name: 'Diploma - Civil',
        description: 'Total station land surveying, site documentation, material testing, and quantity estimations.'
      },
      {
        name: 'Diploma - Other',
        description: 'Polytechnic diplomas in instrumentation, printing, mining, ceramic, and textile technologies.'
      }
    ]
  },
  {
    group: 'Other',
    description: 'Operations, supply chain management, technical documentation, design, and auxiliary professional sectors.',
    subcategories: [
      {
        name: 'Other Jobs',
        description: 'Supply chain coordinators, technical writers, safety officers, and operational analysts.'
      }
    ]
  }
];

export const ALL_CATEGORIES: JobCategory[] = CATEGORY_STRUCTURE.flatMap(g => 
  g.subcategories.map(s => s.name)
);

export const ALL_SOURCES: JobSource[] = [
  'Company Careers',
  'LinkedIn',
  'Indeed',
  'Naukri',
  'Foundit',
  'Glassdoor',
  'Internshala',
  'Wellfound',
  'Cutshort',
  'Workday',
  'Other'
];

export function getCategoryGroup(category: JobCategory): string {
  for (const group of CATEGORY_STRUCTURE) {
    if (group.subcategories.some(sub => sub.name === category)) {
      return group.group;
    }
  }
  return 'Other';
}
