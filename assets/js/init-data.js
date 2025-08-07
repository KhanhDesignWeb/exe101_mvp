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
        { id: "stu01", name: "Pham Minh", rating: 20 },
        { id: "stu02", name: "Le Hoa", rating: 2 },
        { id: "stu03", name: "Tran Quan", rating: 14 },
        { id: "stu04", name: "Nguyen Lan", rating: 3 }
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
        { id: "stu11", name: "Bui Thao", rating: 1 },
        { id: "stu12", name: "Dang Khoa", rating: 5 },
        { id: "stu13", name: "Hoang Nhi", rating: 4 }
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
        { id: "stu21", name: "Vo Dung", rating: 6 },
        { id: "stu22", name: "Ly An", rating: 18 },
        { id: "stu23", name: "Mai Chien", rating: 25 },
        { id: "stu24", name: "Dinh Tien", rating: 40 },
        { id: "stu25", name: "Phan Dao", rating: 12 }
      ]
    }
  ];

  localStorage.setItem('classes', JSON.stringify(window.classes));
}

if (!localStorage.getItem("students")) {
  const students = [
    { id: "u1", name: "Dinh Cuong", rating: 6 },
    { id: "u2", name: "Hue Tu", rating: 12 },
    { id: "u3", name: "Dieu Cuc", rating: 20 },
    { id: "u4", name: "Chau Dung", rating: 3 },
    { id: "u5", name: "Tieu Hi", rating: 8 },
    { id: "u6", name: "Hai Tu", rating: 2 },
    { id: "u7", name: "Dang Khoi", rating: 25 },
    { id: "u8", name: "Hoang Anh", rating: 7 },
  ];
  localStorage.setItem("students", JSON.stringify(students));
}
