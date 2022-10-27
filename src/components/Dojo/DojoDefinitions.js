import { useState, useEffect, useRef, useContext } from "react";
import { Container, Row, Col, InputGroup, Form, Table, Button, Stack, Spinner } from "react-bootstrap";
import { ObjectsContext, UserContext } from "../../utils/Contexts";
import stringSimilarity from "string-similarity";

const DojoDefinitions = () => {
  const { objects, setObjects } = useContext(ObjectsContext);
  const { user, setUser } = useContext(UserContext);

  // app states
  const [appLoading, setAppLoading] = useState(true);
  const [appVersion, setAppVersion] = useState(0); // this is used to detect old datastructure versions
  const [lastUpdated, setLastUpdated] = useState(0);
  const [appPosition, setAppPosition] = useState(1);
  const [loadingObjects, setLoadingObjects] = useState(true);
  const [mainTopicsFilter, setMainTopicsFilter] = useState({});
  const [searchText, setSearchText] = useState("");
  const [dojoDefs, setDojoDefs] = useState({});
  const [appCloudStateChanged, setCloudAppStateChanged] = useState(false);

  const [savingDataToCloud, setSavingDataToCloud] = useState(false);
  const [loadingDataFromCloud, setLoadingDataFromCloud] = useState(false);

  const isFirstRender = useRef(true);

  // practice states
  const [recallStack, setRecallStack] = useState([]);
  const [memorisedStack, setMemorisedStack] = useState([]);
  const [revealDefinition, setRevealDefinition] = useState(false);

  // stats states
  const [resetDanger, setResetDanger] = useState(true);

  // GLOBAL APP STATES --------------------------------------------------------------------------------------------------

  const apiEndpoint = "https://us-central1-dharmasaurus-0.cloudfunctions.net/api";

  // get definitions (need to refactor this as duplicated from other definitions)
  useEffect(() => {
    const getObjects = async () => {
      let objectsFromLocalStorage = localStorage.getItem("objects");
      if (objectsFromLocalStorage) {
        objectsFromLocalStorage = JSON.parse(objectsFromLocalStorage);
        setObjects(objectsFromLocalStorage);
        setLoadingObjects(false);
      }
      let objectsFromServer = await fetchObjects();
      objectsFromServer.sort((a, b) => (a.name > b.name ? 1 : -1));
      setLoadingObjects(false);
      setObjects(objectsFromServer);
      localStorage.setItem("objects", JSON.stringify(objectsFromServer));
      let mainTopicsSet = new Set(objectsFromServer.map((obj) => obj.mainTopic));
      mainTopicsSet = [...mainTopicsSet];
      mainTopicsSet = mainTopicsSet.sort((a, b) => a.localeCompare(b));
      mainTopicsSet = [...mainTopicsSet].reduce((arr, curr) => ((arr[curr] = false), arr), {});
      setMainTopicsFilter(mainTopicsSet);
    };
    getObjects();
  }, []);

  const fetchObjects = async () => {
    const res = await fetch("https://us-central1-dharmasaurus-0.cloudfunctions.net/api/objects");
    const data = await res.json();
    return data;
  };

  // on load get app state
  useEffect(() => {
    try {
      let appFullState = localStorage.getItem("dojoDefinitionsAppState");
      appFullState = JSON.parse(appFullState);
      loadAppState(appFullState);
    } catch {
      setAppPosition(1);
      setDojoDefs({});
    }
    setAppLoading(false);
  }, []);

  // on state change save to local storage
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    saveAppStateToLocalStorage();
  }, [appPosition, dojoDefs, recallStack, revealDefinition]);

  const saveAppStateToLocalStorage = () => {
    localStorage.setItem("dojoDefinitionsAppState", JSON.stringify(compileAppState()));
  };

  const loadAppState = (appState) => {
    let setters = {
      appVersion: setAppVersion,
      lastUpdated: setLastUpdated,
      appPosition: setAppPosition,
      dojoDefs: setDojoDefs,
      recallStack: setRecallStack,
      memorisedStack: setMemorisedStack,
      revealDefinition: setRevealDefinition,
    };
    Object.entries(setters).map(([k, f]) => {
      if (k in appState) f(appState[k]);
    });
  };

  const compileAppState = () => {
    return {
      appVersion: appVersion,
      lastUpdated: lastUpdated,
      appPosition: appPosition,
      dojoDefs: dojoDefs,
      recallStack: recallStack,
      memorisedStack: memorisedStack,
      revealDefinition: revealDefinition,
    };
  };

  const putAppStateToCloud = async () => {
    if (!checkSignIn()) {
      alert("(Optional) Settings and progress will persist on this device but not be synchonised on other devices. Sign in to enable synchronisation settings and progress across devices.");
      return;
    }
    const requestOptions = {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + user.accessToken },
      body: JSON.stringify(compileAppState()),
    };
    let response = await fetch(`${apiEndpoint}/dojo/definitions/appState`, requestOptions);
    setCloudAppStateChanged(false);
    setSavingDataToCloud(false);
  };

  const getAppStateFromCloud = async () => {
    try {
      const requestOptions = {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + user.accessToken },
      };
      let response = await fetch(`${apiEndpoint}/dojo/definitions/appState`, requestOptions);
      let appStateData = await response.json();
      return appStateData;
    } catch (e) {
      console.log(e);
      return false;
    }
  };

  // BEGIN PAGES ---------------------------------------------------------------------------------------------------------

  const pageBegin = () => {
    return (
      <>
        <Container>
          <Row>
            <Col>
              <Row>
                <Col>
                  <div className="text-center">
                    <Button className="my-5" variant="warning">
                      <h1>Still under development - your progress may be lost</h1>
                    </Button>
                  </div>
                  <h1>Instructions</h1>
                  <ol>
                    <li>Begin here</li>
                    <li>Click settings, and add definitions to your memory list</li>
                    <li>
                      Click practice to begin memorisation
                      <ul>
                        <li>Successful memorisation is self examined</li>
                      </ul>
                    </li>
                    <li>The stats tab tracks your progress and lets you know what you need to work on, and what you have memorised</li>
                  </ol>
                </Col>
              </Row>
            </Col>
          </Row>
        </Container>
      </>
    );
  };

  const pageSettings = () => {
    return (
      <>
        <Row>
          <Col>
            <InputGroup size="sm" className="mt-3">
              <Form.Control placeholder="Filter by object name" aria-label="Filter by object name" onChange={handleChangeSearch} />
            </InputGroup>
          </Col>
        </Row>
        <Row className="mt-3">
          <Col>
            <Stack direction="horizontal" gap={1}>
              <Button
                size="sm"
                variant="dark"
                onClick={() => handleAddMany(TKSLDefinitions)}
                disabled={TKSLDefinitions.every((id) => {
                  try {
                    return dojoDefs[id].active;
                  } catch {
                    return false;
                  }
                })}
              >
                Add TKSL Definitions
              </Button>
              {savingDataToCloud ? (
                <Button size="sm" variant="dark" disabled={!appCloudStateChanged}>
                  <Spinner size="sm" animation="border" role="status"></Spinner>
                </Button>
              ) : (
                <Button size="sm" variant="dark" onClick={() => handlePutDataToCloud()} disabled={!appCloudStateChanged}>
                  Save Settings To Cloud
                </Button>
              )}

              {loadingDataFromCloud ? (
                <Button size="sm" variant="dark">
                  <Spinner size="sm" animation="border" role="status"></Spinner>
                </Button>
              ) : (
                <Button size="sm" variant="dark" onClick={() => handleGetAppStateToCloud()}>
                  Load Settings From Cloud
                </Button>
              )}
            </Stack>
          </Col>
        </Row>
        <Row>
          <Col>
            <Table responsive striped bordered hover size="sm" className="mx-1 mt-3">
              <thead>
                <tr>
                  <th className="text-nowrap" style={{ width: "65px" }}>
                    Practice
                  </th>
                  <th className="text-nowrap" style={{ minWidth: "150px", maxWidth: "300px" }}>
                    Main Topic
                  </th>
                  <th style={{ minWidth: "150px" }}>Object</th>
                </tr>
              </thead>
              <tbody>
                {filterSearchObjects().map((obj) => {
                  return (
                    <tr key={obj._id} className="align-middle">
                      <td className="text-nowrap" style={{ width: "65px" }}>
                        <Button size="sm" variant={dojoDefs[obj._id] && dojoDefs[obj._id].active ? "warning" : "dark"} onClick={() => handleMemoriseButton(obj._id)} style={{ minWidth: "60px" }}>
                          {dojoDefs[obj._id] && dojoDefs[obj._id].active ? "Remove" : "Add"}
                        </Button>
                      </td>
                      <td className="px-2" style={{ minWidth: "150px", maxWidth: "300px" }}>
                        {obj.mainTopic}
                      </td>
                      <td style={{ minWidth: "150px" }}>{obj.name}</td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </Col>
        </Row>
      </>
    );
  };

  const pagePractice = () => {
    let noSelectedDefintions = Object.values(dojoDefs).every((val) => !val.active);

    if (noSelectedDefintions)
      return (
        <Container>
          <Row className="py-5">
            <Col className="d-flex justify-content-center">
              <h1>Go back to settings to select some definitions to memorise first!</h1>
            </Col>
          </Row>
          <Row className="py-5">
            <Col className="d-flex justify-content-center">
              {loadingDataFromCloud ? (
                <Button size="sm" variant="dark">
                  <Spinner size="sm" animation="border" role="status"></Spinner>
                </Button>
              ) : (
                <Button size="sm" variant="dark" onClick={() => handleGetAppStateToCloud()}>
                  Load Settings From Cloud
                </Button>
              )}
            </Col>
          </Row>
        </Container>
      );

    const definitionsRecallUI = () => {
      return (
        <>
          <Row style={{ minHeight: "350px" }}>
            {recallStack.length > 0 ? (
              <Col className="d-flex justify-content-center">
                <Container fluid className="py-5">
                  <Row>
                    <Col className="d-flex justify-content-center">
                      <h2>{getObject(recallStack[0]).name}</h2>
                    </Col>
                  </Row>
                  <Row className="my-5">
                    <Col className="d-flex justify-content-center">
                      {revealDefinition ? (
                        getObject(recallStack[0]).definition
                      ) : (
                        <Button variant="outline-primary" onClick={() => setRevealDefinition(true)}>
                          Reveal definition
                        </Button>
                      )}
                    </Col>
                  </Row>
                  {revealDefinition ? (
                    <>
                      <Row className="">
                        <Col className="d-flex justify-content-center">
                          <Stack direction="horizontal" gap={1}>
                            <Button variant="danger" style={{ minWidth: "100px" }} onClick={() => handleDefinitionRecall(0)}>
                              Forgot
                            </Button>
                            <Button variant="warning" style={{ minWidth: "100px" }} onClick={() => handleDefinitionRecall(1)}>
                              Hard
                            </Button>
                            <Button variant="success" style={{ minWidth: "100px" }} onClick={() => handleDefinitionRecall(2)}>
                              Easy
                            </Button>
                          </Stack>
                        </Col>
                      </Row>
                    </>
                  ) : (
                    <></>
                  )}
                </Container>
              </Col>
            ) : (
              <Col className="d-flex justify-content-center">
                <Container fluid className="py-5">
                  <Row>
                    <Col className="d-flex justify-content-center">
                      <h2>No definitions to practice recalling at the moment, come back later to review!</h2>
                    </Col>
                  </Row>
                </Container>
              </Col>
            )}
          </Row>
          <Row className="bg-light py-3">
            <Col className="d-flex justify-content-center">
              {savingDataToCloud ? (
                <Button size="sm" variant="dark" disabled={!appCloudStateChanged}>
                  <Spinner size="sm" animation="border" role="status"></Spinner>
                </Button>
              ) : (
                <Button size="sm" variant="dark" onClick={() => handlePutDataToCloud()} disabled={!appCloudStateChanged}>
                  Save Progress To Cloud
                </Button>
              )}
            </Col>
          </Row>
          <Row className="bg-light py-5">
            <Col>
              <Container>
                <Row className="d-flex justify-content-center">
                  {recallStack.length > 0 && (
                    <Col>
                      <h2>Definitions to recall</h2>
                      <ol>
                        {recallStack.map((id) => {
                          let def = objects.find((v) => v._id == id);
                          let x = dojoDefs[id];
                          return <li key={id}>{def.name}</li>;
                        })}
                      </ol>
                    </Col>
                  )}
                </Row>
                <Row className="d-flex justify-content-center mt-3">
                  {memorisedStack.length > 0 && (
                    <Col>
                      <h2>Your memorised definitions</h2>
                      <Table striped bordered hover size="sm" className="mx-1 mt-3">
                        <thead>
                          <tr>
                            <th>&#128077;</th>
                            <th>Definition</th>
                            <th className="text-center">Next review</th>
                            <th className="text-center">Recall</th>
                          </tr>
                        </thead>
                        <tbody>
                          {memorisedStack.map((id) => {
                            let def = getObject(id);
                            let x = dojoDefs[id];
                            return (
                              <tr key={id} className="align-middle">
                                <td width={"10px"}>&#9989;</td>
                                <td className="px-2"> {def.name}</td>
                                <td className="text-center">
                                  {new Date(x.nextReview).toLocaleDateString()} {new Date(x.nextReview).toLocaleTimeString()}
                                </td>
                                <td className="text-center">
                                  <Button size="sm" variant="warning" onClick={() => handleRecallNow(id)}>
                                    Recall now
                                  </Button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </Table>
                      <p>Note: Press recall now if you think you have forgot or it is hard. </p>
                      <p>
                        In this application pressing recall now ahead of review time does not increase the recall interval. We are optimising for longer time between successful repetitions to strengthen recall. (Reference:{" "}
                        <a href="https://en.wikipedia.org/wiki/SuperMemo#Description_of_SM-2_algorithm" target="_blank">
                          A variation of the SM-2 recall algorithm)
                        </a>
                      </p>
                    </Col>
                  )}
                </Row>
              </Container>
            </Col>
          </Row>
        </>
      );
    };

    return <>{definitionsRecallUI()}</>;
  };

  const pageStats = () => {
    return (
      <Container>
        <Row className="py-5">
          <Col className="d-flex justify-content-center">
            <h1>Under development, come back later!</h1>
          </Col>
        </Row>
        <Row>
          <Col>
            <Table striped bordered hover size="sm" className="mx-1 mt-3">
              <thead>
                <tr>
                  <th>Definition</th>
                  <th className="text-center">Recall Strength</th>
                  <th className="text-center">Actively Learning</th>
                  <th className="text-center">Reset Progress</th>
                </tr>
              </thead>
              <tbody>
                {Object.values(dojoDefs)
                  .sort((a, b) => (a.interval < b.interval ? 1 : -1))
                  .sort((a, b) => (a.active < b.active ? 1 : -1))
                  .map((def) => {
                    let objDef = getObject(def.id);
                    return (
                      <tr key={"stat_" + def.id} className="align-middle">
                        <td> {objDef.name} </td>
                        <td className="text-center">{getStrengthLabel(def.interval)}</td>
                        <td className="text-center">
                          {def.active ? (
                            <Button size="sm" variant="success" disabled={true}>
                              Active
                            </Button>
                          ) : (
                            <Button size="sm" variant="dark" disabled={true}>
                              Not Active
                            </Button>
                          )}
                        </td>
                        <td className="text-center">
                          <Button size="sm" variant="danger" onClick={() => handleResetProgress(def.id)}>
                            Reset
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </Table>
          </Col>
        </Row>
      </Container>
    );
  };

  // END PAGES ---------------------------------------------------------------------------------------------------------

  const appStateEnum = {
    1: "Begin",
    2: "Settings",
    3: "Practice",
    4: "Stats",
  };

  const appStatePages = {
    1: pageBegin,
    2: pageSettings,
    3: pagePractice,
    4: pageStats,
  };

  // HANDLERS ---------------------------------------------------------------------------------------------------------
  // global dojo definitons handlers
  const handleAppPositionChange = (state) => {
    setAppPosition(state);
  };

  const handlePutDataToCloud = () => {
    putAppStateToCloud();
    setSavingDataToCloud(true);
  };

  const handleGetAppStateToCloud = () => {
    if (!checkSignIn()) {
      alert("(Optional) Settings and progress will persist on this device but not be synchonised on other devices. Sign in to enable synchronisation settings and progress across devices.");
      return;
    }
    loadAppStateFromCloud();
    setLoadingDataFromCloud(true);
  };

  const loadAppStateFromCloud = async () => {
    let appState = await getAppStateFromCloud();
    if (Object.keys(appState).length !== 0) loadAppState(appState);
    setLoadingDataFromCloud(false);
  };

  // settings handlers
  const handleChangeSearch = (e) => {
    setSearchText(e.target.value);
  };

  const handleMemoriseButton = (id) => {
    let updateDefs = { ...dojoDefs };
    try {
      updateDefs[id].active = updateDefs[id].active == true ? false : true;
    } catch {
      updateDefs[id] = { id: id, active: true, interval: 0, nextReview: Date.now() };
    }
    setDojoDefs(updateDefs);
    setCloudAppStateChanged(true);
    setLastUpdated(Date.now());
  };

  const handleAddMany = (list) => {
    let updateDefs = { ...dojoDefs };
    list.forEach((id) => {
      try {
        updateDefs[id].active = true;
      } catch {
        updateDefs[id] = { id: id, active: true, interval: 0, nextReview: Date.now() };
      }
    });
    setDojoDefs(updateDefs);
    setCloudAppStateChanged(true);
    setLastUpdated(Date.now());
  };

  // practice handlers
  const handleDefinitionRecall = (difficulty) => {
    setRevealDefinition(false);
    if (difficulty === 0 || difficulty === 1) {
      // if 0 or 1 = forgot/hard
      incrementRecall(false, difficulty, recallStack[0]);
    } else if (difficulty === 2) {
      // if 2 = easy
      incrementRecall(true, difficulty, recallStack[0]);
    }
    updateStacks();
    // any time a definition is recalled, update the last updated
    setLastUpdated(Date.now());
    setCloudAppStateChanged(true);
  };

  const handleRecallNow = (id) => {
    // does the same thing as clicking "hard"
    incrementRecall(false, 1, id);
    updateStacks();
    setCloudAppStateChanged(true);
  };

  const handleResetProgress = (id) => {
    let confirm = true;
    if (resetDanger) {
      confirm = window.confirm("Reset progress back to zero? Caution: there is no undo!");
    }
    if (confirm) {
      // do the same thing as "forgot"
      incrementRecall(true, 0, id);
      updateStacks();
      setResetDanger(false);
    }
  };

  // UTILS ------------------------------------------------------------------------------------------------------------------

  const getObject = (id) => {
    return objects.find((v) => v._id == id);
  };

  const checkSignIn = () => {
    let userCheck = localStorage.getItem("user");
    if (!user) return false;
    return true;
  };

  // UTILS SETTINGS ---------------------------------------------------------------------------------------------------------

  const TKSLDefinitions = ["6342c274844eb81845637b84", "633a5e7afb4cee9cb4d886b9", "633a5f95895aab006667f2c0", "6342c27b844eb81845637b87", "6342c26d844eb81845637b81", "6342c276844eb81845637b85", "6342c266844eb81845637b7e", "6342c264844eb81845637b7d", "6342c25c844eb81845637b7a", "6342c268844eb81845637b7f", "6342c000844eb81845637af4", "6342c27d844eb81845637b88", "6342c2b1844eb81845637b9e", "6342c2af844eb81845637b9d", "6342c2b4844eb81845637b9f", "6342c24e844eb81845637b74", "6342c250844eb81845637b75", "6342c255844eb81845637b77", "6342c253844eb81845637b76", "6342c258844eb81845637b78", "6342c1ec844eb81845637b4a", "6342c1f3844eb81845637b4d", "6342c1fa844eb81845637b50", "6342c1d7844eb81845637b41", "6342c199844eb81845637b34", "6342c1e3844eb81845637b46", "6342c1e0844eb81845637b45", "6342c1d9844eb81845637b42", "6342c1e5844eb81845637b47", "6342c1de844eb81845637b44", "6342c1dc844eb81845637b43", "6342c1c2844eb81845637b38", "6342c26a844eb81845637b80"];

  const filterSearchObjects = () => {
    let searchTextLower = searchText.toLowerCase();

    let filteredObjects = objects.map((obj) => {
      let name = obj.name.toLowerCase();
      let definition = obj.definition.toLowerCase();
      let nameDef = name; // + " " + definition;
      let score = Math.max(stringSimilarity.compareTwoStrings(name, searchTextLower), stringSimilarity.compareTwoStrings(definition, searchTextLower));
      return { ...obj, nameDef: nameDef, score: score };
    });

    // filter by main topic checkboxes
    // if no filter is selected, then do not filter anything (counterintuitive logic, but how UIs work)
    if (Object.entries(mainTopicsFilter).some(([topic, filterValue]) => filterValue)) {
      // loop through and only select defs where main topic is true
      filteredObjects = filteredObjects.filter((obj) => {
        return mainTopicsFilter[obj.mainTopic];
      });
    }

    let sortDefs = (a, b) => {
      // sort by topic and then by name
      if (b.mainTopic < a.mainTopic) return 1;
      if (b.mainTopic > a.mainTopic) return -1;
      return b.name < a.name ? 1 : -1;
    };

    // if the search string is empty, just return the whole dictionary
    if (searchTextLower.length === 0) {
      filteredObjects.sort((a, b) => sortDefs(a, b));
      return filteredObjects;
    }

    // next filter the search list by names and definitions containing all of the key words
    let keywords = searchTextLower.split(" ");
    filteredObjects = filteredObjects.filter((obj) => {
      return keywords.every((word) => {
        return obj.nameDef.includes(word);
      });
    });

    filteredObjects.sort((a, b) => sortDefs(a, b));
    return filteredObjects;
  };

  // UTILS PRACTICE ---------------------------------------------------------------------------------------------------------
  const incrementRecall = (increment, difficulty, id) => {
    const getNextInterval = (getNext, interval) => {
      let nextInterval;
      if (getNext) {
        if (interval == 0) {
          nextInterval = 1;
        } else {
          nextInterval = interval * 2;
        }
      } else {
        nextInterval = interval / 2;
        if (nextInterval < 1) nextInterval = 0;
      }
      nextInterval = Math.min(Math.max(nextInterval, 0), 32); // 0-30 days recall interval only
      return nextInterval;
    };

    let dojoDef = dojoDefs[id];
    let nextInterval = getNextInterval(increment, dojoDef.interval);
    let nextDojoDefs = { ...dojoDefs };
    dojoDef = { ...dojoDef, interval: nextInterval, nextReview: Date.now() + Math.floor(nextInterval * 24 * 3600 * 1000) };
    if (difficulty === 0) {
      // forgot completely - reset to zero
      dojoDef = { ...dojoDef, interval: 0, nextReview: Date.now() }; // recall again now
    } else if (difficulty === 1) {
      dojoDef = { ...dojoDef, nextReview: Date.now() + Math.floor(2 * 60 * 1000) }; // recall in 2 minutes
    }
    nextDojoDefs[id] = dojoDef;
    setDojoDefs(nextDojoDefs);
  };

  useEffect(() => {
    updateStacks();
  }, [dojoDefs]);

  const updateStacks = () => {
    let stackRecall = [];
    let stackMemorised = [];
    let sortedDojoDefs = [...Object.values(dojoDefs)];
    sortedDojoDefs = sortedDojoDefs.filter((x) => x.active);
    sortedDojoDefs.sort((a, b) => (a.nextReview > b.nextReview ? 1 : -1));
    sortedDojoDefs.forEach((def) => {
      let recallCutOff = Date.now() + 10 * 60 * 1000;
      if (def.nextReview <= recallCutOff) {
        stackRecall.push(def.id);
      } else {
        stackMemorised.push(def.id);
      }
    });
    setRecallStack(stackRecall);
    setMemorisedStack(stackMemorised);
  };

  // UTILS STATS ---------------------------------------------------------------------------------------------------------
  const getStrengthLabel = (str) => {
    let labels = {
      2: "Newbie",
      12: "Learner",
      24: "Adept",
      1000: "Master",
    };
    let checkpoints = Object.keys(labels);
    for (var i = 0; i < checkpoints.length; i++) {
      if (str <= checkpoints[i]) return `(${str}) ` + labels[checkpoints[i]];
    }
  };

  // PAGE RENDER ---------------------------------------------------------------------------------------------------------
  return (
    <Container fluid className="m-0">
      <Row>
        <Col className="bg-secondary d-flex justify-content-center">
          <div className="m-1">
            <Stack direction="horizontal" className="p-1" gap={1}>
              {Object.keys(appStateEnum)
                .map((state) => {
                  return (
                    <Button key={state} size="sm" variant={appPosition == state ? "primary" : "dark"} style={{ minWidth: "5rem" }} onClick={() => handleAppPositionChange(state)}>
                      {appStateEnum[state]}
                    </Button>
                  );
                })
                .reduce((prev, curr) => [prev, " > ", curr])}
            </Stack>
          </div>
        </Col>
      </Row>
      {appStatePages[appPosition]()}
    </Container>
  );
};

export default DojoDefinitions;
