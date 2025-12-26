import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Navbar, Nav, Form, FormControl, Button, Card, Modal, Spinner } from 'react-bootstrap';
import { XMLParser } from 'fast-xml-parser';
import axios from 'axios';
import { CATEGORY_TREE } from './data'; // Sử dụng file data.js đã tạo trước đó
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

    // --- HÀM LẤY TIN TỪ RSS (XML) ---
    const fetchRSS = async (url, name) => {
        setLoading(true);
        setCurrentCatName(name);
        try {
            // Vượt CORS bằng Proxy AllOrigins
            const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
            const res = await axios.get(proxyUrl);

            const parser = new XMLParser({ ignoreAttributes: false });
            const result = parser.parse(res.data);
            const items = result?.rss?.channel?.item;

            // Đảm bảo luôn là mảng
            setArticles(Array.isArray(items) ? items : (items ? [items] : []));
        } catch (err) {
            console.error("Lỗi RSS:", err);
        } finally {
            setLoading(false);
        }
    };

    // --- HÀM CRAWL CHI TIẾT TỪ LINK ---
    const crawlArticle = async (article) => {
        setSelectedArticle(article);
        setIsCrawling(true);
        try {
            const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(article.link)}`;
            const res = await axios.get(proxyUrl);

            const dom = new DOMParser().parseFromString(res.data, 'text/html');
            // Selector cho báo GD&T
            const content = dom.querySelector('.detail-content') || dom.querySelector('article');

            if (content) {
                // Xử lý ảnh lỗi link tương đối
                content.querySelectorAll('img').forEach(img => {
                    img.className = "img-fluid rounded my-3";
                    if (img.getAttribute('src')?.startsWith('/')) {
                        img.src = `https://giaoducthoidai.vn${img.getAttribute('src')}`;
                    }
                });
                setDetailContent(content.innerHTML);
            } else {
                setDetailContent("Không thể tự động lấy nội dung. Mời bạn xem tại link gốc.");
            }
        } catch (err) {
            setDetailContent("Lỗi khi tải nội dung bài viết.");
        } finally {
            setIsCrawling(false);
        }
    };

    useEffect(() => {
        fetchRSS(CATEGORY_TREE[0].url, CATEGORY_TREE[0].name);
    }, []);

    // --- COMPONENT MENU ĐỆ QUY ---
    const RecursiveMenu = ({ items }) => (
        <Nav className="flex-column">
            {items.map((cat, idx) => (
                <div key={idx} className="mb-1">
                    <Nav.Link
                        className="category-item py-1 px-2 d-flex align-items-center"
                        onClick={() => cat.url && fetchRSS(cat.url, cat.name)}
                    >
                        {cat.children ? <i className="bi bi-folder2-open me-2"></i> : <i className="bi bi-file-earmark-text me-2"></i>}
                        {cat.name}
                    </Nav.Link>
                    {cat.children && (
                        <div className="ms-3 border-start ps-2">
                            <RecursiveMenu items={cat.children} />
                        </div>
                    )}
                </div>
            ))}
        </Nav>
    );

    return (
        <div className="app-container">
            {/* HEADER LOGO */}
            <header className="bg-white py-3 border-bottom shadow-sm">
                <Container className="d-flex justify-content-between align-items-center">
                    <div className="text-danger fw-bold fs-3 lh-1">
                        GIÁO DỤC <span className="text-dark d-block fs-6 fw-normal">VÀ THỜI ĐẠI</span>
                    </div>
                    <Form className="d-none d-md-flex w-50">
                        <FormControl type="search" placeholder="Tìm kiếm tin tức..." className="rounded-pill bg-light border-0 px-4" />
                    </Form>
                    <Button variant="outline-danger" className="rounded-pill fw-bold btn-sm px-4">BÁO IN</Button>
                </Container>
            </header>

            {/* NAVBAR CHÍNH (MÀU ĐỎ) */}
            <Navbar bg="danger" variant="dark" expand="lg" className="py-0 sticky-top shadow">
                <Container>
                    <Navbar.Toggle aria-controls="main-nav" />
                    <Navbar.Collapse id="main-nav">
                        <Nav className="w-100 justify-content-between">
                            <Nav.Link href="#" onClick={() => fetchRSS(CATEGORY_TREE[0].url, "Trang chủ")}>
                                <i className="bi bi-house-door-fill"></i>
                            </Nav.Link>
                            {CATEGORY_TREE.slice(1, 10).map((cat, i) => (
                                <Nav.Link key={i} onClick={() => cat.url && fetchRSS(cat.url, cat.name)} className="text-white fw-bold px-3 py-3 text-uppercase small">
                                    {cat.name}
                                </Nav.Link>
                            ))}
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            <Container className="mt-4">
                <Row>
                    {/* CỘT TRÁI: DANH MỤC ĐỆ QUY */}
                    <Col lg={3} className="d-none d-lg-block">
                        <Card className="border-0 shadow-sm sticky-sidebar">
                            <Card.Header className="bg-white fw-bold border-0 pt-3">CHUYÊN MỤC</Card.Header>
                            <Card.Body className="pt-0">
                                <RecursiveMenu items={CATEGORY_TREE} />
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* CỘT GIỮA: DANH SÁCH TIN */}
                    <Col lg={9}>
                        <h5 className="text-danger fw-bold mb-3 border-bottom pb-2">
                            <i className="bi bi-collection-play-fill me-2"></i> {currentCatName}
                        </h5>

                        {loading ? (
                            <div className="text-center py-5"><Spinner animation="border" variant="danger" /></div>
                        ) : (
                            <Row>
                                {articles.map((item, idx) => (
                                    <Col md={idx === 0 ? 12 : 6} key={idx} className="mb-4">
                                        <Card className="news-card border-0 h-100 shadow-sm overflow-hidden">
                                            <Card.Body className={idx === 0 ? "d-md-flex p-0" : "p-3"}>
                                                {idx === 0 && <div className="bg-light d-flex align-items-center justify-content-center" style={{minWidth:'40%', minHeight:'200px'}}><i className="bi bi-image fs-1 text-muted"></i></div>}
                                                <div className="p-3">
                                                    <Card.Title
                                                        className={`fw-bold hover-blue ${idx === 0 ? 'fs-4' : 'fs-6'}`}
                                                        style={{cursor:'pointer'}}
                                                        onClick={() => crawlArticle(item)}
                                                    >
                                                        {item.title}
                                                    </Card.Title>
                                                    <Card.Text className="text-muted small">
                                                        {item.description?.replace(/<[^>]*>?/gm, '').substring(0, 150)}...
                                                    </Card.Text>
                                                    <Button size="sm" variant="danger" className="rounded-pill px-3" onClick={() => crawlArticle(item)}>Đọc tiếp</Button>
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

            {/* MODAL CHI TIẾT (CRAWL DỮ LIỆU) */}
            <Modal show={!!selectedArticle} onHide={() => setSelectedArticle(null)} size="lg" centered scrollable>
                <Modal.Header closeButton className="border-0">
                    <Modal.Title className="text-danger fw-bold">{selectedArticle?.title}</Modal.Title>
                </Modal.Header>
                <Modal.Body className="article-body">
                    {isCrawling ? (
                        <div className="text-center py-5">
                            <Spinner animation="grow" variant="danger" />
                            <p className="mt-3 text-muted">Đang bóc tách dữ liệu từ giaoducthoidai.vn...</p>
                        </div>
                    ) : (
                        <div dangerouslySetInnerHTML={{ __html: detailContent }} />
                    )}
                </Modal.Body>
                <Modal.Footer className="border-0">
                    <Button variant="link" href={selectedArticle?.link} target="_blank" className="text-decoration-none text-muted">Xem bài gốc</Button>
                    <Button variant="danger" onClick={() => setSelectedArticle(null)}>Đóng</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default App;