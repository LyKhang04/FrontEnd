import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Navbar, Nav, Form, FormControl, Button, Card, Modal, Spinner } from 'react-bootstrap';
import { XMLParser } from 'fast-xml-parser';
import axios from 'axios';
import { CATEGORY_TREE } from './data'; // Import data mới
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';

function App() {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedArticle, setSelectedArticle] = useState(null);
    const [detailContent, setDetailContent] = useState("");
    const [isCrawling, setIsCrawling] = useState(false);
    const [currentCatName, setCurrentCatName] = useState("Trang chủ");

    // --- HÀM 1: LẤY RSS TỪ URL ---
    const fetchRSS = async (url, name) => {
        setLoading(true);
        setCurrentCatName(name);
        try {
            const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
            const res = await axios.get(proxyUrl);
            const parser = new XMLParser({ ignoreAttributes: false });
            const result = parser.parse(res.data);
            const items = result?.rss?.channel?.item;
            // Đảm bảo luôn trả về mảng
            setArticles(Array.isArray(items) ? items : (items ? [items] : []));
            window.scrollTo(0, 0);
        } catch (err) {
            console.error("Lỗi tải RSS:", err);
        } finally {
            setLoading(false);
        }
    };

    // --- HÀM 2: CRAWL DỮ LIỆU CHI TIẾT ---
    const crawlArticle = async (article) => {
        setSelectedArticle(article);
        setIsCrawling(true);
        setDetailContent("");
        try {
            const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(article.link)}`;
            const res = await axios.get(proxyUrl);
            const dom = new DOMParser().parseFromString(res.data, 'text/html');

            // Chọn vùng nội dung chính (tùy chỉnh theo cấu trúc báo GD&T)
            const content = dom.querySelector('.detail-content') || dom.querySelector('article') || dom.querySelector('.content');

            if (content) {
                // Xử lý ảnh và xóa rác
                content.querySelectorAll('img').forEach(img => {
                    img.className = "img-fluid rounded shadow-sm my-3 d-block mx-auto";
                    const src = img.getAttribute('src');
                    if (src && src.startsWith('/')) {
                        img.src = `https://giaoducthoidai.vn${src}`;
                    }
                });
                content.querySelectorAll(".box-related, .ads, .banner, script").forEach(el => el.remove());
                setDetailContent(content.innerHTML);
            } else {
                setDetailContent("<p class='text-center py-3'>Không thể tự động lấy nội dung. <a href='"+article.link+"' target='_blank'>Xem bài viết gốc</a></p>");
            }
        } catch (err) {
            setDetailContent("<p class='text-danger text-center'>Lỗi kết nối khi tải nội dung.</p>");
        } finally {
            setIsCrawling(false);
        }
    };

    useEffect(() => {
        // Tự động tải trang chủ khi mở App
        if (CATEGORY_TREE.length > 0) {
            fetchRSS(CATEGORY_TREE[0].url, CATEGORY_TREE[0].name);
        }
    }, []);

    return (
        <div className="app-container">
            {/* 1. TOP INFO BAR */}
            <div className="top-info-bar bg-light border-bottom py-1">
                <Container className="d-flex justify-content-start align-items-center small text-secondary flex-wrap">
                    <span className="me-3 mb-1"><i className="bi bi-clock me-1"></i> {new Date().toLocaleDateString('vi-VN', {weekday: 'long', year: 'numeric', month: '2-digit', day: '2-digit'})}</span>
                    <span className="me-3 mb-1 border-start ps-3"><i className="bi bi-telephone me-1"></i> Hotline: <strong className="text-danger">096.733.5089</strong></span>
                    <span className="mb-1 border-start ps-3"><i className="bi bi-envelope me-1"></i> Email: <span className="text-primary">gdtddientu@gmail.com</span></span>
                </Container>
            </div>

            {/* 2. HEADER LOGO & SEARCH */}
            <header className="bg-white py-3">
                <Container className="d-flex justify-content-between align-items-end flex-wrap">
                    {/* Logo Chính */}
                    <div className="logo-box text-start cursor-pointer mb-2" onClick={() => fetchRSS(CATEGORY_TREE[0].url, "Trang chủ")}>
                        <h1 className="logo-main text-danger fw-bold mb-0 lh-1">GIÁO DỤC</h1>
                        <div className="d-flex align-items-center">
                            <span className="logo-sub text-warning fw-bold fs-4 me-1" style={{fontFamily: 'serif'}}>VÀ</span>
                            <span className="logo-sub text-danger fw-bold fs-2">THỜI ĐẠI</span>
                        </div>
                    </div>

                    {/* Search + Logo Phụ */}
                    <div className="d-flex align-items-center w-50 justify-content-end mb-2 header-right-section">
                        <Form className="w-75 me-3 position-relative d-none d-md-block">
                            <FormControl
                                type="search"
                                placeholder="Tìm kiếm..."
                                className="rounded-pill bg-light border-0 ps-3 pe-5 py-2"
                            />
                            <Button variant="link" className="position-absolute top-50 end-0 translate-middle-y text-dark pe-3">
                                <i className="bi bi-search"></i>
                            </Button>
                        </Form>

                        {/* Logo Phụ */}
                        <div className="sub-logo-box text-end lh-1 ps-3 border-start">
                            <div className="text-danger fw-bold fs-5">GIÁO DỤC</div>
                            <div className="text-dark fw-bold" style={{fontSize: '0.6rem'}}>CHUYÊN TRANG CỦA</div>
                            <div className="text-dark" style={{fontSize: '0.6rem'}}>BÁO GIÁO DỤC & THỜI ĐẠI</div>
                            <div className="text-danger fw-bold" style={{fontSize: '0.75rem'}}>THỦ ĐÔ</div>
                        </div>
                    </div>
                </Container>
            </header>

            {/* 3. NAVBAR ĐỎ (Sticky) */}
            <Navbar bg="danger" variant="dark" expand="lg" className="py-0 sticky-top main-nav shadow-sm">
                <Container>
                    <Navbar.Toggle aria-controls="main-navbar" />
                    <Navbar.Collapse id="main-navbar">
                        <Nav className="w-100 justify-content-between align-items-center">
                            {/* Nút Home */}
                            <Nav.Link onClick={() => fetchRSS(CATEGORY_TREE[0].url, "Trang chủ")} className="py-2 px-3 bg-danger-dark">
                                <i className="bi bi-house-door-fill fs-5"></i>
                            </Nav.Link>

                            {/* Danh sách Menu Lấy từ Data */}
                            {CATEGORY_TREE.slice(1, 13).map((item, i) => (
                                <Nav.Link
                                    key={i}
                                    className="text-white fw-bold px-2 py-3 nav-link-custom"
                                    onClick={() => fetchRSS(item.url, item.name)}
                                >
                                    {item.name}
                                </Nav.Link>
                            ))}
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            {/* 4. NỘI DUNG CHÍNH (Đã xóa cột phải, mở rộng full width) */}
            <Container className="mt-4">
                <Row>
                    {/* Cột chính mở rộng ra 12 (Full width) */}
                    <Col lg={12}>
                        <div className="section-title mb-4 border-bottom pb-2 border-danger border-2 d-flex align-items-center">
                            <span className="badge bg-danger me-2">LIVE</span>
                            <h5 className="fw-bold m-0 text-danger text-uppercase">{currentCatName}</h5>
                        </div>

                        {loading ? (
                            <div className="text-center py-5"><Spinner animation="border" variant="danger" /></div>
                        ) : (
                            <Row>
                                {articles.map((item, idx) => (
                                    // Điều chỉnh grid: Bài đầu to (12), các bài sau chia 3 cột (4) hoặc 2 cột (6) tùy ý
                                    <Col md={idx === 0 ? 12 : 4} key={idx} className="mb-4">
                                        <Card className={`news-card h-100 border-0 shadow-sm ${idx === 0 ? 'featured-card' : ''}`}>
                                            <Card.Body className={idx === 0 ? 'd-md-flex p-0' : 'p-3'}>
                                                {/* Ảnh đại diện cho bài Featured */}
                                                {idx === 0 && (
                                                    <div className="featured-img-box bg-secondary-subtle d-flex align-items-center justify-content-center text-muted col-md-6">
                                                        <i className="bi bi-card-image fs-1"></i>
                                                    </div>
                                                )}
                                                <div className={`d-flex flex-column ${idx === 0 ? 'p-4 col-md-6' : ''}`}>
                                                    <Card.Title
                                                        className={`fw-bold mb-2 hover-blue ${idx === 0 ? 'fs-3' : 'fs-6'}`}
                                                        onClick={() => crawlArticle(item)}
                                                    >
                                                        {item.title}
                                                    </Card.Title>
                                                    <Card.Text className="text-muted small">
                                                        {item.description?.replace(/<[^>]*>?/gm, '').substring(0, idx === 0 ? 250 : 100)}...
                                                    </Card.Text>
                                                    {idx === 0 && (
                                                        <Button variant="outline-danger" size="sm" className="mt-auto w-25" onClick={() => crawlArticle(item)}>Đọc tiếp</Button>
                                                    )}
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        )}
                    </Col>

                    {/* ĐÃ XÓA CỘT BÊN PHẢI (SIDEBAR & BANNER) */}
                </Row>
            </Container>

            {/* 5. MODAL HIỂN THỊ NỘI DUNG CRAWL */}
            <Modal show={!!selectedArticle} onHide={() => setSelectedArticle(null)} size="lg" centered scrollable>
                <Modal.Header closeButton className="border-0 bg-light">
                    <Modal.Title className="text-danger fw-bold fs-5">{selectedArticle?.title}</Modal.Title>
                </Modal.Header>
                <Modal.Body className="article-content-body px-4 py-3">
                    {isCrawling ? (
                        <div className="text-center py-5">
                            <Spinner animation="grow" variant="danger" />
                            <p className="mt-2 text-muted">Đang tải dữ liệu bài viết...</p>
                        </div>
                    ) : (
                        <div dangerouslySetInnerHTML={{ __html: detailContent }} />
                    )}
                </Modal.Body>
                <Modal.Footer className="border-0">
                    <Button variant="secondary" onClick={() => setSelectedArticle(null)}>Đóng</Button>
                    <Button variant="danger" href={selectedArticle?.link} target="_blank">Xem trên Web gốc</Button>
                </Modal.Footer>
            </Modal>

            {/* Footer */}
            <footer className="bg-light text-center py-3 mt-5 border-top small text-muted">
                &copy; 2025 Báo Giáo dục & Thời đại - React App Demo
            </footer>
        </div>
    );
}

export default App;