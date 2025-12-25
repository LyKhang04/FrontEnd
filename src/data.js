export const CATEGORY_TREE = [
    {
        id: 1,
        name: "Trang chủ",
        url: "https://giaoducthoidai.vn/rss/home.rss"
    },
    {
        id: 2,
        name: "Giáo dục",
        // Link danh mục cha (nếu muốn bấm vào cha cũng ra tin)
        url: "https://giaoducthoidai.vn/rss/giao-duc-2.rss",
        children: [
            { id: 21, name: "Học đường", url: "https://giaoducthoidai.vn/rss/hoc-duong-14.rss" },
            { id: 22, name: "Tuyển sinh", url: "https://giaoducthoidai.vn/rss/tuyen-sinh-du-hoc-16.rss" },
            { id: 23, name: "Gương mặt", url: "https://giaoducthoidai.vn/rss/guong-mat-giao-duc-15.rss" }
        ]
    },
    {
        id: 3,
        name: "Thời sự",
        url: "https://giaoducthoidai.vn/rss/thoi-su-1.rss",
        children: [
            { id: 31, name: "Chính trị", url: "https://giaoducthoidai.vn/rss/chinh-tri-3.rss" }
        ]
    },
    {
        id: 4,
        name: "Pháp luật",
        url: "https://giaoducthoidai.vn/rss/phap-luat-5.rss"
    }
];