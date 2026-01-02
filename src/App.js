import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Navbar, Nav, Form, FormControl, Button, Card, Modal, Spinner, NavDropdown } from 'react-bootstrap';
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

    const extractImage = (description) => {
        if (!description) return null;
        const imgRegex = /<img[^>]+src="([^">]+)"/g;
        const match = imgRegex.exec(description);
        return match && match[1] ? match[1] : null;
    };

    const cleanDescription = (description) => {
        if (!description) return "";
        return description.replace(/<[^>]*>?/gm, '').substring(0, 160) + "...";
    };

    const fetchRSS = async (url, name) => {
        setLoading(true);
        setCurrentCatName(name);
        try {
            const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
            const res = await axios.get(proxyUrl);
            const parser = new XMLParser({ ignoreAttributes: false });
            const result = parser.parse(res.data);
            let items = result?.rss?.channel?.item;
            items = Array.isArray(items) ? items : (items ? [items] : []);

            const processedItems = items.map(item => ({
                ...item,
                imageUrl: extractImage(item.description),
                cleanDesc: cleanDescription(item.description)
            }));

            setArticles(processedItems);
            window.scrollTo(0, 0);
        } catch (err) {
            console.error("Lỗi tải RSS:", err);
        } finally {
            setLoading(false);
        }
    };

    const crawlArticle = async (article) => {
        setSelectedArticle(article);
        setIsCrawling(true);
        setDetailContent("");
        try {
            const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(article.link)}`;
            const res = await axios.get(proxyUrl);
            const dom = new DOMParser().parseFromString(res.data, 'text/html');
            const content = dom.querySelector('.detail-content') || dom.querySelector('article') || dom.querySelector('.content');

            if (content) {
                content.querySelectorAll('img').forEach(img => {
                    img.className = "img-fluid rounded shadow-sm my-3 d-block mx-auto";
                    const src = img.getAttribute('src');
                    if (src && src.startsWith('/')) img.src = `https://giaoducthoidai.vn${src}`;
                });
                content.querySelectorAll(".box-related, .ads, .banner, script").forEach(el => el.remove());
                setDetailContent(content.innerHTML);
            } else {
                setDetailContent("<p class='text-center py-3'>Không thể bóc tách nội dung. <a href='"+article.link+"' target='_blank'>Xem bài gốc</a></p>");
            }
        } catch (err) {
            setDetailContent("<p class='text-danger text-center'>Lỗi tải nội dung.</p>");
        } finally {
            setIsCrawling(false);
        }
    };

    useEffect(() => {
        if (CATEGORY_TREE.length > 0) fetchRSS(CATEGORY_TREE[0].url, CATEGORY_TREE[0].name);
    }, []);

    // Helper component hiển thị khối danh mục nhỏ (vd: Giáo dục, Thời sự...)
    const CategoryBlock = ({ category }) => (
        <div className="category-block mt-5">
            <div className="d-flex justify-content-between align-items-center border-bottom border-danger border-2 mb-3">
                <h4 className="bg-danger text-white px-3 py-1 mb-0 text-uppercase fw-bold" style={{ fontSize: '1rem' }}>
                    {category.name}
                </h4>
                <Nav.Link onClick={() => fetchRSS(category.url, category.name)} className="text-danger small fw-bold">
                    XEM THÊM <i className="bi bi-chevron-double-right"></i>
                </Nav.Link>
            </div>
            {/* Logic này yêu cầu fetch RSS riêng cho từng block nếu muốn chính xác,
                để đơn giản ta sẽ lấy dữ liệu từ mảng articles hiện tại nếu trùng tên */}
            <Row>
                <Col md={12}>
                    <p className="text-muted small">Dữ liệu cho phần này sẽ tự động cập nhật khi bạn chọn danh mục tương ứng trên Menu.</p>
                </Col>
            </Row>
        </div>
    );

    return (
        <div className="app-container">
            {/* 1. Top Bar */}
            <div className="top-info-bar bg-light border-bottom py-1">
                <Container className="d-flex justify-content-start align-items-center small text-secondary">
                    <span className="me-3"><i className="bi bi-clock me-1"></i> {new Date().toLocaleDateString('vi-VN')}</span>
                    <span className="me-3 border-start ps-3">Hotline: <strong className="text-danger">096.733.5089</strong></span>
                    <span className="border-start ps-3">Email: <span className="text-primary">gdtddientu@gmail.com</span></span>
                </Container>
            </div>

            {/* 2. Header */}
            <header className="bg-white py-3">
                <Container className="d-flex justify-content-between align-items-end flex-wrap">
                    <div className="logo-box cursor-pointer mb-2" onClick={() => fetchRSS(CATEGORY_TREE[0].url, "Trang chủ")}>
                        <h1 className="logo-main text-danger fw-bold mb-0 lh-1">GIÁO DỤC</h1>
                        <div className="d-flex align-items-center">
                            <span className="logo-sub text-warning fw-bold fs-4 me-1">VÀ</span>
                            <span className="logo-sub text-danger fw-bold fs-2">THỜI ĐẠI</span>
                        </div>
                    </div>
                    <div className="d-flex align-items-center w-50 justify-content-end mb-2">
                        <Form className="w-75 me-3 position-relative d-none d-md-block">
                            <FormControl type="search" placeholder="Tìm kiếm..." className="rounded-pill bg-light border-0 ps-3 pe-5 py-2" />
                            <Button variant="link" className="position-absolute top-50 end-0 translate-middle-y text-dark pe-3"><i className="bi bi-search"></i></Button>
                        </Form>
                        <div className="sub-logo-box text-end lh-1 ps-3 border-start">
                            <div className="text-danger fw-bold fs-5">GIÁO DỤC</div>
                            <div className="text-dark fw-bold small">THỦ ĐÔ</div>
                        </div>
                    </div>
                </Container>
            </header>

            {/* 3. Navigation Bar */}
            <Navbar bg="danger" variant="dark" expand="lg" className="py-0 sticky-top main-nav shadow-sm">
                <Container>
                    <Navbar.Toggle aria-controls="main-navbar" />
                    <Navbar.Collapse id="main-navbar">
                        <Nav className="w-100 justify-content-between align-items-center">
                            <Nav.Link onClick={() => fetchRSS(CATEGORY_TREE[0].url, "Trang chủ")} className="py-2 px-3 bg-danger-dark">
                                <i className="bi bi-house-door-fill fs-5"></i>
                            </Nav.Link>
                            {CATEGORY_TREE.slice(1, 14).map((item, i) => (
                                item.children ? (
                                    <NavDropdown key={i} title={item.name} id={`nav-${i}`} className="custom-dropdown text-white fw-bold text-uppercase">
                                        <NavDropdown.Item onClick={() => fetchRSS(item.url, item.name)} className="fw-bold text-danger">Tất cả {item.name}</NavDropdown.Item>
                                        <NavDropdown.Divider />
                                        {item.children.map((child, idx) => (
                                            <NavDropdown.Item key={idx} onClick={() => fetchRSS(child.url, child.name)}>{child.name}</NavDropdown.Item>
                                        ))}
                                    </NavDropdown>
                                ) : (
                                    <Nav.Link key={i} className="text-white fw-bold px-2 py-3 nav-link-custom" onClick={() => fetchRSS(item.url, item.name)}>{item.name}</Nav.Link>
                                )
                            ))}
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            {/* 4. Main Content */}
            <Container className="mt-4">
                <Row>
                    <Col lg={12}>
                        <div className="section-title mb-4 border-bottom pb-2 border-danger border-2">
                            <span className="badge bg-danger me-2">LIVE</span>
                            <h5 className="fw-bold d-inline-block text-danger text-uppercase mb-0">{currentCatName}</h5>
                        </div>

                        {loading ? <div className="text-center py-5"><Spinner animation="border" variant="danger" /></div> : (
                            <>
                                <Row>
                                    {articles.slice(0, 7).map((item, idx) => (
                                        <Col md={idx === 0 ? 12 : 4} key={idx} className="mb-4">
                                            <Card className={`news-card h-100 border-0 shadow-sm ${idx === 0 ? 'featured-card' : ''}`}>
                                                <Card.Body className={idx === 0 ? 'd-md-flex p-0' : 'p-3'}>
                                                    {idx === 0 && (
                                                        <div className="featured-img-box col-md-7 bg-light overflow-hidden">
                                                            {item.imageUrl ? <img src={item.imageUrl} className="w-100 h-100 object-fit-cover" alt="" /> : <div className="p-5 text-center"><i className="bi bi-card-image fs-1 text-muted"></i></div>}
                                                        </div>
                                                    )}
                                                    <div className={`d-flex flex-column ${idx === 0 ? 'p-4 col-md-5' : ''}`}>
                                                        <Card.Title className={`fw-bold mb-2 hover-blue ${idx === 0 ? 'fs-3' : 'fs-6'}`} onClick={() => crawlArticle(item)}>{item.title}</Card.Title>
                                                        <Card.Text className="text-muted small">{item.cleanDesc}</Card.Text>
                                                        {idx === 0 && <Button variant="outline-danger" size="sm" className="mt-auto w-25" onClick={() => crawlArticle(item)}>Đọc tiếp</Button>}
                                                    </div>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    ))}
                                </Row>

                                {/* Bổ sung các khối chuyên mục nhỏ (Category Blocks) khi ở Trang chủ */}
                                {currentCatName === "Trang chủ" && (
                                    <>
                                        <CategoryBlock category={CATEGORY_TREE[1]} /> {/* Giáo dục */}
                                        <CategoryBlock category={CATEGORY_TREE[2]} /> {/* Thời sự */}
                                        <CategoryBlock category={CATEGORY_TREE[3]} /> {/* Pháp luật */}
                                    </>
                                )}
                            </>
                        )}
                    </Col>
                </Row>
            </Container>

            {/* 5. Footer (Đã bổ sung đầy đủ) */}
            <footer className="footer mt-5 pt-5 pb-4 text-white" style={{ backgroundColor: '#c92127' }}>
                <Container>
                    <Row>
                        <Col md={4} className="mb-4 text-center text-md-start">
                            <div className="footer-logo bg-white p-2 d-inline-block rounded mb-3">
                                <h2 className="text-danger fw-bold mb-0" style={{ fontSize: '1.5rem' }}>GIÁO DỤC <span className="text-dark d-block" style={{ fontSize: '0.8rem' }}>VÀ THỜI ĐẠI</span></h2>
                            </div>
                            <p className="small lh-base">Cơ quan của Bộ Giáo dục và Đào tạo - Diễn đàn toàn xã hội vì sự nghiệp giáo dục.</p>
                        </Col>
                        <Col md={4} className="mb-4">
                            <h5 className="fw-bold text-uppercase border-bottom border-white pb-2 mb-3" style={{ fontSize: '0.9rem' }}>Trụ sở chính</h5>
                            <ul className="list-unstyled small lh-lg">
                                <li><i className="bi bi-geo-alt-fill me-2"></i> 15 Hai Bà Trưng, Hoàn Kiếm, Hà Nội</li>
                                <li><i className="bi bi-telephone-fill me-2"></i> 024.3936.9800</li>
                                <li><i className="bi bi-envelope-fill me-2"></i> gdtddientu@gmail.com</li>
                            </ul>
                        </Col>
                        <Col md={4} className="mb-4">
                            <h5 className="fw-bold text-uppercase border-bottom border-white pb-2 mb-3" style={{ fontSize: '0.9rem' }}>Liên hệ quảng cáo</h5>
                            <p className="small mb-1">Phòng Truyền thông và Dự án</p>
                            <p className="fw-bold"><i className="bi bi-phone-fill me-2"></i> 0886.059.988</p>
                        </Col>
                    </Row>
                    <div className="border-top border-light pt-3 mt-3 text-center small">
                        <p className="mb-0">© 2025 Báo Giáo dục & Thời đại. Tất cả các quyền được bảo lưu.</p>
                    </div>
                </Container>
            </footer>

            {/* Modal hiển thị tin */}
            <Modal show={!!selectedArticle} onHide={() => setSelectedArticle(null)} size="lg" centered scrollable>
                <Modal.Header closeButton className="border-0 bg-light">
                    <Modal.Title className="text-danger fw-bold fs-5">{selectedArticle?.title}</Modal.Title>
                </Modal.Header>
                <Modal.Body className="article-content-body px-4 py-3">
                    {isCrawling ? <div className="text-center py-5"><Spinner animation="grow" variant="danger" /></div> : <div dangerouslySetInnerHTML={{ __html: detailContent }} />}
                </Modal.Body>
            </Modal>
        </div>
    );
}

export default App;