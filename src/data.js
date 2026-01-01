export const CATEGORY_TREE = [
    {
        id: 1,
        name: "Trang chủ",
        url: "https://giaoducthoidai.vn/rss/home.rss"
    },
    {
        id: 2,
        name: "Giáo dục",
        url: "https://giaoducthoidai.vn/rss/giao-duc-2.rss",
        children: [
            { id: 21, name: "Chính sách", url: "https://giaoducthoidai.vn/rss/chinh-sach-quan-ly-12.rss" },
            { id: 22, name: "Địa phương", url: "https://giaoducthoidai.vn/rss/dia-phuong-13.rss" },
            { id: 23, name: "Đào tạo - Tuyển sinh", url: "https://giaoducthoidai.vn/rss/tuyen-sinh-du-hoc-16.rss" },
            { id: 24, name: "Bốn phương", url: "https://giaoducthoidai.vn/rss/bon-phuong-18.rss" },
            { id: 25, name: "Chuyển động", url: "https://giaoducthoidai.vn/rss/chuyen-dong-19.rss" }
        ]
    },
    {
        id: 3,
        name: "Thời sự",
        url: "https://giaoducthoidai.vn/rss/thoi-su-1.rss",
        children: [
            { id: 31, name: "Chính trị", url: "https://giaoducthoidai.vn/rss/chinh-tri-3.rss" },
            { id: 32, name: "Xã hội", url: "https://giaoducthoidai.vn/rss/xa-hoi-4.rss" }
        ]
    },
    {
        id: 4,
        name: "Giáo dục pháp luật",
        url: "https://giaoducthoidai.vn/rss/phap-luat-5.rss",
        children: [
            { id: 41, name: "An ninh", url: "https://giaoducthoidai.vn/rss/an-ninh-32.rss" },
            { id: 42, name: "Pháp đình", url: "https://giaoducthoidai.vn/rss/phap-dinh-33.rss" },
            { id: 43, name: "Bạn đọc - Điều tra", url: "https://giaoducthoidai.vn/rss/ban-doc-dieu-tra-34.rss" }
        ]
    },
    {
        id: 5,
        name: "Kết nối",
        url: "https://giaoducthoidai.vn/rss/ket-noi-20.rss",
        children: [
            { id: 51, name: "Công đoàn", url: "https://giaoducthoidai.vn/rss/cong-doan-35.rss" },
            { id: 52, name: "Sáng tác", url: "https://giaoducthoidai.vn/rss/sang-tac-36.rss" },
            { id: 53, name: "Đồng hành", url: "https://giaoducthoidai.vn/rss/dong-hanh-37.rss" },
            { id: 54, name: "Khoa học - Công nghệ", url: "https://giaoducthoidai.vn/rss/khoa-hoc-cong-nghe-38.rss" }
        ]
    },
    {
        id: 6,
        name: "Trao đổi",
        url: "https://giaoducthoidai.vn/rss/trao-doi-4.rss",
        children: [
            { id: 61, name: "Phương pháp", url: "https://giaoducthoidai.vn/rss/phuong-phap-17.rss" },
            { id: 62, name: "Góc chuyên gia", url: "https://giaoducthoidai.vn/rss/goc-chuyen-gia-40.rss" }
        ]
    },
    {
        id: 7,
        name: "Học đường",
        url: "https://giaoducthoidai.vn/rss/hoc-duong-14.rss",
        children: [
            { id: 71, name: "Kỹ năng", url: "https://giaoducthoidai.vn/rss/ky-nang-26.rss" },
            { id: 72, name: "Du học", url: "https://giaoducthoidai.vn/rss/du-hoc-28.rss" },
            { id: 73, name: "Thể chất", url: "https://giaoducthoidai.vn/rss/the-chat-27.rss" }
        ]
    },
    {
        id: 8,
        name: "Nhân ái",
        url: "https://giaoducthoidai.vn/rss/nhan-ai-23.rss"
    },
    {
        id: 9,
        name: "Thế giới",
        url: "https://giaoducthoidai.vn/rss/the-gioi-10.rss",
        children: [
            { id: 91, name: "Giáo dục Quốc phòng", url: "https://giaoducthoidai.vn/rss/giao-duc-quoc-phong-29.rss" },
            { id: 92, name: "Thế giới đó đây", url: "https://giaoducthoidai.vn/rss/the-gioi-do-day-30.rss" },
            { id: 93, name: "Chuyện lạ", url: "https://giaoducthoidai.vn/rss/chuyen-la-44.rss" }
        ]
    },
    // --- CẬP NHẬT PHẦN SỨC KHOẺ ---
    {
        id: 10,
        name: "Sức khoẻ",
        url: "https://giaoducthoidai.vn/rss/suc-khoe-19.rss",
        children: [
            { id: 101, name: "Khoẻ đẹp", url: "https://giaoducthoidai.vn/rss/y-hoc-20.rss" },
            { id: 102, name: "Gia đình", url: "https://giaoducthoidai.vn/rss/dinh-duong-21.rss" },
            { id: 103, name: "Đẩy lùi Covid-19", url: "https://giaoducthoidai.vn/rss/suc-khoe-19.rss" } // URL dự phòng
        ]
    },
    // ------------------------------
    {
        id: 11,
        name: "Media",
        url: "https://giaoducthoidai.vn/rss/video-media-11.rss"
    },
    {
        id: 12,
        name: "Văn hóa",
        url: "https://giaoducthoidai.vn/rss/van-hoa-8.rss"
    },
    {
        id: 13,
        name: "Thể thao",
        url: "https://giaoducthoidai.vn/rss/the-thao-12.rss"
    }
];