import { Container, Row, Col, Button, Card, Spinner, Stack, Collapse, ListGroup, Offcanvas } from "react-bootstrap";
import { useState, useEffect, useRef } from "react";

const Maps = () => {
  const [showMenu, setShowMenu] = useState(true);
  const [mapLoading, setMapLoading] = useState(true);
  const [currentMap, setCurrentMap] = useState({ text: "Mind and Mental Factors", url: "mmf.svg", parent: false, key: "mmf" });

  useEffect(() => {
    fetchMap();
  }, []);

  const repositoryUrl = "https://raw.githubusercontent.com/PatrickHuynh/dharmasaurus-data/e27a4c64b702a9cf2cd6e12820d60b2ccda3c85d/maps/";

  const mapPaths = {
    mmf: { text: "Mind and Mental Factors", url: "mmf.svg", parent: false },
    mmf_minds: { text: "Minds", url: "mmf_minds.svg", parent: "mmf" },
    mmf_5omnipresent: { text: "Five Omnipresent", url: "mmf_5omnipresent.svg", parent: "mmf" },
  };

  const fetchMap = async () => {
    setMapLoading(true);
    const res = await fetch(repositoryUrl + currentMap.url);
    setMapLoading(false);
  };

  const handleSelectMap = async (key) => {
    await fetchMap();
    setCurrentMap({ ...mapPaths[key], key: key });
    setShowMenu(!showMenu);
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
    let crumbs = "";
    let el = currentMap;
    do {
      crumbs = el.text + (crumbs ? " / " + crumbs : "");
      el = mapPaths[el.parent];
    } while (el);
    return crumbs;
  };

  return (
    <Container fluid className="m-0">
      <Offcanvas show={showMenu} onHide={handleCloseMenu} backdrop={true} scroll={true} placement="start">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Select Map</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <ListGroup>
            {Object.entries(mapPaths).map(([key, value]) => {
              let isActive = key === currentMap.key;
              return (
                <ListGroup.Item id={key} action onClick={() => handleSelectMap(key)} active={isActive}>
                  {value.parent ? (
                    <>{"> " + value.text}</>
                  ) : (
                    <b>
                      <u>{value.text}</u>
                    </b>
                  )}
                </ListGroup.Item>
              );
            })}
          </ListGroup>
        </Offcanvas.Body>
      </Offcanvas>

      <Row className="pt-2 bg-light">
        <Col>
          <Button size="sm" onClick={() => setShowMenu(!showMenu)} aria-controls="collapse-map-menu" aria-expanded={showMenu}>
            Show Menu
          </Button>{" "}
          <b>{crumbsList()}</b>
        </Col>
      </Row>
      <Row>
        <Col>{mapLoading ? loadingSpinner("Image loading...") : <img src={repositoryUrl + currentMap.url} />}</Col>
      </Row>
    </Container>
  );
};

export default Maps;
