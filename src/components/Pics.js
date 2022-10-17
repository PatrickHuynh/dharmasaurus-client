import { Container, Row, Col, Button, Card, Spinner, Stack, Collapse, ListGroup, Offcanvas } from "react-bootstrap";
import { useState, useEffect, useRef } from "react";
import { LinkContainer } from "react-router-bootstrap";

const Maps = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [mapLoading, setMapLoading] = useState(true);
  const [currentMap, setCurrentMap] = useState({ text: "Chittamani Tara", url: "chittamani_tara.jpg", key: "chittamani_tara" });

  useEffect(() => {
    fetchMap();
  }, []);

  const repositoryUrl = "https://raw.githubusercontent.com/PatrickHuynh/dharmasaurus-data/main/images/";

  const mapPaths = {
    chittamani_tara: { text: "Chittamani Tara", url: "chittamani_tara.jpg", key: "chittamani_tara" },
  };

  const fetchMap = async () => {
    setMapLoading(true);
    const res = await fetch(repositoryUrl + currentMap.url);
    setMapLoading(false);
  };

  const handleSelectMap = async (key) => {
    setShowMenu(false);
    await fetchMap();
    setCurrentMap({ ...mapPaths[key], key: key });
  };

  const handleCloseMenu = () => setShowMenu(false);

  const loadingSpinner = (loadingMessage) => {
    return (
      <Stack direction="horizontal" gap={2} className="d-flex align-items-center p-2 btn btn-light">
        <Spinner className="m-2" animation="border" role="status"></Spinner>
        <h6>{loadingMessage}</h6>
      </Stack>
    );
  };

  const crumbsList = () => {
    return <h6 className={`d-inline text-white`}>{currentMap.text}</h6>;
  };

  return (
    <Container fluid className="m-0 bg-dark">
      <Offcanvas show={showMenu} onHide={handleCloseMenu} backdrop={true} scroll={true} placement="start">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Select Image</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <ListGroup>
            {Object.entries(mapPaths).map(([key, value]) => {
              let isActive = key === currentMap.key;
              return (
                <ListGroup.Item id={key} action onClick={() => handleSelectMap(key)} active={isActive}>
                  {value.text}
                </ListGroup.Item>
              );
            })}
          </ListGroup>
        </Offcanvas.Body>
      </Offcanvas>

      <Row className="p-2 bg-dark flex-nowrap" style={{ maxHeight: "40px" }}>
        <Col xs="auto">
          <Button size="sm" onClick={() => setShowMenu(!showMenu)} aria-controls="collapse-map-menu" aria-expanded={showMenu}>
            Show Menu
          </Button>{" "}
        </Col>
        <Col className="text-center">
          <div className="ps-2 d-inline text-nowrap overflow-hidden align-middle">{crumbsList()}</div>
        </Col>
      </Row>
      <Row className="p-2 bg-dark text-center">
        <Col>{mapLoading ? loadingSpinner("Image loading...") : <img className="img-fluid" src={repositoryUrl + currentMap.url} />}</Col>
      </Row>
    </Container>
  );
};

export default Maps;
