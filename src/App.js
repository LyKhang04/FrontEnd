import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Navbar, Button, Modal, Spinner, Breadcrumb } from 'react-bootstrap';
import { XMLParser } from 'fast-xml-parser'; // Thư viện parse XML chuẩn
import axios from 'axios';
import { CATEGORY_TREE } from './data';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
    const [articles, setArticles] = useState([]); // Danh sách tin
    const [loading, setLoading] = useState(false); // Trạng thái loading tin
    const [crawling, setCrawling] = useState(false); // Trạng thái loading chi tiết
    const [currentCategory, setCurrentCategory] = useState("Trang chủ");

    // State cho bài viết chi tiết
    const [selectedArticle, setSelectedArticle] = useState(null);
    const [articleContent, setArticleContent] = useState("");

    // --- HÀM 1: LẤY DANH SÁCH TIN TỪ RSS (XML) ---
    const fetchRSS = async (url, categoryName) => {
        if (!url) return;
        setLoading(true);
        setCurrentCategory(categoryName);
        try {
            // Dùng Proxy allorigins để bypass CORS
            const proxy = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
            const response = await axios.get(proxy);

            // Parse XML sang JSON
            const parser = new XMLParser();
            const jsonData = parser.parse(response.data);

            // Xử lý an toàn dữ liệu (tránh lỗi nếu chỉ có 1 bài viết)
            const items = jsonData?.rss?.channel?.item;
            const list = Array.isArray(items) ? items : (items ? [items] : []);

            setArticles(list);
        } catch (error) {
            console.error("Lỗi lấy RSS:", error);
            alert("Không thể lấy dữ liệu từ nguồn này.");
        } finally {
            setLoading(false);
        }
    };

    // --- HÀM 2: CRAWL DỮ LIỆU CHI TIẾT TỪ HTML ---
    const handleCrawlDetail = async (article) => {
        setSelectedArticle(article);
        setCrawling(true);
        setArticleContent(""); // Reset nội dung cũ

        try {
            // 1. Lấy Source HTML của trang chi tiết qua Proxy
            const proxy = `https://api.allorigins.win/raw?url=${encodeURIComponent(article.link)}`;
            const response = await axios.get(proxy);

            // 2. Dùng DOMParser để biến string HTML thành Document Object
            const domParser = new DOMParser();
            const doc = domParser.parseFromString(response.data, "text/html");

            // 3. SELECTOR QUAN TRỌNG: Tìm div chứa nội dung bài viết của báo GD&T
            // Báo GD&T thường dùng class 'detail-content' hoặc thẻ 'article'
            let contentNode = doc.querySelector(".detail-content") || doc.querySelector("article");

            if (contentNode) {
                // 4. Clean dữ liệu: Xóa các phần không cần thiết (Quảng cáo, tin liên quan)
                const junkSelectors = [".box-related", ".ads", ".banner", "script", "style"];
                junkSelectors.forEach(sel => {
                    contentNode.querySelectorAll(sel).forEach(el => el.remove());
                });

                // 5. Fix ảnh: Đảm bảo ảnh hiển thị responsive
                contentNode.querySelectorAll("img").forEach(img => {
                    img.style.maxWidth = "100%";
                    img.style.height = "auto";
                    // Xử lý lazy load nếu ảnh chưa load
                    if(img.dataset.src) img.src = img.dataset.src;
                });

                setArticleContent(contentNode.innerHTML);
            } else {
                setArticleContent("<p>Không thể bóc tách nội dung tự động. Vui lòng xem link gốc.</p>");
            }
        } catch (error) {
            console.error("Lỗi Crawl:", error);
            setArticleContent("<p>Lỗi kết nối khi tải chi tiết bài viết.</p>");
        } finally {
            setCrawling(false);
        }
    };

    // Khởi chạy lần đầu
    useEffect(() => {
        fetchRSS(CATEGORY_TREE[0].url, CATEGORY_TREE[0].name);
    }, []);

    return (
        <div className="app-container">
            <Navbar bg="primary" variant="dark" className="shadow-sm mb-4">
                <Container>
                    <Navbar.Brand>📰 GD&T Crawler App</Navbar.Brand>
                    <Navbar.Text className="text-white">ReactJS - RSS Parser</Navbar.Text>
                </Container>
            </Navbar>

            <Container>
                <Row>
                    {/* SIDEBAR: DANH MỤC ĐỆ QUY */}
                    <Col md={3} className="mb-4">
                        <Card className="shadow-sm">
                            <Card.Header className="bg-light fw-bold">Danh mục tin</Card.Header>
                            <div className="p-2">
                                <RecursiveCategory list={CATEGORY_TREE} onSelect={fetchRSS} />
                            </div>
                        </Card>
                    </Col>

                    {/* MAIN: DANH SÁCH TIN TỨC */}
                    <Col md={9}>
                        <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
                            <h4 className="text-primary m-0">{currentCategory}</h4>
                            <span className="badge bg-secondary">{articles.length} tin</span>
                        </div>

                        {loading ? (
                            <div className="text-center py-5"><Spinner animation="border" variant="primary"/></div>
                        ) : (
                            <Row>
                                {articles.map((item, idx) => (
                                    <Col md={12} lg={6} key={idx} className="mb-4">
                                        <Card className="h-100 shadow-sm news-card">
                                            <Card.Body className="d-flex flex-column">
                                                <Card.Title className="fs-6 fw-bold text-dark">
                                                    <a href="#!" onClick={(e) => { e.preventDefault(); handleCrawlDetail(item); }} className="text-decoration-none text-dark hover-blue">
                                                        {item.title}
                                                    </a>
                                                </Card.Title>
                                                <Card.Text className="small text-muted flex-grow-1">
                                                    {/* Loại bỏ HTML tag trong mô tả ngắn */}
                                                    {item.description?.replace(/<[^>]+>/g, '').substring(0, 120)}...
                                                </Card.Text>
                                                <div className="mt-2">
                                                    <Button size="sm" variant="outline-primary" className="me-2 w-100"
                                                            onClick={() => handleCrawlDetail(item)}>
                                                        <i className="bi bi-eye-fill"></i> Xem chi tiết (Crawl)
                                                    </Button>
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        )}
                    </Col>
                </Row>
            </Container>

            {/* MODAL: HIỂN THỊ NỘI DUNG CRAWL ĐƯỢC */}
            <Modal show={!!selectedArticle} onHide={() => setSelectedArticle(null)} size="lg" scrollable>
                <Modal.Header closeButton>
                    <Modal.Title className="fs-6">{selectedArticle?.title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {crawling ? (
                        <div className="text-center py-4">
                            <Spinner animation="grow" variant="info" />
                            <p className="mt-2 text-muted">Đang phân tích HTML từ link gốc...</p>
                        </div>
                    ) : (
                        <div className="article-body" dangerouslySetInnerHTML={{ __html: articleContent }} />
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setSelectedArticle(null)}>Đóng</Button>
                    <Button variant="primary" href={selectedArticle?.link} target="_blank">Xem trang gốc</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

// COMPONENT ĐỆ QUY (Hiển thị danh mục lồng nhau)
const RecursiveCategory = ({ list, onSelect }) => {
    return (
        <ul className="list-unstyled ps-2 mb-0">
            {list.map((item) => (
                <li key={item.id} className="mb-1">
                    <div
                        className="category-item p-2 rounded"
                        onClick={(e) => {
                            e.stopPropagation(); // Ngăn sự kiện nổi bọt
                            if (item.url) onSelect(item.url, item.name);
                        }}
                    >
                        {item.children ? '📂 ' : '📰 '} {item.name}
                    </div>
                    {/* Điều kiện dừng đệ quy: Nếu có children thì gọi lại chính nó */}
                    {item.children && item.children.length > 0 && (
                        <div className="border-start ms-3 ps-2">
                            <RecursiveCategory list={item.children} onSelect={onSelect} />
                        </div>
                    )}
                </li>
            ))}
        </ul>
    );
};

export default App;