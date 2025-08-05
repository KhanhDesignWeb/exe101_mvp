 if (!localStorage.getItem('classes')) {
      window.classes = [
        {
          class_id: "SE1801",
          subject_code: "PRN212",
          name: "Critical Thinking Basics",
          status: "In Progress",
          semester: "Semester 1 - 2025",
          members: 60,
          slots: 10,
          teacher: "Nguyen Van A",
          topics: []
        },
        {
          class_id: "SE1802",
          subject_code: "DEF202",
          name: "Advanced Critical Thinking",
          status: "Not Started",
          semester: "Semester 2 - 2025",
          members: 35,
          slots: 8,
          teacher: "Tran Thi B",
          topics: []
        },
        {
          class_id: "SE1803",
          subject_code: "GHI303",
          name: "Academic Writing Skills",
          status: "Completed",
          semester: "Semester 1 - 2025",
          members: 42,
          slots: 10,
          teacher: "Le Phuoc C",
          topics: []
        }
      ];
      localStorage.setItem('classes', JSON.stringify(window.classes));
    }
if (!localStorage.getItem('students')) {
  const students = [
    { id: 'u1', name: 'Dinh Cuong' },
    { id: 'u2', name: 'Hue Tu' },
    { id: 'u3', name: 'Dieu Cuc' },
    { id: 'u4', name: 'Chau Dung' }
  ];
  localStorage.setItem('students', JSON.stringify(students));
}
