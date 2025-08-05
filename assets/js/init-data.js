if (!localStorage.getItem('classes')) {
  window.classes = [
    {
      class_id: "SE1801",
      subject_code: "PRN212",
      name: "Critical Thinking Basics",
      status: "In Progress",
      semester: "Semester 1 - 2025",
      members: 4,
      slots: 10,
      teacher: "Nguyen Van A",
      topics: [],
      memberList: [
        { id: "stu01", name: "Pham Minh" },
        { id: "stu02", name: "Le Hoa" },
        { id: "stu03", name: "Tran Quan" },
        { id: "stu04", name: "Nguyen Lan" }
      ]
    },
    {
      class_id: "SE1802",
      subject_code: "DEF202",
      name: "Advanced Critical Thinking",
      status: "Not Started",
      semester: "Semester 2 - 2025",
      members: 3,
      slots: 8,
      teacher: "Tran Thi B",
      topics: [],
      memberList: [
        { id: "stu11", name: "Bui Thao" },
        { id: "stu12", name: "Dang Khoa" },
        { id: "stu13", name: "Hoang Nhi" }
      ]
    },
    {
      class_id: "SE1803",
      subject_code: "GHI303",
      name: "Academic Writing Skills",
      status: "Completed",
      semester: "Semester 1 - 2025",
      members: 5,
      slots: 10,
      teacher: "Le Phuoc C",
      topics: [],
      memberList: [
        { id: "stu21", name: "Vo Dung" },
        { id: "stu22", name: "Ly An" },
        { id: "stu23", name: "Mai Chien" },
        { id: "stu24", name: "Dinh Tien" },
        { id: "stu25", name: "Phan Dao" }
      ]
    }
  ];

  localStorage.setItem('classes', JSON.stringify(window.classes));
}

if (!localStorage.getItem("students")) {
  const students = [
    { id: "u1", name: "Dinh Cuong" },
    { id: "u2", name: "Hue Tu" },
    { id: "u3", name: "Dieu Cuc" },
    { id: "u4", name: "Chau Dung" },
  ];
  localStorage.setItem("students", JSON.stringify(students));
}
