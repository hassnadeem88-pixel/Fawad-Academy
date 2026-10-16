export interface PreloadedStudent {
  id: string;
  name: string;
  classId: string;
  className: string;
  registeredAt: string;
}

export interface PreloadedClassroom {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
}

export const initialClassrooms: PreloadedClassroom[] = [
  { id: 'class_9th', name: 'Class 9th', description: 'Matric Part-I Science Cohort', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'class_10th', name: 'Class 10th', description: 'Matric Part-II Board Exam Division', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'class_11th', name: 'Class 11th', description: 'Intermediate FSc Part-I Science Stream', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'class_12th', name: 'Class 12th', description: 'Intermediate FSc Part-II Pre-Medical & Pre-Engineering', createdAt: '2026-01-01T00:00:00.000Z' },
];

export const initialStudents: PreloadedStudent[] = [
  // Class 9th (16 students)
  { id: 'FA2019-00001', name: 'Ayesha', classId: 'class_9th', className: 'Class 9th', registeredAt: '2026-01-10T00:00:00.000Z' },
  { id: 'FA2019-00002', name: 'Ayza', classId: 'class_9th', className: 'Class 9th', registeredAt: '2026-01-10T00:00:00.000Z' },
  { id: 'FA2019-00003', name: 'Prathana', classId: 'class_9th', className: 'Class 9th', registeredAt: '2026-01-10T00:00:00.000Z' },
  { id: 'FA2019-00004', name: 'Dua fatima', classId: 'class_9th', className: 'Class 9th', registeredAt: '2026-01-10T00:00:00.000Z' },
  { id: 'FA2019-00005', name: 'Manahil', classId: 'class_9th', className: 'Class 9th', registeredAt: '2026-01-10T00:00:00.000Z' },
  { id: 'FA2019-00006', name: 'Balakhsher', classId: 'class_9th', className: 'Class 9th', registeredAt: '2026-01-10T00:00:00.000Z' },
  { id: 'FA2019-00007', name: 'Anas Ali', classId: 'class_9th', className: 'Class 9th', registeredAt: '2026-01-10T00:00:00.000Z' },
  { id: 'FA2019-00008', name: 'Kelash', classId: 'class_9th', className: 'Class 9th', registeredAt: '2026-01-10T00:00:00.000Z' },
  { id: 'FA2019-00009', name: 'Azeemjan', classId: 'class_9th', className: 'Class 9th', registeredAt: '2026-01-10T00:00:00.000Z' },
  { id: 'FA2019-00010', name: 'Habibullah', classId: 'class_9th', className: 'Class 9th', registeredAt: '2026-01-10T00:00:00.000Z' },
  { id: 'FA2019-000023', name: 'Lalchand', classId: 'class_9th', className: 'Class 9th', registeredAt: '2026-01-10T00:00:00.000Z' },
  { id: 'FA2019-000035', name: 'Zain Ali', classId: 'class_9th', className: 'Class 9th', registeredAt: '2026-01-10T00:00:00.000Z' },
  { id: 'FA2019-000040', name: 'Awais', classId: 'class_9th', className: 'Class 9th', registeredAt: '2026-01-10T00:00:00.000Z' },
  { id: 'FA2019-000050', name: 'Yasir Ali', classId: 'class_9th', className: 'Class 9th', registeredAt: '2026-01-10T00:00:00.000Z' },
  { id: 'FA2019-90', name: 'Fatima', classId: 'class_9th', className: 'Class 9th', registeredAt: '2026-01-10T00:00:00.000Z' },
  { id: 'FA2019-91', name: 'Shabir', classId: 'class_9th', className: 'Class 9th', registeredAt: '2026-01-10T00:00:00.000Z' },

  // Class 10th (12 students)
  { id: 'FA2019-21', name: 'Rafay', classId: 'class_10th', className: 'Class 10th', registeredAt: '2026-01-10T00:00:00.000Z' },
  { id: 'FA2019-22', name: 'Rashid Ali', classId: 'class_10th', className: 'Class 10th', registeredAt: '2026-01-10T00:00:00.000Z' },
  { id: 'FA2019-23', name: 'Mustaqeem', classId: 'class_10th', className: 'Class 10th', registeredAt: '2026-01-10T00:00:00.000Z' },
  { id: 'FA2019-24', name: 'Rehan', classId: 'class_10th', className: 'Class 10th', registeredAt: '2026-01-10T00:00:00.000Z' },
  { id: 'FA2019-25', name: 'Atif', classId: 'class_10th', className: 'Class 10th', registeredAt: '2026-01-10T00:00:00.000Z' },
  { id: 'FA2019-26', name: 'Awais', classId: 'class_10th', className: 'Class 10th', registeredAt: '2026-01-10T00:00:00.000Z' },
  { id: 'FA2019-27', name: 'Arisha', classId: 'class_10th', className: 'Class 10th', registeredAt: '2026-01-10T00:00:00.000Z' },
  { id: 'FA2019-30', name: 'Vishal das', classId: 'class_10th', className: 'Class 10th', registeredAt: '2026-01-10T00:00:00.000Z' },
  { id: 'FA2019-31', name: 'Parkash', classId: 'class_10th', className: 'Class 10th', registeredAt: '2026-01-10T00:00:00.000Z' },
  { id: 'FA2019-32', name: 'Amulakh', classId: 'class_10th', className: 'Class 10th', registeredAt: '2026-01-10T00:00:00.000Z' },
  { id: 'FA2019-36', name: 'Ali', classId: 'class_10th', className: 'Class 10th', registeredAt: '2026-01-10T00:00:00.000Z' },
  { id: 'FA2019-87', name: 'Aqsa komal', classId: 'class_10th', className: 'Class 10th', registeredAt: '2026-01-10T00:00:00.000Z' },

  // Class 11th (9 students)
  { id: 'FA2019-0001', name: 'Ali sher', classId: 'class_11th', className: 'Class 11th', registeredAt: '2026-01-10T00:00:00.000Z' },
  { id: 'FA2019-0002', name: 'Muqadas', classId: 'class_11th', className: 'Class 11th', registeredAt: '2026-01-10T00:00:00.000Z' },
  { id: 'FA2019-0003', name: 'Rimsha', classId: 'class_11th', className: 'Class 11th', registeredAt: '2026-01-10T00:00:00.000Z' },
  { id: 'FA2019-0004', name: 'Suneeta', classId: 'class_11th', className: 'Class 11th', registeredAt: '2026-01-10T00:00:00.000Z' },
  { id: 'FA2019-0005', name: 'Sher Muhammad', classId: 'class_11th', className: 'Class 11th', registeredAt: '2026-01-10T00:00:00.000Z' },
  { id: 'FA2019-0006', name: 'Ghulam Muhammad', classId: 'class_11th', className: 'Class 11th', registeredAt: '2026-01-10T00:00:00.000Z' },
  { id: 'FA2019-0008', name: 'Shakeela', classId: 'class_11th', className: 'Class 11th', registeredAt: '2026-01-10T00:00:00.000Z' },
  { id: 'FA2019-101', name: 'Rimsha k.k', classId: 'class_11th', className: 'Class 11th', registeredAt: '2026-01-10T00:00:00.000Z' },
  { id: 'FA2019-300', name: 'Nafay', classId: 'class_11th', className: 'Class 11th', registeredAt: '2026-01-10T00:00:00.000Z' },

  // Class 12th (21 students)
  { id: 'FA2019-001', name: 'Ayesha', classId: 'class_12th', className: 'Class 12th', registeredAt: '2026-01-10T00:00:00.000Z' },
  { id: 'FA2019-002', name: 'Asad Ali', classId: 'class_12th', className: 'Class 12th', registeredAt: '2026-01-10T00:00:00.000Z' },
  { id: 'FA2019-003', name: 'Aliza fatima', classId: 'class_12th', className: 'Class 12th', registeredAt: '2026-01-10T00:00:00.000Z' },
  { id: 'FA2019-004', name: 'Aitazaz', classId: 'class_12th', className: 'Class 12th', registeredAt: '2026-01-10T00:00:00.000Z' },
  { id: 'FA2019-005', name: 'Ahsan', classId: 'class_12th', className: 'Class 12th', registeredAt: '2026-01-10T00:00:00.000Z' },
  { id: 'FA2019-006', name: 'Haya fatima', classId: 'class_12th', className: 'Class 12th', registeredAt: '2026-01-10T00:00:00.000Z' },
  { id: 'FA2019-007', name: 'Maheen', classId: 'class_12th', className: 'Class 12th', registeredAt: '2026-01-10T00:00:00.000Z' },
  { id: 'FA2019-008', name: 'Muskan', classId: 'class_12th', className: 'Class 12th', registeredAt: '2026-01-10T00:00:00.000Z' },
  { id: 'FA2019-009', name: 'Neha', classId: 'class_12th', className: 'Class 12th', registeredAt: '2026-01-10T00:00:00.000Z' },
  { id: 'FA2019-010', name: 'Dayal das', classId: 'class_12th', className: 'Class 12th', registeredAt: '2026-01-10T00:00:00.000Z' },
  { id: 'FA2019-011', name: 'Faheem', classId: 'class_12th', className: 'Class 12th', registeredAt: '2026-01-10T00:00:00.000Z' },
  { id: 'FA2019-012', name: 'Hassnain', classId: 'class_12th', className: 'Class 12th', registeredAt: '2026-01-10T00:00:00.000Z' },
  { id: 'FA2019-12', name: 'Anum', classId: 'class_12th', className: 'Class 12th', registeredAt: '2026-01-10T00:00:00.000Z' },
  { id: 'FA2019-013', name: 'Meesam', classId: 'class_12th', className: 'Class 12th', registeredAt: '2026-01-10T00:00:00.000Z' },
  { id: 'FA2019-13', name: 'Asad Ali', classId: 'class_12th', className: 'Class 12th', registeredAt: '2026-01-10T00:00:00.000Z' },
  { id: 'FA2019-014', name: 'Suneel', classId: 'class_12th', className: 'Class 12th', registeredAt: '2026-01-10T00:00:00.000Z' },
  { id: 'FA2019-015', name: 'Soojal', classId: 'class_12th', className: 'Class 12th', registeredAt: '2026-01-10T00:00:00.000Z' },
  { id: 'FA2019-016', name: 'Touqeer', classId: 'class_12th', className: 'Class 12th', registeredAt: '2026-01-10T00:00:00.000Z' },
  { id: 'FA2019-017', name: 'Govind', classId: 'class_12th', className: 'Class 12th', registeredAt: '2026-01-10T00:00:00.000Z' },
  { id: 'FA2019-60', name: 'Waqas Ali', classId: 'class_12th', className: 'Class 12th', registeredAt: '2026-01-10T00:00:00.000Z' },
  { id: 'FA2019-100', name: 'Jeevraj kumar', classId: 'class_12th', className: 'Class 12th', registeredAt: '2026-01-10T00:00:00.000Z' },
];
