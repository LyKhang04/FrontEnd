import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Navbar, Nav, Form, FormControl, Button, Card, Modal, Spinner } from 'react-bootstrap';
import { XMLParser } from 'fast-xml-parser';
import axios from 'axios';
import { CATEGORY_TREE } from './data';
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

    // 1. Hàm lấy RSS (Vượt CORS qua AllOrigins)
    const fetchRSS = async (url, name) => {
        setLoading(true);
        setCurrentCatName(name);
        try {
            const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
            const res = await axios.get(proxyUrl);
            const parser = new XMLParser({ ignoreAttributes: false });
            const result = parser.parse(res.data);
            const items = result?.rss?.channel?.item;
            setArticles(Array.isArray(items) ? items : (items ? [items] : []));
        } catch (err) {
            console.error("Lỗi tải RSS:", err);
        } finally {
            setLoading(false);
        }
    };

    // 2. Hàm Crawl dữ liệu chi tiết
    const crawlArticle = async (article) => {
        setSelectedArticle(article);
        setIsCrawling(true);
        try {
            const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(article.link)}`;
            const res = await axios.get(proxyUrl);
            const dom = new DOMParser().parseFromString(res.data, 'text/html');

            // Selector chính xác cho báo GD&T
            const content = dom.querySelector('.detail-content') || dom.querySelector('article') || dom.querySelector('.content');

            if (content) {
                // Fix ảnh bị lỗi đường dẫn tương đối
                content.querySelectorAll('img').forEach(img => {
                    img.className = "img-fluid rounded shadow-sm my-3";
                    if (img.getAttribute('src')?.startsWith('/')) {
                        img.src = `https://giaoducthoidai.vn${img.getAttribute('src')}`;
                    }
                });
                setDetailContent(content.innerHTML);
            } else {
                setDetailContent("<p>Nội dung đang được cập nhật...</p>");
            }
        } catch (err) {
            setDetailContent("<p>Lỗi khi kết nối với máy chủ nguồn.</p>");
        } finally {
            setIsCrawling(false);
        }
    };

    useEffect(() => {
        fetchRSS(CATEGORY_TREE[0].url, CATEGORY_TREE[0].name);
    }, []);

    // 3. Component Menu đệ quy (Recursive Sidebar)
    const RecursiveMenu = ({ items, level = 0 }) => (
        <ul className={`list-unstyled mb-0 ${level > 0 ? 'ms-3 border-start ps-2' : ''}`}>
            {items.map((cat, idx) => (
                <li key={idx} className="mb-1">
                    <div
                        className="category-item p-2 rounded"
                        onClick={() => cat.url && fetchRSS(cat.url, cat.name)}
                    >
                        <i className={`bi ${cat.children ? 'bi-folder2' : 'bi-dot'} me-2`}></i>
                        {cat.name}
                    </div>
                    {cat.children && <RecursiveMenu items={cat.children} level={level + 1} />}
                </li>
            ))}
        </ul>
    );

    return (
        <div className="app-container">
            {/* Header Logo & Search */}
            <header className="bg-white py-3">
                <Container className="d-flex justify-content-between align-items-center">
                    <div className="logo-box">
                        <h1 className="text-danger fw-bold mb-0 fs-2">GIÁO DỤC</h1>
                        <p className="text-dark fw-bold small mb-0">VÀ THỜI ĐẠI</p>
                    </div>
                    <Form className="d-none d-lg-flex w-50 mx-4">
                        <div className="input-group">
                            <FormControl type="search" placeholder="Tìm kiếm..." className="rounded-start-pill border-end-0 bg-light" />
                            <Button variant="light" className="rounded-end-pill border-start-0 bg-light"><i className="bi bi-search"></i></Button>
                        </div>
                    </Form>
                    <Button variant="link" className="text-danger fw-bold text-decoration-none d-none d-md-block">BÁO IN</Button>
                </Container>
            </header>

            {/* Red Navbar */}
            <Navbar bg="danger" variant="dark" expand="lg" className="py-0 sticky-top main-nav shadow-sm">
                <Container>
                    <Navbar.Toggle aria-controls="main-navbar" />
                    <Navbar.Collapse id="main-navbar">
                        <Nav className="w-100 justify-content-between">
                            <Nav.Link onClick={() => fetchRSS(CATEGORY_TREE[0].url, "Trang chủ")}><i className="bi bi-house-door-fill"></i></Nav.Link>
                            {CATEGORY_TREE.slice(1, 10).map((cat, i) => (
                                <Nav.Link key={i} onClick={() => cat.url && fetchRSS(cat.url, cat.name)} className="text-white fw-bold px-3 py-3 text-uppercase tiny-text">
                                    {cat.name}
                                </Nav.Link>
                            ))}
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            <Container className="mt-4">
                <Row>
                    {/* Main Content Area */}
                    <Col lg={9}>
                        <h4 className="text-danger fw-bold mb-4 border-bottom pb-2">{currentCatName}</h4>
                        {loading ? (
                            <div className="text-center py-5"><Spinner animation="border" variant="danger" /></div>
                        ) : (
                            <Row>
                                {articles.map((item, idx) => (
                                    <Col md={idx === 0 ? 12 : 6} key={idx} className="mb-4">
                                        <Card className={`news-card h-100 shadow-sm border-0 ${idx === 0 ? 'featured-card' : ''}`}>
                                            <Card.Body className={idx === 0 ? 'd-md-flex p-0' : 'p-3'}>
                                                {idx === 0 && (
                                                    <div className="featured-img-placeholder bg-secondary-subtle d-flex align-items-center justify-content-center">
                                                        <i className="bi bi-card-image fs-1 text-muted"></i>
                                                    </div>
                                                )}
                                                <div className="p-3">
                                                    <Card.Title className={`fw-bold mb-2 hover-blue ${idx === 0 ? 'fs-3' : 'fs-6'}`} onClick={() => crawlArticle(item)}>
                                                        {item.title}
                                                    </Card.Title>
                                                    <Card.Text className="text-muted small">
                                                        {item.description?.replace(/<[^>]*>?/gm, '').substring(0, 160)}...
                                                    </Card.Text>
                                                    <Button variant="outline-danger" size="sm" onClick={() => crawlArticle(item)}>Chi tiết</Button>
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        )}
                    </Col>

                    {/* Sidebar Area */}
                    <Col lg={3}>
                        <Card className="border-0 shadow-sm mb-4">
                            <Card.Header className="bg-danger text-white fw-bold py-3">CHUYÊN MỤC</Card.Header>
                            <Card.Body className="p-2">
                                <RecursiveMenu items={CATEGORY_TREE} />
                            </Card.Body>
                        </Card>
                        <div className="baoin-banner shadow-sm rounded p-4 text-center text-white fw-bold mb-4">
                            BÁO IN <br/> HÔM NAY CÓ GÌ?
                        </div>
                    </Col>
                </Row>
            </Container>

            {/* Crawl Modal */}
            <Modal show={!!selectedArticle} onHide={() => setSelectedArticle(null)} size="lg" centered scrollable>
                <Modal.Header closeButton className="border-0 bg-light">
                    <Modal.Title className="text-danger fw-bold">{selectedArticle?.title}</Modal.Title>
                </Modal.Header>
                <Modal.Body className="article-body px-4">
                    {isCrawling ? (
                        <div className="text-center py-5"><Spinner animation="grow" variant="danger" /><p className="mt-2 text-muted">Đang crawl dữ liệu...</p></div>
                    ) : (
                        <div dangerouslySetInnerHTML={{ __html: detailContent }} />
                    )}
                </Modal.Body>
            </Modal>
        </div>
    );
}

export default App;