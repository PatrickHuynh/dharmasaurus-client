import { useState, useEffect } from "react";
import { Container } from "react-bootstrap";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Card from "react-bootstrap/Card";
import stringSimilarity from "string-similarity";

const Definitions = () => {
  const [objects, setObjects] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [loadingObjects, setLoadingObjects] = useState(true);

  useEffect(() => {
    const getObjects = async () => {
      let objectsFromServer = await fetchObjects();
      objectsFromServer.sort((a, b) => (a.name > b.name ? 1 : -1));
      setLoadingObjects(false);
      setObjects(objectsFromServer);
    };
    getObjects();
  }, []);

  const fetchObjects = async () => {
    const res = await fetch("https://us-central1-dharmasaurus-0.cloudfunctions.net/api/objects");
    const data = await res.json();
    return data;
  };

  const handleChangeSearch = (e) => {
    setSearchText(e.target.value);
  };

  const filterSearchObjects = () => {
    let filteredObjects = objects.map((obj) => {
      let name = obj.name.toLowerCase();
      let definition = obj.definition.toLowerCase();
      let searchTextLower = searchText.toLowerCase();
      let score = Math.max(stringSimilarity.compareTwoStrings(name, searchTextLower), stringSimilarity.compareTwoStrings(definition, searchTextLower) * 0.8);
      return { ...obj, score: score };
    });
    filteredObjects.filter((obj) => {
      if (searchText == "") return true;
      if (obj.score >= 0.25) return true;
      return false;
    });
    filteredObjects.sort((a, b) => b.score - a.score);
    filteredObjects = filteredObjects.filter((obj) => {
      return searchText == "" || obj.score > 0.25;
    });
    return filteredObjects;
  };

  const showPercentage = (val) => {
    val = Math.round(val * 100);
    return val;
  };

  return (
    <Container fluid className="m-0 p-0">
      <Container fluid className="m-0 p-0">
        <InputGroup size="sm" className="p-3 bg-secondary">
          <Form.Control placeholder="Search" aria-label="Search" onChange={handleChangeSearch} />
        </InputGroup>
      </Container>
      {loadingObjects && <p className="p-3">Loading...</p>}
      {!loadingObjects &&
        objects.length > 0 &&
        filterSearchObjects().map((obj) => {
          return (
            <Card key={obj.id} className="m-1 bg-light border border-dark border-2">
              <Card.Body>
                <Card.Title>{obj.name + " (" + showPercentage(obj.score) + "%)"}</Card.Title>
                <Card.Text>{obj.definition}</Card.Text>
              </Card.Body>
            </Card>
          );
        })}
    </Container>
  );
};

export default Definitions;
