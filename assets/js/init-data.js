if (!localStorage.getItem("classes")) {
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
      topics: [
        {
          topic_id: "T1",
          title: "Chủ đề 1 - Lập luận cơ bản",
          description: "Thảo luận về các lập luận cơ bản trong đời sống",
          end_time: "2025-08-27T16:40:00.000Z",
          created_by: "Nguyen Van A",
          created_at: "2025-08-01T10:00:00.000Z",
          homeworks: [
            {
              hw_id: "HW1",
              title: "Bài tập Critical Thinking 1",
              description:
                "Hãy phân tích và phản biện một lập luận bất kỳ trong đời sống.",
              attachments: [],
              due_date: "2025-08-15T23:59:00",
              created_by: "Nguyen Van A",
              submissions: [],
            },
          ],
        },
      ],
      memberList: [
        { id: "stu01", name: "Pham Minh", rating: 20 },
        { id: "stu02", name: "Le Hoa", rating: 2 },
        { id: "stu03", name: "Tran Quan", rating: 14 },
        { id: "stu04", name: "Nguyen Lan", rating: 3 },
      ],
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
      topics: [
        {
          topic_id: "T1",
          title: "Chủ đề 1 - Lập luận nâng cao",
          description: "Phân tích logic của một tranh luận phức tạp.",
          end_time: "2025-08-30T16:40:00.000Z",
          created_by: "Tran Thi B",
          created_at: "2025-08-05T09:00:00.000Z",
          homeworks: [
            {
              hw_id: "HW1",
              title: "Bài tập Nâng cao 1",
              description: "Phân tích logic của một tranh luận phức tạp.",
              attachments: [],
              due_date: "2025-08-20T23:59:00",
              created_by: "Tran Thi B",
              submissions: [],
            },
          ],
        },
      ],
      memberList: [
        { id: "stu11", name: "Bui Thao", rating: 1 },
        { id: "stu12", name: "Dang Khoa", rating: 5 },
        { id: "stu13", name: "Hoang Nhi", rating: 4 },
      ],
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
      topics: [
        {
          topic_id: "T1",
          title: "Chủ đề 1 - Viết học thuật",
          description: "Luyện tập viết học thuật chuyên sâu.",
          end_time: "2025-09-01T16:40:00.000Z",
          created_by: "Le Phuoc C",
          created_at: "2025-08-07T11:00:00.000Z",
          homeworks: [
            {
              hw_id: "HW1",
              title: "Bài tập Viết học thuật 1",
              description: "Viết một bài luận 500 từ về một chủ đề tự chọn.",
              attachments: [],
              due_date: "2025-08-25T23:59:00",
              created_by: "Le Phuoc C",
              submissions: [],
            },
          ],
        },
      ],
      memberList: [
        { id: "stu21", name: "Vo Dung", rating: 6 },
        { id: "stu22", name: "Ly An", rating: 18 },
        { id: "stu23", name: "Mai Chien", rating: 25 },
        { id: "stu24", name: "Dinh Tien", rating: 40 },
        { id: "stu25", name: "Phan Dao", rating: 12 },
      ],
    },
  ];

  localStorage.setItem("classes", JSON.stringify(window.classes));
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
    { id: "u9", name: "Pham Minh", rating: 32 },
    { id: "u10", name: "Le Hoa", rating: 56 },
    { id: "u11", name: "Tran Quan", rating: 7 },
    { id: "u12", name: "Nguyen Lan", rating: 2 },
    { id: "u13", name: "Bui Thao", rating: 9 },
    { id: "u14", name: "Dang Khoa", rating: 0 },
    { id: "u15", name: "Hoang Nhi", rating: 0 },
    { id: "u16", name: "Vo Dung", rating: 23 },
    { id: "u17", name: "Ly An", rating: 8 },
    { id: "u18", name: "Mai Chien", rating: 34 },
    { id: "u18", name: "Dinh Tien", rating: 15 },
    { id: "u18", name: "Phan Dao", rating: 26 },
  ];
  localStorage.setItem("students", JSON.stringify(students));
}
if (!localStorage.getItem("conversationHistory")) {
  const conversationHistory = [
    { role: "user", content: "xin chào" },
    { role: "assistant", content: "Xin chào! How familiar are you with the concept of cultural greetings and their significance in different societies? Can you think of any other greetings from different cultures that you find interesting or unique?" },
    { role: "user", content: "cách để cải thiện tư duy phản biện" },
    { role: "assistant", content: "Improving critical thinking skills is essential for making sound decisions and solving problems effectively. Have you ever tried analyzing different perspectives on an issue before forming your own opinion? How do you think actively seeking out opposing viewpoints could enhance your critical thinking abilities?" },
    { role: "user", content: "dsadas" },
    { role: "assistant", content: "Improving critical thinking involves actively engaging with various perspectives and challenging one's own assumptions. Let's explore how considering differing viewpoints can help deepen your understanding of complex issues. Can you think of a time when considering an opposing viewpoint led you to a new insight or understanding?" }
  ];

  localStorage.setItem("conversationHistory", JSON.stringify(conversationHistory));
}
if (!localStorage.getItem("cognitiveEngagementHistory")) {
  const cognitiveEngagementHistory = [
    {
      classId: "SE1801",
      senderId: "115260584507841844388",
      senderName: "Le Phuoc Loc (K18 CT)",
      engagement: "Neutral",
      senderAvatar: "https://lh3.googleusercontent.com/a/ACg8ocLJxw3478uSHig1rqk20wxkpjJIgJhoczVcXFB-uW-xdAoCWA=s96-c"
    },
    {
      classId: "SE1801",
      senderId: "115260584507841844388",
      senderName: "Le Phuoc Loc (K18 CT)",
      engagement: "Positive",
      senderAvatar: "https://lh3.googleusercontent.com/a/ACg8ocLJxw3478uSHig1rqk20wxkpjJIgJhoczVcXFB-uW-xdAoCWA=s96-c"
    },
    {
      classId: "SE1801",
      senderId: "115260584507841844388",
      senderName: "Le Phuoc Loc (K18 CT)",
      engagement: "Negative",
      senderAvatar: "https://lh3.googleusercontent.com/a/ACg8ocLJxw3478uSHig1rqk20wxkpjJIgJhoczVcXFB-uW-xdAoCWA=s96-c"
    },
    {
      classId: "SE1801",
      senderId: "u9",
      senderName: "Pham Minh",
      engagement: "Positive",
      senderAvatar: null
    },
    {
      classId: "SE1801",
      senderId: "u9",
      senderName: "Pham Minh",
      engagement: "Positive",
      senderAvatar: null
    },
    {
      classId: "SE1801",
      senderId: "u9",
      senderName: "Pham Minh",
      engagement: "Positive",
      senderAvatar: null
    },
    {
      classId: "SE1801",
      senderId: "u9",
      senderName: "Pham Minh",
      engagement: "Neutral",
      senderAvatar: null
    },
    {
      classId: "SE1801",
      senderId: "u10",
      senderName: "Le Hoa",
      engagement: "Neutral",
      senderAvatar: null
    },
    {
      classId: "SE1801",
      senderId: "u11",
      senderName: "Tran Quan",
      engagement: "Neutral",
      senderAvatar: null
    },
    {
      classId: "SE1801",
      senderId: "u12",
      senderName: "Nguyen Lan",
      engagement: "Negative",
      senderAvatar: null
    }
  ];

  localStorage.setItem("cognitiveEngagementHistory", JSON.stringify(cognitiveEngagementHistory));
}