// src/App.js
import React from 'react';
import { Container, Row, Col, Navbar, Nav, Form, FormControl, Button, Card } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Dữ liệu mẫu mô phỏng nội dung trang web
const featuredArticle = {
    title: "Xây dựng cơ chế, chính sách đột phá nhằm đào tạo, phát triển học sinh tài năng",
    summary: "GD&TĐ - Sáng 26/12, tại trụ sở Chính phủ, Thủ tướng Phạm Minh Chính gặp mặt, biểu dương các học sinh đoạt giải tại các kỳ thi quốc tế năm 2025.",
    time: "5 giờ trước",
    image: "https://placehold.co/800x450/e9ecef/495057?text=Featured+Image" // Ảnh placeholder
};

const smallArticles = [
    { id: 1, title: "Bài viết nhỏ 1", image: "https://placehold.co/400x250/e9ecef/495057?text=Image+1" },
    { id: 2, title: "Bài viết nhỏ 2", image: "https://placehold.co/400x250/e9ecef/495057?text=Image+2" },
    { id: 3, title: "Bài viết nhỏ 3", image: "https://placehold.co/400x250/e9ecef/495057?text=Image+3" },
];

function App() {
    return (
        <div className="app-container">
            {/* Header & Navigation */}
            <header className="bg-white py-3 border-bottom">
                <Container className="d-flex justify-content-between align-items-center">
                    <Navbar.Brand href="#home" className="text-danger fw-bold fs-3">
                        GIÁO DỤC <span className="text-dark d-block fs-6">VÀ THỜI ĐẠI</span>
                    </Navbar.Brand>
                    <Form className="d-flex w-50">
                        <FormControl
                            type="search"
                            placeholder="Tìm kiếm..."
                            className="me-2 rounded-pill bg-light border-0"
                            aria-label="Search"
                        />
                    </Form>
                    <Nav.Link href="#baoin" className="text-danger fw-bold">BÁO IN</Nav.Link>
                </Container>
            </header>

            {/* Main Navigation Bar (Red) */}
            <Navbar bg="danger" variant="dark" expand="lg" className="py-0 sticky-top">
                <Container>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="me-auto w-100 justify-content-between">
                            <Nav.Link href="#home" className="text-white"><i className="bi bi-house-door-fill"></i></Nav.Link>
                            {['Giáo dục', 'Thời sự', 'Giáo dục pháp luật', 'Kết nối', 'Trao đổi', 'Học đường', 'Nhân ái', 'Thế giới', 'Sức khoẻ', 'Media', 'Văn hóa', 'Thể thao'].map((item, index) => (
                                <Nav.Link key={index} href={`#${item}`} className="text-white fw-500 px-3 py-3 nav-item-custom">{item}</Nav.Link>
                            ))}
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            {/* Trending Bar */}
            <div className="bg-light py-2">
                <Container className="d-flex align-items-center small">
                    <span className="text-danger fw-bold me-2"><i className="bi bi-lightning-fill"></i> Sự kiện</span>
                    <a href="#event1" className="text-muted text-decoration-none me-3 hover-blue">#Hướng tới Đại hội đại biểu toàn quốc lần thứ XIV của Đảng</a>
                    <a href="#event2" className="text-muted text-decoration-none me-3 hover-blue">#Xây dựng Luật Nhà giáo</a>
                </Container>
            </div>

            <Container className="mt-4">
                {/* Main Content - Top Section */}
                <Row className="mb-4">
                    {/* Featured Article (Left Column) */}
                    <Col lg={8}>
                        <Card className="news-card border-0 h-100">
                            <Row className="g-0 h-100">
                                <Col md={7}>
                                    <Card.Img src={featuredArticle.image} alt="Featured" className="h-100 object-fit-cover rounded-start" />
                                </Col>
                                <Col md={5}>
                                    <Card.Body className="d-flex flex-column h-100 p-4">
                                        <Card.Title className="fw-bold fs-4 hover-blue mb-3"><a href="#featured" className="text-decoration-none text-dark">{featuredArticle.title}</a></Card.Title>
                                        <Card.Text className="text-muted small mb-2">{featuredArticle.time}</Card.Text>
                                        <Card.Text>{featuredArticle.summary}</Card.Text>
                                    </Card.Body>
                                </Col>
                            </Row>
                        </Card>
                    </Col>

                    {/* Sidebar (Right Column) */}
                    <Col lg={4}>
                        <Card className="border-0 shadow-sm">
                            <Card.Img src="https://placehold.co/400x500/dc3545/ffffff?text=BÁO+IN\nHÔM+NAY+CÓ+GÌ?" alt="Báo in banner" />
                        </Card>
                    </Col>
                </Row>

                {/* Main Content - Bottom Section (Small Articles) */}
                <Row>
                    {smallArticles.map(article => (
                        <Col md={4} key={article.id} className="mb-4">
                            <Card className="news-card border-0 h-100">
                                <Card.Img variant="top" src={article.image} className="rounded-top" />
                                <Card.Body>
                                    <Card.Title className="fw-bold hover-blue"><a href={`#article${article.id}`} className="text-decoration-none text-dark">{article.title}</a></Card.Title>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </Container>
        </div>
    );
}

export default App;