import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Navbar, Nav, Form, FormControl, Button, Card, Modal, Spinner, NavDropdown } from 'react-bootstrap';
import { XMLParser } from 'fast-xml-parser';
import axios from 'axios';
import { CATEGORY_TREE } from './data';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';

// --- DANH SÁCH 12 KHỐI DANH MỤC HIỂN THỊ Ở TRANG CHỦ ---
// Lưu ý: Các link này đã được chọn lọc để tránh trùng ID với các mục con trong Menu
const HOME_BLOCKS = [
    { name: "Giáo dục", url: "https://giaoducthoidai.vn/rss/giao-duc-2.rss" },
    { name: "Thời sự", url: "https://giaoducthoidai.vn/rss/thoi-su-1.rss" },
    { name: "Giáo dục pháp luật", url: "https://giaoducthoidai.vn/rss/phap-luat-5.rss" },
    { name: "Kết nối", url: "https://giaoducthoidai.vn/rss/dong-hanh-37.rss" }, // ID 37 (Tránh trùng ID 20 của Y học)
    { name: "Trao đổi", url: "https://giaoducthoidai.vn/rss/goc-nhin-7.rss" }, // ID 7 (Tránh trùng ID 4 của Xã hội)
    { name: "Học đường", url: "https://giaoducthoidai.vn/rss/hoc-duong-14.rss" },
    { name: "Nhân ái", url: "https://giaoducthoidai.vn/rss/nhan-ai-23.rss" },
    { name: "Thế giới", url: "https://giaoducthoidai.vn/rss/the-gioi-10.rss" },
    { name: "Sức khoẻ", url: "https://giaoducthoidai.vn/rss/suc-khoe-19.rss" }, // ID 19
    { name: "Media", url: "https://giaoducthoidai.vn/rss/video-media-11.rss" },
    { name: "Văn hóa", url: "https://giaoducthoidai.vn/rss/van-hoa-8.rss" },
    { name: "Thể thao", url: "https://giaoducthoidai.vn/rss/the-thao-12.rss" } // ID 12
];

function App() {
    const [articles, setArticles] = useState([]);
    const [homeBlockArticles, setHomeBlockArticles] = useState({});
    const [loading, setLoading] = useState(false);
    const [selectedArticle, setSelectedArticle] = useState(null);
    const [detailContent, setDetailContent] = useState("");
    const [isCrawling, setIsCrawling] = useState(false);
    const [currentCatName, setCurrentCatName] = useState("Trang chủ");

    // --- HÀM TIỆN ÍCH ---
    const extractImage = (description) => {
        if (!description) return null;
        const imgRegex = /<img[^>]+src="([^">]+)"/g;
        const match = imgRegex.exec(description);
        return match && match[1] ? match[1] : null;
    };

    const cleanDescription = (description) => {
        if (!description) return "";
        return description.replace(/<[^>]*>?/gm, '').substring(0, 150) + "...";
    };

    // --- LOGIC LẤY RSS CÓ FIX CACHE & LỖI TRANG TRẮNG ---
    const getRSSData = async (url) => {
        try {
            // Thêm timestamp để ép server trả dữ liệu mới nhất
            const uniqueUrl = `${url}?t=${new Date().getTime()}`;
            const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(uniqueUrl)}`;

            const res = await axios.get(proxyUrl);
            const parser = new XMLParser({ ignoreAttributes: false });
            const result = parser.parse(res.data);
            let items = result?.rss?.channel?.item;
            items = Array.isArray(items) ? items : (items ? [items] : []);

            return items.map(item => ({
                ...item,
                imageUrl: extractImage(item.description),
                cleanDesc: cleanDescription(item.description)
            }));
        } catch (err) {
            console.error("Lỗi lấy RSS:", url, err);
            return [];
        }
    };

    // --- XỬ LÝ SỰ KIỆN CLICK MENU ---
    const fetchRSS = async (url, name) => {
        setLoading(true);
        setCurrentCatName(name);
        setArticles([]); // Xóa bài cũ ngay lập tức

        // Thêm độ trễ nhỏ 300ms để hiệu ứng loading hiển thị rõ ràng
        setTimeout(async () => {
            const data = await getRSSData(url);
            setArticles(data);
            setLoading(false);
            window.scrollTo(0, 0);
        }, 300);
    };

    // --- XỬ LÝ XEM CHI TIẾT BÀI VIẾT ---
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
                setDetailContent("<p class='text-center py-3'>Không thể bóc tách nội dung tự động. <a href='"+article.link+"' target='_blank'>Xem bài gốc</a></p>");
            }
        } catch (err) {
            setDetailContent("<p class='text-danger text-center'>Lỗi kết nối khi tải nội dung.</p>");
        } finally {
            setIsCrawling(false);
        }
    };

    // --- EFFECT KHỞI TẠO (CHẠY 1 LẦN) ---
    useEffect(() => {
        // 1. Tải trang chủ
        if (CATEGORY_TREE.length > 0) {
            fetchRSS(CATEGORY_TREE[0].url, "Trang chủ");
        }

        // 2. Tải ngầm dữ liệu cho 12 khối danh mục trang chủ
        const fetchHomeBlocks = async () => {
            const blockData = {};
            await Promise.all(HOME_BLOCKS.map(async (block) => {
                const items = await getRSSData(block.url);
                blockData[block.name] = items.slice(0, 5); // Lấy 5 tin mới nhất
            }));
            setHomeBlockArticles(blockData);
        };
        fetchHomeBlocks();
    }, []);

    // --- COMPONENT KHỐI TIN TỨC ---
    const NewsSection = ({ title, data, onTitleClick }) => {
        if (!data || data.length === 0) return null;

        return (
            <div className="news-section-block mb-5">
                <div className="d-flex justify-content-between align-items-center border-bottom border-danger border-2 mb-3">
                    <h4 className="section-header-title text-danger fw-bold mb-0 text-uppercase py-1 cursor-pointer" onClick={onTitleClick}>
                        {title}
                    </h4>
                    <Nav.Link className="text-muted small p-0" onClick={onTitleClick}>Xem thêm <i className="bi bi-chevron-double-right"></i></Nav.Link>
                </div>
                <Row>
                    <Col md={7}>
                        {data[0] && (
                            <Card className="border-0 shadow-sm h-100 main-block-card cursor-pointer" onClick={() => crawlArticle(data[0])}>
                                <div className="ratio ratio-16x9 bg-light overflow-hidden rounded">
                                    {data[0].imageUrl ? <img src={data[0].imageUrl} className="object-fit-cover" alt="" /> : <div className="d-flex align-items-center justify-content-center h-100"><i className="bi bi-image fs-1 text-muted"></i></div>}
                                </div>
                                <Card.Body className="px-0 pt-2">
                                    <Card.Title className="fw-bold fs-5 hover-blue">{data[0].title}</Card.Title>
                                    <Card.Text className="text-muted small">{data[0].cleanDesc}</Card.Text>
                                </Card.Body>
                            </Card>
                        )}
                    </Col>
                    <Col md={5}>
                        <div className="sub-news-list">
                            {data.slice(1, 5).map((item, idx) => (
                                <div key={idx} className="d-flex mb-3 pb-3 border-bottom align-items-start cursor-pointer" onClick={() => crawlArticle(item)}>
                                    <div className="flex-shrink-0 ratio ratio-1x1 bg-light rounded overflow-hidden me-3" style={{ width: '90px' }}>
                                        {item.imageUrl ? <img src={item.imageUrl} className="object-fit-cover" alt="" /> : <i className="bi bi-image m-auto text-muted"></i>}
                                    </div>
                                    <div className="flex-grow-1">
                                        <h6 className="fw-bold mb-1 small hover-blue line-clamp-2">{item.title}</h6>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Col>
                </Row>
            </div>
        );
    };

    // --- GIAO DIỆN CHÍNH ---
    return (
        <div className="app-container">
            {/* Top Bar */}
            <div className="top-info-bar bg-light border-bottom py-1">
                <Container className="d-flex justify-content-start align-items-center small text-secondary">
                    <span className="me-3"><i className="bi bi-clock me-1"></i> {new Date().toLocaleDateString('vi-VN')}</span>
                    <span className="me-3 border-start ps-3">Hotline: <strong className="text-danger">091.880.3833</strong></span>
                    <span className="border-start ps-3">Email: gdtddientu@gmail.com</span>
                </Container>
            </div>

            {/* Header */}
            <header className="bg-white py-3">
                <Container className="d-flex justify-content-between align-items-center flex-wrap">
                    <div className="logo-box cursor-pointer" onClick={() => fetchRSS(CATEGORY_TREE[0].url, "Trang chủ")}>
                        <h1 className="logo-main text-danger fw-bold mb-0 lh-1">GIÁO DỤC</h1>
                        <div className="d-flex align-items-center">
                            <span className="logo-sub text-warning fw-bold fs-4 me-1">VÀ</span>
                            <span className="logo-sub text-danger fw-bold fs-2">THỜI ĐẠI</span>
                        </div>
                    </div>
                    <div className="d-flex align-items-center header-right">
                        <Form className="d-none d-md-flex me-3">
                            <FormControl type="search" placeholder="Tìm kiếm..." className="rounded-pill bg-light border-0 px-4 py-2" />
                        </Form>
                        <div className="sub-logo-box text-end lh-1 border-start ps-3">
                            <div className="text-danger fw-bold fs-5">GIÁO DỤC</div>
                            <div className="text-dark fw-bold small">VIỆT NAM</div>
                        </div>
                    </div>
                </Container>
            </header>

            {/* Navbar */}
            <Navbar bg="danger" variant="dark" expand="lg" className="py-0 sticky-top main-nav shadow-sm">
                <Container>
                    <Navbar.Toggle aria-controls="main-navbar" />
                    <Navbar.Collapse id="main-navbar">
                        <Nav className="w-100 justify-content-between">
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

            {/* Main Content */}
            <Container className="mt-4">
                <div className="banner-top mb-4 rounded overflow-hidden shadow-sm">
                    <img src="https://giaoducthoidai.vn/images/banner_default.jpg" className="w-100" alt="Quảng cáo" onError={(e) => e.target.style.display='none'} />
                </div>

                <Row>
                    <Col lg={9}>
                        {loading ? (
                            <div className="text-center py-5"><Spinner animation="border" variant="danger" /></div>
                        ) : (
                            <>
                                {/* TOÀN CẢNH - SỰ KIỆN (Chỉ ở trang chủ) */}
                                {currentCatName === "Trang chủ" && articles.length > 0 && (
                                    <div className="mb-5">
                                        <div className="toan-canh-title mb-4 d-flex align-items-center">
                                            <h4 className="fw-bold text-danger m-0" style={{ borderBottom: '3px solid #dc3545', paddingBottom: '5px' }}>
                                                Toàn cảnh - Sự kiện
                                            </h4>
                                            <span className="flex-grow-1 ms-3 border-bottom"></span>
                                        </div>
                                        <Row>
                                            <Col md={7}>
                                                <Card className="border-0 shadow-sm h-100 cursor-pointer" onClick={() => crawlArticle(articles[0])}>
                                                    <div className="ratio ratio-4x3 bg-light overflow-hidden rounded">
                                                        {articles[0].imageUrl ? <img src={articles[0].imageUrl} className="object-fit-cover" alt="" /> : <div className="d-flex align-items-center justify-content-center h-100"><i className="bi bi-card-image fs-1 text-muted"></i></div>}
                                                    </div>
                                                    <Card.Body className="px-0">
                                                        <Card.Title className="fw-bold fs-3 hover-blue mt-2">{articles[0].title}</Card.Title>
                                                        <Card.Text className="text-muted small">{articles[0].cleanDesc}</Card.Text>
                                                    </Card.Body>
                                                </Card>
                                            </Col>
                                            <Col md={5}>
                                                {articles.slice(1, 6).map((item, idx) => (
                                                    <div key={idx} className="d-flex mb-3 pb-3 border-bottom align-items-start cursor-pointer" onClick={() => crawlArticle(item)}>
                                                        <div className="flex-shrink-0 ratio ratio-16x9 bg-light rounded overflow-hidden me-2" style={{ width: '120px' }}>
                                                            {item.imageUrl ? <img src={item.imageUrl} className="object-fit-cover" alt="" /> : <i className="bi bi-image m-auto text-muted"></i>}
                                                        </div>
                                                        <h6 className="fw-bold small hover-blue mb-0 line-clamp-3">{item.title}</h6>
                                                    </div>
                                                ))}
                                            </Col>
                                        </Row>
                                    </div>
                                )}

                                {/* LIST TIN (Khi không ở trang chủ) */}
                                {currentCatName !== "Trang chủ" && (
                                    <>
                                        <div className="section-title mb-4 border-bottom pb-2 border-danger border-2">
                                            <h5 className="fw-bold text-danger text-uppercase mb-0">{currentCatName}</h5>
                                        </div>

                                        {articles.length === 0 ? (
                                            <div className="text-center py-5 text-muted bg-light rounded">
                                                <i className="bi bi-inbox fs-1 d-block mb-3 opacity-50"></i>
                                                <p>Chưa có tin bài trong chuyên mục này hoặc kết nối bị gián đoạn.</p>
                                                <Button variant="outline-danger" size="sm" onClick={() => fetchRSS(CATEGORY_TREE.find(c => c.name === currentCatName)?.url || "", currentCatName)}>
                                                    Thử tải lại
                                                </Button>
                                            </div>
                                        ) : (
                                            <Row>
                                                {articles.map((item, idx) => (
                                                    <Col md={idx === 0 ? 12 : 6} key={idx} className="mb-4">
                                                        <Card className={`news-card h-100 border-0 shadow-sm ${idx === 0 ? 'featured-card' : ''}`}>
                                                            <Card.Body className={idx === 0 ? 'd-md-flex p-0' : 'p-3'}>
                                                                {idx === 0 && (
                                                                    <div className="featured-img-box col-md-6 bg-light overflow-hidden">
                                                                        {item.imageUrl && <img src={item.imageUrl} className="w-100 h-100 object-fit-cover" alt="" />}
                                                                    </div>
                                                                )}
                                                                <div className={`d-flex flex-column ${idx === 0 ? 'p-4 col-md-6' : ''}`}>
                                                                    <Card.Title className={`fw-bold hover-blue ${idx === 0 ? 'fs-3' : 'fs-6'}`} onClick={() => crawlArticle(item)}>
                                                                        {item.title}
                                                                    </Card.Title>
                                                                    <Card.Text className="text-muted small">{item.cleanDesc}</Card.Text>
                                                                </div>
                                                            </Card.Body>
                                                        </Card>
                                                    </Col>
                                                ))}
                                            </Row>
                                        )}
                                    </>
                                )}

                                {/* KHỐI DANH MỤC (Chỉ ở trang chủ) */}
                                {currentCatName === "Trang chủ" && HOME_BLOCKS.map((block, idx) => (
                                    <NewsSection
                                        key={idx}
                                        title={block.name}
                                        data={homeBlockArticles[block.name] || []}
                                        onTitleClick={() => fetchRSS(block.url, block.name)}
                                    />
                                ))}
                            </>
                        )}
                    </Col>

                    {/* Sidebar */}
                    <Col lg={3}>
                        <div className="sidebar-box mb-4">
                            <div className="sidebar-header bg-danger text-white p-2 fw-bold text-uppercase mb-0">
                                <i className="bi bi-star-fill me-2 text-warning"></i> Mới cập nhật
                            </div>
                            <div className="sidebar-content border border-top-0 p-2 bg-white" style={{maxHeight: '500px', overflowY: 'auto'}}>
                                {articles.slice(6, 15).map((item, idx) => (
                                    <div key={idx} className="mb-2 pb-2 border-bottom cursor-pointer" onClick={() => crawlArticle(item)}>
                                        <h6 className="fw-bold small hover-blue mb-1">{item.title}</h6>
                                        <span className="text-muted" style={{ fontSize: '0.7rem' }}>Vừa xong</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="sidebar-box mb-4">
                            <div className="sidebar-header p-2 fw-bold text-uppercase mb-0 border-start border-5 border-danger text-danger bg-light">
                                SUY NGẪM
                            </div>
                            <div className="sidebar-content p-3 bg-light">
                                <h6 className="fw-bold mb-2">Sắp nhập trường cao đẳng sư phạm: Tất yếu của đổi mới</h6>
                                <p className="small text-muted mb-0">GD&TĐ - Việc sáp nhập các trường cao đẳng sư phạm là xu thế tất yếu nhằm nâng cao chất lượng...</p>
                            </div>
                        </div>

                        <div className="baoin-banner text-center text-white p-4 rounded shadow-sm d-flex flex-column align-items-center justify-content-center cursor-pointer mb-4">
                            <i className="bi bi-newspaper fs-1 mb-2"></i>
                            <h5 className="fw-bold mb-0">ĐỌC BÁO IN</h5>
                            <h5 className="fw-bold">ONLINE</h5>
                        </div>
                    </Col>
                </Row>
            </Container>

            {/* Footer */}
            <footer className="footer-site mt-5 pt-5 pb-3 text-white" style={{ backgroundColor: '#c92127' }}>
                <Container>
                    <Row className="mb-4">
                        <Col md={5} className="mb-4">
                            <div className="footer-logo-box bg-white p-2 d-inline-block rounded mb-3">
                                <h3 className="text-danger fw-bold mb-0 lh-1">GIÁO DỤC <span className="text-dark d-block" style={{ fontSize: '0.7rem' }}>VÀ THỜI ĐẠI</span></h3>
                            </div>
                            <p className="small mb-2 fw-bold text-uppercase">Cơ quan của bộ giáo dục và đào tạo</p>
                            <p className="small opacity-75">Giấy phép số 479/GP-BTTTT cấp ngày 29/10/2020.</p>
                            <p className="small opacity-75">Tổng biên tập: <strong>Lý Thái Minh Khang</strong></p>
                        </Col>
                        <Col md={4} className="mb-4">
                            <h6 className="fw-bold text-uppercase border-bottom border-white border-opacity-25 pb-2 mb-3">Thông tin liên hệ</h6>
                            <ul className="list-unstyled small opacity-75 lh-lg">
                                <li><i className="bi bi-geo-alt-fill me-2"></i> Khu phố 6, Thủ Đức, Thành phố Hồ Chí Minh, Việt Nam</li>
                                <li><i className="bi bi-telephone-fill me-2"></i> 091.880.3833</li>
                                <li><i className="bi bi-envelope-fill me-2"></i> gdtddientu@gmail.com</li>
                            </ul>
                        </Col>
                        <Col md={3} className="mb-4 text-center text-md-start">
                            <h6 className="fw-bold text-uppercase border-bottom border-white border-opacity-25 pb-2 mb-3">Mạng xã hội</h6>
                            <div className="d-flex justify-content-center justify-content-md-start gap-3 fs-4">
                                <i className="bi bi-facebook cursor-pointer"></i>
                                <i className="bi bi-youtube cursor-pointer"></i>
                                <i className="bi bi-tiktok cursor-pointer"></i>
                            </div>
                        </Col>
                    </Row>
                    <div className="footer-bottom border-top border-white border-opacity-25 pt-3 text-center small opacity-50">
                        <p>© 2025 Báo Giáo dục và Thời đại. All rights reserved.</p>
                    </div>
                </Container>
            </footer>

            {/* Modal */}
            <Modal show={!!selectedArticle} onHide={() => setSelectedArticle(null)} size="lg" centered scrollable>
                <Modal.Header closeButton className="border-0 bg-light">
                    <Modal.Title className="text-danger fw-bold fs-5">{selectedArticle?.title}</Modal.Title>
                </Modal.Header>
                <Modal.Body className="article-content-body px-4 py-3">
                    {isCrawling ? (
                        <div className="text-center py-5">
                            <Spinner animation="grow" variant="danger" />
                            <p className="mt-2 text-muted">Đang tải nội dung...</p>
                        </div>
                    ) : (
                        <div dangerouslySetInnerHTML={{ __html: detailContent }} />
                    )}
                </Modal.Body>
                <Modal.Footer className="border-0">
                    <Button variant="secondary" onClick={() => setSelectedArticle(null)}>Đóng</Button>
                    <Button variant="danger" href={selectedArticle?.link} target="_blank">Xem gốc</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default App;